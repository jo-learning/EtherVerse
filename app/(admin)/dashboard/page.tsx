"use client";
import { useState } from "react";
import { FaUser, FaCoins, FaChartBar } from "react-icons/fa";

const users = [
  {
    id: 1,
    name: "Alice",
    email: "alice@email.com",
    balances: { BTC: 0.5, ETH: 2.1, USDT: 1200 },
  },
  {
    id: 2,
    name: "Bob",
    email: "bob@email.com",
    balances: { BTC: 0.1, ETH: 0.0, USDT: 500 },
  },
  {
    id: 3,
    name: "Charlie",
    email: "charlie@email.com",
    balances: { BTC: 0.0, ETH: 5.0, USDT: 3000 },
  },
];

const coins = ["BTC", "ETH", "USDT"];

export default function AdminDashboard() {
  // Analysis
  const userCount = users.length;
  const totalBalances = coins.reduce((acc, coin) => {
    acc[coin] = users.reduce(
      (sum, user) => sum + (user.balances[coin as keyof typeof user.balances] || 0),
      0
    );
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-700 dark:text-purple-400 flex items-center gap-2">
        <FaChartBar /> Admin Dashboard
      </h1>
      {/* Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center">
          <FaUser size={32} className="text-purple-600 mb-2" />
          <div className="text-2xl font-bold">{userCount}</div>
          <div className="text-gray-500 dark:text-gray-400">Total Users</div>
        </div>
        {coins.map((coin) => (
          <div key={coin} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center">
            <FaCoins size={32} className="text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{totalBalances[coin]}</div>
            <div className="text-gray-500 dark:text-gray-400">Total {coin} Balance</div>
          </div>
        ))}
      </div>
      {/* User Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-400">User Balances</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Email</th>
                {coins.map((coin) => (
                  <th key={coin} className="py-2 px-4">{coin} Balance</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  {coins.map((coin) => (
                    <td key={coin} className="py-2 px-4">{user.balances[coin as keyof typeof user.balances]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
