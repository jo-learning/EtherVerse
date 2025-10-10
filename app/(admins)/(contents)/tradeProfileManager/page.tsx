"use client";

import { useEffect, useState } from "react";

type AdminFlag = {
  key: string;
  enabled: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
};

export default function TradeProfitManagerPage() {
  const [flag, setFlag] = useState<AdminFlag | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/flags/trade-profit", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to load (${res.status})`);
      }
      const data = (await res.json()) as AdminFlag;
      setFlag(data);
    } catch (e: any) {
      setError(e.message || "Failed to load flag");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (enabled: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/flags/trade-profit", {
        method: flag ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to save (${res.status})`);
      }
      const data = (await res.json()) as AdminFlag;
      setFlag(data);
    } catch (e: any) {
      setError(e.message || "Failed to save flag");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete the trade-profit flag?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/flags/trade-profit", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to delete (${res.status})`);
      }
      setFlag({ key: "trade-profit", enabled: false, updatedAt: null, updatedBy: null });
    } catch (e: any) {
      setError(e.message || "Failed to delete flag");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Trade Profit Manager</h1>
        <button
          onClick={load}
          className="px-3 py-1 rounded border"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-600/20 border border-red-600 text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-gray-900/40 p-4">
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-300">Flag Key</div>
                <div className="font-mono">trade-profit</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm px-2 py-1 rounded-full ${flag?.enabled ? "bg-green-600/20 text-green-300 border border-green-600" : "bg-red-600/20 text-red-300 border border-red-600"}`}>
                  {flag?.enabled ? "Profitable" : "Non-profitable"}
                </span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!flag?.enabled}
                    onChange={(e) => save(e.target.checked)}
                    disabled={saving}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute relative after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div>
                <div className="text-gray-400">Updated At</div>
                <div>{flag?.updatedAt ? new Date(flag.updatedAt).toLocaleString() : "—"}</div>
              </div>
              <div>
                <div className="text-gray-400">Updated By (Admin ID)</div>
                <div className="font-mono">{flag?.updatedBy ?? "—"}</div>
              </div>
              <div className="flex items-end justify-end">
                <button
                  onClick={remove}
                  className="px-3 py-1 rounded border border-red-600 text-red-300 hover:bg-red-600/10"
                  disabled={saving}
                >
                  Delete Flag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-400">
        Tip: When enabled, completed trades will be forced to positive profit; when disabled, they will be forced negative.
      </div>
    </div>
  );
}
