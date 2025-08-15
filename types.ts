export type Coin = {
  symbol: string; // e.g., BTC
  name: string;   // e.g., Bitcoin
  priceUsd: number;
  change24hPct: number; // e.g., 0.032 => 3.2%
  spark: number[]; // tiny sparkline data
  logo: string; // URL to coin logo
};