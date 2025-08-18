"use client";
import { useState } from "react";

export default function Google2FAPage() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"none" | "pending" | "verified" | "error">("none");
  // Simulated secret and QR code
  const secret = "JBSWY3DPEHPK3PXP";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/EtherVerse?secret=${secret}`;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("pending");
    // Simulate verification
    setTimeout(() => {
      if (code === "123456") setStatus("verified");
      else setStatus("error");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-bold mb-4 text-purple-700 dark:text-purple-400">Google 2FA Setup</h1>
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-6">
        <div className="flex flex-col items-center">
          <img src={qrUrl} alt="Google 2FA QR Code" className="mb-4 rounded-lg" />
          <div className="mb-2 text-center">
            <span className="font-semibold">Secret Key:</span>
            <span className="ml-2 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{secret}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Scan the QR code with Google Authenticator or enter the secret key manually.
          </p>
        </div>
        <form onSubmit={handleVerify} className="space-y-4">
          <label className="block font-medium mb-1">Enter 2FA Code</label>
          <input
            type="text"
            required
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
            placeholder="6-digit code"
          />
          <button
            type="submit"
            className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
          >
            Verify
          </button>
        </form>
        {status === "pending" && (
          <div className="text-yellow-500 font-bold text-center">Verifying...</div>
        )}
        {status === "verified" && (
          <div className="text-green-600 font-bold text-center">2FA Verified!</div>
        )}
        {status === "error" && (
          <div className="text-red-600 font-bold text-center">Invalid code. Try again.</div>
        )}
      </div>
    </div>
  );
}
