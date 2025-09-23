import { Coin, Wallet } from "@/types";

export const coins: Coin[] = [
  { symbol: "BTC", name: "BTC Coin", priceUsd: "0", change24hPct: 0.0021, spark: [3,4,3,5,5,6,5,7,7,8], logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
  { symbol: "ETH", name: "ETH Coin", priceUsd: "0", change24hPct: -0.0087, spark: [4,4,5,5,4,4,3,3,4,4], logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  { symbol: "USDT", name: "USDT Coin", priceUsd: "0", change24hPct: 0.0000, spark: [0,0,0,0,0,0,0,0,0,0], logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png" },
  { symbol: "BNB", name: "BNB Coin", priceUsd: "0", change24hPct: 0.0132, spark: [2,2,3,3,4,4,5,5,6,6], logo: "https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png" },
  { symbol: "XRP", name: "XRP Coin", priceUsd: "0", change24hPct: 0.0175, spark: [1,1,2,2,3,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
  { symbol: "SOL", name: "SOL Coin", priceUsd: "0", change24hPct: 0.0321, spark: [3,3,4,5,5,6,7,7,8,8], logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
  { symbol: "AAVE", name: "AAVE Coin", priceUsd: "0", change24hPct: -0.0112, spark: [2,2,3,3,4,4,5,5,6,6], logo: "https://assets.coingecko.com/coins/images/12645/large/AAVE.png" },
  { symbol: "DOT", name: "DOT Coin", priceUsd: "0", change24hPct: 0.0201, spark: [1,1,2,2,3,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png" },
  { symbol: "LINK", name: "LINK Coin", priceUsd: "0", change24hPct: 0.0137, spark: [1,1,2,2,3,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/877/standard/chainlink-new-logo.png" },
  { symbol: "UNI", name: "UNI Coin", priceUsd: "0", change24hPct: 0.0172, spark: [1,1,2,2,3,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/12504/large/uniswap-logo.png" },
  { symbol: "LTC", name: "LTC Coin", priceUsd: "0", change24hPct: 0.0098, spark: [1,1,2,2,3,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/2/large/litecoin.png" },
  { symbol: "ADA", name: "ADA Coin", priceUsd: "0", change24hPct: 0.0512, spark: [1,1,2,3,4,5,6,6,7,7], logo: "https://assets.coingecko.com/coins/images/975/large/cardano.png" },
  { symbol: "DOGE", name: "DOGE Coin", priceUsd: "0", change24hPct: 0.0271, spark: [2,2,3,3,4,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png" },
  { symbol: "EOS", name: "EOS Coin", priceUsd: "0", change24hPct: 0.0152, spark: [1,2,2,1,2,3,2,3,3,4], logo: "https://assets.coingecko.com/coins/images/738/standard/CG_EOS_Icon.png" },
{ symbol: "XAU", name: "XAU Coin", priceUsd: "0", change24hPct: 0.0021, spark: [3,4,3,5,5,6,5,7,7,8], logo: "https://assets.coingecko.com/coins/images/31894/standard/GOLD.png" },
{ symbol: "XAG", name: "XAG Coin", priceUsd: "0", change24hPct: 0.0018, spark: [2,3,2,4,4,5,4,6,6,7], logo: "https://assets.coingecko.com/coins/images/66401/standard/200.jpg" },
{ symbol: "XPT", name: "XPT Coin", priceUsd: "0", change24hPct: 0.0018, spark: [2,3,2,4,4,5,4,6,6,7], logo: "https://assets.coingecko.com/coins/images/66401/standard/200.jpg" },
{ symbol: "WTI", name: "WTI Coin", priceUsd: "0", change24hPct: 0.0018, spark: [2,3,2,4,4,5,4,6,6,7], logo: "https://assets.coingecko.com/coins/images/66401/standard/200.jpg" },
{ symbol: "XG", name: "XG Coin", priceUsd: "0", change24hPct: 0.0032, spark: [4,5,4,6,6,7,6,8,8,9], logo: "platinum.webp" },
{ symbol: "GBP", name: "GBP/USD", priceUsd: "0", change24hPct: 0.0007, spark: [1,1,1,1,1,1,1,1,1,1], logo: "pound.jpg" },
{ symbol: "JPY", name: "JPY/USD", priceUsd: "0", change24hPct: 0.0003, spark: [1,1,1,1,1,1,1,1,1,1], logo: "yen.png" },
];

// Ensure defaults for new metrics
(coins as any[]).forEach((c) => {
  if (typeof (c as any).volume24h === "undefined") (c as any).volume24h = 0;
  if (typeof (c as any).trades24h === "undefined") (c as any).trades24h = 0;
});

// Legacy UI wallets representation (still used by components).
// NOTE: This does not directly mirror the Prisma Wallet model, which includes profits, frozen, actualBalance, etc.
// For seeding the database, use `walletsSeed` below.
export const walletsData: Wallet[] = ["USDT","BTC","ETH","AAVE","BNB","XRP","ADA","SOL"].map(sym => {
  const coin = coins.find(c => c.symbol === sym);
  return {
    name: `${sym} Wallet`,
    network: "", // can be set later per chain
    symbol: sym,
    balance: "0.00",
    change: "0.0%",
    logo: coin?.logo || "",
    priceUsd: "$0.00",
    address: "",
  } as Wallet;
});

// Schema-aligned wallet seed objects for Prisma (excluding id + timestamps which Prisma sets)
// Fields from schema.prisma Wallet model:
// id, coinId, balance, profits, frozen, symbol (unique), name, logo, address, actualBalance, privateKey, publicKey, network, createdAt, updatedAt
// We provide defaults for missing optional crypto-specific fields.
export const walletsSeed = coins.filter(c => ["USDT","BTC","ETH","AAVE","BNB","XRP","ADA","SOL"].includes(c.symbol)).map(c => ({
  coinId: c.symbol,          // using symbol as external coin identifier; adjust if separate Coin table
  balance: 0,
  profits: 0,
  frozen: 0,
  symbol: c.symbol,
  name: `${c.symbol} Wallet`,
  logo: c.logo,
  address: "",              // to be filled when address is generated
  actualBalance: "0",
  privateKey: null as string | null,
  publicKey: "",            // placeholder until generated
  network: "",               // e.g., 'erc20', 'bep20', etc.
}));

/**
 * walletsSeed is intended strictly for database seeding (see /api/createAllCoins route).
 * UI components should continue using walletsData (lightweight, string fields for display).
 * If you later add a Coin table, replace coinId with the actual Coin primary key or keep symbol mapping.
 */

// Fetch real-time prices from CoinGecko
export async function fetchCoinPrices(): Promise<Coin[]> {
  const ids = [
    "bitcoin", "ethereum", "tether", "binancecoin", "ripple", "solana", "aave",
    "polkadot", "chainlink", "uniswap", "litecoin", "cardano", "dogecoin", "eos"
  ];
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

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`;
  const res = await fetch(url);
  const prices = await res.json();

  return coins.map(coin => ({
    ...coin,
    priceUsd: prices[symbolToId[coin.symbol]]?.usd ?? coin.priceUsd,
  }));
}

export function getCoin(symbol: string) {
  return coins.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());
}

export function getWallet(symbol: string) {
  return walletsData.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());
}


// mapping symbols → CoinGecko IDs
const coinGeckoIds: Record<string, string> = {
  USDT: "tether",
  BTC: "bitcoin",
  ETH: "ethereum",
  AAVE: "aave",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  SOL: "solana",
};

// New helper: fetch a single symbol merged wallet via dedicated API (preferred path)
export async function fetchUserWalletSymbol(userEmail: string, symbol: string) {
  const res = await fetch(`/api/userWallet?userId=${encodeURIComponent(userEmail)}&symbol=${encodeURIComponent(symbol)}`);
  if (!res.ok) return undefined;
  const data = await res.json();
  if (!Array.isArray(data.wallets) || data.wallets.length === 0) return undefined;
  return data.wallets[0];
}

// NEW: fetch all merged wallets for a user (no pricing enrichment)
export async function fetchUserWallets(userEmail: string): Promise<Wallet[]> {
  // Fallback to legacy endpoint if needed
  try {
    console.log("fetchUserWallets primary failed, trying fallback");
    const res = await fetch(`/api/getUserAddress?userId=${encodeURIComponent(userEmail)}`);
    if (res.ok) {
      const data = await res.json();
      console.log("fetchUserWallets fallback response:", data);
      if (Array.isArray(data.wallets)) return data.wallets;
    }
  } catch (e) {
    console.warn("fetchUserWallets fallback error", e);
  }

  return []; // empty => caller can decide to show zeros
}

// Updated: single wallet fetch with price enrichment
export async function fetchWallet(symbol: string, userEmail: string): Promise<Wallet | undefined> {
  const base = getWallet(symbol);
  if (!base) return undefined;

  try {
    // Try single-symbol endpoint first
    let entry = await fetchUserWalletSymbol(userEmail, symbol);

    // If not found, pull all and pick
    if (entry) {
      const all = await fetchUserWallets(userEmail);
      entry = all.find(w => w.symbol?.toUpperCase() === symbol.toUpperCase());
    }

    const coinId = coinGeckoIds[symbol.toUpperCase()];
    let priceUsd = "$0.00";
    let change = "0.0%";

    if (coinId) {
      try {
        const priceRes = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
        );
        if (priceRes.ok) {
          const prices = await priceRes.json();
          const coinPrice = Number(prices[coinId]?.usd) || 0;
          const priceChange = Number(prices[coinId]?.usd_24h_change) || 0;
          const balanceNum = parseFloat(entry?.balance ?? base.balance ?? "0") || 0;
          priceUsd = `$ ${(balanceNum * coinPrice).toFixed(2)}`;
          change = `${priceChange.toFixed(2)}%`;
        }
      } catch (priceErr) {
        console.warn("Price fetch failed", priceErr);
      }
    }

    return {
      ...base,
      balance: entry?.balance ?? base.balance,
      address: entry?.address ?? base.address,
      network: entry?.network ?? base.network,
      priceUsd,
      change,
    };
  } catch (e) {
    console.error("fetchWallet error", e);
    return base;
  }
}


export async function subscribePrice(symbol: string, cb: (price: string, change: string) => void) {
  const pair = `${symbol.toLowerCase()}usdt`;
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair}@ticker`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const priceUsd = `$${parseFloat(data.c).toFixed(2)}`; // last price
    const change = `${parseFloat(data.P).toFixed(2)}%`;  // 24h % change
    cb(priceUsd, change);
  };

  return () => ws.close(); // cleanup
}


export function subscribeMarket(symbols: string[], onUpdate: (symbol: string, price: string, change: string) => void) {
  // stream multiple tickers in one connection
  const streams = symbols.map(s => `${s.toLowerCase()}usdt@ticker`).join("/");
  const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    const d = msg.data;
    const sym = d.s.replace("USDT", ""); // "BTCUSDT" -> "BTC"
    const price = `$${parseFloat(d.c).toFixed(2)}`;
    const change = `${parseFloat(d.P).toFixed(2)}%`;
    onUpdate(sym, price, change);
  };

  return () => ws.close();
}

const sparks: Record<string, number[]> = {};
const MAX_POINTS = 50; // small size, e.g., 50 points for the sparkline

// fetch initial 24h data
async function fetchInitialSpark(symbol: string) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=30m&limit=${MAX_POINTS}`;
  const res = await fetch(url);
  const data = await res.json();
  // each kline: [openTime, open, high, low, close, ...]
  sparks[symbol] = data.map((k: any) => parseFloat(k[4])); // close prices
}

export function subscribeMarketWithSpark(
  symbols: string[],
  onUpdate: (
    symbol: string,
    price: string,
    change: string,
    spark: number[],
    volume24h: number,
    trades24h: number
  ) => void
) {
  // fetch initial spark for all symbols
  // await Promise.all(symbols.map(s => fetchInitialSpark(s)));

  const streams = symbols.map(s => `${s.toLowerCase()}usdt@ticker`).join("/");
  const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    const d = msg.data;
    const sym = d.s.replace("USDT", "");
    const priceNum = parseFloat(d.c);

    // keep spark history
    if (!sparks[sym]) sparks[sym] = [];
    sparks[sym].push(priceNum);
    if (sparks[sym].length > MAX_POINTS) sparks[sym].shift();

    // normalize spark to range 0–8
    const min = Math.min(...sparks[sym]);
    const max = Math.max(...sparks[sym]);
    const normalized =
      max === min
        ? sparks[sym].map(() => 5)
        : sparks[sym].map(v => ((v - min) / (max - min)) * 8);

    const price = `$${priceNum.toFixed(2)}`;
    const change = `${parseFloat(d.P).toFixed(2)}%`;
    const volume24h = parseFloat(d.q || d.v || 0); // quote or base volume
    const trades24h = Number(d.n || 0); // trade count 24h

    onUpdate(sym, price, change, normalized, volume24h, trades24h);
  };

  return () => ws.close();
}

// lib/data.ts
export const NEWS = [
  {
    id: 1,
    title: "Bitcoin Surges Past $60,000 Amid Institutional Demand",
    source: "CoinDesk",
    time: "2 hours ago",
    image: "/images.jpeg",
    url: "https://coindesk.com",
    content: "Detailed content about Bitcoin surge..."
  },
  {
    id: 2,
    title: "Ethereum 2.0 Upgrade Scheduled for Next Month",
    source: "CryptoNews",
    time: "5 hours ago",
    image: "/image1.jpg",
    url: "https://cryptonews.com",
    content: "Detailed content about Ethereum upgrade..."
  },
   {
    id: 3,
    title: "Binance announces new trading pairs",
    url: "#",
    time: "30m ago",
    source: "Binance Blog",
    image: "/image3.webp",
  }
  // Add more news items with unique IDs
];






// export async function fetchWallet(symbol: string, userId: string): Promise<Wallet | undefined> {
//   const wallet = getWallet(symbol);
//   if (!wallet) return undefined;
//   const res = await fetch(`/api/getUserAddress?userId=${userId}`);
//   if (!res.ok) return wallet;
  
//   const data = await res.json();
//   const userWallets: any = Object.values(data.wallets).find(
//     (w: any) => w.network?.toLocaleUpperCase() === symbol.toLocaleUpperCase()
//   );
//   // console.log("Fetching wallet for user:", userWallets?.balance, "symbol:", symbol, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.");
//   // const userWallet = data.wallets[symbol.toLocaleUpperCase()];
//   if (userWallets) {
//     return {
//       ...wallet,
//       balance: userWallets?.balance ?? wallet.balance,
//       address: userWallets?.address ?? wallet.address,
//     };
//   }
//   return wallet;
// }