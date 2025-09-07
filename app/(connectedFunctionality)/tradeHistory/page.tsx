"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTradeStore } from "@/lib/tradeStore";

const COLORS = {
  purple: "#4b0082", // Dark purple
  neonGreen: "#39FF14", // Neon green
  black: "#0D0D0D",
  white: "#ffffff",
  background: "#0a1026",
  navy: "#172042", // Slightly lighter navy blue
  textWhite: "#ffffff",
  textGray: "#b0b8c1",
};

export default function HistoryPage() {
  const [tab, setTab] = useState<"wait" | "finished">("finished");
  const trades = useTradeStore((state) => state.trades);
  const updateTrade = useTradeStore((state) => state.updateTrade);
  const addBalance = async (addBalance: number, network: string) => {
    try {
      const address = window.ethereum?.selectedAddress;
      await fetch(`/api/updateBalance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          addBalance,
          network,
        }),
      });
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  // Auto-update trade statuses when deliverTime expires
  useEffect(() => {
    const interval = setInterval(() => {
      trades.forEach((trade) => {
        if (trade.status === "wait") {
          const start = new Date(trade.id).getTime();
          const now = Date.now();
          const deliverMs = trade.deliveryTime * 1000;
          if (now >= start + deliverMs) {
            updateTrade(trade.id, { status: "finished" });
            addBalance(Number(trade.profit), trade.pair);
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [trades, updateTrade]);

  const filtered = trades.filter((t) => t.status === tab);

  return (
    <div
      className="min-h-screen"
      style={{ background: COLORS.background, color: COLORS.textWhite }}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center"
        style={{
          background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.neonGreen})`,
          color: COLORS.textWhite,
        }}
      >
        {/* Uncomment if you want a back button */}
        {/* <Link href="/trade" className="mr-4 text-2xl" style={{ color: COLORS.textWhite }}>←</Link> */}
        <h1 className="text-lg font-semibold">My contract</h1>
      </div>

      {/* Tabs */}
      <div className="flex justify-between p-4 items-center">
        <div className="flex gap-4">
          <button
            onClick={() => setTab("wait")}
            className="pb-1"
            style={{
              borderBottom: tab === "wait" ? `2px solid ${COLORS.purple}` : "none",
              color: tab === "wait" ? COLORS.neonGreen : COLORS.textGray,
              fontWeight: tab === "wait" ? 700 : 400,
              background: "transparent",
            }}
          >
            wait
          </button>
          <button
            onClick={() => setTab("finished")}
            className="pb-1"
            style={{
              borderBottom: tab === "finished" ? `2px solid ${COLORS.purple}` : "none",
              color: tab === "finished" ? COLORS.neonGreen : COLORS.textGray,
              fontWeight: tab === "finished" ? 700 : 400,
              background: "transparent",
            }}
          >
            finished
          </button>
        </div>
        <span className="text-sm" style={{ color: COLORS.textGray }}>
          {/* You can display account type here if you have such state */}
          Demo Account
        </span>
      </div>

      {/* Trade list */}
      <div className="p-4 space-y-3">
        {filtered.length === 0 && (
          <p className="text-center" style={{ color: COLORS.textGray }}>No more</p>
        )}
        {filtered.map((trade) => {
          const start = new Date(trade.id).getTime();
          const now = Date.now();
          const deliverMs = trade.deliveryTime * 1000;
          const remaining = Math.max(0, Math.floor((start + deliverMs - now) / 1000));

          return (
            <Link
              key={trade.id}
              href={`/tradeHistory/${trade.id}`}
              className="flex justify-between p-4 rounded-lg shadow hover:shadow-md transition"
              style={{
                background: COLORS.navy,
                color: COLORS.textWhite,
                border: `1px solid ${COLORS.purple}`,
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ color: COLORS.neonGreen }}>🪙</span>
                  <span className="font-semibold">{trade.pair}</span>
                </div>
                <p className="text-xs" style={{ color: COLORS.textGray }}>
                  {trade.date} {trade.status === "wait" && `• ⏳ ${remaining}s`}
                </p>
              </div>
              <p
                className="font-semibold"
                style={{
                  color: trade.profit >= 0 ? COLORS.neonGreen : "#ff3b3b",
                }}
              >
                {trade.profit}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
