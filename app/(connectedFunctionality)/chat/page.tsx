"use client";
import { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaPaperPlane, FaImage, FaTimes, FaSpinner } from "react-icons/fa";
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

const ChatMessageImage = ({ path }: { path: string }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api${path}`);
        if (res.ok) {
          const blob = await res.blob();
          setImageUrl(URL.createObjectURL(blob));
        }
      } catch (error) {
        console.error("Failed to fetch image", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [path]);

  if (loading) {
    return <FaSpinner className="animate-spin" />;
  }

  if (!imageUrl) {
    return <span>Image not available</span>;
  }

  return <img src={imageUrl} alt="chat image" className="rounded-lg" />;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<{ who: string; message: string; createdAt: string, type?: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { address } = useAccount();
  const [imageToSend, setImageToSend] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);


  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
              type: c.type,
            })),
          ]);
        }
      } catch {}
      setLoading(false);
    }
    fetchChats();
  }, [address]);

  // ✅ use WebSocket hook
  const emailLike = address;
  const { sendMessage: sendWSMessage } = useUserWS(
    `userEmail:${address}`,
    (data) => {
      if (data?.type === "message" && data.chat) {
        // To prevent duplicates from optimistic updates, check if message already exists
        setMessages((prev) => {
          if (prev.some(m => (m as any).id === data.chat.id)) {
            return prev;
          }
          return [...prev, data.chat];
        });
        setTimeout(() => {
          if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
          }
        }, 20);
      }
    }
  );

  const clearImage = () => {
    setImageToSend(null);
    setImagePreviewUrl(null);
    setInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !imageToSend) return;
    setSending(true);
    if (imageToSend) {
      const formData = new FormData();
      formData.append("image", imageToSend);
      try {
        const res = await fetch("/api/chat/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          const sentMessage = await sendWSMessage(data.filePath, { address: emailLike, type: "image" });
          if (sentMessage && sentMessage.chat) {
            setMessages((prev) => [...prev, sentMessage.chat]);
          }
          clearImage();
        }
      } catch (error) {
        console.error("Image upload failed", error);
      }
    } else {
      if (!input.trim()) return;
      const sentMessage = await sendWSMessage(input, { address: emailLike });
      if (sentMessage && sentMessage.chat) {
        setMessages((prev) => [...prev, sentMessage.chat]);
      }
      setInput(""); // optimistic clear
    }
    setSending(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageToSend(file);
      setInput(file.name);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
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
                    ? { background: COLORS.purple, color: COLORS.neonGreen, borderRadius: 20, padding: "8px 16px", maxWidth: "16rem", fontWeight: 500, whiteSpace: "pre-wrap" }
                    : { background: COLORS.navy, color: COLORS.textWhite, borderRadius: 20, padding: "8px 16px", maxWidth: "16rem", fontWeight: 500, border: `1px solid ${COLORS.purple}`, whiteSpace: "pre-wrap" } }>
                  {msg.type === "image" ? (
                    <ChatMessageImage path={msg.message} />
                  ) : (
                    msg.message
                  )}
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
           className="p-4 border-t flex flex-col sticky bottom-0"
           style={{ background: COLORS.navy, borderColor: COLORS.purple }}>
        {imagePreviewUrl && (
          <div className="relative mb-2 self-start">
            <img src={imagePreviewUrl} alt="preview" className="max-h-40 rounded-lg" />
            <button 
              onClick={clearImage} 
              className="absolute top-1 right-1 bg-gray-800 rounded-full p-1 text-white"
            >
              <FaTimes />
            </button>
          </div>
        )}
        <div className="flex items-center w-full">
          <button onClick={() => fileInputRef.current?.click()}
                  className="mr-3 px-4 py-2 rounded-lg flex items-center font-semibold transition"
                  style={{ background: COLORS.purple, color: COLORS.neonGreen, border: `1px solid ${COLORS.neonGreen}` }}>
            <FaImage />
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          <input ref={inputRef} type="text" className="flex-1 p-2 rounded-lg focus:outline-none"
                style={{ border: `1px solid ${COLORS.purple}`, background: COLORS.background, color: COLORS.textWhite }}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()} 
                readOnly={!!imageToSend}
                />
          <button onClick={handleSend}
                  disabled={sending || (!input.trim() && !imageToSend)}
                  className="ml-3 px-4 py-2 rounded-lg flex items-center font-semibold transition disabled:opacity-50"
                  style={{ background: COLORS.purple, color: COLORS.neonGreen, border: `1px solid ${COLORS.neonGreen}` }}>
            {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </div>
      </div>
    </div>
  );
}
