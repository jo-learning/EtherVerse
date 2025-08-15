"use client";
import { useState } from "react";
import { FaUser, FaExchangeAlt, FaGift, FaChartLine, FaCogs, FaComments, FaSearch, FaMoon, FaSun } from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import { AiOutlineBars, AiOutlineClose } from "react-icons/ai";
import { log } from "console";

export default function WalletPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeWallet, setActiveWallet] = useState("USDT Wallet");
  const [searchQuery, setSearchQuery] = useState("");

  const wallets = [
    { name: "USDT Wallet", balance: "$7,282.30", change: "+2.1%", logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png" },
    { name: "BTC Wallet", balance: "$0.00", change: "0.0%", logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
    { name: "ETH Wallet", balance: "$0.00", change: "0.0%", logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"},
    { name: "AAVE Wallet", balance: "$0.00", change: "0.0%", logo: "https://assets.coingecko.com/coins/images/12645/large/AAVE.png" },
    { name: "BNB Wallet", balance: "$0.00", change: "0.0%", logo: "https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png" },
    { name: "XRP Wallet", balance: "$0.00", change: "0.0%", logo: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
    { name: "ADA Wallet", balance: "$0.00", change: "0.0%", logo: "https://assets.coingecko.com/coins/images/975/large/cardano.png" },
    { name: "SOL Wallet", balance: "$0.00", change: "0.0%", logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
  ];

  const filteredWallets = wallets.filter(wallet =>
    wallet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex h-screen overflow-x-hidden dark:bg-gray-900 bg-gray-50 lg:flex`}>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-blue-500 dark:text-white lg:hidden shadow-lg">
          <h1 className="font-bold text-lg">Crypto Wallet</h1>
          <button 
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <AiOutlineBars size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl p-6 shadow-xl text-gray-900 dark:text-white">
            <div className="flex justify-between items-center">
              <div className="">
                <h2 className="text-2xl md:text-3xl font-bold  ">Send Crypto</h2>
                <p className="opacity-90 mt-1">Select a wallet to transfer funds</p>
              </div>
              <div className="hidden md:flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                <span className="font-medium">Active:</span>
                <span>{activeWallet}</span>
              </div>
            </div>
          </div>

          {/* Wallet List */}
          <div className="mt-6 bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search wallets..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100/50 dark:bg-gray-700/50 border-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-gray-800 dark:text-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="divide-y divide-gray-200/50 dark:divide-gray-700">
              {filteredWallets.map((wallet, idx) => (
                <button
                  key={idx}
                  className={`flex justify-between items-center w-full p-4 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all ${
                    activeWallet === wallet.name ? "bg-purple-50/50 dark:bg-purple-900/20" : ""
                  }`}
                  onClick={() => {
                    setActiveWallet(wallet.name)
                    window.location.href = `/wallets/${wallet.name.split(" ")[0].toLowerCase()}`
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center overflow-hidden">
                      {wallet.logo ? (
                        <img src={wallet.logo} alt={wallet.name} className="w-7 h-7 object-contain" />
                      ) : (
                        <span className="text-lg">{wallet.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{wallet.name}</h3>
                      <p className={`text-xs ${wallet.change.startsWith("+") ? "text-green-500" : "text-gray-500"}`}>
                        {wallet.change}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800 dark:text-gray-200">{wallet.balance}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Action Button */}
        {/* <div className="lg:hidden fixed bottom-6 left-6 right-6">
          <button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
            Continue with {activeWallet}
          </button>
        </div> */}
      </main>
    </div>
  );
}