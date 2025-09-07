"use client";
import Link from "next/link";
import { Coin } from "@/types";

// Parse number from string | number | other
function toNumber(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function formatUsd(value: unknown): string {
  const num = toNumber(value);
  if (num === null) return typeof value === "string" ? value : "$0.00";

  if (num < 1) return `$${num.toFixed(5)}`;
  if (num < 1000) return `$${num.toFixed(2)}`;
  return num.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function getChangeDisplay(coin: Coin): { text: string; up: boolean } {
  // Prefer string change like "-0.3%" if present
  if (coin && (coin as any).change != null) {
    const text = String((coin as any).change);
    const n = toNumber(text) ?? 0;
    return { text, up: n >= 0 };
  }
  // Fallback to numeric change24hPct (e.g., 0.0031 => 0.31%)
  if (typeof coin.change24hPct === "number") {
    const pct = coin.change24hPct * 100;
    return { text: `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`, up: pct >= 0 };
  }
  return { text: "0.00%", up: true };
}

// Color palette (should be imported from a shared location if used elsewhere)
export const COLORS = {
  purple: "#4b0082",      // Dark purple
  neonGreen: "#39FF14",   // Neon green
  black: "#0D0D0D",
  white: "#fffabc",
  red: "#ff1744",         // Neon red for decrease
  navy: "#172042",        // Slightly lighter navy blue
  textWhite: "#ffffff",
  textGray: "#b0b8c1"
};

export default function CryptoCard({ coin }: { coin: Coin }) {
  const { text: changeText, up } = getChangeDisplay(coin);
  const spark = coin.spark || [];
  const max = Math.max(...spark, 1);
  const min = Math.min(...spark, 0);
  const points = spark.map((v, i) => {
    const x = (i / (spark.length - 1)) * 100; // x% along width
    const y = 100 - ((v - min) / (max - min)) * 100; // invert y for SVG
    return `${x},${y}`;
  }).join(" ");

  return (
    <Link
      href={`/detail/${coin.symbol.toLowerCase()}`}
      className="flex items-center gap-4 p-4 rounded-2xl shadow-lg border transition-all"
      style={{
        background: COLORS.navy,
        borderColor: COLORS.purple,
        color: COLORS.textWhite
      }}
    >
      <img
        src={coin.logo}
        alt={coin.symbol}
        className="h-10 w-10 rounded-full"
        style={{
          background: COLORS.black,
          border: `2px solid ${COLORS.purple}`,
          boxShadow: `0 0 8px ${COLORS.purple}`
        }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="truncate font-semibold" style={{ color: COLORS.textWhite }}>{coin.name}</div>
          <div className="text-sm" style={{ color: COLORS.textGray }}>24 Hrs</div>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          <div className="font-semibold" style={{ color: COLORS.textWhite }}>
            {formatUsd((coin as any).priceUsd)}
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: up ? COLORS.neonGreen : COLORS.red }}
          >
            {changeText}
          </div>
        </div>
      </div>

      <div className="flex items-end gap-0.5 mt-1 h-10">
        {spark.length > 0 && (
          <svg className="w-full h-10 mt-1" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke={up ? COLORS.neonGreen : COLORS.red}
              strokeWidth="2"
              points={points}
            />
          </svg>
        )}
      </div>
    </Link>
  );
}
