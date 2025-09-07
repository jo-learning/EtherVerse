"use client"

import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useState, useEffect } from "react"
import { FaWallet, FaCheck, FaCopy } from "react-icons/fa";

export default function WalletConnectButton() {
  const { openConnectModal } = useConnectModal();
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Simulate connection state (in a real app, you'd get this from your wallet connection)
  const handleConnect = () => {
    if (openConnectModal) {
      openConnectModal();
      // In a real app, you would set connected state based on actual connection
      setTimeout(() => {
        setConnected(true);
        setAddress("0x742d35Cc...6634C893"); // Mock address
      }, 1000);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setAddress("");
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortenAddress = (addr: string) => {
    if (isMobile) {
      return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);
    }
    return addr;
  };

  return (
    <div className="flex flex-col items-center">
      {!connected ? (
        <button
          onClick={handleConnect}
          className="inline-flex items-center px-2 py-2 md:px-6 md:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl md:rounded-2xl shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 text-base md:text-lg w-full md:w-auto justify-center"
        >
          <FaWallet className="mr-1 md:mr-3 text-lg md:text-xl" />
          Connect Wallet
        </button>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-3 bg-gray-800 rounded-xl md:rounded-2xl p-3 md:p-2 shadow-lg w-full md:w-auto">
          <div className="flex items-center bg-gray-700 rounded-lg py-2 px-3 md:py-1 md:px-2">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-xs md:text-sm text-white">{shortenAddress(address)}</span>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={copyAddress}
              className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-xs md:text-sm transition-colors flex-1 md:flex-none"
            >
              {copied ? <FaCheck className="mr-1" /> : <FaCopy className="mr-1" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDisconnect}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-xs md:text-sm transition-colors flex-1 md:flex-none"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}