"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { FaUser, FaEye, FaEdit, FaBan, FaTrash, FaPlus, FaSync } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";

type ApiUser = {
  id: string;
  userId: number;
  email: string;
  name: string | null;
  avatar: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  balances: Record<string, number>;
  wallet: {
    id: string;
    createdAt: string;
    updatedAt: string;
    balances: Record<string, number>;
  } | null;
};

type UserFormValues = {
  email: string;
  name: string | null;
  status: string;
  userId?: number;
};

const coins = ["BTC", "ETH", "USDT"] as const;
const statusOptions = ["active", "suspended", "banned"] as const;

async function parseBody(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

interface UserFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialUser: ApiUser | null;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
  submitting: boolean;
}

function UserFormModal({ open, mode, initialUser, onClose, onSubmit, submitting }: UserFormModalProps) {
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [name, setName] = useState(initialUser?.name ?? "");
  const [status, setStatus] = useState(initialUser?.status ?? "active");
  const [userId, setUserId] = useState(initialUser?.userId ? String(initialUser.userId) : "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setEmail(initialUser?.email ?? "");
    setName(initialUser?.name ?? "");
    setStatus(initialUser?.status ?? "active");
    setUserId(initialUser?.userId ? String(initialUser.userId) : "");
    setError(null);
  }, [open, initialUser]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    const trimmedName = name.trim();
    const parsedUserId = userId.trim() ? Number(userId) : undefined;

    if (parsedUserId !== undefined && !Number.isInteger(parsedUserId)) {
      setError("User ID must be an integer");
      return;
    }

    try {
      await onSubmit({
        email: trimmedEmail,
        name: trimmedName ? trimmedName : null,
        status,
        userId: parsedUserId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit user");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg p-6 text-gray-900 dark:text-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-300"
          disabled={submitting}
        >
          ✕
        </button>
        <h2 className="text-lg font-bold mb-4">
          {mode === "create" ? "Create User" : "Edit User"}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="user@example.com"
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Full name"
              disabled={submitting}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={submitting}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">User ID (optional)</label>
              <input
                type="number"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Auto-generated if empty"
                disabled={submitting}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold disabled:opacity-70"
              disabled={submitting}
            >
              {submitting ? "Saving..." : mode === "create" ? "Create" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formUser, setFormUser] = useState<ApiUser | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users");
      const body = (await parseBody(response)) as { users?: ApiUser[]; error?: string };
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to fetch users");
      }
      setUsers(body.users ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load users";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreateForm = () => {
    setFormMode("create");
    setFormUser(null);
    setFormModalOpen(true);
  };

  const openEditForm = (user: ApiUser) => {
    setFormMode("edit");
    setFormUser(user);
    setFormModalOpen(true);
  };

  const handleView = (user: ApiUser) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleFormSubmit = async (values: UserFormValues) => {
    setFormSubmitting(true);
    try {
      if (formMode === "create") {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: values.email,
            name: values.name,
            status: values.status,
            userId: values.userId,
          }),
        });
        const body = (await parseBody(response)) as { user?: ApiUser; error?: string };
        if (!response.ok) {
          throw new Error(body?.error ?? "Failed to create user");
        }
        if (body.user) {
          setUsers((prev) => [body.user!, ...prev]);
        }
        toast.success("User created successfully");
      } else if (formMode === "edit" && formUser) {
        const response = await fetch(`/api/users/${formUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: values.email,
            name: values.name,
            status: values.status,
            userId: values.userId,
          }),
        });
        const body = (await parseBody(response)) as { user?: ApiUser; error?: string };
        if (!response.ok) {
          throw new Error(body?.error ?? "Failed to update user");
        }
        if (body.user) {
          setUsers((prev) => prev.map((item) => (item.id === body.user!.id ? body.user! : item)));
          setSelectedUser((current) => (current?.id === body.user!.id ? body.user! : current));
        }
        toast.success("User updated successfully");
      }
      setFormModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save user";
      toast.error(message);
      throw err;
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleBan = async (user: ApiUser) => {
    const nextStatus = user.status === "banned" ? "active" : "banned";
    setActionId(user.id);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const body = (await parseBody(response)) as { user?: ApiUser; error?: string };
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to update user status");
      }
      if (body.user) {
        setUsers((prev) => prev.map((item) => (item.id === body.user!.id ? body.user! : item)));
        setSelectedUser((current) => (current?.id === body.user!.id ? body.user! : current));
      }
      toast.success(nextStatus === "banned" ? "User banned" : "User reinstated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (user: ApiUser) => {
    if (!window.confirm(`Delete user ${user.email}? This cannot be undone.`)) {
      return;
    }
    setActionId(user.id);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = (await parseBody(response)) as { error?: string };
        throw new Error(body?.error ?? "Failed to delete user");
      }
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      setSelectedUser((current) => (current?.id === user.id ? null : current));
      if (selectedUser?.id === user.id) {
        setViewModalOpen(false);
      }
      toast.success("User deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setActionId(null);
    }
  };

  const totalUsers = users.length;
  const activeUsers = useMemo(() => users.filter((user) => user.status === "active").length, [users]);
  const bannedUsers = useMemo(() => users.filter((user) => user.status === "banned").length, [users]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1f2937", color: "#fff", border: "1px solid #4b0082" },
          success: { iconTheme: { primary: "#22c55e", secondary: "#1f2937" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#1f2937" } },
        }}
      />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400 flex items-center gap-2">
          <FaUser /> User Management
        </h1>
        <div className="flex gap-3">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
            disabled={loading}
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700"
          >
            <FaPlus /> Add User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Users" value={totalUsers.toString()} />
        <StatCard title="Active" value={activeUsers.toString()} tone="success" />
        <StatCard title="Banned" value={bannedUsers.toString()} tone="danger" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-400">Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Joined</th>
                {coins.map((coin) => (
                  <th key={coin} className="py-2 px-4">{coin} Balance</th>
                ))}
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5 + coins.length} className="py-6 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5 + coins.length} className="py-6 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5 + coins.length} className="py-6 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-2 px-4">{user.name ?? "-"}</td>
                    <td className="py-2 px-4">{user.email}</td>
                    <td
                      className={`py-2 px-4 font-semibold ${
                        user.status === "active"
                          ? "text-green-600"
                          : user.status === "banned"
                          ? "text-red-600"
                          : "text-yellow-500"
                      }`}
                    >
                      {user.status}
                    </td>
                    <td className="py-2 px-4">{formatDate(user.createdAt)}</td>
                    {coins.map((coin) => (
                      <td key={coin} className="py-2 px-4">
                        {user.balances?.[coin] ?? 0}
                      </td>
                    ))}
                    <td className="py-2 px-4 flex gap-2">
                      <button
                        className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                        title="View"
                        onClick={() => handleView(user)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50"
                        title="Edit"
                        onClick={() => openEditForm(user)}
                        disabled={actionId === user.id}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 disabled:opacity-50"
                        title={user.status === "banned" ? "Unban" : "Ban"}
                        onClick={() => handleToggleBan(user)}
                        disabled={actionId === user.id}
                      >
                        <FaBan />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50"
                        title="Delete"
                        onClick={() => handleDelete(user)}
                        disabled={actionId === user.id}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserFormModal
        open={formModalOpen}
        mode={formMode}
        initialUser={formUser}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        submitting={formSubmitting}
      />

      {viewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 text-gray-900 dark:text-gray-100 relative">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-400"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">User Details</h2>
            <div className="space-y-2 text-sm">
              <DetailRow label="Name" value={selectedUser.name ?? "-"} />
              <DetailRow label="Email" value={selectedUser.email} />
              <DetailRow label="Status" value={selectedUser.status} />
              <DetailRow label="User ID" value={selectedUser.userId.toString()} />
              <DetailRow label="Joined" value={formatDate(selectedUser.createdAt)} />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Balances</h3>
              <ul className="space-y-1 text-sm">
                {coins.map((coin) => (
                  <li key={coin} className="flex justify-between">
                    <span>{coin}</span>
                    <span>{selectedUser.balances?.[coin] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold disabled:opacity-50"
                onClick={() => {
                  openEditForm(selectedUser);
                  setViewModalOpen(false);
                }}
                disabled={actionId === selectedUser.id}
              >
                Edit
              </button>
              <button
                className="flex-1 py-2 rounded-lg bg-yellow-500 text-white font-bold disabled:opacity-50"
                onClick={() => handleToggleBan(selectedUser)}
                disabled={actionId === selectedUser.id}
              >
                {selectedUser.status === "banned" ? "Unban" : "Ban"}
              </button>
              <button
                className="flex-1 py-2 rounded-lg bg-red-600 text-white font-bold disabled:opacity-50"
                onClick={() => handleDelete(selectedUser)}
                disabled={actionId === selectedUser.id}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  tone?: "default" | "success" | "danger";
}

function StatCard({ title, value, tone = "default" }: StatCardProps) {
  const bg =
    tone === "success"
      ? "bg-emerald-100 dark:bg-emerald-900/40"
      : tone === "danger"
      ? "bg-red-100 dark:bg-red-900/40"
      : "bg-purple-100 dark:bg-purple-900/40";

  return (
    <div className={`${bg} rounded-xl p-4 shadow text-gray-900 dark:text-gray-100`}>
      <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex justify-between gap-4">
      <span className="font-semibold text-gray-600 dark:text-gray-300">{label}:</span>
      <span className="text-gray-900 dark:text-gray-100 text-right">{value}</span>
    </div>
  );
}
