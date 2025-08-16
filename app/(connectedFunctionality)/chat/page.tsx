"use client";
import { useState } from "react";
import { FaUserCircle, FaPaperPlane } from "react-icons/fa";

// Only customer service chat
const initialMessages = [
  { from: "service", text: "Hello! How can we assist you today?" },
  { from: "me", text: "Hi, I need help with my wallet." },
];

export default function ChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "me", text: input }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-xl mx-auto mt-8 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <FaUserCircle size={32} className="text-purple-600 dark:text-purple-400" />
        <span className="font-bold text-lg text-purple-600 dark:text-purple-400">Customer Service</span>
      </div>
      {/* Chat Panel */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs ${
                msg.from === "me"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      {/* Input Box */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center bg-white dark:bg-gray-800">
        <input
          type="text"
          className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 focus:outline-none"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="ml-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}
