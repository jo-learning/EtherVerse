// app/page.tsx
'use client';
import CryptoCard from "@/components/CryptoCard";
import { coins as staticCoins, fetchCoinPrices, subscribeMarketWithSpark } from "@/lib/data";
import { useState, useEffect } from "react";
import { Coin } from "@/types";
import CryptoCarousel from "@/components/CryptoCarousel";
import FinancialTags from "@/components/FinancialTags";

// Color palette
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

// Example news data
const NEWS = [
  {
    title: "Bitcoin hits new all-time high",
    url: "#",
    time: "2m ago",
    source: "CryptoNews",
    image: "/images.jpeg",
  },
  {
    title: "Ethereum 2.0 upgrade launches successfully",
    url: "#",
    time: "10m ago",
    source: "CoinDesk",
    image: "/image1.jpg",
  },
  {
    title: "Binance announces new trading pairs",
    url: "#",
    time: "30m ago",
    source: "Binance Blog",
    image: "/image3.webp",
  }
];

export default function Page() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [activeFilter, setActiveFilter] = useState('digital');

  useEffect(() => {
    // 1. Fetch initial prices (REST snapshot)
    fetchCoinPrices().then(fetchedCoins => {
      setCoins(fetchedCoins);
      setFilteredCoins(filterCoins(fetchedCoins, activeFilter));
    });

    // 2. Start Binance WS updates
    const unsubscribe = subscribeMarketWithSpark(
      staticCoins.map(c => c.symbol),
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

  // Update filtered coins when active filter changes
  useEffect(() => {
    setFilteredCoins(filterCoins(coins, activeFilter));
  }, [activeFilter, coins]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const filterCoins = (coins: Coin[], filter: string): Coin[] => {
    switch (filter) {
      case 'digital':
        // Show all cryptocurrencies
        return coins.filter(coin => 
          ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'SOL', 'AAVE', 'DOT', 'LINK', 'UNI', 'LTC', 'ADA', 'DOGE', 'EOS'].includes(coin.symbol)
        );
      case 'forex':
        // Filter for forex-related coins
        return coins.filter(coin => 
          ['EUR', 'GBP', 'JPY', 'USD'].includes(coin.symbol)
        );
      case 'metal':
        // Filter for precious metal-related coins
        return coins.filter(coin => 
          ['XAU', 'XAG', 'XPT'].includes(coin.symbol)
        );
      case 'top':
        // Show top 5 coins by market cap
        return coins.slice(0, 5);
      default:
        return coins;
    }
  };

  return (
    <div className="" style={{ background: "#0a1026", minHeight: "100vh" }}>
      <CryptoCarousel />
      <section className="flex-1 overflow-y-auto px-4 md:px-6">
        <div className="grid gap-6">
          {/* Left: market list */}
          <div>
            <div
              className="rounded-2xl shadow-lg p-4 mb-3 border"
              style={{
                background: "rgba(10,16,38,0.95)",
                borderColor: COLORS.purple,
                color: COLORS.neonGreen
              }}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold" style={{ color: COLORS.neonGreen }}>Market</div>
                <FinancialTags onFilterChange={handleFilterChange} />
              </div>
            </div>
            <div className="grid gap-3">
              {filteredCoins.length === 0 && (
                <div className="flex justify-center items-center py-8">
                  <svg className="animate-spin h-8 w-8" style={{ color: COLORS.purple }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span className="ml-3" style={{ color: COLORS.neonGreen }}>Loading coins...</span>
                </div>
              )}
              {filteredCoins.map((c) => (
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
                          border: `2px solid ${COLORS.textGray}`,
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
                          color: COLORS.purple,
                          fontWeight: 600,
                          letterSpacing: 0.5
                        }}>
                          {news.source}
                        </span>
                        <span className="text-xs" style={{ color: COLORS.textGray || "#b0b8c1" }}>{news.time}</span>
                      </div>
                    </div>
                    <span className="ml-2 text-lg" style={{ color: COLORS.textGray }}>→</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}