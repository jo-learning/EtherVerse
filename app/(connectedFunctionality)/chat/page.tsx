"use client";
import { useState, useEffect } from "react";
import { FaUserCircle, FaPaperPlane } from "react-icons/fa";

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
  const [messages, setMessages] = useState<{ who: string; message: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch chats on mount
  useEffect(() => {
    async function fetchChats() {
      setLoading(true);
      try {
        const address = window.ethereum?.selectedAddress;
        const res = await fetch(`/api/chat/get?address=${encodeURIComponent(address)}`);
        const data = await res.json();
        if (data.chats) {
          setMessages(data.chats.map((c: any) => ({
            who: c.who,
            message: c.message
          })));
        }
      } catch (err) {
        // handle error
      }
      setLoading(false);
    }
    fetchChats();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const address = window.ethereum?.selectedAddress;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address, message: input })
      });
      const data = await res.json();
      if (data.chat) {
        setMessages(prev => [
          ...prev,
          { who: data.chat.who || "user", message: data.chat.message }
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
      className="flex flex-col h-[calc(100vh-64px)] max-w-xl mx-auto mt-8 rounded-xl shadow-lg overflow-hidden"
      style={{ background: COLORS.background }}
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
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {loading && messages.length === 0 ? (
          <div className="text-center" style={{ color: COLORS.textGray }}>Loading...</div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.who === "user" ? "justify-end" : "justify-start"}`}
            >
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
            </div>
          ))
        )}
      </div>
      {/* Input Box */}
      <div
        className="p-4 border-t flex items-center"
        style={{
          background: COLORS.navy,
          borderColor: COLORS.purple,
        }}
      >
        <input
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
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="ml-3 px-4 py-2 rounded-lg flex items-center font-semibold transition"
          style={{
            background: COLORS.purple,
            color: COLORS.neonGreen,
            border: `1px solid ${COLORS.neonGreen}`,
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLElement).style.background = COLORS.neonGreen;
            (e.currentTarget as HTMLElement).style.color = COLORS.black;
          }}
          onMouseOut={e => {
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
