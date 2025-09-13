"use client";
import { useEffect, useState } from "react";
import {
  FaUser,
  FaExchangeAlt,
  FaGift,
  FaChartLine,
  FaCogs,
  FaComments,
  FaSearch,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import { AiOutlineBars, AiOutlineClose } from "react-icons/ai";
import { log } from "console";
import { useLoading } from "@/components/loadingPage";
import { useAccount } from "wagmi";

// Color palette
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

export default function WalletPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeWallet, setActiveWallet] = useState("USDT Wallet");
  const [searchQuery, setSearchQuery] = useState("");
  const { address} = useAccount();
  const [wallets, setWallets] = useState([
    {
      name: "BTC Wallet",
      network: "",
      symbol: "BTC",
      balance: "0.00 BTC",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    },
    {
      name: "ETH Wallet",
      network: "",
      symbol: "ETH",
      balance: "0.00 ETH",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    },
    {
      name: "USDT Wallet",
      network: "",
      symbol: "USDT",
      balance: "0.00 USDT",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
    },
    {
      name: "USDC Coin Wallet",
      network: "",
      symbol: "USDC",
      balance: "0.00 USDC",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
    },
    {
      name: "BNB Wallet",
      network: "",
      symbol: "BNB",
      balance: "0.00 BNB",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png",
    },
    {
      name: "XRP Wallet",
      network: "",
      symbol: "XRP",
      balance: "0.00 XRP",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
    },
    {
      name: "ADA Wallet",
      network: "",
      symbol: "ADA",
      balance: "0.00 ADA",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
    },
    {
      name: "DOGE Wallet",
      network: "",
      symbol: "DOGE",
      balance: "0.00 DOGE",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
    },
    {
      name: "MATIC Wallet",
      network: "",
      symbol: "MATIC",
      balance: "0.00 MATIC",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png",
    },
    {
      name: "DOT Wallet",
      network: "",
      symbol: "DOT",
      balance: "0.00 DOT",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://static.coingecko.com/s/polkadot-73b0c058cae10a2f076a82dcade5cbe38601fad05d5e6211188f09eb96fa4617.gif",
    },
    {
      name: "LTC Wallet",
      network: "",
      symbol: "LTC",
      balance: "0.00 LTC",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/2/large/litecoin.png",
    },
    {
      name: "LINK Wallet",
      network: "",
      symbol: "LINK",
      balance: "0.00 LINK",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/877/standard/chainlink-new-logo.png",
    },
    {
      name: "UNI Wallet",
      network: "",
      symbol: "UNI",
      balance: "0.00 UNI",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/50744/standard/CUQw_tZe_400x400.jpg",
    },
    {
      name: "AVAX Wallet",
      network: "",
      symbol: "AVAX",
      balance: "0.00 AVAX",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png",
    },
    {
      name: "SHIB Wallet",
      network: "",
      symbol: "SHIB",
      balance: "0.00 SHIB",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/11939/standard/shiba.png",
    },
    {
      name: "WBTC Wallet",
      network: "",
      symbol: "WBTC",
      balance: "0.00 WBTC",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png",
    },
    {
      name: "DAI Wallet",
      network: "",
      symbol: "DAI",
      balance: "0.00 DAI",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png",
    },
    {
      name: "TUSD Wallet",
      network: "",
      symbol: "TUSD",
      balance: "0.00 TUSD",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/3449/standard/tusd.png?1696504140",
    },
    {
      name: "UNI-V3 Wallet",
      network: "",
      symbol: "UNI-V3",
      balance: "0.00 UNI-V3",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/markets/images/1212/large/uniswap-v3.jpg",
    },
    {
      name: "BCH Wallet",
      network: "",
      symbol: "BCH",
      balance: "0.00 BCH",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/780/standard/bitcoin-cash-circle.png",
    },
    {
      name: "XLM Wallet",
      network: "",
      symbol: "XLM",
      balance: "0.00 XLM",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/100/standard/fmpFRHHQ_400x400.jpg",
    },
    {
      name: "VET Wallet",
      network: "",
      symbol: "VET",
      balance: "0.00 VET",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/1167/standard/VET.png",
    },
    {
      name: "FIL Wallet",
      network: "",
      symbol: "FIL",
      balance: "0.00 FIL",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/12817/standard/filecoin.png",
    },
    {
      name: "XTZ Wallet",
      network: "",
      symbol: "XTZ",
      balance: "0.00 XTZ",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/32340/standard/CoinGecko_200_x_200.jpg",
    },
    {
      name: "EOS Wallet",
      network: "",
      symbol: "EOS",
      balance: "0.00 EOS",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/738/standard/CG_EOS_Icon.png",
    },
    {
      name: "TRX Wallet",
      network: "",
      symbol: "TRX",
      balance: "0.00 TRX",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/1094/standard/tron-logo.png",
    },
    {
      name: "ATOM Wallet",
      network: "",
      symbol: "ATOM",
      balance: "0.00 ATOM",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/1481/standard/cosmos_hub.png",
    },
    {
      name: "ALGO Wallet",
      network: "",
      symbol: "ALGO",
      balance: "0.00 ALGO",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/4380/standard/download.png",
    },
    {
      name: "HBAR Wallet",
      network: "",
      symbol: "HBAR",
      balance: "0.00 HBAR",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/3688/standard/hbar.png",
    },
    {
      name: "ZEC Wallet",
      network: "",
      symbol: "ZEC",
      balance: "0.00 ZEC",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/486/standard/circle-zcash-color.png",
    },
    {
      name: "DASH Wallet",
      network: "",
      symbol: "DASH",
      balance: "0.00 DASH",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/19/standard/dash-logo.png",
    },
    {
      name: "XEM Wallet",
      network: "",
      symbol: "XEM",
      balance: "0.00 XEM",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/242/standard/NEM_WC_Logo_200px.png",
    },
    {
      name: "BAT Wallet",
      network: "",
      symbol: "BAT",
      balance: "0.00 BAT",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/677/standard/basic-attention-token.png",
    },
    {
      name: "ENJ Wallet",
      network: "",
      symbol: "ENJ",
      balance: "0.00 ENJ",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/1102/standard/Symbol_Only_-_Purple.png",
    },
    {
      name: "PAX Wallet",
      network: "",
      symbol: "PAX",
      balance: "0.00 PAX",
      priceUsd: "$0.00",
      change: "0.0%",
      logo: "https://assets.coingecko.com/coins/images/9519/standard/paxgold.png",
    },
  ]);
  type Wallet = {
    name: string;
    network: string;
    symbol: string;
    balance: string;
    priceUsd: string;
    change: string;
    logo: string;
  };

  const [newWallets, setNewWallets] = useState<Wallet[]>([]);
  // const { setLoading } = useLoading();
  const [loading, setLoading] = useState(false);

  // Mapping from your symbol → CoinGecko ID
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

  const getWallets = async () => {
    try {
      // const address = window.ethereum?.selectedAddress;
      const response = await fetch(`/api/getUserAddress?userId=${address}`);
      const data = await response.json();

      if (data.wallets && Array.isArray(data.wallets)) {
        // 1. Get live prices from CoinGecko
        const ids = Object.values(coinGeckoIds).join(",");
        const pricesRes = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        const prices = await pricesRes.json();

        // 2. Merge balances and prices
        const updatedWallets = wallets.map((wallet) => {
          const found = data.wallets.find(
            (w: any) => w.symbol === wallet.symbol
          );
          const balanceNum = found ? parseFloat(found.balance) : 0;
          const cgId = coinGeckoIds[wallet.symbol];
          const coinPrice = prices[cgId]?.usd || 0;
          const change =
            prices[cgId]?.usd_24h_change?.toFixed(2) + "%" || "0.0%";

          return found
            ? {
                ...wallet,
                balance: `${balanceNum.toFixed(2)} ${found.symbol}`,
                priceUsd: `$ ${(balanceNum * coinPrice).toFixed(2)}`,
                change,
              }
            : wallet;
        });

        console.log("Wallets with prices:", updatedWallets);
        setNewWallets(updatedWallets);
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };
  var filteredWallets: any = [];

  if (newWallets.length !== 0) {
    filteredWallets = newWallets.filter((wallet) =>
      wallet.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  useEffect(() => {
    getWallets();
  }, [address]);

  return (
    <div
      className="flex h-screen overflow-x-hidden lg:flex"
      style={{ background: COLORS.background }}
    >
      {loading && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center"
                  style={{ background: COLORS.white, backgroundColor: COLORS.white, opacity: 0.4 }}>
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4"
                    style={{ borderColor: COLORS.purple }}></div>
                </div>
              )}
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Header Card */}
          <div
            className="rounded-2xl p-6 shadow-xl bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('slider 1.jpg')",
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold" style={{color: COLORS.white}}>Send Crypto</h2>
                <p className="opacity-90 mt-1" style={{color: COLORS.white}}>
                  Select a wallet to transfer funds
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-full bg-white/20 text-purple-700">
                <span className="font-medium">Active:</span>
                <span>{activeWallet}</span>
              </div>
            </div>
          </div>

          {/* Wallet List */}
          <div
            className="mt-6 rounded-2xl shadow-lg overflow-hidden border"
            style={{
              background: COLORS.background,
              borderColor: COLORS.purple,
            }}
          >
            <div
              className="p-4 border-b"
              style={{
                borderColor: COLORS.purple + "55",
                background: COLORS.background,
              }}
            >
              <div className="relative">
                <FaSearch
                  className="absolute left-3 top-3"
                  style={{ color: COLORS.white + "99" }}
                />
                <input
                  type="text"
                  placeholder="Search wallets..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none focus:outline-none"
                  style={{
                    background: COLORS.navy,
                    color: COLORS.white,
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              {filteredWallets.length === 0 && (
                <div className="flex justify-center items-center py-8">
                  <svg
                    className="animate-spin h-8 w-8"
                    style={{ color: COLORS.purple }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  <span className="ml-3" style={{ color: COLORS.neonGreen }}>
                    Loading wallets...
                  </span>
                </div>
              )}

              {filteredWallets.length > 0 && (
                <div className="grid gap-3 p-3">
                  {filteredWallets.map((wallet: Wallet, idx: number) => (
                    <button
                      key={idx}
                      className="rounded-xl border shadow p-4 flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-lg"
                      style={{
                        background: COLORS.navy,
                        borderColor: COLORS.purple,
                        color: COLORS.white,
                      }}
                      onClick={() => {
                        setLoading(true);
                        setActiveWallet(wallet.name);
                        window.location.href = `/wallets/${wallet.name
                          .split(" ")[0]
                          .toLowerCase()}`;
                      }}
                    >
                      {/* Left: logo + name */}
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
                          // style={{ background: COLORS.white }}
                        >
                          {wallet.logo ? (
                            <img
                              src={wallet.logo}
                              alt={wallet.name}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <span className="text-lg">{wallet.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold" style={{ color: COLORS.white }}>
                            {wallet.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                background: COLORS.background,
                                color: COLORS.textGray,
                                border: `1px solid ${COLORS.purple}66`,
                              }}
                            >
                              {wallet.symbol}
                            </span>
                            <span
                              className="text-xs font-medium"
                              style={{
                                color: wallet.change.startsWith("-")
                                  ? "#ff1744"
                                  : COLORS.neonGreen,
                              }}
                            >
                              {wallet.change}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: value + balance */}
                      <div className="text-right">
                        <div className="font-semibold" style={{ color: COLORS.white }}>
                          {wallet.priceUsd}
                        </div>
                        <div className="text-sm" style={{ color: COLORS.textGray }}>
                          {wallet.balance}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
