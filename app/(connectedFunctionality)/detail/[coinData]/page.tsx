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
import { useAccount } from "wagmi";
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
  neonGreen: "#ffffff", // Neon green
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
  const [selectedDirection, setSelectedDirection] = useState<"Buy long" | "Buy short">("Buy long");
  const { address } = useAccount();

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

    // const address = window.ethereum?.selectedAddress;
    if (address) {
      fetchWallet(coinData, address).then(setCoins);
    }
    
  }, [coinData, address]);

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
  const [direction, setDirection] = useState<"Buy long" | "Buy short">("Buy long");
  const [inputValue, setInputValue] = useState("");

  function calculateProfit(amount: any, time: any) {
    const amt = parseFloat(amount) || 0;
    // Profit calculation based on delivery time
    if (time === "30S") return amt * 0.8; // 80% profit for 30 seconds
    if (time === "60S") return amt * 0.7; // 70% profit for 60 seconds
    if (time === "120S") return amt * 0.6; // 60% profit for 120 seconds
    if (time === "3600S") return amt * 0.5; // 50% profit for 1 hour
    if (time === "10800S") return amt * 0.4; // 40% profit for 3 hours
    if (time === "21600S") return amt * 0.3; // 30% profit for 6 hours
    if (time === "43200S") return amt * 0.2; // 20% profit for 12 hours
    return 0;
  }

  function handleEntrustNow() {
    const profit = calculateProfit(amount, deliveryTime);

    if (!coin) return;
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
      contract: 30,
      profit,
      deliveryPrice: parseFloat(coin.priceUsd as any),
      deliveryTime: parseInt(deliveryTimeNumber, 10),
      status: "wait",
    });
    

    setShowModal(false);
    setInputValue("");
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

  const handleNumberInput = (value: string) => {
    if (value === "backspace") {
      setInputValue(prev => prev.slice(0, -1));
    } else if (value === "done") {
      setAmount(inputValue);
      handleEntrustNow();
    } else if (value === "." && !inputValue.includes(".")) {
      setInputValue(prev => prev + value);
    } else if (value !== ".") {
      setInputValue(prev => prev + value);
    }
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

      {/* Split Entrust Buttons */}
      <div className="relative w-full h-16 mt-6 mb-4">
        <button
          onClick={() => {
            setSelectedDirection("Buy long");
            setShowModal(true);
            setDirection("Buy long");
          }}
          className="absolute left-0 w-2/4 h-10 text-lg font-bold transform -skew-x-12 overflow-hidden z-10"
          style={{
            background: `linear-gradient(90deg, ${COLORS.neonGreen}, ${COLORS.purple})`,
            color: COLORS.black,
            borderRadius: "12px 0 0 12px",
          }}
        >
          <span className="block transform skew-x-12">BUY LONG</span>
        </button>
        <button
          onClick={() => {
            setSelectedDirection("Buy short");
            setShowModal(true);
            setDirection("Buy short");
          }}
          className="absolute right-0 w-2/4 h-10 text-lg font-bold transform -skew-x-12 overflow-hidden"
          style={{
            background: `linear-gradient(90deg, #ff3b3b, ${COLORS.purple})`,
            color: COLORS.white,
            borderRadius: "0 12px 12px 0",
          }}
        >
          <span className="block transform skew-x-12">BUY SHORT</span>
        </button>
      </div>

      {/* Modal */}
     {showModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50"
    style={{ background: "rgba(13,13,13,0.85)" }}
  >
    <div
      className="rounded-xl w-full max-w-md mx-2 sm:mx-0 p-4 sm:p-6 relative flex flex-col"
      style={{ 
        background: COLORS.navy, 
        color: COLORS.textWhite,
        maxHeight: "90vh"
      }}
    >
      <button
        onClick={() => {
          setShowModal(false);
          setInputValue("");
        }}
        className="absolute right-4 top-4 z-10"
        style={{ color: COLORS.textGray }}
      >
        ✕
      </button>
      
      {/* Fixed header section */}
      <div className="flex-shrink-0">
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
                    : "transparent",
                color:
                  direction === "Buy long"
                    ? COLORS.black
                    : COLORS.textGray,
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
                    : "transparent",
                color:
                  direction === "Buy short"
                    ? COLORS.white
                    : COLORS.textGray,
              }}
              onClick={() => setDirection("Buy short")}
            >
              Buy Short
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable content section */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col md:flex-row gap-4 pb-2">
          

          {/* Right Column - Account Type and Done Button */}
          <div className="w-full md:w-1/3 flex flex-col justify-between">
            {/* Account Type Buttons */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textGray }}>
                Account Type
              </label>
              <div className="flex flex-col rounded-lg overflow-hidden gap-2">
                <button
                  type="button"
                  className={`py-3 text-center font-semibold rounded-lg ${
                    accountType === "Real Account" 
                      ? "bg-green-600 text-white" 
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => setAccountType("Real Account")}
                >
                  Real Account
                </button>
                <button
                  type="button"
                  className={`py-3 text-center font-semibold rounded-lg ${
                    accountType === "Demo Account" 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => setAccountType("Demo Account")}
                >
                  Demo Account
                </button>
              </div>
            </div>

            {/* Delivery Time */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textGray }}>
                Delivery Time
              </label>
              <select
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full rounded-lg p-3 mb-2"
                style={{
                  background: COLORS.background,
                  color: COLORS.textWhite,
                  border: `1px solid ${COLORS.purple}`,
                }}
              >
                <option value="30S">30S</option>
                <option value="60S">60S</option>
                <option value="120S">120S</option>
                <option value="3600S">1H</option>
                <option value="10800S">3H</option>
                <option value="21600S">6H</option>
                <option value="43200S">12H</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textGray }}>
                Price Range
              </label>
              <select
                className="w-full rounded-lg p-3 mb-4"
                style={{
                  background: COLORS.background,
                  color: COLORS.textWhite,
                  border: `1px solid ${COLORS.purple}`,
                }}
              >
                {(() => {
                  // Get the base percentage based on delivery time
                  let basePercentage = 20;
                  
                  if (deliveryTime === "60S") basePercentage = 25;
                  else if (deliveryTime === "120S") basePercentage = 30;
                  else if (deliveryTime === "3600S") basePercentage = 35;
                  else if (deliveryTime === "10800S") basePercentage = 40;
                  else if (deliveryTime === "21600S") basePercentage = 45;
                  else if (deliveryTime === "43200S") basePercentage = 50;
                  
                  // Generate options with increasing percentages
                  const options = [];
                  for (let i = 0; i < 5; i++) {
                    const percentage = basePercentage + (i * 5);
                    options.push(
                      <option key={i} value={percentage}>
                        (±{percentage}%)
                      </option>
                    );
                  }
                  
                  return options;
                })()}
              </select>
            </div>

            {/* Left Column - Number Keys */}
          <div className="w-full md:w-2/3">
            

            {/* Amount Display */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textGray }}>
                USDT Amount
              </label>
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg p-3 text-right text-xl font-medium"
                  style={{
                    background: COLORS.background,
                    color: COLORS.textWhite,
                    border: `1px solid ${COLORS.purple}`,
                    minHeight: '50px'
                  }}
                >
                  {inputValue || "0"} USDT
                </div>
                <button
                  type="button"
                  className="px-3 py-2 rounded-lg"
                  style={{
                    background: COLORS.purple,
                    color: COLORS.neonGreen,
                  }}
                  onClick={() => {
                    if (accountType == "Demo Account"){
                      setInputValue("100");
                    } else {

                      setInputValue(coinWallet?.balance?.toString() || "");
                    }
                  }}
                >
                  Max
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-xs" style={{ color: COLORS.textGray }}>
                Available Balance: {accountType == "Real Account" ? coinWallet?.balance : 100} USDT
              </p>
              <p className="text-xs" style={{ color: COLORS.neonGreen }}>
                Estimated Profit: {calculateProfit(inputValue, deliveryTime).toFixed(2)} USDT
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4 mt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "backspace"].map((item) => (
                <button
                  key={item}
                  onClick={() => handleNumberInput(item.toString())}
                  className="p-3 rounded-lg text-lg font-medium h-14"
                  style={{
                    background: COLORS.background,
                    color: COLORS.textWhite,
                    border: `1px solid ${COLORS.purple}`,
                  }}
                >
                  {item === "backspace" ? "⌫" : item}
                </button>
              ))}
            </div>
          </div>

            {/* Done Button */}
            <button
              onClick={() => {
                setAmount(inputValue);
                handleNumberInput("done");
              }}
              className="w-full py-4 font-bold mt-auto"
              style={{
                background: direction === "Buy long" 
                  ? `linear-gradient(90deg, ${COLORS.neonGreen}, ${COLORS.purple})`
                  : `linear-gradient(90deg, #ff3b3b, ${COLORS.purple})`,
                color: COLORS.textWhite,
                borderRadius: 16,
              }}
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}