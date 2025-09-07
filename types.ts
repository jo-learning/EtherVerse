export type Coin = {
  symbol: string; // e.g., BTC
  name: string;   // e.g., Bitcoin
  priceUsd: string;
  change24hPct: number; // e.g., 0.032 => 3.2%
  spark: number[]; // tiny sparkline data
  logo: string; // URL to coin logo
  change?: string; // e.g., "+3.2%" or "-1.5%"
  
};

export type Wallet = {
  name: string;
  network:string;
  symbol:string;
  balance:string;
  change:string;
  logo: string;
  priceUsd: string;
  address: string;
}