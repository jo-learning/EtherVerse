"use client";
import { useState } from "react";

export default function KYCPage() {
  const [name, setName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "none">("none");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("pending");
    // Simulate KYC processing
    setTimeout(() => setStatus("approved"), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-bold mb-4 text-purple-700 dark:text-purple-400">KYC Verification</h1>
      <p className="mb-6">Upload your documents and verify your identity to enable full dApp features.</p>
      <form className="max-w-md bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block font-medium mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">ID Number</label>
          <input
            type="text"
            required
            value={idNumber}
            onChange={e => setIdNumber(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Upload Document</label>
          <input
            type="file"
            required
            accept="image/*,application/pdf"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
        >
          Submit KYC
        </button>
      </form>
      {/* Status */}
      {status !== "none" && (
        <div className="mt-6 max-w-md mx-auto p-4 rounded-xl bg-white dark:bg-gray-800 shadow text-center">
          {status === "pending" && <span className="text-yellow-500 font-bold">KYC Status: Pending...</span>}
          {status === "approved" && <span className="text-green-600 font-bold">KYC Status: Approved!</span>}
          {status === "rejected" && <span className="text-red-600 font-bold">KYC Status: Rejected</span>}
        </div>
      )}
    </div>
  );
}
