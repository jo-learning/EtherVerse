'use client';
import Header from "@/components/header";
import CryptoCard from "@/components/CryptoCard";
import { coins } from "@/lib/data";
import { FaChartLine, FaCogs, FaComments, FaExchangeAlt, FaGift, FaMoon, FaSun, FaUser } from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

export default function Page() {
  return (
      <div className="">
        <header className="bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-lg">Trade Market</h1>
            {/* Add mobile menu button or actions if needed */}
          </div>
        </header>
        <section className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-6">
            {/* Left: market list */}
            <div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg p-4 mb-3 border border-gray-200/50 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-800 dark:text-gray-200">Market</div>
                  <div className="flex gap-2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-3 py-1 rounded-xl text-xs">Digital Currency</span>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-xl text-xs hidden sm:inline">Foreign Exchange</span>
                  </div>
                </div>
              </div>
              <div className="grid gap-3">
                {coins.map((c) => (
                  <CryptoCard key={c.symbol} coin={c} />
                ))}
              </div>
            </div>
            {/* Right: promo / balance panel */}
            <aside className="hidden md:block">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg p-6 mb-4 border border-gray-200/50 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">Balance</span>
                  <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-1.5 rounded-xl shadow hover:shadow-lg transition-all text-sm">Deposit</button>
                </div>
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">$12,450.00</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">USD Equivalent</div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl shadow-lg p-6 flex flex-col gap-2">
                <div className="font-semibold text-lg">Welcome Bonus!</div>
                <div className="text-sm">Get up to $100 on your first deposit. Limited time offer.</div>
                <button className="bg-white text-blue-600 font-semibold px-4 py-1.5 rounded-xl shadow hover:shadow-lg transition-all text-sm mt-2">Claim Now</button>
              </div>
            </aside>
          </div>
        </section>
      </div>
  );
}
