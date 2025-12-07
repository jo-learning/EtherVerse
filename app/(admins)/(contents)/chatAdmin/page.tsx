"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { FaUserCircle, FaPaperPlane, FaSync, FaExclamationTriangle, FaEdit, FaTrash, FaImage, FaTimes, FaSpinner } from "react-icons/fa";
import { HiHome } from "react-icons/hi";
import { useAdminWS } from "../../../../hooks/useAdminWS";

interface ChatMessage {
  id: string;
  message: string;
  who: string;
  createdAt: string;
  adminId?: string | null;
  type?: string;
}

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  userId: string;
}

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageContent, setEditingMessageContent] = useState("");
  const [imageToSend, setImageToSend] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("userId");
    if (userId) {
      setSelectedUserId(userId);
    }
  }, []);

  const fetchUsers = useCallback(async (selectFirstUser = false) => {
    setLoadingUsers(true);
    setError(null);
    try {
      const res = await fetch("/api/chatAdmin/users", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users || []);
      if (!selectedUserId && selectFirstUser && data.users?.length) {
        setSelectedUserId(data.users[0].id);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingUsers(false);
    }
  }, [selectedUserId]);

  const fetchMessages = useCallback(async (userId: string, cursor?: string) => {
    if (!userId) return;
    setLoadingMsgs(true);
    setError(null);
    try {
      const qp = new URLSearchParams({ userId });
      if (cursor) qp.set("cursor", cursor);
      const res = await fetch("/api/chatAdmin/messages?" + qp.toString(), {
        cache: "no-store",
      });
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

  useEffect(() => {
    fetchUsers(true);
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedUserId) {
      setMessages([]);
      setNextCursor(null);
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId, fetchMessages]);

  const onWsMessage = (data: any) => {
    if (
      data?.type === "message" &&
      data.chat &&
      data.chat.userId === selectedUserId
    ) {
      setMessages((prev) => [...prev, data.chat]);
      setTimeout(() => {
        if (scrollRef.current) {
          const { scrollHeight, scrollTop, clientHeight } = scrollRef.current;
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
    } catch (e: any) {
      setError(e.message || "Failed to send");
      setMsgInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageToSend(file);
      setMsgInput(file.name);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageToSend(null);
    setImagePreviewUrl(null);
    setMsgInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteMessage = async (chatId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/chat/${chatId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete message");
      setMessages((prev) => prev.filter((m) => m.id !== chatId));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleUpdateMessage = async (chatId: string) => {
    if (!editingMessageContent.trim()) return;
    try {
      const res = await fetch(`/api/admin/chat/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: editingMessageContent }),
      });
      if (!res.ok) throw new Error("Failed to update message");
      const updatedChat = await res.json();
      setMessages((prev) =>
        prev.map((m) => (m.id === chatId ? updatedChat : m))
      );
      setEditingMessageId(null);
      setEditingMessageContent("");
    } catch (e: any) {
      setError(e.message);
    }
  };

  const startEditing = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditingMessageContent(message.message);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingMessageContent("");
  };

  const loadOlder = () => {
    if (nextCursor && selectedUserId)
      fetchMessages(selectedUserId, nextCursor);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [msgInput]);

  return (
    <div className="flex h-[calc(100vh-2rem)] bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden mx-auto">
      <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <a href="/account" className="text-purple-600 dark:text-purple-400">
              <HiHome />
            </a>
            <h2 className="font-bold text-lg text-purple-600 dark:text-purple-400">
              Chats
            </h2>
          </div>
          <button
            onClick={() => fetchUsers(true)}
            className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            <FaSync className={loadingUsers ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
        <div className="p-2">
          <input
            placeholder="Filter..."
            className="w-full text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 focus:outline-none"
            onChange={(e) => {
              const val = e.target.value.toLowerCase();
              const filtered = users.filter((u) =>
                (u.name || u.email).toLowerCase().includes(val)
              );
              if (val) setUsers(filtered as any);
              else fetchUsers();
            }}
          />
        </div>
        <ul className="flex-1 overflow-y-auto">
          {loadingUsers && (
            <li className="px-4 py-2 text-xs text-gray-500">
              Loading users...
            </li>
          )}
          {!loadingUsers &&
            users.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => setSelectedUserId(u.id)}
                  className={`w-full flex flex-col items-start gap-1 px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-left ${
                    selectedUserId === u.id
                      ? "bg-purple-50 dark:bg-purple-900/20"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {" "}
                    <FaUserCircle className="text-gray-400" size={24} />{" "}
                    <span className="font-medium">{u.userId || u.email}</span>
                  </div>
                  <span className="text-[10px] text-gray-500">{u.id}</span>
                </button>
              </li>
            ))}
          {!loadingUsers && users.length === 0 && (
            <li className="px-4 py-4 text-sm text-gray-500">No users</li>
          )}
        </ul>
      </aside>
      <section className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-semibold text-purple-700 dark:text-purple-300 text-sm">
              {users.find((u) => u.id === selectedUserId)?.name ||
                users.find((u) => u.id === selectedUserId)?.email ||
                "Select a user"}
            </h3>
            <p className="text-[11px] text-gray-500">
              {selectedUserId ? `${messages.length} messages` : ""}
            </p>
          </div>
          {nextCursor && (
            <button
              onClick={loadOlder}
              className="text-xs text-purple-600 hover:text-purple-800"
            >
              Load older
            </button>
          )}
        </div>
        <div
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto space-y-2 bg-gradient-to-b from-gray-100 dark:from-gray-800 to-gray-50 dark:to-gray-900"
        >
          {loadingMsgs && (
            <div className="text-xs text-gray-500">Loading messages...</div>
          )}
          {!loadingMsgs &&
            messages.map((m) => (
              <div
                key={m.id}
                className={`group flex items-center gap-2 ${
                  m.who === "admin" ? "justify-end" : "justify-start"
                }`}
              >
                {m.who === "admin" && (
                  <div className="flex items-center gap-1 transition-opacity sm:opacity-0 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto sm:group-focus-within:opacity-100">
                    <button
                      onClick={() => startEditing(m)}
                      className="text-xs text-gray-500 hover:text-blue-500"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(m.id)}
                      className="text-xs text-gray-500 hover:text-red-500"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
                {editingMessageId === m.id ? (
                  <div className="flex-1">
                    <textarea
                      value={editingMessageContent}
                      onChange={(e) =>
                        setEditingMessageContent(e.target.value)
                      }
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:outline-none text-sm"
                    />
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        onClick={cancelEditing}
                        className="text-xs text-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateMessage(m.id)}
                        className="text-xs text-green-500"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-lg text-sm shadow whitespace-pre-wrap ${
                      m.who === "admin"
                        ? "bg-purple-600 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    {m.type === 'image' ? (
                      <ChatMessageImage path={m.message} />
                    ) : (
                      m.message
                    )}
                  </div>
                )}
              </div>
            ))}
          {!loadingMsgs && !messages.length && (
            <div className="text-center text-xs text-gray-400 pt-8">
              No messages yet.
            </div>
          )}
        </div>
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 gap-2">
          {error && (
            <div className="text-red-500 text-xs flex items-center gap-1">
              <FaExclamationTriangle />
              {error}
            </div>
          )}
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
                    className="mr-3 px-4 py-2 rounded-lg flex items-center font-semibold transition bg-purple-600 text-white hover:bg-purple-700 self-end">
              <FaImage />
            </button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            <textarea
              ref={textareaRef}
              rows={1}
              style={{ resize: "none", overflowY: "auto" }}
              disabled={!selectedUserId || sending}
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                selectedUserId ? "Type a message..." : "Select a user"
              }
              className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:outline-none text-sm"
              readOnly={!!imageToSend}
            />
            <button
              disabled={!msgInput.trim() || !selectedUserId || sending}
              onClick={handleSendMessage}
              className="ml-1 px-4 py-2 bg-purple-600 disabled:opacity-50 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm self-end"
            >
              {sending ? (
                <FaSync className="animate-spin" />
              ) : (
                <FaPaperPlane />
              )}
              Send
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
