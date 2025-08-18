"use client";
import { useState } from "react";
import { FaUser, FaEye, FaEdit, FaBan, FaTrash } from "react-icons/fa";

const users = [
  {
    id: 1,
    name: "Alice",
    email: "alice@email.com",
    status: "active",
    balances: { BTC: 0.5, ETH: 2.1, USDT: 1200 },
    joined: "2024-05-01",
  },
  {
    id: 2,
    name: "Bob",
    email: "bob@email.com",
    status: "banned",
    balances: { BTC: 0.1, ETH: 0.0, USDT: 500 },
    joined: "2024-04-15",
  },
  {
    id: 3,
    name: "Charlie",
    email: "charlie@email.com",
    status: "active",
    balances: { BTC: 0.0, ETH: 5.0, USDT: 3000 },
    joined: "2024-03-20",
  },
];

const coins = ["BTC", "ETH", "USDT"];

export default function UserManagementPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleView = (user: any) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleEdit = (user: any) => {
    alert(`Edit user: ${user.name}`);
  };

  const handleBan = (user: any) => {
    alert(`Ban user: ${user.name}`);
  };

  const handleDelete = (user: any) => {
    if (confirm(`Delete user ${user.name}?`)) {
      alert("User deleted (demo only)");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-700 dark:text-purple-400 flex items-center gap-2">
        <FaUser /> User Management
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-400">Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Joined</th>
                {coins.map((coin) => (
                  <th key={coin} className="py-2 px-4">{coin} Balance</th>
                ))}
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className={`py-2 px-4 font-semibold ${user.status === "active" ? "text-green-600" : "text-red-600"}`}>{user.status}</td>
                  <td className="py-2 px-4">{user.joined}</td>
                  {coins.map((coin) => (
                    <td key={coin} className="py-2 px-4">{user.balances[coin as keyof typeof user.balances]}</td>
                  ))}
                  <td className="py-2 px-4 flex gap-2">
                    <button
                      className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                      title="View"
                      onClick={() => handleView(user)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      title="Edit"
                      onClick={() => handleEdit(user)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                      title="Ban"
                      onClick={() => handleBan(user)}
                    >
                      <FaBan />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50"
                      title="Delete"
                      onClick={() => handleDelete(user)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* User Detail Modal */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 text-gray-900 dark:text-gray-100 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">User Details</h2>
            <div className="mb-2"><span className="font-semibold">Name:</span> {selectedUser.name}</div>
            <div className="mb-2"><span className="font-semibold">Email:</span> {selectedUser.email}</div>
            <div className="mb-2"><span className="font-semibold">Status:</span> {selectedUser.status}</div>
            <div className="mb-2"><span className="font-semibold">Joined:</span> {selectedUser.joined}</div>
            <div className="mb-2 font-semibold">Balances:</div>
            <ul className="mb-4">
              {coins.map((coin) => (
                <li key={coin}>{coin}: {selectedUser.balances[coin]}</li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold"
                onClick={() => handleEdit(selectedUser)}
              >
                Edit
              </button>
              <button
                className="flex-1 py-2 rounded-lg bg-yellow-500 text-white font-bold"
                onClick={() => handleBan(selectedUser)}
              >
                Ban
              </button>
              <button
                className="flex-1 py-2 rounded-lg bg-red-600 text-white font-bold"
                onClick={() => handleDelete(selectedUser)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
