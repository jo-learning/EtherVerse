"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { FaArrowDown, FaArrowUp, FaExchangeAlt } from "react-icons/fa";

const COLORS = {
  purple: "#4b0082",
  neonGreen: "#39FF14",
  black: "#0D0D0D",
  white: "#ffffff",
  background: "#0a1026",
  navy: "#172042",
  textWhite: "#ffffff",
  textGray: "#b0b8c1",
};

// Mock data per coin
const MOCK_DATA: Record<string, any[]> = {
  btc: [
    {
      id: 1,
      type: "send",
      amount: "-0.5",
      symbol: "BTC",
      date: "2025-09-05 14:32",
      address: "bc1qxy...9w0a",
      status: "Completed",
      priceUsd: 112199,
      change: 1.15,
    },
    {
      id: 2,
      type: "receive",
      amount: "+1.2",
      symbol: "BTC",
      date: "2025-09-04 09:20",
      address: "bc1qxy...9w0a",
      status: "Completed",
      priceUsd: 112199,
      change: -0.85,
    },
  ],
  eth: [
    {
      id: 1,
      type: "receive",
      amount: "+2.5",
      symbol: "ETH",
      date: "2025-09-05 12:15",
      address: "0x39f...8aB",
      status: "Completed",
      priceUsd: 4450,
      change: 2.05,
    },
    {
      id: 2,
      type: "send",
      amount: "-1.0",
      symbol: "ETH",
      date: "2025-09-03 20:45",
      address: "0x88a...f91",
      status: "Completed",
      priceUsd: 4450,
      change: -1.12,
    },
  ],
};

const TABS = [
  { key: "all", label: "All" },
  { key: "send", label: "Send" },
  { key: "receive", label: "Receive" },
  { key: "convert", label: "Convert" },
];

export default function CoinTransactionPage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("all");

  // Get coin from URL: /wallets/[coin]/transaction
  const coin = pathname.split("/")[2]?.toLowerCase() || "btc";
  const transactions = MOCK_DATA[coin] || [];

  const filteredTxs =
    activeTab === "all"
      ? transactions
      : transactions.filter((tx) => tx.type === activeTab);

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{
        background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.navy} 100%)`,
        color: COLORS.textWhite,
      }}
    >
      <div className="w-full max-w-2xl mx-auto mt-8 px-2 sm:px-4">
        <h2
          className="text-2xl font-bold mb-6 text-center sm:text-left"
          style={{ color: COLORS.textWhite }}
        >
          {coin.toUpperCase()} Transaction History
        </h2>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center sm:justify-start">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                activeTab === tab.key ? "shadow bg-[#23232a]" : "hover:bg-[#181c2f]"
              }`}
              style={{
                color: activeTab === tab.key ? COLORS.textGray : COLORS.textWhite,
                border:
                  activeTab === tab.key ? `2px solid ${COLORS.textWhite}` : "2px solid transparent",
                minWidth: 90,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div
          className="rounded-2xl shadow-lg overflow-hidden border"
          style={{ background: COLORS.navy, borderColor: COLORS.purple }}
        >
          {filteredTxs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No transactions found.</div>
          ) : (
            filteredTxs.map((tx) => (
              <div
                key={tx.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b last:border-b-0 gap-2"
                style={{ borderColor: COLORS.background }}
              >
                {/* Left: Type + Date + Address */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span>
                    {tx.type === "send" && <FaArrowUp className="text-red-400" />}
                    {tx.type === "receive" && <FaArrowDown className="text-green-400" />}
                    {tx.type === "convert" && <FaExchangeAlt className="text-blue-400" />}
                  </span>
                  <div>
                    <div className="font-semibold" style={{ color: COLORS.white }}>
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </div>
                    <div className="text-xs" style={{ color: COLORS.textGray }}>
                      {tx.date}
                    </div>
                    <div className="text-xs break-all" style={{ color: COLORS.textGray }}>
                      {tx.address}
                    </div>
                  </div>
                </div>

                {/* Right: Amount + Status + Price */}
                <div className="text-right w-full sm:w-auto">
                  <div
                    className="font-bold text-lg"
                    style={{
                      color:
                        tx.type === "send"
                          ? "#ff1744"
                          : tx.type === "receive"
                          ? "#39FF14"
                          : COLORS.neonGreen,
                    }}
                  >
                    {tx.amount} {tx.symbol}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.textGray }}>
                    {tx.status}
                  </div>

                  {/* Price & change */}
                  <div className="text-xs mt-1">
                    <span className="font-medium">${tx.priceUsd.toLocaleString()}</span>{" "}
                    <span style={{ color: tx.change < 0 ? "#ff1744" : "#39FF14" }}>
                      {tx.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
