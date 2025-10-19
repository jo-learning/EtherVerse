"use client";
import { useState } from "react";

interface SweepResponse {
  hash: string;
  owner: string;
  to: string;
  token: string;
  amount: string;
  spender: string;
}

export default function SweepPage() {
  const [owner, setOwner] = useState("");
  const [to, setTo] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SweepResponse | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/erc20/sweep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, to, token: token || undefined }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Sweep failed");
      setResult(json as SweepResponse);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const etherscanTx = result?.hash
    ? `https://etherscan.io/tx/${result.hash}`
    : null;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-300">ERC20 Sweep</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        This tool calls the on-chain transferFrom using the server-side sweeper account. Owner must have approved the sweeper as spender and hold balance.
      </p>

      {error && (
        <div className="rounded-md bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-2">
          {error}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="grid gap-4 md:grid-cols-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl p-4 border border-gray-200 dark:border-gray-700"
      >
        <div className="md:col-span-2 font-semibold">Sweep Parameters</div>
        <input
          className="input md:col-span-2"
          placeholder="Owner address (0x...)"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          required
        />
        <input
          className="input md:col-span-2"
          placeholder="Recipient (to) address (0x...)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        />
        <input
          className="input md:col-span-2"
          placeholder="Token address (optional, defaults to USDT mainnet)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <div className="flex gap-2 md:col-span-2">
          <button
            disabled={loading}
            className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Sweeping..." : "Sweep"}
          </button>
          <button
            type="button"
            onClick={() => {
              setOwner("");
              setTo("");
              setToken("");
              setError(null);
              setResult(null);
            }}
            className="px-4 py-2 rounded-md bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Reset
          </button>
        </div>
      </form>

      {result && (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="font-semibold mb-2">Sweep Result</h2>
          <div className="text-sm space-y-1">
            <div>
              <span className="font-medium">Tx Hash:</span>{" "}
              {etherscanTx ? (
                <a className="text-blue-600 hover:underline" href={etherscanTx} target="_blank" rel="noreferrer">
                  {result.hash}
                </a>
              ) : (
                result.hash
              )}
            </div>
            <div><span className="font-medium">Owner:</span> {result.owner}</div>
            <div><span className="font-medium">Recipient:</span> {result.to}</div>
            <div><span className="font-medium">Token:</span> {result.token}</div>
            <div><span className="font-medium">Amount:</span> {result.amount}</div>
            <div><span className="font-medium">Spender (sweeper):</span> {result.spender}</div>
          </div>
        </div>
      )}

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
