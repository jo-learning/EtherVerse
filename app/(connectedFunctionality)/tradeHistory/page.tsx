"use client";

import Link from "next/link";
import { useState } from "react";
import { useTradeStore } from "@/lib/tradeStore";

export default function HistoryPage() {
  const [tab, setTab] = useState<"wait" | "finished">("finished");
  const trades = useTradeStore((state) => state.trades);
  const filtered = trades.filter((t) => t.status === tab);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-400 p-4 flex items-center text-white">
        <Link href="/" className="mr-4 text-2xl">←</Link>
        <h1 className="text-lg font-semibold">My contract</h1>
      </div>

      {/* Tabs */}
      <div className="flex justify-between p-4 items-center">
        <div className="flex gap-4">
          <button
            onClick={() => setTab("wait")}
            className={`pb-1 ${tab === "wait" ? "border-b-2 border-purple-500 font-semibold" : "text-gray-500"}`}
          >
            wait
          </button>
          <button
            onClick={() => setTab("finished")}
            className={`pb-1 ${tab === "finished" ? "border-b-2 border-purple-500 font-semibold" : "text-gray-500"}`}
          >
            finished
          </button>
        </div>
        <span className="text-sm text-gray-500">Demo Account</span>
      </div>

      {/* Trade list */}
      <div className="p-4 space-y-3">
        {filtered.length === 0 && <p className="text-center text-gray-400">No more</p>}
        {filtered.map((trade) => (
          <Link
            key={trade.id}
            href={`/tradeHistory/${trade.id}`}
            className="flex justify-between bg-white p-4 rounded-lg shadow hover:shadow-md transition"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500">🪙</span>
                <span className="font-semibold">{trade.pair}</span>
              </div>
              <p className="text-xs text-gray-500">{trade.date}</p>
            </div>
            <p className={`font-semibold ${trade.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {trade.profit}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
