// app/detail/[coin]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { fetchWallet, getCoin, getWallet } from "@/lib/data";
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
const TradingViewWidget = dynamic(() => import('../../../../components/TradingViewTest'), { ssr: false })

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

// Color palette
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

export default function CoinDetailPage() {
  const { coinData } = useParams<{ coinData: string }>();
  const coin = getCoin(coinData);
  const [showModal, setShowModal] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Real-time price state
  const [realPrice, setRealPrice] = useState<number | null>(null);
  const staticCoins = getWallet(coin?.symbol ?? "");
  const [coinWallet, setCoins] = useState(staticCoins);

  useEffect(() => {
    if (!coin) return;
    // Map symbol to CoinGecko id
    const symbolToId: Record<string, string> = {
      BTC: "bitcoin",
      ETH: "ethereum",
      USDT: "tether",
      BNB: "binancecoin",
      XRP: "ripple",
      SOL: "solana",
      AAVE: "aave",
      DOT: "polkadot",
      LINK: "chainlink",
      UNI: "uniswap",
      LTC: "litecoin",
      ADA: "cardano",
      DOGE: "dogecoin",
      EOS: "eos",
    };
    const id = symbolToId[coin.symbol];
    if (!id) return;
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`)
      .then(res => res.json())
      .then(data => setRealPrice(data[id]?.usd ?? coin.priceUsd));

    const address = window.ethereum?.selectedAddress;
    fetchWallet(coinData, address).then(setCoins);
    
  }, [coinData]);

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
  const [accountType, setAccountType] = useState("Real Account")
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

    var deliveryTimeNumber = deliveryTime.replace("S", "");

    addTrade({
      id: Date.now(),
      pair: `${coin.symbol}/USDT`,
      date: new Date().toISOString().replace("T", " ").slice(0, 19),
      purchaseAmount: parseFloat(amount) || 0,
      direction,
      purchasePrice: parseFloat(coin.priceUsd as any),
      contract: 30, // If you have this dynamically, replace
      profit,
      deliveryPrice: parseFloat(coin.priceUsd as any),
      deliveryTime: parseInt(deliveryTimeNumber, 10),
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
    <div
      className="min-h-screen p-2 sm:p-4"
      style={{
        background: COLORS.background,
        color: COLORS.textWhite,
      }}
    >
      {/* Header */}
      <div
        className="flex flex-row sm:flex-row items-center gap-3 p-2 sm:p-4"
        style={{ background: COLORS.navy, borderRadius: 16 }}
      >
        
        <div className="flex items-center gap-2">
          <img
            src={coin.logo}
            alt={coin.name}
            className="w-8 h-8"
            style={{ borderRadius: 8, background: COLORS.white }}
          />
          <div>
            <p className="font-bold" style={{ color: COLORS.textWhite }}>{coin.name}</p>
            <span className="text-xs" style={{ color: COLORS.textGray }}>USDT</span>
          </div>
        </div>
        <Link
          href="/tradeHistory"
          className="ml-auto flex items-center gap-1"
          style={{ color: COLORS.neonGreen }}
        >
          <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 2a2 2 0 0 0-2 2v16.382a1 1 0 0 0 1.447.894L12 18.118l6.553 3.158A1 1 0 0 0 20 20.382V4a2 2 0 0 0-2-2H6zm0 2h12v15.382l-6-2.892-6 2.892V4z"/>
          </svg>
          <span className="hidden sm:inline text-sm">Saved</span>
        </Link>
      </div>

      {/* Price Section */}
      <div className="text-center mt-4">
        <p className="text-2xl font-bold" style={{ color: COLORS.neonGreen }}>
          US$ {(realPrice ?? coin.priceUsd).toLocaleString()}
        </p>
        <p
          className="text-sm"
          style={{
            color: up ? COLORS.neonGreen : "#ff3b3b",
            fontWeight: 600,
          }}
        >
          {up ? "+" : ""}
          {(coin.change24hPct * 100).toFixed(3)}%
        </p>
      </div>

      {/* Chart */}
      <div
        className="mt-6 rounded-xl p-2 sm:p-4 shadow-lg"
        style={{ background: COLORS.navy }}
      >
        <TradingViewWidget
          symbol={`BINANCE:${coin.symbol}USD`}
          interval="D"
          width="100%"
          height={300}
        />
      </div>

      {/* Entrust Button */}
      <div className="left-0 right-0 px-2 sm:px-4 py-2">
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-3 text-lg font-bold shadow-lg"
          style={{
            background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.neonGreen})`,
            color: COLORS.textWhite,
            borderRadius: 16,
          }}
        >
          Entrust Now
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(13,13,13,0.85)" }}
        >
          <div
            className="rounded-xl w-full max-w-md mx-2 sm:mx-0 p-4 sm:p-6 relative"
            style={{ background: COLORS.navy, color: COLORS.textWhite }}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4"
              style={{ color: COLORS.textGray }}
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4" style={{ color: COLORS.neonGreen }}>
              {coin.symbol} Coin Delivery
            </h2>

            {/* Coin Info */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={coin.logo}
                alt={coin.name}
                className="w-8 h-8"
                style={{ borderRadius: 8, background: COLORS.white }}
              />
              <div>
                <p className="font-bold" style={{ color: COLORS.textWhite }}>{coin.name}</p>
                <span className="text-sm" style={{ color: COLORS.textGray }}>{direction}</span>
              </div>
              <span className="ml-auto text-sm" style={{ color: COLORS.neonGreen }}>
                {coinWallet?.balance} USDT
              </span>
            </div>

            {/* Buy Direction Switch */}
            <div className="flex justify-center mb-4">
              <div
                className="flex rounded-full p-1 gap-2"
                style={{ background: COLORS.background }}
              >
                <button
                  type="button"
                  className="px-6 py-2 rounded-full font-semibold transition-colors duration-200"
                  style={{
                    background:
                      direction === "Buy long"
                        ? `linear-gradient(90deg, ${COLORS.neonGreen}, ${COLORS.purple})`
                        : COLORS.white,
                    color:
                      direction === "Buy long"
                        ? COLORS.black
                        : COLORS.textGray,
                    boxShadow:
                      direction === "Buy long"
                        ? "0 2px 8px rgba(57,255,20,0.2)"
                        : undefined,
                  }}
                  onClick={() => setDirection("Buy long")}
                >
                  Buy Long
                </button>
                <button
                  type="button"
                  className="px-6 py-2 rounded-full font-semibold transition-colors duration-200"
                  style={{
                    background:
                      direction === "Buy short"
                        ? `linear-gradient(90deg, #ff3b3b, ${COLORS.purple})`
                        : COLORS.white,
                    color:
                      direction === "Buy short"
                        ? COLORS.white
                        : COLORS.textGray,
                    boxShadow:
                      direction === "Buy short"
                        ? "0 2px 8px rgba(255,59,59,0.2)"
                        : undefined,
                  }}
                  onClick={() => setDirection("Buy short")}
                >
                  Buy Short
                </button>
              </div>
            </div>

            {/* Account Type */}
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textGray }}>
              Account Type
            </label>
            <select
              className="w-full rounded-lg p-2 mb-3"
              style={{
                background: COLORS.background,
                color: COLORS.textWhite,
                border: `1px solid ${COLORS.purple}`,
              }}
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option>Real Account</option>
              <option>Demo Account</option>
            </select>

            {/* Delivery Time */}
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textGray }}>
              Delivery Time
            </label>
            <select
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="w-full rounded-lg p-2 mb-3"
              style={{
                background: COLORS.background,
                color: COLORS.textWhite,
                border: `1px solid ${COLORS.purple}`,
              }}
            >
              <option>30S</option>
              <option>120S</option>
              <option>200S</option>
            </select>

            {/* Price Range */}
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textGray }}>
              Price Range
            </label>
            <select
              className="w-full rounded-lg p-2 mb-3"
              style={{
                background: COLORS.background,
                color: COLORS.textWhite,
                border: `1px solid ${COLORS.purple}`,
              }}
            >
              <option>(±20%)</option>
            </select>

            {/* Amount */}
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textGray }}>
              USDT Amount
            </label>
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                max={coinWallet?.balance ?? undefined}
                onChange={(e) => {
                  const val = e.target.value;
                  // Prevent input above max balance
                  if (
                    coinWallet?.balance !== undefined &&
                    parseFloat(val) > Number(coinWallet.balance)
                  ) {
                    setAmount(`${coinWallet.balance}`);
                  } else {
                    setAmount(val);
                  }
                }}
                className="flex-1 rounded-lg p-2"
                style={{
                  background: COLORS.background,
                  color: COLORS.textWhite,
                  border: `1px solid ${COLORS.purple}`,
                }}
              />
              <button
                type="button"
                className="px-3 py-2 rounded-lg"
                style={{
                  background: COLORS.purple,
                  color: COLORS.neonGreen,
                }}
                onClick={() => setAmount(`${coinWallet?.balance ?? ""}`)}
              >
                Max
              </button>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs mb-4" style={{ color: COLORS.textGray }}>
                Available Balance: {accountType == "Real Account" ? coinWallet?.balance : 100} USDT
              </p>
              <p className="text-xs mb-4" style={{ color: COLORS.neonGreen }}>
                Estimated Profit: {calculateProfit(amount, deliveryTime).toFixed(2)} USDT
              </p>
            </div>

            {/* Submit */}
            <button
              onClick={handleEntrustNow}
              className="w-full py-3 font-bold"
              style={{
                background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.neonGreen})`,
                color: COLORS.textWhite,
                borderRadius: 16,
              }}
            >
              Entrust Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
