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
  { symbol: "XAU", name: "XAU Coin", priceUsd: "0", change24hPct: 0.0021, spark: [3,4,3,5,5,6,5,7,7,8], logo: "gold--big.svg" },
  { symbol: "XAG", name: "XAG Coin", priceUsd: "0", change24hPct: 0.0018, spark: [2,3,2,4,4,5,4,6,6,7], logo: "https://assets.coingecko.com/coins/images/66401/standard/200.jpg" },
  { symbol: "XPT", name: "XPT Coin", priceUsd: "0", change24hPct: 0.0018, spark: [2,3,2,4,4,5,4,6,6,7], logo: "xpt.avif" },
  { symbol: "WTI", name: "WTI Coin", priceUsd: "0", change24hPct: 0.0018, spark: [2,3,2,4,4,5,4,6,6,7], logo: "wti.jpg" },
  { symbol: "XG", name: "XG Coin", priceUsd: "0", change24hPct: 0.0032, spark: [4,5,4,6,6,7,6,8,8,9], logo: "platinum.webp" },
  { symbol: "GBP", name: "GBP/USD", priceUsd: "0", change24hPct: 0.0007, spark: [1,1,1,1,1,1,1,1,1,1], logo: "pound.jpg" },
  { symbol: "JPY", name: "JPY/USD", priceUsd: "0", change24hPct: 0.0003, spark: [1,1,1,1,1,1,1,1,1,1], logo: "yen.png" },
];

// Only these symbols are allowed to change their change24hPct and spark over time.
const dynamicSymbols = new Set<string>(["XAU", "XAG", "XPT", "WTI", "XG", "GBP", "JPY"]);


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

// Fetch real-time prices: Finnhub for forex/metals, CoinGecko for the rest
export async function fetchCoinPrices(): Promise<Coin[]> {
  // Lock change24hPct and spark for all non-dynamic coins BEFORE fetching prices (idempotent)
  // Randomize change24hPct and spark for dynamic symbols; do not lock anything
  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
  const randStep = (max: number) => (Math.random() - 0.5) * 2 * max; // [-max, +max]
  const SPARK_LEN = 10;

  for (const c of coins) {
    const sym = c.symbol.toUpperCase();
    const isDynamic = dynamicSymbols.has(sym);

    // Only apply randomization to dynamic symbols
    if (isDynamic) {
      // Jitter 24h change slightly each call (values are fractional, e.g., 0.01 = 1%)
      const base = typeof c.change24hPct === "number" ? c.change24hPct : 0;
      const delta = randStep(0.002); // ±0.20%
      c.change24hPct = clamp(base + delta, -0.2, 0.2); // clamp to [-20%, +20%]

      // Spark: random walk within [0..9], keep fixed length
      let sparkArr: number[] = Array.isArray((c as any).spark) ? ([...(c as any).spark] as number[]) : [];
      if (!sparkArr.length) sparkArr = [5];

      const last = sparkArr[sparkArr.length - 1] ?? 5;
      const smallStep = Math.random() < 0.7 ? (Math.random() < 0.5 ? -1 : 1) : 0; // mostly -1,0,+1
      const noise = randStep(0.25); // tiny float noise, rounded away
      const next = clamp(Math.round(last + smallStep + noise), 0, 9);

      sparkArr.push(next);
      while (sparkArr.length > SPARK_LEN) sparkArr.shift();
      (c as any).spark = sparkArr;
    }
  }

  // Map coins we fetch from Finnhub → OANDA symbols (+ invert where needed)
  const finnhubMap: Record<string, { sym: string; invert?: boolean }> = {
    // precious metals (as forex pairs on OANDA)
    XAU: { sym: 'XAU' },
    XAG: { sym: 'XAG' },
    XPT: { sym: 'XPT' },
    // forex bases
    GBP: { sym: 'GBP' },
    // Finnhub/OANDA uses USD_JPY; invert to get JPY/USD
    JPY: { sym: 'JPY', invert: true },
  };

  // 1) CoinGecko for non-forex/metals symbols
  const ids = [
    'bitcoin','ethereum','tether','binancecoin','ripple','solana','aave',
    'polkadot','chainlink','uniswap','litecoin','cardano','dogecoin','eos',
    // metals handled by Finnhub: xau,xag,xpt
    // oil/platinum aliases not on CG (WTI/XG) remain as-is
  ];
  const symbolToId: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    USDT: 'tether',
    BNB: 'binancecoin',
    XRP: 'ripple',
    SOL: 'solana',
    AAVE: 'aave',
    DOT: 'polkadot',
    LINK: 'chainlink',
    UNI: 'uniswap',
    LTC: 'litecoin',
    ADA: 'cardano',
    DOGE: 'dogecoin',
    EOS: 'eos',
  };

  let cgPrices: any = {};
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) cgPrices = await res.json();
  } catch (e) {
    console.warn('[prices] CoinGecko fetch failed', e);
  }

  // 2) Finnhub for forex + metals (current price)
  const fhPrices: Record<string, number> = {};
  const TD_API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;
  if (!TD_API_KEY) {
    console.warn('[TwelveData] NEXT_PUBLIC_TWELVE_DATA_API_KEY missing; forex/metals will fallback.');
  } else {
    await Promise.all(
      Object.entries(finnhubMap).map(async ([coinSym, cfg]) => {
        // For TD: use BASE/USD; if invert is set, query USD/BASE and invert the result
        const pair = cfg.invert ? `USD/${cfg.sym}` : `${cfg.sym}/USD`;
        const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(pair)}&apikey=${encodeURIComponent(TD_API_KEY)}`;
        try {
          const r = await fetch(url, { cache: 'no-store' });
          if (!r.ok) return;
          const j = await r.json();
          const raw = j?.price ?? j?.data?.price;
          const p = Number(raw);
          if (!Number.isFinite(p)) return;
          fhPrices[coinSym] = cfg.invert ? (p !== 0 ? 1 / p : 0) : p;
        } catch (e) {
          console.warn('[TwelveData] price fetch failed', coinSym, pair, e);
        }
      })
    );
  }

  // 3) Merge results
  return coins.map((coin) => {
    const sym = coin.symbol.toUpperCase();

    // Prefer Finnhub for forex/metals we mapped
    if (sym in fhPrices) {
      const p = fhPrices[sym];
      return { ...coin, priceUsd: Number.isFinite(p) ? String(p) : coin.priceUsd };
    }

    // Else CoinGecko for known crypto
    const id = symbolToId[sym];
    const p = id ? cgPrices?.[id]?.usd : undefined;
    return { ...coin, priceUsd: typeof p === 'number' ? String(p) : coin.priceUsd };
  });
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
    
    const res = await fetch(`/api/getUserAddress?userId=${encodeURIComponent(userEmail)}`);
    if (res.ok) {
      const data = await res.json();
      
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


export async function subscribePrice(
  symbol: string,
  cb: (price: string, change: string) => void
) {
  const excluded = new Set(["XAU", "XAG", "XPT", "WTI", "XG", "GBP", "JPY"]);
  const isFutures = excluded.has(symbol.toUpperCase());

  const pair = `${symbol.toLowerCase()}usdt`;
  
  const wsUrl = isFutures
    ? `wss://fstream.binance.com/ws/${pair}@ticker` // futures for metals
    : `wss://stream.binance.com:9443/ws/${pair}@ticker`; // spot for crypto

  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (!data?.c || !data?.P) return;

    const priceUsd = `$${parseFloat(data.c).toFixed(2)}`; // last price
    const change = `${parseFloat(data.P).toFixed(2)}%`;    // 24h % change
    cb(priceUsd, change);
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
    ws.close();
  };

  ws.onclose = () => {
    console.warn(`WebSocket closed for ${symbol}.`);
    // Optional: reconnect logic can be added here
  };

  return () => ws.close(); // cleanup function
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
export function subscribeFuturesMarket(
  symbols: string[],
  onUpdate: (symbol: string, price: string, change: string) => void
) {
  // Futures base
  const streams = symbols.map(s => `${s.toLowerCase()}usdt@ticker`).join("/");
  const ws = new WebSocket(`wss://fstream.binance.com/stream?streams=${streams}`);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    const d = msg.data;

    if (d?.s && d?.c && d?.P) {
      const sym = d.s; // e.g. "XAUUSDT"
      const price = `$${parseFloat(d.c).toFixed(2)}`;
      const change = `${parseFloat(d.P).toFixed(2)}%`;
      onUpdate(sym, price, change);
    }
  };

  ws.onclose = () => {
    console.warn("Futures WebSocket closed. Reconnecting...");
    setTimeout(() => subscribeFuturesMarket(symbols, onUpdate), 2000);
  };

  ws.onerror = (err) => {
    console.error("Futures WebSocket error:", err);
    ws.close();
  };

  return () => ws.close();
}


const sparks: Record<string, number[]> = {};
const MAX_POINTS = 50; // small size, e.g., 50 points for the sparkline

// Twelve Data API key for client-side fetches (forex)
// const TD_API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;

// Finnhub API key for forex + precious metals
const FH_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

// fetch initial 24h data (Binance spot)
async function fetchInitialSpark(symbol: string) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=30m&limit=${MAX_POINTS}`;
  const res = await fetch(url);
  const data = await res.json();
  // each kline: [openTime, open, high, low, close, ...]
  // console.log("this is the binance spark data", symbol, data);
  sparks[symbol] = data.map((k: any) => parseFloat(k[4])); // close prices
}

// Fetch initial spark for forex with Twelve Data
// async function fetchInitialSparkForex(base: string) {
//   if (!TD_API_KEY) {
//     console.warn('[TwelveData] missing NEXT_PUBLIC_TWELVE_DATA_API_KEY; skipping initial spark for', base);
//     return;
//   }
//   const pair = `${base}/USD`;
//   const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(pair)}&interval=30min&outputsize=${MAX_POINTS}&apikey=${encodeURIComponent(TD_API_KEY)}`;
//   try {
//     const r = await fetch(url, { cache: 'no-store' });
//     const json = await r.json();
//     // console.log('[TwelveData] initial spark fetched for', pair, json);
//     const values = Array.isArray(json?.values) ? json.values : [];
//     const closes = values.slice().reverse().map((v: any) => parseFloat(v?.close)).filter((n: number) => Number.isFinite(n));
//     if (closes.length) {
//       // console.log('[TwelveData] initial spark data points for', base, closes);
//       // sparks[base] = closes[closes.length - MAX_POINTS >= 0 ? closes.length - MAX_POINTS : 0];
//       // console.log(closes.map((k: any) => parseFloat(k)))
//       sparks[base] = closes.map((k: any) => parseFloat(k)); 
//     }
//   } catch (e) {
//     console.warn('[TwelveData] initial spark failed', base, e);
//   }
// }

function normalizeSpark(arr: number[]) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  return max === min ? arr.map(() => 5) : arr.map(v => ((v - min) / (max - min)) * 8);
}

function pctChange(arr: number[]) {
  if (arr.length < 2) return '0.00%';
  const first = arr[0];
  const last = arr[arr.length - 1];
  if (!first) return '0.00%';
  const pct = ((last - first) / first) * 100;
  return `${pct.toFixed(2)}%`;
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
  // separate futures vs spot vs forex
  const lower = symbols.map(s => s.toUpperCase());
  const futuresSymbols = lower.filter(s => ["XAU", "XAG"].includes(s));
  const forexBaseSet = new Set(["GBP", "JPY", "EUR", "AUD", "CAD", "CHF", "NZD"]); // extend as needed
  const forexSymbols = lower.filter(s => forexBaseSet.has(s) && s !== "USD");
  const spotSymbols = lower.filter(s => !["XAU", "XAG"].includes(s) && !forexBaseSet.has(s));

  // helper to create Binance websocket
  function createWS(baseUrl: string, syms: string[]) {
    if (!syms.length) return null;
    const streams = syms.map(s => `${s.toLowerCase()}usdt@ticker`).join("/");
    const ws = new WebSocket(`${baseUrl}/stream?streams=${streams}`);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const d = msg.data;
      const sym = d.s.replace("USDT", ""); // "BTCUSDT" -> "BTC"
      const priceNum = parseFloat(d.c);

      // keep spark history
      if (!sparks[sym]) sparks[sym] = [];
      sparks[sym].push(priceNum);
      if (sparks[sym].length > MAX_POINTS) sparks[sym].shift();

      const price = `$${priceNum.toFixed(2)}`;
      const change = `${parseFloat(d.P).toFixed(2)}%`;
      const volume24h = parseFloat(d.q || d.v || 0); // quote or base volume
      const trades24h = Number(d.n || 0); // trade count 24h

      onUpdate(sym, price, change, normalizeSpark(sparks[sym]), volume24h, trades24h);
    };

    return ws;
  }

  // Twelve Data: single WS for multiple forex pairs
  let wsForex: WebSocket | null = null;
  (async () => {
    if (!forexSymbols.length) return;
    // if (!TD_API_KEY) {
    //   console.warn('[TwelveData] NEXT_PUBLIC_TWELVE_DATA_API_KEY not set; skipping forex WS');
    //   return;
    // }

    // seed sparks for forex
    // await Promise.all(forexSymbols.map((b) => fetchInitialSparkForex(b)));

    // const pairs = forexSymbols.map(b => `${b}/USD`).join(',');
    // console.log('[TwelveData] connecting to WS for pairs:', pairs);
    // const url = `wss://ws.twelvedata.com/v1/quotes/price?symbol=${encodeURIComponent(pairs)}&apikey=${encodeURIComponent(TD_API_KEY)}`;
    // wsForex = new WebSocket(url);
    // console.log('[TwelveData] WS connecting...');
    // wsForex.onmessage = (event) => {
    //   try {
    //     const data = JSON.parse(event.data as any);
    //     console.log('[TwelveData] WS message', data);
    //     // Twelve Data can deliver single or batched updates; normalize to array
    //     const updates = Array.isArray(data) ? data : [data];
    //     for (const u of updates) {
    //       const symPair: string = u?.symbol || u?.data?.symbol;
    //       const priceStr: string = u?.price || u?.data?.price || u?.close;
    //       if (!symPair || !priceStr) continue;

    //       // Expect "GBP/USD" -> base = "GBP"
    //       const base = symPair.split('/')[0]?.toUpperCase();

    //       const priceNum = parseFloat(priceStr);
    //       if (!Number.isFinite(priceNum) || !base) continue;

    //       if (!sparks[base]) sparks[base] = [];
    //       sparks[base].push(priceNum);
    //       if (sparks[base].length > MAX_POINTS) sparks[base].shift();

    //       const price = `$${priceNum.toFixed(5)}`; // more precision for FX
    //       const change = pctChange(sparks[base]);

    //       onUpdate(base, price, change, normalizeSpark(sparks[base]), 0, 0);
    //     }
    //   } catch (e) {
    //     console.warn('[TwelveData] parse error', e);
    //   }
    // };

    // wsForex.onerror = (e) => {
    //   console.warn('[TwelveData] WS error', e);
    //   try { wsForex?.close(); } catch {}
    // };

    // wsForex.onclose = () => {
    //   console.warn('[TwelveData] WS closed');
    // };
  })();

  // Seed sparks for crypto spot via Binance
  (async () => {
    await Promise.all(spotSymbols.map((s) => fetchInitialSpark(s)));
  })();

  const wsFutures = createWS("wss://fstream.binance.com", futuresSymbols);
  const wsSpot = createWS("wss://stream.binance.com:9443", spotSymbols);

  return () => {
    if (wsFutures) wsFutures.close();
    if (wsSpot) wsSpot.close();
    // if (wsForex) wsForex.close();
  };
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