"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { FaWallet, FaCheck, FaCopy } from "react-icons/fa";

export default function WalletConnectButton() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, status } = useConnect();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const [copied, setCopied] = useState(false);
  const [autoPref, setAutoPref] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem("autoConnect") === "1";
  });

  // Persist preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("autoConnect", autoPref ? "1" : "0");
    }
  }, [autoPref]);

  // Optional quick connector (e.g., MetaMask) for auto-connect
  const quickConnector = useMemo(
    () =>
      connectors.find((c) => c.id === "injected") ||
      connectors.find((c) => /metamask/i.test(c.name)) ||
      connectors[0],
    [connectors]
  );

  // Auto-connect if user opted-in and not already connected
  useEffect(() => {
    if (!autoPref || isConnected || status === "pending") return;
    if (quickConnector && quickConnector.ready) {
      connect({ connector: quickConnector });
    }
    // If no ready connector, you could optionally open the modal:
    // else openConnectModal?.();
  }, [autoPref, isConnected, status, quickConnector, connect, openConnectModal]);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shorten = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <div className="flex flex-col items-center gap-2">
      {!isConnected ? (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => openConnectModal?.()}
            className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
          >
            <FaWallet className="mr-2" />
            Connect Wallet
          </button>

          <label className="flex items-center gap-2 text-sm opacity-80">
            <input
              type="checkbox"
              checked={autoPref}
              onChange={(e) => setAutoPref(e.target.checked)}
            />
            Auto-connect next time
          </label>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-3 bg-gray-800 rounded-xl p-2 shadow-lg">
          <div className="flex items-center bg-gray-700 rounded-lg py-1 px-2">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-sm text-white">{shorten(address)}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyAddress}
              className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-xs transition-colors"
            >
              {copied ? <FaCheck className="mr-1" /> : <FaCopy className="mr-1" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={() => disconnect()}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-xs transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}