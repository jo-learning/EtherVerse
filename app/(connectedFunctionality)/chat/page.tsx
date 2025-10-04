"use client";
import { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaPaperPlane } from "react-icons/fa";
import { useAccount } from "wagmi";
import { useUserWS } from "../../../hooks/useUserWS";  // ✅ new hook

// Colors
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

const USER_ADDRESS = "user@email.com";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ who: string; message: string; createdAt: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();

  const inputRef = useRef<HTMLInputElement>(null);
  const inputBarRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Welcome message
  useEffect(() => {
    setMessages([{
      who: "service",
      message: "Welcome to our customer support! How may I assist you today?",
      createdAt: new Date().toLocaleString()
    }]);
  }, []);

  // Fetch chats on mount
  useEffect(() => {
    async function fetchChats() {
      setLoading(true);
      try {
        const res = await fetch(`/api/chat/get?address=${encodeURIComponent(address ?? "")}`);
        const data = await res.json();
        if (data.chats) {
          setMessages((prev) => [
            ...prev,
            ...data.chats.map((c: any) => ({
              who: c.who,
              message: c.message,
              createdAt: new Date(c.createdAt).toLocaleString(),
            })),
          ]);
        }
      } catch {}
      setLoading(false);
    }
    fetchChats();
  }, [address]);

  // ✅ use WebSocket hook
  const emailLike = address ?? USER_ADDRESS;
  const { sendMessage: sendWSMessage } = useUserWS(
    `userEmail:${emailLike}`,
    (data) => {
      if (data?.type === "message" && data.chat) {
        setMessages((prev) => [...prev, data.chat]);
        setTimeout(() => {
          if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
          }
        }, 20);
      }
    }
  );

  const handleSend = () => {
    if (!input.trim()) return;
    sendWSMessage(input, { address: emailLike });
    setInput(""); // optimistic clear
  };

  return (
    <div className="flex flex-col max-w-xl mx-auto rounded-xl shadow-lg"
         style={{ background: COLORS.background, minHeight: "100dvh" }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b"
           style={{ background: COLORS.navy, borderColor: COLORS.purple }}>
        <FaUserCircle size={32} style={{ color: COLORS.neonGreen }} />
        <span className="font-bold text-lg" style={{ color: COLORS.neonGreen }}>
          Customer Service
        </span>
      </div>

      {/* Chat Panel */}
      <div ref={messagesRef} className="flex-1 p-4 overflow-y-auto space-y-2"
           style={{ scrollBehavior: "smooth" }}>
        {loading && messages.length === 0 ? (
          <div className="text-center" style={{ color: COLORS.textGray }}>Loading...</div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.who === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex flex-col">
                <div style={ msg.who === "user"
                    ? { background: COLORS.purple, color: COLORS.neonGreen, borderRadius: 20, padding: "8px 16px", maxWidth: "16rem", fontWeight: 500 }
                    : { background: COLORS.navy, color: COLORS.textWhite, borderRadius: 20, padding: "8px 16px", maxWidth: "16rem", fontWeight: 500, border: `1px solid ${COLORS.purple}` } }>
                  {msg.message}
                </div>
                <div className={`text-sm ${msg.who === "user" ? "text-right" : "text-left"}`}
                     style={{ color: COLORS.textGray }}>
                  {msg.createdAt}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div ref={inputBarRef}
           className="p-4 border-t flex items-center sticky bottom-0"
           style={{ background: COLORS.navy, borderColor: COLORS.purple }}>
        <input ref={inputRef} type="text" className="flex-1 p-2 rounded-lg focus:outline-none"
               style={{ border: `1px solid ${COLORS.purple}`, background: COLORS.background, color: COLORS.textWhite }}
               placeholder="Type your message..."
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && handleSend()} />
        <button onClick={handleSend}
                className="ml-3 px-4 py-2 rounded-lg flex items-center font-semibold transition"
                style={{ background: COLORS.purple, color: COLORS.neonGreen, border: `1px solid ${COLORS.neonGreen}` }}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}
