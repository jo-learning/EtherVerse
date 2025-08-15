"use client";

import Link from "next/link";
import { useTradeStore } from "@/lib/tradeStore";

export default function TradeDetailPage({ params }: { params: { id: string } }) {
  const trades = useTradeStore((state) => state.trades);
  const trade = trades.find((t) => t.id === Number(params.id));

  if (!trade) return <p className="p-4">Trade not found</p>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-400 p-4 flex items-center text-white">
        <Link href="/tradeHistory" className="mr-4 text-2xl">←</Link>
        <h1 className="text-lg font-semibold">My contract</h1>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="flex items-center gap-2 font-semibold">🪙 {trade.pair}</span>
          <span>{trade.date}</span>
        </div>
        <p>Purchase Amount: {trade.purchaseAmount} USDT</p>
        <p>
          Direction:{" "}
          <span className={trade.direction.includes("short") ? "text-red-500 font-semibold" : "text-green-500 font-semibold"}>
            {trade.direction}
          </span>
        </p>
        <p>Purchase price: {trade.purchasePrice}</p>
        <p>Contract: {trade.contract}$</p>
        <p className={`${trade.profit >= 0 ? "text-green-500" : "text-red-500"} font-semibold`}>
          Profit: {trade.profit}
        </p>
        <p>Delivery Price: {trade.deliveryPrice}</p>
        <p>Delivery time: {trade.deliveryTime}</p>
      </div>
    </div>
  );
}
