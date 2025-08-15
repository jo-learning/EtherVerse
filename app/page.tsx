"use client";
import { useState } from "react";
import { FaWallet } from "react-icons/fa";

export default function HomePage() {
  const [connected, setConnected] = useState(false);

  const handleConnectWallet = () => {
    // Simulate wallet connection
    setConnected(true);
    // In a real dApp, integrate with wallet provider here
    window.location.href = "/account"; // Redirect to account page after connection
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-700 text-white">
      {/* Hero Section */}
      <div className="max-w-xl w-full text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
          Welcome to EtherVerse
        </h1>
        <p className="text-lg md:text-xl opacity-90 mb-6">
          Your gateway to decentralized finance. Manage your crypto assets, trade, and explore DeFi opportunities—all in one place.
        </p>
        <div>
          <button
            onClick={handleConnectWallet}
            className="inline-flex items-center px-8 py-4 bg-white text-purple-700 font-bold rounded-2xl shadow-lg hover:bg-purple-100 transition-all text-xl"
            disabled={connected}
          >
            <FaWallet className="mr-3 text-2xl" />
            {connected ? "Wallet Connected" : "Connect to Wallet"}
          </button>
        </div>
        {connected && (
          <div className="mt-6 text-green-300 font-semibold text-lg">
            🎉 Wallet successfully connected!
          </div>
        )}
      </div>
      {/* Footer */}
      <footer className="absolute bottom-6 w-full text-center text-sm text-white/70">
        &copy; {new Date().getFullYear()} EtherVerse. All rights reserved.
      </footer>
    </div>
  );
}