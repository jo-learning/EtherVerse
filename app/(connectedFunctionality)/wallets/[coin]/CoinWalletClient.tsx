"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowLeft, FaQrcode, FaPaperPlane, FaSync } from "react-icons/fa";

interface Props {
  coin: string;
}

export default function CoinWalletClient({ coin }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"receive" | "send" | "convert">("receive");

  const coinData: Record<
    string,
    {
      name: string;
      logo: string;
      balanceUSD: string;
      balanceCoin: string;
      frozen: string;
      address: string;
      network: string;
    }
  > = {
    eth: {
      name: "ETH Wallet",
      logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      balanceUSD: "7,284.49",
      balanceCoin: "3.2400 ETH",
      frozen: "0.0000 ETH",
      address: "0xAC7f193bDD0E...A3956a9A20E8A0",
      network: "ERC20",
    },
    btc: {
      name: "BTC Wallet",
      logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      balanceUSD: "0.00",
      balanceCoin: "0.0000 BTC",
      frozen: "0.0000 BTC",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      network: "Bitcoin",
    },
    usdt: {
      name: "USDT Wallet",
      logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
      balanceUSD: "7,282.30",
      balanceCoin: "7,282.3000 USDT",
      frozen: "0.0000 USDT",
      address: "0xB123456789...ABCDEF123456",
      network: "TRC20",
    },
    
  };

  const coinKey = coin.toLowerCase();
  const coinInfo = coinData[coinKey] || {
    name: "Unknown Wallet",
    logo: "",
    balanceUSD: "0.00",
    balanceCoin: "0.0000",
    frozen: "0.0000",
    address: "N/A",
    network: "N/A",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coinInfo.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500 via-blue-400 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      {/* Header */}
      <header className="flex items-center p-4 bg-white/20 dark:bg-gray-800/50 backdrop-blur-md shadow-md">
        <button onClick={() => router.back()} className="mr-3">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">{coinInfo.name}</h1>
      </header>

      {/* Logo */}
      {coinInfo.logo && (
        <div className="flex justify-center mt-6">
          <img src={coinInfo.logo} alt={coinInfo.name} className="w-16 h-16 rounded-full" />
        </div>
      )}

      {/* Balance Card */}
      <div className="max-w-lg mx-auto mt-4 bg-white/80 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg backdrop-blur-md border border-gray-200/40 dark:border-gray-700 text-center">
        <h2 className="text-3xl font-bold">${coinInfo.balanceUSD}</h2>
        <p className="text-purple-600 dark:text-purple-400 font-medium">{coinInfo.balanceCoin}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Frozen: {coinInfo.frozen}</p>
      </div>

      {/* Action Buttons */}
      <div className="max-w-lg mx-auto mt-6 grid grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab("receive")}
          className={`py-2 rounded-lg flex flex-col items-center justify-center ${
            activeTab === "receive" ? "bg-purple-600 text-white" : "bg-white/60 dark:bg-gray-700"
          }`}
        >
          <FaQrcode />
          <span className="text-sm">Receive</span>
        </button>
        <button
          onClick={() => setActiveTab("send")}
          className={`py-2 rounded-lg flex flex-col items-center justify-center ${
            activeTab === "send" ? "bg-blue-600 text-white" : "bg-white/60 dark:bg-gray-700"
          }`}
        >
          <FaPaperPlane />
          <span className="text-sm">Send</span>
        </button>
        <button
          onClick={() => setActiveTab("convert")}
          className={`py-2 rounded-lg flex flex-col items-center justify-center ${
            activeTab === "convert" ? "bg-green-600 text-white" : "bg-white/60 dark:bg-gray-700"
          }`}
        >
          <FaSync />
          <span className="text-sm">Convert</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-w-lg mx-auto mt-6 bg-white/80 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg backdrop-blur-md border border-gray-200/40 dark:border-gray-700">
        {activeTab === "receive" && (
          <div className="text-center">
            <span className="inline-block bg-orange-500 text-white text-xs px-3 py-1 rounded-full mb-4">
              {coinInfo.network}
            </span>
            <div className="mx-auto w-40 h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                {/* QR Code */}
                <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                  coinInfo.address
                )}`}
                alt="QR Code"
                className="w-36 h-36"
                />
            </div>
            <p className="mt-4 break-all text-sm">{coinInfo.address}</p>
            <button
              onClick={handleCopy}
              className="mt-3 text-purple-600 dark:text-purple-400 hover:underline"
            >
              {copied ? "Copied!" : "Copy address"}
            </button>
          </div>
        )}

        {activeTab === "send" && (
          <div>
            <h3 className="text-lg font-bold mb-3">Send {coinKey.toUpperCase()}</h3>
            <input
              type="text"
              placeholder="Recipient address"
              className="w-full p-2 mb-3 border rounded-lg dark:bg-gray-700"
            />
            <input
              type="number"
              placeholder="Amount"
              className="w-full p-2 mb-3 border rounded-lg dark:bg-gray-700"
            />
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Send Now
            </button>
          </div>
        )}

        {activeTab === "convert" && (
          <div>
            <h3 className="text-lg font-bold mb-3">Convert {coinKey.toUpperCase()}</h3>
            <input
              type="number"
              placeholder="Amount"
              className="w-full p-2 mb-3 border rounded-lg dark:bg-gray-700"
            />
            <select className="w-full p-2 mb-3 border rounded-lg dark:bg-gray-700">
              <option>BTC</option>
              <option>ETH</option>
              <option>USDT</option>
            </select>
            <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Convert Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
