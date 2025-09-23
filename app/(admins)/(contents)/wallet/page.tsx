"use client";
import { useEffect, useState } from "react";

type Wallet = {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  network: string;
  address: string;
  publicKey: string;
  actualBalance: string;
  balance: number;
  profits: number;
  frozen: number;
  createdAt: string;
  updatedAt: string;
  // privateKey intentionally omitted (sanitized list)
};

type FormState = {
  id?: string;
  coinId: string;
  symbol: string;
  name: string;
  network: string;
  address: string;
  publicKey: string;
};

const emptyForm: FormState = {
  coinId: "",
  symbol: "",
  name: "",
  network: "",
  address: "",
  publicKey: "",
};

export default function WalletPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState(false);

  async function loadWallets() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wallet", { method: "GET" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to load wallets");
      }
      const data = await res.json();
      setWallets(data.wallets || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWallets();
  }, []);

  function handleChange<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const method = editing ? "PATCH" : "POST";
      const body = editing ? { ...form } : { ...form };
      const res = await fetch("/api/wallet", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Operation failed");
      setForm(emptyForm);
      setEditing(false);
      loadWallets();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(w: Wallet) {
    setForm({
      id: w.id,
      coinId: w.coinId,
      symbol: w.symbol,
      name: w.name,
      network: w.network,
      address: w.address,
      publicKey: w.publicKey,
    });
    setEditing(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this wallet?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/wallet?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Delete failed");
      loadWallets();
    } catch (e: any) {
      setError(e.message);
    }
  }

  function handleCancel() {
    setForm(emptyForm);
    setEditing(false);
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-300">Wallet Management</h1>

      {error && (
        <div className="rounded-md bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-2">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl p-4 border border-gray-200 dark:border-gray-700"
      >
        <div className="md:col-span-3 font-semibold">
          {editing ? "Edit Wallet" : "Create Wallet"}
        </div>
        <input
          className="input"
          placeholder="Coin ID"
          value={form.coinId}
          onChange={e => handleChange("coinId", e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Symbol (e.g. BTC)"
          value={form.symbol}
          onChange={e => handleChange("symbol", e.target.value.toUpperCase())}
          required
        />
        <input
          className="input"
          placeholder="Name"
          value={form.name}
          onChange={e => handleChange("name", e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Network"
          value={form.network}
          onChange={e => handleChange("network", e.target.value)}
          required
        />
        <input
          className="input md:col-span-2"
          placeholder="Address"
          value={form.address}
          onChange={e => handleChange("address", e.target.value)}
          required
        />
        <input
          className="input md:col-span-2"
          placeholder="Public Key"
          value={form.publicKey}
          onChange={e => handleChange("publicKey", e.target.value)}
          required
        />
        <div className="flex gap-2 md:col-span-3">
          <button
            disabled={submitting}
            className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {submitting ? (editing ? "Updating..." : "Creating...") : editing ? "Update" : "Create"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-md bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Wallets ({wallets.length})</h2>
          <button
            onClick={loadWallets}
            disabled={loading}
            className="text-sm px-3 py-1 rounded-md bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 pr-4">Symbol</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Network</th>
                <th className="py-2 pr-4">Balance</th>
                <th className="py-2 pr-4">Profits</th>
                <th className="py-2 pr-4">Frozen</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map(w => (
                <tr
                  key={w.id}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-purple-50/50 dark:hover:bg-gray-700/40"
                >
                  <td className="py-2 pr-4 font-medium">{w.symbol}</td>
                  <td className="py-2 pr-4">{w.name}</td>
                  <td className="py-2 pr-4">{w.network}</td>
                  <td className="py-2 pr-4">{w.balance}</td>
                  <td className="py-2 pr-4">{w.profits}</td>
                  <td className="py-2 pr-4">{w.frozen}</td>
                  <td className="py-2 pr-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(w)}
                      className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))}
              {wallets.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-500">
                    No wallets found.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={7} className="py-4 text-center">
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Delete action requires SUPERADMIN; if forbidden, you will see an error.
        </p>
      </div>
      <style jsx>{`
        .input {
          background: rgba(255,255,255,0.8);
          border: 1px solid var(--tw-colors-gray-300);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          width: 100%;
          outline: none;
        }
        .dark .input {
          background: rgba(31,41,55,0.6);
          border-color: #374151;
          color: #f1f5f9;
        }
        .input:focus {
          border-color: #9333ea;
          box-shadow: 0 0 0 1px #9333ea33;
        }
      `}</style>
    </div>
  );
}
