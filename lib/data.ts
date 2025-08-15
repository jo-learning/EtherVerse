import { Coin } from "@/types";

export const coins: Coin[] = [
  { symbol: "BTC", name: "BTC Coin", priceUsd: 43978.6, change24hPct: 0.0039, spark: [3,4,3,5,5,6,5,7,7,8], logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
  { symbol: "ETH", name: "ETH Coin", priceUsd: 2247.5, change24hPct: -0.0166, spark: [4,4,5,5,4,4,3,3,4,4], logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  { symbol: "USDT", name: "USDT Coin", priceUsd: 1.0, change24hPct: 0.0000, spark: [0,0,0,0,0,0,0,0,0,0], logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png" },
  { symbol: "BNB", name: "BNB Coin", priceUsd: 306.5, change24hPct: 0.0123, spark: [2,2,3,3,4,4,5,5,6,6], logo: "https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png" },
  { symbol: "XRP", name: "XRP Coin", priceUsd: 0.51, change24hPct: 0.0185, spark: [1,1,2,2,3,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
  { symbol: "SOL", name: "SOL Coin", priceUsd: 20.15, change24hPct: 0.0345, spark: [3,3,4,5,5,6,7,7,8,8], logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
  { symbol: "AAVE", name: "AAVE Coin", priceUsd: 85.3, change24hPct: -0.0124, spark: [2,2,3,3,4,4,5,5,6,6], logo: "https://assets.coingecko.com/coins/images/12645/large/AAVE.png" },
  { symbol: "DOT", name: "DOT Coin", priceUsd: 6.25, change24hPct: 0.0217, spark: [1,1,2,2,3,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png" },
  { symbol: "LINK", name: "LINK Coin", priceUsd: 7.85, change24hPct: 0.0142, spark: [1,1,2,2,3,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/877/large/chainlink.png" },
  { symbol: "UNI", name: "UNI Coin", priceUsd: 6.15, change24hPct: 0.0189, spark: [1,1,2,2,3,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/12504/large/uniswap-logo.png" },
  { symbol: "LTC", name: "LTC Coin", priceUsd: 92.4, change24hPct: 0.0105, spark: [1,1,2,2,3,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/2/large/litecoin.png" },
  { symbol: "ADA", name: "ADA Coin", priceUsd: 0.4462, change24hPct: 0.0528, spark: [1,1,2,3,4,5,6,6,7,7], logo: "https://assets.coingecko.com/coins/images/975/large/cardano.png" },
  { symbol: "DOGE", name: "DOGE Coin", priceUsd: 0.09735, change24hPct: 0.0287, spark: [2,2,3,3,4,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png" },
  { symbol: "EOS", name: "EOS Coin", priceUsd: 0.75, change24hPct: 0.0162, spark: [1,2,2,1,2,3,2,3,3,4], logo: "https://assets.coingecko.com/coins/images/7383/large/eos-eos-logo.png" },
];

export function getCoin(symbol: string) {
  return coins.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());
}