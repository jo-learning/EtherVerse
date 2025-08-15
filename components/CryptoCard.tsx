"use client";
import Link from "next/link";
import { Coin } from "@/types";

function formatUsd(n: number) {
  return n < 1 ? `$${n.toFixed(5)}` : n < 1000 ? `$${n.toFixed(2)}` : `$${n.toLocaleString()}`;
}

export default function CryptoCard({ coin }: { coin: Coin }) {
  const up = coin.change24hPct >= 0;
  return (
    <Link
      href={`/detail/${coin.symbol.toLowerCase()}`}
      className="flex items-center gap-4 p-4 rounded-2xl shadow-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all"
    >
      <img
        src={coin.logo}
        alt={coin.symbol[0]}
        className="h-10 w-10 rounded-full bg-white dark:bg-gray-700 shadow-sm object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="truncate font-semibold text-gray-800 dark:text-gray-200">{coin.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">24 Hrs</div>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <div className="font-semibold text-gray-800 dark:text-gray-200">{formatUsd(coin.priceUsd)}</div>
          <div className={`text-sm font-medium ${up ? "text-green-500" : "text-red-500"}`}>{(up ? "+" : "") + (coin.change24hPct * 100).toFixed(2)}%</div>
        </div>
      </div>
      <div className="flex items-end gap-0.5 h-10">
        {coin.spark.map((v: number, i: number) => (
          <span key={i} style={{ height: `${6 + v * 6}px` }} className={`w-1.5 rounded ${up ? "bg-green-400" : "bg-red-400"}`}></span>
        ))}
      </div>
    </Link>
  );
}