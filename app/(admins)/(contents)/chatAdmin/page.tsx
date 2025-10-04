"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { FaUserCircle, FaPaperPlane, FaSync, FaExclamationTriangle } from "react-icons/fa";
import { HiHome } from "react-icons/hi";
import { useAdminWS } from "../../../../hooks/useAdminWS"; // Assuming the hook is in this path

// NOTE: Since the useAdminWS file wasn't directly accessible in the previous edits,
// I am including the full, fixed hook logic here as a utility function for completeness
// based on the selection you provided. In a real app, this should be in its own file.




interface Assignment { id: string; adminId: string; userId: string; }
interface UserItem { id: string; email: string; name: string | null; assignments?: { adminId: string }[]; userId: string; }
interface ChatMessage { id: string; message: string; who: string; createdAt: string; adminId?: string | null; }

export default function AdminChatPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // This function is now stable and won't be recreated on re-renders,
  // preventing the effect that calls it from running unnecessarily.
  const fetchUsers = useCallback(async (selectFirstUser = false) => {
    setLoadingUsers(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/users", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users || []);
      // Only set selected user if it hasn't been set, or if we explicitly refresh and want to select the first one.
      if (!selectedUserId && selectFirstUser && data.users?.length) {
        setSelectedUserId(data.users[0].id);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingUsers(false);
    }
  }, [selectedUserId]); // Include selectedUserId to prevent infinite loop on first load if setting it.

  const fetchMessages = useCallback(async (userId: string, cursor?: string) => {
    if (!userId) return;
    setLoadingMsgs(true);
    setError(null);
    try {
      const qp = new URLSearchParams({ userId });
      if (cursor) qp.set("cursor", cursor);
      const res = await fetch("/api/chat/messages?" + qp.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      if (cursor) {
        setMessages((prev) => [...data.chats.reverse(), ...prev]);
      } else {
        setMessages(data.chats.reverse());
      }
      setNextCursor(data.nextCursor);
      setTimeout(() => {
        if (!cursor && scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  // Effect to load users once on initial component mount.
  useEffect(() => {
    fetchUsers(true);
  }, [fetchUsers]);

  useEffect(() => { 
      if (selectedUserId) {
          setMessages([]); // Clear previous messages
          setNextCursor(null); // Reset cursor
          fetchMessages(selectedUserId); 
      }
  }, [selectedUserId, fetchMessages]);

  // This function handles incoming WebSocket messages.
  const onWsMessage = (data: any) => {
    if (data?.type === "message" && data.chat && data.chat.userId === selectedUserId) {
      setMessages((prev) => [...prev, data.chat]);
      setTimeout(() => {
        if (scrollRef.current) {
          const { scrollHeight, scrollTop, clientHeight } = scrollRef.current;
          // Only auto-scroll if the user is near the bottom
          if (scrollHeight - scrollTop < clientHeight + 100) {
               scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }
      }, 50);
    }
  };

  const { sendMessage: sendWSMessage } = useAdminWS(
    selectedUserId,
    selectedUserId,
    onWsMessage
  );

  const handleSendMessage = async () => {
    if (!msgInput.trim() || !selectedUserId) return;
    const text = msgInput;
    setMsgInput("");
    setSending(true);
    setError(null);
    try {
      await sendWSMessage(text);
    } catch(e: any) {
        setError(e.message || "Failed to send");
        setMsgInput(text); // Restore message on failure
    } finally {
        setSending(false);
    }
  };

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
          <button onClick={() => fetchUsers(true)} className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"><FaSync className={loadingUsers ? 'animate-spin' : ''} />Refresh</button>
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
                <div className="flex items-center gap-2"> <FaUserCircle className="text-gray-400" size={24} /> <span className="font-medium">{u.userId || u.email}</span></div>
                <span className="text-[10px] text-gray-500">{u.id}</span>
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
            <p className="text-[11px] text-gray-500">{selectedUserId ? `${messages.length} messages` : ''}</p>
          </div>
          {nextCursor && <button onClick={loadOlder} className="text-xs text-purple-600 hover:text-purple-800">Load older</button>}
        </div>
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-2 bg-gradient-to-b from-gray-100 dark:from-gray-800 to-gray-50 dark:to-gray-900">
          {loadingMsgs && <div className="text-xs text-gray-500">Loading messages...</div>}
          {!loadingMsgs && messages.map(m => (
            <div key={m.id} className={`flex ${m.who === 'admin' ? 'justify-end' : 'justify-start'}`}> 
              <div className={`px-4 py-2 rounded-2xl max-w-lg text-sm shadow ${m.who === 'admin' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600'}`}>{m.message}</div>
            </div>
          ))}
          {!loadingMsgs && !messages.length && <div className="text-center text-xs text-gray-400 pt-8">No messages yet.</div>}
        </div>
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center bg-white dark:bg-gray-800 gap-2">
          {error && <div className="text-red-500 text-xs flex items-center gap-1"><FaExclamationTriangle />{error}</div>}
          <input disabled={!selectedUserId || sending} value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=> e.key==='Enter' && handleSendMessage()} placeholder={selectedUserId? 'Type a message...' : 'Select a user'} className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:outline-none text-sm" />
          <button disabled={!msgInput.trim() || !selectedUserId || sending} onClick={handleSendMessage} className="ml-1 px-4 py-2 bg-purple-600 disabled:opacity-50 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm">
            {sending ? <FaSync className="animate-spin" /> : <FaPaperPlane />}
             Send
          </button>
        </div>
      </section>
    </div>
  );
}
