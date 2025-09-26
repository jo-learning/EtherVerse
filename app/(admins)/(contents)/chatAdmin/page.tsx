"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { FaUserCircle, FaPaperPlane, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import { HiHome } from 'react-icons/hi';

interface Assignment { id: string; adminId: string; userId: string; }
interface UserItem { id: string; email: string; name: string | null; assignments?: { adminId: string }[] }
interface ChatMessage { id: string; message: string; who: string; createdAt: string; adminId?: string | null; }

export default function AdminChatPage() {
	const [users, setUsers] = useState<UserItem[]>([]);
	const [loadingUsers, setLoadingUsers] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [msgInput, setMsgInput] = useState('');
	const [loadingMsgs, setLoadingMsgs] = useState(false);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const scrollRef = useRef<HTMLDivElement | null>(null);

	const fetchUsers = useCallback(async () => {
		setLoadingUsers(true); setError(null);
		try {
			const res = await fetch('/api/chat/users', { cache: 'no-store' });
			if (!res.ok) throw new Error('Failed to load users');
			const data = await res.json();
			setUsers(data.users || []);
			if (!selectedUserId && data.users?.length) setSelectedUserId(data.users[0].id);
		} catch (e:any) { setError(e.message); }
		finally { setLoadingUsers(false); }
	}, [selectedUserId]);

	const fetchMessages = useCallback(async (userId: string, cursor?: string) => {
		if (!userId) return;
		setLoadingMsgs(true); setError(null);
		try {
			const qp = new URLSearchParams({ userId });
			if (cursor) qp.set('cursor', cursor);
			const res = await fetch('/api/chat/messages?' + qp.toString(), { cache: 'no-store' });
			if (!res.ok) throw new Error('Failed to load messages');
			const data = await res.json();
			if (cursor) {
				// append older at end since API returns newest first
				setMessages(prev => [...prev, ...data.chats.reverse()]);
			} else {
				setMessages(data.chats.reverse());
			}
			setNextCursor(data.nextCursor);
			setTimeout(() => {
				if (!cursor && scrollRef.current) { scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }
			}, 50);
		} catch (e:any) { setError(e.message); }
		finally { setLoadingMsgs(false); }
	}, []);

	const sendMessage = async () => {
		if (!msgInput.trim() || !selectedUserId) return;
		setSending(true); setError(null);
		const text = msgInput;
		setMsgInput('');
		try {
			const res = await fetch('/api/chat/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: selectedUserId, message: text }) });
			if (!res.ok) throw new Error('Failed to send');
			const data = await res.json();
			setMessages(prev => [...prev, data.chat]);
			setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 30);
		} catch (e:any) { setError(e.message); }
		finally { setSending(false); }
	};

	useEffect(() => { fetchUsers(); }, [fetchUsers]);
	useEffect(() => { if (selectedUserId) fetchMessages(selectedUserId); }, [selectedUserId, fetchMessages]);
	// Realtime via a single WebSocket per tab with heartbeat and resubscribe on user change
	const currentSubRef = useRef<string | null>(null);
	const selectedUserRef = useRef<string | null>(null);
	selectedUserRef.current = selectedUserId;
	useEffect(() => {
		let tries = 0;
		let hb: any;
		let reconnectTimer: any;

		// Prime server
		fetch('/api/ws').catch(() => {});

		// Reuse existing socket in dev StrictMode double-mount
		const existing: WebSocket | undefined = (window as any).__adminWS;
		if (existing && (existing.readyState === 0 || existing.readyState === 1)) {
			console.debug('[WS-ADMIN] reusing existing socket');
			return () => { /* don't interfere with existing owner */ };
		}

		const ownerId = Math.random().toString(36).slice(2);
		const connect = () => {
			const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws';
			const url = `${wsProto}://${window.location.host}/api/ws`;
			console.debug('[WS-ADMIN] connecting', url);
			const ws = new WebSocket(url);
			(ws as any).__ownerId = ownerId;
			(window as any).__adminWS = ws;
			const startHeartbeat = () => {
				clearInterval(hb);
				hb = setInterval(() => {
					try { ws?.send(JSON.stringify({ type: 'ping', ts: Date.now() })); } catch {}
				}, 25000);
			};
			ws.addEventListener('open', () => {
				console.debug('[WS-ADMIN] open');
				tries = 0;
				startHeartbeat();
				if (selectedUserRef.current) {
					const ch = `user:${selectedUserRef.current}`;
					ws.send(JSON.stringify({ type: 'subscribe', channel: ch }));
					currentSubRef.current = ch;
					console.debug('[WS-ADMIN] subscribed', ch);
				}
			});
			ws.addEventListener('message', (ev) => {
				try {
					const data = JSON.parse(ev.data as any);
					if (data?.type === 'message' && data.chat) {
						const c = data.chat;
						const sel = selectedUserRef.current;
						if (!sel || c.userId !== sel) return;
						setMessages(prev => [...prev, c]);
						setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 20);
					}
				} catch {}
			});
			ws.addEventListener('close', (ev) => {
				clearInterval(hb);
				// Only clear global if this owner created it
				if (((window as any).__adminWS as any)?.__ownerId === ownerId) {
					(window as any).__adminWS = undefined;
				}
				const jitter = Math.floor(Math.random() * 300);
				try { console.debug('[WS-ADMIN] closed', ev.code, ev.reason); } catch {}
				const delay = Math.min(1000 * Math.pow(2, tries++), 8000) + jitter;
				console.debug('[WS-ADMIN] closed, reconnecting in', delay);
				reconnectTimer = setTimeout(connect, delay);
			});
			ws.addEventListener('error', () => {});
		};

		connect();
		return () => {
			clearInterval(hb);
			clearTimeout(reconnectTimer);
			const gws: any = (window as any).__adminWS;
			// Only close if we own it (avoid StrictMode first-unmount killing the second mount's socket)
			if (gws && gws.__ownerId === ownerId) {
				try { gws.close(); } catch {}
				(window as any).__adminWS = undefined;
			}
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Subscribe switcher when user changes
	useEffect(() => {
		const ws: WebSocket | undefined = (window as any).__adminWS;
		if (!ws || ws.readyState !== 1 /* OPEN */) return;
		const prev = currentSubRef.current;
		if (prev) {
			try { ws.send(JSON.stringify({ type: 'unsubscribe', channel: prev })); } catch {}
			console.debug('[WS-ADMIN] unsubscribed', prev);
		}
		if (selectedUserId) {
			const ch = `user:${selectedUserId}`;
			try { ws.send(JSON.stringify({ type: 'subscribe', channel: ch })); } catch {}
			console.debug('[WS-ADMIN] subscribed', ch);
			currentSubRef.current = ch;
		} else {
			currentSubRef.current = null;
		}
	}, [selectedUserId]);

	const loadOlder = () => { if (nextCursor && selectedUserId) fetchMessages(selectedUserId, nextCursor); };

	return (
		<div className="flex h-[calc(100vh-2rem)] bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden mx-auto">
			{/* Sidebar */}
			<aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
				<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center gap-2">
						<a href="/account" className="text-purple-600 dark:text-purple-400"><HiHome /></a>
						<h2 className="font-bold text-lg text-purple-600 dark:text-purple-400">Chats</h2>
					</div>
					<button onClick={fetchUsers} className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"><FaSync className={loadingUsers ? 'animate-spin' : ''} />Refresh</button>
				</div>
				<div className="p-2">
					<input placeholder="Filter..." className="w-full text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 focus:outline-none" onChange={e => {
						const val = e.target.value.toLowerCase();
						const filtered = users.filter(u => (u.name || u.email).toLowerCase().includes(val));
						if (val) setUsers(filtered as any); else fetchUsers();
					}} />
				</div>
				<ul className="flex-1 overflow-y-auto">
					{loadingUsers && <li className="px-4 py-2 text-xs text-gray-500">Loading users...</li>}
					{!loadingUsers && users.map(u => (
						<li key={u.id}>
							<button onClick={() => setSelectedUserId(u.id)} className={`w-full flex flex-col items-start gap-1 px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-left ${selectedUserId===u.id?'bg-purple-50 dark:bg-purple-900/20':''}`}> 
								<div className="flex items-center gap-2"> <FaUserCircle className="text-gray-400" size={24} /> <span className="font-medium">{u.name || u.email}</span></div>
								<span className="text-[10px] text-gray-500">{u.email}</span>
							</button>
						</li>
					))}
					{!loadingUsers && users.length===0 && <li className="px-4 py-4 text-sm text-gray-500">No users</li>}
				</ul>
			</aside>
			{/* Chat Panel */}
			<section className="flex-1 flex flex-col">
				<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
					<div>
						<h3 className="font-semibold text-purple-700 dark:text-purple-300 text-sm">{users.find(u=>u.id===selectedUserId)?.name || users.find(u=>u.id===selectedUserId)?.email || 'Select a user'}</h3>
						<p className="text-[11px] text-gray-500">{messages.length} messages</p>
					</div>
					{nextCursor && <button onClick={loadOlder} className="text-xs text-purple-600 hover:text-purple-800">Load older</button>}
				</div>
				<div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-2 bg-gradient-to-b from-gray-100 dark:from-gray-800 to-gray-50 dark:to-gray-900">
					{loadingMsgs && <div className="text-xs text-gray-500">Loading messages...</div>}
					{!loadingMsgs && messages.map(m => (
						<div key={m.id} className={`flex ${m.who === 'admin' ? 'justify-end' : 'justify-start'}`}> 
							<div className={`px-4 py-2 rounded-2xl max-w-xs text-sm shadow ${m.who === 'admin' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600'}`}>{m.message}</div>
						</div>
					))}
					{!loadingMsgs && !messages.length && <div className="text-xs text-gray-400">No messages yet.</div>}
				</div>
				<div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center bg-white dark:bg-gray-800 gap-2">
					{error && <div className="text-red-500 text-xs flex items-center gap-1"><FaExclamationTriangle />{error}</div>}
					<input disabled={!selectedUserId || sending} value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=> e.key==='Enter' && sendMessage()} placeholder={selectedUserId? 'Type a message...' : 'Select a user'} className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:outline-none text-sm" />
					<button disabled={!msgInput.trim() || !selectedUserId || sending} onClick={sendMessage} className="ml-1 px-4 py-2 bg-purple-600 disabled:opacity-50 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm">
						<FaPaperPlane /> Send
					</button>
				</div>
			</section>
		</div>
	);
}
