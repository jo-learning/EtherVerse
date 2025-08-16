"use client";
import { useState } from "react";
import { FaUserCircle, FaPaperPlane } from "react-icons/fa";
import { HiHome } from "react-icons/hi";

type Message = { from: string; text: string };
type Messages = { [userId: string]: Message[] };

const users = [
  { id: 1, name: "Customer Service", avatar: "/avatar1.png" },
  { id: 2, name: "Alice", avatar: "/avatar2.png" },
  { id: 3, name: "Bob", avatar: "/avatar3.png" },
];

const initialMessages: Messages = {
  "1": [
    { from: "service", text: "Hello! How can we assist you today?" },
    { from: "me", text: "Hi, I need help with my wallet." },
  ],
  "2": [
    { from: "Alice", text: "Hey, did you try the new feature?" },
    { from: "me", text: "Yes, it's awesome!" },
  ],
  "3": [
    { from: "Bob", text: "Let's catch up soon." },
    { from: "me", text: "Sure, see you!" },
  ],
};

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(users[0].id);
  const [messages, setMessages] = useState<Messages>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [selectedUser.toString()]: [...prev[selectedUser.toString()], { from: "me", text: input }],
    }));
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh)] bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden  mx-auto">
      {/* Sidebar */}
      <aside className="w-1/3 min-w-[120px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="flex justify-center items-center">
        <a 
        href="/account"
        >

        <HiHome />
        </a>
        <h2 className="p-4 font-bold text-lg text-purple-600 dark:text-purple-400 border-b border-gray-200 dark:border-gray-700">Chats</h2>
      
      </div>
        <ul className="flex-1 overflow-y-auto">
          {users.map((user) => (
            <li key={user.id}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition ${
                  selectedUser === user.id ? "bg-purple-50 dark:bg-purple-900/20 font-bold" : ""
                }`}
                onClick={() => setSelectedUser(user.id)}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <FaUserCircle size={32} className="text-gray-400" />
                )}
                <span>{user.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      {/* Chat Panel */}
      <section className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
          {(messages[selectedUser.toString()] || []).map((msg, idx) => (
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
      </section>
    </div>
  );
}
