"use client";

import Link from "next/link";
import { useTradeStore } from "@/lib/tradeStore";
import { redirect, useParams, useRouter } from "next/navigation";
import CountdownTimer from "@/components/CountdownTimer";
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

export default function TradeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const trades = useTradeStore((state) => state.trades);
  const trade = trades.find((t) => t.id === Number(id));
  const { coinData } = useParams<{ coinData: string }>();
  const coin = getCoin(coinData);

  if (!coin) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.background }}>
      <p className="text-white">Coin not found</p>
    </div>
  );

  if (!trade) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.background }}>
      <p className="text-white">Trade not found</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: COLORS.background, color: COLORS.textWhite }}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between" style={{
        background: COLORS.navy,
        color: COLORS.textWhite,
        borderBottom: `1px solid ${COLORS.purple}`,
      }}>
        <div className="flex items-center">
          
          <h1 className="text-lg font-semibold">Trade Details</h1>
        </div>
        <span className="text-sm px-3 py-1 rounded-full" 
              style={{ 
                background: COLORS.purple, 
                color: COLORS.textWhite 
              }}>
          {trade.status === "wait" ? "Pending" : "Completed"}
        </span>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Trade Card */}
        <div className="rounded-xl p-4 mb-4" style={{
          background: COLORS.navy,
          border: `1px solid ${COLORS.purple}`,
        }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{ background: COLORS.background }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12H15M9 16H15M9 8H15M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" 
                        stroke={COLORS.textWhite} strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-semibold text-lg">{trade.pair}</span>
            </div>
            <span className="text-sm" style={{ color: COLORS.textGray }}>{trade.date}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              <div>
                <p className="text-sm" style={{ color: COLORS.textGray }}>Purchase Amount</p>
                <p className="font-medium">{trade.purchaseAmount} USDT</p>
              </div>
              
              <div>
                <p className="text-sm" style={{ color: COLORS.textGray }}>Direction</p>
                <p className={`font-semibold ${trade.direction.includes("short") ? "text-red-400" : "text-blue-400"}`}>
                  {trade.direction}
                </p>
              </div>
              
              <div>
                <p className="text-sm" style={{ color: COLORS.textGray }}>Purchase Price</p>
                <p className="font-medium">{trade.purchasePrice}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div>
                <p className="text-sm" style={{ color: COLORS.textGray }}>Contract Value</p>
                <p className="font-medium">{trade.contract}$</p>
              </div>
              
              <div>
                <p className="text-sm" style={{ color: COLORS.textGray }}>Profit/Loss</p>
                <p className={`font-semibold ${trade.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {trade.profit >= 0 ? "+" : ""}{trade.profit.toFixed(2)} USDT
                </p>
              </div>
              
              <div>
                <p className="text-sm" style={{ color: COLORS.textGray }}>Delivery Time</p>
                <p className="font-medium">{trade.deliveryTime} seconds</p>
              </div>
            </div>
          </div>

          {/* Delivery Price */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: COLORS.purple }}>
            <p className="text-sm" style={{ color: COLORS.textGray }}>Delivery Price</p>
            <p className="font-medium text-lg">{trade.deliveryPrice}</p>
          </div>
        </div>

        {/* Status Indicator + Countdown */}
        <div className="rounded-xl p-4 text-center space-y-2" style={{
          background: COLORS.navy,
          border: `1px solid ${trade.status === "wait" ? COLORS.purple : trade.profit >= 0 ? "#10B981" : "#EF4444"}`,
        }}>
          <div>
            <p className="text-sm mb-1" style={{ color: COLORS.textGray }}>Status</p>
            <p className={`font-semibold text-lg ${trade.status === "wait" ? "text-yellow-400" : trade.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
              {trade.status === "wait" ? "⏳ In Progress" : trade.profit >= 0 ? "✅ Profitable" : "❌ Loss"}
            </p>
          </div>
          {trade.status === "wait" && (
            <div className="flex flex-col items-center">
              <CountdownTimer
                seconds={trade.deliveryTime}
                label="Time Left"
                onComplete={() => {
                  // After completion we refresh to pull updated status/profit from server/store
                  // router.refresh();
                  router.back();
                }}
                className="text-sm text-white"
              />
              <span className="mt-1 text-[10px] opacity-60">Auto refresh when done</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}