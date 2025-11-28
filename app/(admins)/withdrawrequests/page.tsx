"use client";
import { useEffect, useState } from "react";
import { FaSpinner, FaSync } from "react-icons/fa";

interface WithdrawRequest {
  id: string;
  userId: string;
  coin: string;
  amount: number;
  address: string;
  status: string;
  createdAt: string;
  user: {
    email: string;
    userId: string;
  };
}

export default function WithdrawRequestsPage() {
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/wallet/withdraw-request");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch requests");
      }
      const data = await response.json();
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/wallet/withdraw-request`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update status");
      }
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === id ? { ...req, status } : req
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) {
      return;
    }
    try {
      const response = await fetch(`/api/wallet/withdraw-request?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete request");
      }
      setRequests((prevRequests) => prevRequests.filter((req) => req.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Withdrawal Requests
          </h1>
          <button
            onClick={fetchRequests}
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-600"
            disabled={loading}
          >
            <FaSync className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        {error && <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>}
        {loading ? (
          <div className="flex justify-center">
            <FaSpinner className="animate-spin text-4xl text-blue-500 dark:text-blue-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-800 dark:text-gray-300">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 px-4 font-semibold">User</th>
                  <th className="py-2 px-4 font-semibold">Address</th>
                  <th className="py-2 px-4 font-semibold">Coin</th>
                  <th className="py-2 px-4 font-semibold">Amount</th>
                  <th className="py-2 px-4 font-semibold">Status</th>
                  <th className="py-2 px-4 font-semibold">Date</th>
                  <th className="py-2 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4">{req.user.userId || req.user.email}</td>
                    <td className="py-4 px-4">{req.address}</td>
                    <td className="py-4 px-4">{req.coin}</td>
                    <td className="py-4 px-4">{req.amount}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          req.status === "pending"
                            ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : req.status === "approved"
                            ? "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {req.status === 'pending' && (
                          <>
                            <button onClick={() => handleStatusChange(req.id, 'approved')} className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-600">Approve</button>
                            <button onClick={() => handleStatusChange(req.id, 'rejected')} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600">Reject</button>
                          </>
                        )}
                        <button onClick={() => handleDelete(req.id)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-600">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
