"use client";
import { useState } from "react";

export default function EmailSettingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"none" | "pending" | "verified">("none");
  const [code, setCode] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("pending");
    // Simulate sending verification code
    setTimeout(() => setStatus("pending"), 1000);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate verification
    if (code === "123456") {
      setStatus("verified");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-bold mb-4 text-purple-700 dark:text-purple-400">Email Setup</h1>
      <p className="mb-6">Update and verify your email address for your dApp account.</p>
      <form className="max-w-md bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4 mx-auto" onSubmit={handleEmailSubmit}>
        <div>
          <label className="block font-medium mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
        >
          Send Verification Code
        </button>
      </form>
      {status === "pending" && (
        <form className="max-w-md bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4 mx-auto mt-6" onSubmit={handleVerify}>
          <div>
            <label className="block font-medium mb-1">Verification Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
              placeholder="Enter code"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
          >
            Verify Email
          </button>
        </form>
      )}
      {status === "verified" && (
        <div className="mt-6 max-w-md mx-auto p-4 rounded-xl bg-white dark:bg-gray-800 shadow text-center">
          <span className="text-green-600 font-bold">Email Verified!</span>
        </div>
      )}
    </div>
  );
}
