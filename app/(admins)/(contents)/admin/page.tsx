"use client";
import React, { useEffect, useState } from "react";

type Admin = {
  id: string;
  adminId: number;
  email: string;
  name?: string | null;
  role: "ADMIN" | "SUPERADMIN";
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
};

type SessionCheck = {
  authenticated: boolean;
  admin?: { id: string; role: "ADMIN" | "SUPERADMIN"; email: string };
};

const emptyForm = {
  id: "",
  email: "",
  name: "",
  password: "",
  role: "ADMIN" as "ADMIN" | "SUPERADMIN",
  status: "active",
};

export default function AdminManagementPage() {
  const [session, setSession] = useState<SessionCheck | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const [form, setForm] = useState({ ...emptyForm });
  const [editing, setEditing] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Load session
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/login", { credentials: "include" });
        const data = await res.json();
        setSession(data);
      } catch {
        setSession({ authenticated: false });
      } finally {
        setLoadingSession(false);
      }
    })();
  }, []);

  async function loadAdmins() {
    setLoadingAdmins(true);
    setError(null);
    try {
      const res = await fetch("/api/admin", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch admins");
      setAdmins(json.admins || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingAdmins(false);
    }
  }

  useEffect(() => {
    if (session?.authenticated && session.admin?.role === "SUPERADMIN") {
      loadAdmins();
    }
  }, [session]);

  function handleChange<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditing(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!form.email || (!editing && !form.password)) {
      setError("Email and password (for create) required");
      return;
    }
    setSubmitting(true);
    try {
      const method = editing ? "PATCH" : "POST";
      const payload: any = {
        email: form.email.trim(),
        role: form.role,
        name: form.name || undefined,
        status: form.status,
      };
      if (editing) {
        payload.id = form.id;
        if (form.password) payload.password = form.password;
      } else {
        payload.password = form.password;
      }
      const res = await fetch("/api/admin", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Operation failed");
      setInfo(editing ? "Admin updated" : "Admin created");
      resetForm();
      loadAdmins();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(a: Admin) {
    setEditing(true);
    setForm({
      id: a.id,
      email: a.email,
      name: a.name || "",
      password: "",
      role: a.role,
      status: a.status,
    });
    setInfo(null);
    setError(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this admin?")) return;
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/admin?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Delete failed");
      setInfo("Admin deleted");
      if (form.id === id) resetForm();
      loadAdmins();
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (loadingSession) {
    return (
      <div className="p-8 text-sm text-gray-500">
        Checking session...
      </div>
    );
  }

  if (!session?.authenticated) {
    return (
      <div className="p-8 max-w-md">
        <h1 className="text-xl font-bold mb-2">Unauthorized</h1>
        <p className="text-sm text-gray-500">
          Please login as SUPERADMIN to manage admins.
        </p>
      </div>
    );
  }

  if (session.admin?.role !== "SUPERADMIN") {
    return (
      <div className="p-8 max-w-md">
        <h1 className="text-xl font-bold mb-2">Forbidden</h1>
        <p className="text-sm text-gray-500">
          Only SUPERADMIN can access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-300">Admin Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create, update, and delete administrator accounts.
        </p>
      </header>

      <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h2 className="font-semibold mb-4">{editing ? "Edit Admin" : "Create Admin"}</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide opacity-70">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={e => handleChange("email", e.target.value)}
              disabled={editing}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide opacity-70">
              {editing ? "New Password (optional)" : "Password"}
            </label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={e => handleChange("password", e.target.value)}
              placeholder={editing ? "Leave blank to keep" : ""}
              required={!editing}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide opacity-70">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="Optional"
            />
          </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide opacity-70">Role</label>
              <select
                className="input"
                value={form.role}
                onChange={e => handleChange("role", e.target.value as any)}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="SUPERADMIN">SUPERADMIN</option>
              </select>
            </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide opacity-70">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={e => handleChange("status", e.target.value)}
            >
              <option value="active">active</option>
              <option value="disabled">disabled</option>
            </select>
          </div>
          <div className="md:col-span-2 flex gap-3 pt-2">
            <button
              disabled={submitting}
              className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {submitting ? (editing ? "Updating..." : "Creating...") : editing ? "Update Admin" : "Create Admin"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-md bg-gray-300 dark:bg-gray-600 text-sm font-medium hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {error && (
          <div className="mt-4 text-xs rounded-md px-3 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">
            {error}
          </div>
        )}
        {info && (
          <div className="mt-4 text-xs rounded-md px-3 py-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700">
            {info}
          </div>
        )}
      </section>

      <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Admins ({admins.length})</h2>
          <button
            onClick={loadAdmins}
            disabled={loadingAdmins}
            className="text-xs px-3 py-1 rounded-md bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
          >
            {loadingAdmins ? "Loading..." : "Refresh"}
          </button>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Last Login</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr
                  key={a.id}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-purple-50/40 dark:hover:bg-gray-700/40"
                >
                  <td className="py-2 pr-4 font-mono">{a.adminId}</td>
                  <td className="py-2 pr-4">{a.email}</td>
                  <td className="py-2 pr-4">{a.role}</td>
                  <td className="py-2 pr-4">{a.status}</td>
                  <td className="py-2 pr-4">
                    {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : "-"}
                  </td>
                  <td className="py-2 pr-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(a)}
                      className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))}
              {!loadingAdmins && admins.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    No admins found.
                  </td>
                </tr>
              )}
              {loadingAdmins && (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[10px] text-gray-500 dark:text-gray-400">
          Deleting or demoting the last SUPERADMIN is blocked.
        </p>
      </section>

      <style jsx>{`
        .input {
          background: rgba(255,255,255,0.85);
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.55rem 0.75rem;
          font-size: 0.75rem;
          outline: none;
          transition: border .15s, box-shadow .15s;
        }
        .dark .input {
          background: rgba(31,41,55,0.65);
          border-color: #374151;
          color: #f1f5f9;
        }
        .input:focus {
          border-color: #9333ea;
          box-shadow: 0 0 0 1px #9333ea55;
        }
      `}</style>
    </div>
  );
}
