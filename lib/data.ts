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
  { symbol: "LINK", name: "LINK Coin", priceUsd: "0", change24hPct: 0.0137, spark: [1,1,2,2,3,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/877/large/chainlink.png" },
  { symbol: "UNI", name: "UNI Coin", priceUsd: "0", change24hPct: 0.0172, spark: [1,1,2,2,3,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/12504/large/uniswap-logo.png" },
  { symbol: "LTC", name: "LTC Coin", priceUsd: "0", change24hPct: 0.0098, spark: [1,1,2,2,3,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/2/large/litecoin.png" },
  { symbol: "ADA", name: "ADA Coin", priceUsd: "0", change24hPct: 0.0512, spark: [1,1,2,3,4,5,6,6,7,7], logo: "https://assets.coingecko.com/coins/images/975/large/cardano.png" },
  { symbol: "DOGE", name: "DOGE Coin", priceUsd: "0", change24hPct: 0.0271, spark: [2,2,3,3,4,3,4,4,5,5], logo: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png" },
  { symbol: "EOS", name: "EOS Coin", priceUsd: "0", change24hPct: 0.0152, spark: [1,2,2,1,2,3,2,3,3,4], logo: "https://assets.coingecko.com/coins/images/7383/large/eos-eos-logo.png" },
{ symbol: "XAU", name: "Gold", priceUsd: "0", change24hPct: 0.0021, spark: [3,4,3,5,5,6,5,7,7,8], logo: "https://example.com/gold.png" },
{ symbol: "XAG", name: "Silver", priceUsd: "0", change24hPct: 0.0018, spark: [2,3,2,4,4,5,4,6,6,7], logo: "https://example.com/silver.png" },
{ symbol: "XPT", name: "Platinum", priceUsd: "0", change24hPct: 0.0032, spark: [4,5,4,6,6,7,6,8,8,9], logo: "https://example.com/platinum.png" },
{ symbol: "EUR", name: "Euro", priceUsd: "0", change24hPct: 0.0005, spark: [1,1,1,1,1,1,1,1,1,1], logo: "https://example.com/euro.png" },
{ symbol: "GBP", name: "British Pound", priceUsd: "0", change24hPct: 0.0007, spark: [1,1,1,1,1,1,1,1,1,1], logo: "https://example.com/pound.png" },
{ symbol: "JPY", name: "Japanese Yen", priceUsd: "0", change24hPct: 0.0003, spark: [1,1,1,1,1,1,1,1,1,1], logo: "https://example.com/yen.png" },
];

export const walletsData: Wallet[] = [
   { name: "USDT Wallet",network: "", symbol: "USDT", balance: "0.00", change: "0.0%", logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png", priceUsd: "$0.00", address: "" },
    { name: "BTC Wallet",network: "", symbol: "BTC", balance: "0.00", change: "0.0%", logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" , priceUsd: "$0.00", address: ""},
    { name: "ETH Wallet",network: "", symbol: "ETH", balance: "0.00", change: "0.0%", logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png", priceUsd: "$0.00", address: ""},
    { name: "AAVE Wallet",network: "", symbol: "AAVE", balance: "0.00", change: "0.0%", logo: "https://assets.coingecko.com/coins/images/12645/large/AAVE.png" , priceUsd: "$0.00", address: ""},
    { name: "BNB Wallet",network: "", symbol: "BNB", balance: "0.00", change: "0.0%", logo: "https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png" , priceUsd: "$0.00", address: ""},
    { name: "XRP Wallet",network: "", symbol: "XRP", balance: "0.00", change: "0.0%", logo: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" , priceUsd: "$0.00", address: ""},
    { name: "ADA Wallet",network: "", symbol: "ADA", balance: "0.00", change: "0.0%", logo: "https://assets.coingecko.com/coins/images/975/large/cardano.png" , priceUsd: "$0.00", address: ""},
    { name: "SOL Wallet",network: "", symbol: "SOL", balance: "0.00", change: "0.0%", logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png" , priceUsd: "$0.00", address: ""},
]

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

export async function fetchWallet(symbol: string, userId: string): Promise<Wallet | undefined> {
  const wallet = getWallet(symbol);
  if (!wallet) return undefined;

  try {
    // 1. Fetch user wallet data
    const res = await fetch(`/api/getUserAddress?userId=${userId}`);
    if (!res.ok) return wallet;
    const data = await res.json();

    // 2. Find the wallet for this symbol
    const userWallet: any = Object.values(data.wallets).find(
      (w: any) => w.symbol?.toLocaleUpperCase() === symbol.toLocaleUpperCase()
    );

    // 3. Fetch current price from CoinGecko
    const coinId = coinGeckoIds[symbol.toUpperCase()];
    let priceUsd = "$0.00";
    let change = "0.0%";

    if (coinId) {
      const priceRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
      );
      const prices = await priceRes.json();
      const coinPrice = prices[coinId]?.usd || 0;
      const priceChange = prices[coinId]?.usd_24h_change || 0;

      const balanceNum = parseFloat(userWallet?.balance ?? "0");
      priceUsd = `$ ${(balanceNum * coinPrice).toFixed(2)}`;
      change = `${priceChange.toFixed(2)}%`;
    }

    return {
      ...wallet,
      balance: userWallet?.balance ?? wallet.balance,
      address: userWallet?.address ?? wallet.address,
      network: userWallet?.network ?? wallet.network,
      priceUsd,
      change,
    };
  } catch (err) {
    console.error("Error fetching wallet:", err);
    return wallet;
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
  onUpdate: (symbol: string, price: string, change: string, spark: number[]) => void
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

    onUpdate(sym, price, change, normalized);
  };

  return () => ws.close();
}







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