// app/detail/[coin]/page.tsx
"use client";

import React, { useState } from "react";
import { getCoin } from "@/lib/data";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { useTradeStore } from "@/lib/tradeStore";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
const TradingViewWidget = dynamic(( ) => import('../../../../components/TradingViewTest'), { ssr: false })

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);


export default function CoinDetailPage() {
  const { coinData } = useParams<{ coinData: string }>(); // ✅ typed
  const coin = getCoin(coinData);
  const [showModal, setShowModal] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  if (!coin) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg font-semibold">Coin not found.</p>
        <Link href="/" className="text-blue-500 underline">
          Go back
        </Link>
      </div>
    );
  }

  const addTrade = useTradeStore((state) => state.addTrade);

  const [deliveryTime, setDeliveryTime] = useState("30S");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"Buy long" | "Buy short">("Buy long"); // Now dynamic

  function calculateProfit(amount: any, time: any) {
    const amt = parseFloat(amount) || 0;
    if (time === "30S") return amt * 0.2;
    if (time === "120S") return amt * 0.15;
    if (time === "200S") return amt * 0.1;
    return 0;
  }

  function handleEntrustNow() {
    const profit = calculateProfit(amount, deliveryTime);

    if (!coin) return; // Prevent usage if coin is undefined
    if (!amount || isNaN(parseFloat(amount))) {
      alert("Please enter a valid amount.");
      return;
    }

    addTrade({
      id: Date.now(),
      pair: `${coin.symbol}/USDT`,
      date: new Date().toISOString().replace("T", " ").slice(0, 19),
      purchaseAmount: parseFloat(amount) || 0,
      direction,
      purchasePrice: coin.priceUsd,
      contract: 30, // If you have this dynamically, replace
      profit,
      deliveryPrice: coin.priceUsd,
      deliveryTime,
      status: "wait",
    });

    setShowModal(false);
  }

  const up = coin.change24hPct >= 0;

  const fakeChartData = {
    labels: ["5M", "15M", "1H", "6H", "1D"],
    datasets: [
      {
        label: "Price",
        data: [43000, 43200, 43150, 43500, 43965],
        borderColor: up ? "#16a34a" : "#dc2626",
        backgroundColor: "transparent",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500 via-purple-400 to-blue-400 p-2 sm:p-4 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-2 sm:p-4">
        <button
          onClick={() => history.back()}
          className="p-2 bg-white/20 rounded-full"
        >
          <FaArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <img
            src={coin.logo}
            alt={coin.name}
            className="w-8 h-8"
          />
          <div>
            <p className="font-bold">{coin.name}</p>
            <span className="text-xs opacity-80">USDT</span>
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className="text-center mt-4">
        <p className="text-2xl font-bold">
          US$ {coin.priceUsd.toLocaleString()}
        </p>
        <p className={`text-sm ${up ? "text-green-400" : "text-red-400"}`}>
          {up ? "+" : ""}
          {(coin.change24hPct * 100).toFixed(3)}%
        </p>
      </div>

      {/* Chart */}
      {/* <div className="mt-6 bg-white rounded-xl p-2 sm:p-4 text-gray-900 shadow-lg">
        <Line
          data={fakeChartData}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
          }}
        />
      </div> */}
      <TradingViewWidget
    symbol={`BINANCE:${coin.symbol}USD`}
    interval="D"
    width="100%"
    height={300}
  />

      {/* Entrust Button */}
      <div className="left-0 right-0 px-2 sm:px-4 py-2">
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-lg font-bold shadow-lg"
        >
          Entrust Now
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-2 sm:mx-0 p-4 sm:p-6 text-gray-900 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-500"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">BTC Coin Delivery</h2>

            {/* Coin Info */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={coin.logo}
                alt={coin.name}
                className="w-8 h-8"
              />
              <div>
                <p className="font-bold">{coin.name}</p>
                <span className="text-sm opacity-70">{direction}</span>
              </div>
              <span className="ml-auto text-sm text-gray-500">0.00 USDT</span>
            </div>

            {/* Buy Direction Switch */}
            <div className="flex justify-center mb-4">
              <div className="flex bg-gray-100 rounded-full p-1 gap-2">
                <button
                  type="button"
                  className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 ${
                    direction === "Buy long"
                      ? "bg-gradient-to-r from-green-400 to-green-600 text-white shadow"
                      : "bg-white text-gray-700"
                  }`}
                  onClick={() => setDirection("Buy long")}
                  style={{
                    boxShadow: direction === "Buy long" ? "0 2px 8px rgba(34,197,94,0.2)" : undefined,
                  }}
                >
                  Buy Long
                </button>
                <button
                  type="button"
                  className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 ${
                    direction === "Buy short"
                      ? "bg-gradient-to-r from-red-400 to-red-600 text-white shadow"
                      : "bg-white text-gray-700"
                  }`}
                  onClick={() => setDirection("Buy short")}
                  style={{
                    boxShadow: direction === "Buy short" ? "0 2px 8px rgba(239,68,68,0.2)" : undefined, 
                  }}
                    
                    >
                  Buy Short
                </button>
              </div>
            </div>

            {/* Account Type */}
            <label className="block text-sm font-medium mb-1">
              Account Type
            </label>
            <select className="w-full border rounded-lg p-2 mb-3">
              <option>Real Account</option>
              <option>Demo Account</option>
            </select>

            {/* Delivery Time */}
            <label className="block text-sm font-medium mb-1">
              Delivery Time
            </label>
            <select
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="w-full border rounded-lg p-2 mb-3"
            >
              <option>30S</option>
              <option>120S</option>
              <option>200S</option>
            </select>

            {/* Price Range */}
            <label className="block text-sm font-medium mb-1">
              Price Range
            </label>
            <select className="w-full border rounded-lg p-2 mb-3">
              <option>(±20%)</option>
            </select>

            {/* Amount */}
            <label className="block text-sm font-medium mb-1">
              USDT Amount
            </label>
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 border rounded-lg p-2"
              />
              <button
                type="button"
                className="px-3 py-2 bg-gray-200 rounded-lg"
                onClick={() => setAmount("7282.30")} // Example max balance
              >
                Max
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Available Balance: 7282.30
            </p>

            {/* Submit */}
            <button
              onClick={handleEntrustNow}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold"
            >
              Entrust Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
