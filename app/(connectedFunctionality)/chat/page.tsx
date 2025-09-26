"use client";
import { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaPaperPlane } from "react-icons/fa";
import { useAccount } from "wagmi";

// Color theme constants
const COLORS = {
  purple: "#4b0082",
  neonGreen: "#ffffff",
  black: "#0D0D0D",
  white: "#ffffff",
  background: "#0a1026",
  navy: "#172042",
  textWhite: "#ffffff",
  textGray: "#b0b8c1",
};

const USER_ADDRESS = "user@email.com"; // Replace with actual logic to get user's address/email

export default function ChatPage() {
  const [messages, setMessages] = useState<{ who: string; message: string; createdAt: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();

  const inputRef = useRef<HTMLInputElement>(null);
  const inputBarRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Add welcome message on component mount
  useEffect(() => {
    const welcomeMessage = {
      who: "service",
      message: "Welcome to our customer support! How may I assist you today? Please let me know if you have any questions or concerns.",
      createdAt: new Date().toLocaleString()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Keep input visible when keyboard opens (mobile)
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const handler = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      if (messagesRef.current) {
        // add bottom padding so content is not hidden behind the input bar
        messagesRef.current.style.paddingBottom = `${kb + 96}px`;
      }
      if (inputBarRef.current) {
        // lift the input bar above the keyboard
        inputBarRef.current.style.transform = `translateY(-${kb}px)`;
      }
    };
    vv.addEventListener("resize", handler);
    vv.addEventListener("scroll", handler);
    handler();
    return () => {
      vv.removeEventListener("resize", handler);
      vv.removeEventListener("scroll", handler);
    };
  }, []);

  // Fetch chats on mount
  useEffect(() => {
    async function fetchChats() {
      setLoading(true);
      try {
        // const address = window.ethereum?.selectedAddress;
        const res = await fetch(`/api/chat/get?address=${encodeURIComponent(address ?? "")}`);
        const data = await res.json();
        if (data.chats) {
          setMessages(prev => [
            ...prev,
            ...data.chats.map((c: any) => ({
              who: c.who,
              message: c.message,
              createdAt: new Date(c.createdAt).toLocaleString(),
            }))
          ]);
        }
      } catch (err) {
        // handle error
      }
      setLoading(false);
    }
    fetchChats();
  }, [address]);

  // WebSocket realtime with priming, logs, heartbeat, reconnect jitter, and StrictMode guard
  useEffect(() => {
    if (!address) return;
    let hb: any;
    let reconnectTimer: any;
    let tries = 0;

    fetch('/api/ws').catch(() => {});

    // Reuse existing in StrictMode double-mount
    const existing: any = (window as any).__userWS;
    if (existing && (existing.readyState === 0 || existing.readyState === 1)) {
      console.debug('[WS-USER] reusing existing socket');
      // Ensure subscribed for current address when it opens
      if (existing.readyState === 1) {
        try {
          existing.send(JSON.stringify({ type: 'subscribe', channel: `user:${address}` }));
          existing.send(JSON.stringify({ type: 'subscribe', channel: `userEmail:${address}` }));
        } catch {}
      } else {
        existing.addEventListener('open', () => {
          try {
            existing.send(JSON.stringify({ type: 'subscribe', channel: `user:${address}` }));
            existing.send(JSON.stringify({ type: 'subscribe', channel: `userEmail:${address}` }));
          } catch {}
        }, { once: true });
      }
      return () => { /* do not close someone else's socket */ };
    }

    const ownerId = Math.random().toString(36).slice(2);
    const connect = () => {
      const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const url = `${wsProto}://${window.location.host}/api/ws`;
      console.debug('[WS-USER] connecting', url);
      const ws: any = new WebSocket(url);
      ws.__ownerId = ownerId;
      (window as any).__userWS = ws;
      ws.addEventListener('open', () => {
        tries = 0;
        console.debug('[WS-USER] open');
        clearInterval(hb);
        hb = setInterval(() => { try { ws?.send(JSON.stringify({ type: 'ping', ts: Date.now() })); } catch {} }, 25000);
        try {
          ws.send(JSON.stringify({ type: 'subscribe', channel: `user:${address}` }));
          ws.send(JSON.stringify({ type: 'subscribe', channel: `userEmail:${address}` }));
        } catch {}
      });
      ws.addEventListener('message', (ev: MessageEvent) => {
        console.debug('[WS-USER] message', ev.data);
        try {
          const data = JSON.parse(ev.data as any);
          if (data?.type === 'message' && data.chat) {
            const c = data.chat;
            setMessages(prev => [...prev, { who: c.who, message: c.message, createdAt: new Date(c.createdAt).toLocaleString() }]);
            setTimeout(() => { messagesRef.current && (messagesRef.current.scrollTop = messagesRef.current.scrollHeight); }, 20);
          }
        } catch (e) { console.warn('[WS-USER] parse error', e); }
      });
      ws.addEventListener('error', (e: any) => { console.warn('[WS-USER] error', e); });
      ws.addEventListener('close', (ev: CloseEvent) => {
        try { console.debug('[WS-USER] closed', ev.code, ev.reason); } catch {}
        clearInterval(hb);
        // Only clear global if we own it
        if (((window as any).__userWS as any)?.__ownerId === ownerId) {
          (window as any).__userWS = undefined;
        }
        const jitter = Math.floor(Math.random() * 300);
        const delay = Math.min(1000 * Math.pow(2, tries++), 8000) + jitter;
        reconnectTimer = setTimeout(connect, delay);
      });
    };

    connect();
    return () => {
      clearInterval(hb);
      clearTimeout(reconnectTimer);
      const gws: any = (window as any).__userWS;
      if (gws && gws.__ownerId === ownerId) {
        try { gws.close(); } catch {}
        (window as any).__userWS = undefined;
      }
    };
  }, [address]);

  // If address changes while socket is open, resubscribe channels
  useEffect(() => {
    const ws: WebSocket | undefined = (window as any).__userWS;
    if (!ws || ws.readyState !== 1) return;
    try {
      ws.send(JSON.stringify({ type: 'subscribe', channel: `user:${address}` }));
      ws.send(JSON.stringify({ type: 'subscribe', channel: `userEmail:${address}` }));
    } catch {}
  }, [address]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      // const address = window.ethereum?.selectedAddress;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address, message: input }),
      });
      const data = await res.json();
      if (data.chat) {
        setMessages((prev) => [
          ...prev,
          {
            who: data.chat.who || "user",
            message: data.chat.message,
            createdAt: new Date(data.chat.createdAt).toLocaleString(),
          },
        ]);
      }
      setInput("");
    } catch (err) {
      // handle error
    }
    setLoading(false);
  };

  return (
    <div
      className="flex flex-col max-w-xl mx-auto rounded-xl shadow-lg"
      style={{ background: COLORS.background, minHeight: "100dvh" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 border-b"
        style={{
          background: COLORS.navy,
          borderColor: COLORS.purple,
        }}
      >
        <FaUserCircle size={32} style={{ color: COLORS.neonGreen }} />
        <span className="font-bold text-lg" style={{ color: COLORS.neonGreen }}>
          Customer Service
        </span>
      </div>
      {/* Chat Panel */}
      <div
        ref={messagesRef}
        className="flex-1 p-4 overflow-y-auto space-y-2"
        style={{ scrollBehavior: "smooth" }}
      >
        {loading && messages.length === 0 ? (
          <div className="text-center" style={{ color: COLORS.textGray }}>Loading...</div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.who === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex flex-col">
               <div
                style={
                  msg.who === "user"
                    ? {
                        background: COLORS.purple,
                        color: COLORS.neonGreen,
                        borderRadius: 20,
                        padding: "8px 16px",
                        maxWidth: "16rem",
                        fontWeight: 500,
                      }
                    : {
                        background: COLORS.navy,
                        color: COLORS.textWhite,
                        borderRadius: 20,
                        padding: "8px 16px",
                        maxWidth: "16rem",
                        fontWeight: 500,
                        border: `1px solid ${COLORS.purple}`,
                      }
                }
              >
                {msg.message}
              </div>
              {/* Message Date */}
              <div
                className={`text-sm ${msg.who === "user" ? "text-right" : "text-left"}`}
                style={{ color: COLORS.textGray }}
              >
                {msg.createdAt}
              </div>
              </div>
             
            </div>
          ))
        )}
      </div>
      {/* Sticky Input Box */}
      <div
        ref={inputBarRef}
        className="p-4 border-t flex items-center sticky bottom-0"
        style={{
          background: COLORS.navy,
          borderColor: COLORS.purple,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
          zIndex: 10,
          transition: "transform 0.2s ease",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          className="flex-1 p-2 rounded-lg focus:outline-none"
          style={{
            border: `1px solid ${COLORS.purple}`,
            background: COLORS.background,
            color: COLORS.textWhite,
          }}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setTimeout(() => inputRef.current?.scrollIntoView({ block: "end", inline: "nearest", behavior: "smooth" }), 50)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="ml-3 px-4 py-2  rounded-lg flex items-center font-semibold transition"
          style={{
            background: COLORS.purple,
            color: COLORS.neonGreen,
            border: `1px solid ${COLORS.neonGreen}`,
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLElement).style.background = COLORS.neonGreen;
            (e.currentTarget as HTMLElement).style.color = COLORS.black;
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLElement).style.background = COLORS.purple;
            (e.currentTarget as HTMLElement).style.color = COLORS.neonGreen;
          }}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}