'use client';
import Header from "@/components/header";
import CryptoCard from "@/components/CryptoCard";
import { coins as staticCoins, fetchCoinPrices, subscribeMarket, subscribeMarketWithSpark } from "@/lib/data";
import { FaChartLine, FaCogs, FaComments, FaExchangeAlt, FaGift, FaMoon, FaSun, FaUser } from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { Coin } from "@/types";
import CryptoCarousel from "@/components/CryptoCarousel";
import FinancialTags from "@/components/FinancialTags";

// Neon color palette
// const COLORS = {
//   purple: "#4b0082",      // Dark purple
//   neonGreen: "#39FF14",   // Neon green
//   black: "#0D0D0D",
//   white: "#fffabc",
//   textWhite: "#ffffff",
// };

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

// Example news data (replace with API fetch if needed)
const NEWS = [
  {
    title: "Bitcoin hits new all-time high",
    url: "#",
    time: "2m ago",
    source: "CryptoNews",
    image: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=029", // Example image
  },
  {
    title: "Ethereum 2.0 upgrade launches successfully",
    url: "#",
    time: "10m ago",
    source: "CoinDesk",
    image: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=029",
  },
  {
    title: "Binance announces new trading pairs",
    url: "#",
    time: "30m ago",
    source: "Binance Blog",
    image: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png?v=029",
  }
];

export default function Page() {
  const [coins, setCoins] = useState<Coin[]>([]);
  

  useEffect(() => {
  // 1. Fetch initial prices (REST snapshot)
  fetchCoinPrices().then(setCoins);

  // 2. Start Binance WS updates
  const unsubscribe = subscribeMarketWithSpark(
    staticCoins.map(c => c.symbol), // e.g., ["BTC", "ETH", "BNB"]
    (symbol, price, change, spark) => {
      setCoins(prev =>
        prev.map(c =>
          c.symbol.toUpperCase() === symbol.toUpperCase()
            ? { ...c, priceUsd: price, change, spark }
            : c
        )
      );
    }
  );

  return () => unsubscribe();
}, []);

  

  return (
      <div className="" style={{ background: "#0a1026", minHeight: "100vh" }}>
        {/* <header className="bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg p-4 mb-6"> */}
          {/* <div className="flex items-center justify-between"> */}
            {/* <h1 className="font-bold text-lg">Trade Market</h1> */}
            {/* Add mobile menu button or actions if needed */}
          {/* </div> */}
        {/* </header> */}
          <CryptoCarousel />
        <section className="flex-1 overflow-y-auto px-4 md:px-6">
          <div className="grid gap-6">
            {/* Left: market list */}
            <div>
              <div
                className="rounded-2xl shadow-lg p-4 mb-3 border"
                style={{
                  background: "rgba(10,16,38,0.95)", // deep navy blue, slightly transparent
                  borderColor: COLORS.purple,
                  color: COLORS.neonGreen
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold" style={{ color: COLORS.neonGreen }}>Market</div>
                  <FinancialTags />
                </div>
              </div>
              <div className="grid gap-3">
                {
              coins.length === 0 && (
                <div className="flex justify-center items-center py-8">
                  <svg className="animate-spin h-8 w-8" style={{ color: COLORS.purple }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span className="ml-3" style={{ color: COLORS.neonGreen }}>Loading wallets...</span>
                </div>
              )
            }
                {coins.map((c) => (
                  <CryptoCard key={c.symbol} coin={c} />
                ))}
              </div>
              {/* Latest News List */}
              <div
                className="rounded-2xl shadow-lg p-4 mt-6 border"
                style={{
                  background: COLORS.navy || "#172042",
                  borderColor: COLORS.purple,
                  color: COLORS.textWhite,
                  boxShadow: "0 4px 32px 0 #4b0082aa"
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold text-xl tracking-wide" style={{ color: COLORS.neonGreen, letterSpacing: 1 }}>Latest News</div>
                </div>
                <ul className="divide-y divide-[#23234a]">
                  {NEWS.map((news, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-4 py-4 hover:bg-[#0a1026] rounded-xl transition"
                      style={{
                        paddingLeft: 4,
                        paddingRight: 4,
                        cursor: "pointer",
                        boxShadow: "0 2px 8px 0 #0002"
                      }}
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={news.image}
                          alt={news.source}
                          className="rounded-lg shadow"
                          style={{
                            width: 48,
                            height: 48,
                            objectFit: "cover",
                            border: `2px solid ${COLORS.neonGreen}`,
                            background: COLORS.background
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-lg hover:underline"
                          style={{
                            color: COLORS.textWhite,
                            textShadow: "0 1px 8px #39FF1440"
                          }}
                        >
                          {news.title}
                        </a>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{
                            background: COLORS.background,
                            color: COLORS.neonGreen,
                            fontWeight: 600,
                            letterSpacing: 0.5
                          }}>
                            {news.source}
                          </span>
                          <span className="text-xs" style={{ color: COLORS.textGray || "#b0b8c1" }}>{news.time}</span>
                        </div>
                      </div>
                      <span className="ml-2 text-lg" style={{ color: COLORS.neonGreen }}>→</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Right: promo / balance panel */}
            {/* <aside className="hidden md:block">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg p-6 mb-4 border border-gray-200/50 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">Balance</span>
                  <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-1.5 rounded-xl shadow hover:shadow-lg transition-all text-sm">Deposit</button>
                </div>
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">$12,450.00</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">USD Equivalent</div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl shadow-lg p-6 flex flex-col gap-2">
                <div className="font-semibold text-lg">Welcome Bonus!</div>
                <div className="text-sm">Get up to $100 on your first deposit. Limited time offer.</div>
                <button className="bg-white text-blue-600 font-semibold px-4 py-1.5 rounded-xl shadow hover:shadow-lg transition-all text-sm mt-2">Claim Now</button>
              </div>
            </aside> */}
          </div>
        </section>
      </div>
  );
}
