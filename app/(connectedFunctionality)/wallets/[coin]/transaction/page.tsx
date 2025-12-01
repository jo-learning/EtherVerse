"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FaArrowDown, FaArrowUp, FaExchangeAlt } from "react-icons/fa";
import { useAccount } from "wagmi";
import { Toaster, toast } from "react-hot-toast";

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

interface Transaction {
  id: string;
  type: string;
  coin: string;
  amount: number;
  createdAt: string;
}

const TABS = [
  { key: "all", label: "All" },
  { key: "send", label: "Send" },
  { key: "receive", label: "Receive" },
  { key: "convert", label: "Convert" },
];

export default function CoinTransactionPage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("all");
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [convertHistory, setConvertHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get coin from URL: /wallets/[coin]/transaction
  const coin = pathname.split("/")[2]?.toLowerCase() || "btc";

  useEffect(() => {
    const fetchData = async () => {
      if (!address) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`/api/transactions/user?userId=${address}`);
        if (res.ok) {
          const allTransactions = await res.json();
          setTransactions(allTransactions.filter((tx: Transaction) => tx.coin.toLowerCase() === coin));
        } else {
          toast.error("Failed to fetch transaction history.");
        }
      } catch (error) {
        toast.error("An error occurred while fetching transaction history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const storedHistory = localStorage.getItem('convertHistory');
    if (storedHistory) {
      setConvertHistory(JSON.parse(storedHistory));
    }
  }, [address, coin]);


  const filteredTxs =
    activeTab === "all"
      ? transactions
      : transactions.filter((tx) => {
        if (activeTab === 'send') return tx.type !== 'topup';
        if (activeTab === 'receive') return tx.type === 'topup';
        return false;
      });

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{
        background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.navy} 100%)`,
        color: COLORS.textWhite,
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1f2937", color: "#fff", border: "1px solid #4b0082" },
          success: { iconTheme: { primary: "#22c55e", secondary: "#1f2937" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#1f2937" } },
        }}
      />
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
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : activeTab === 'convert' ? (
            convertHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No conversion history found.</div>
            ) : (
              convertHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b last:border-b-0 gap-2"
                  style={{ borderColor: COLORS.background }}
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span><FaExchangeAlt className="text-blue-400" /></span>
                    <div>
                      <div className="font-semibold" style={{ color: COLORS.white }}>
                        Convert
                      </div>
                      <div className="text-xs" style={{ color: COLORS.textGray }}>
                        {new Date(item.date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right w-full sm:w-auto">
                    <div className="font-bold text-lg" style={{ color: COLORS.neonGreen }}>
                      {item.amount} {item.from} → {item.result.toFixed(6)} {item.to}
                    </div>
                    {item.price && (
                      <div className="text-xs mt-1">
                        <span className="font-medium">@ ${item.price}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          ) : filteredTxs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No transactions found.</div>
          ) : (
            filteredTxs.map((tx) => (
              <div
                key={tx.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b last:border-b-0 gap-2"
                style={{ borderColor: COLORS.background }}
              >
                {/* Left: Type + Date */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span>
                    {tx.type !== "topup" && <FaArrowUp className="text-red-400" />}
                    {tx.type === "topup" && <FaArrowDown className="text-green-400" />}
                  </span>
                  <div>
                    <div className="font-semibold" style={{ color: COLORS.white }}>
                      {tx.type === 'topup' ? 'Receive' : 'Send'}
                    </div>
                    <div className="text-xs" style={{ color: COLORS.textGray }}>
                      {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="text-right w-full sm:w-auto">
                  <div
                    className="font-bold text-lg"
                    style={{
                      color:
                        tx.type !== "topup"
                          ? "#ff1744"
                          : "#39FF14",
                    }}
                  >
                    {tx.type !== 'topup' ? '-' : '+'}{tx.amount} {tx.coin.toUpperCase()}
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
