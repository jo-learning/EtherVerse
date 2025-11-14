"use client";

import { fetchWallet, getWallet } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaQrcode, FaPaperPlane, FaSync, FaWallet, FaCoins, FaLock, FaArrowLeft, FaExchangeAlt } from "react-icons/fa";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Toaster, toast } from "react-hot-toast";

// Color palette
const COLORS = {
  purple: "#4b0082",      // Dark purple
  neonGreen: "#39FF14",   // Neon green
  black: "#0D0D0D",
  white: "#ffffff",
  background: "#0a1026",
  navy: "#172042",        // Slightly lighter navy blue
  textWhite: "#ffffff",
  textGray: "#b0b8c1"
};

interface Props {
  coin: string;
}

export default function CoinWalletClient({ coin }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"receive" | "send" | "convert">("receive");
  const staticCoins = getWallet(coin);
  const [coinData, setCoins] = useState(staticCoins);
  const [showContactModal, setShowContactModal] = useState(false);
  const [convertAmount, setConvertAmount] = useState<string>('');
  const { address } = useAccount();

  useEffect(() => {
    // const address = window.ethereum?.selectedAddress;
    console.log(coin, address);
    fetchWallet(coin, address ?? "").then(setCoins);
  }, [address]);

  const handleCopy = () => {
    navigator.clipboard.writeText(coinData?.address ? coinData?.address : "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{
        background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.navy} 100%)`,
        color: COLORS.textWhite,
      }}
    >
      <Toaster
                    position="top-right"
                    toastOptions={{
                      style: { background: "#1f2937", color: "#fff", border: "1px solid #4b0082" },
                      success: { iconTheme: { primary: "#22c55e", secondary: "#1f2937" } },
                      error: { iconTheme: { primary: "#ef4444", secondary: "#1f2937" } },
                    }}
                  />
      {/* Coin Logo & Balance */}
      <div className="flex flex-col items-center mt-4 mb-2">
        {coinData?.logo && (
          <div
            className="rounded-full shadow-lg flex items-center justify-center"
            style={{
              background: COLORS.white,
              width: 72,
              height: 72,
              border: `3px solid ${COLORS.purple}`,
              boxShadow: `0 0 16px ${COLORS.purple}55`
            }}
          >
            <img src={coinData?.logo} alt={coinData?.name} className="w-14 h-14 object-contain" />
          </div>
        )}
        <div className="mt-4 text-3xl font-extrabold flex items-center gap-2" style={{ color: COLORS.textWhite }}>
          <FaCoins className="text-yellow-400" />
          {coinData?.priceUsd}
        </div>
        <div className="mt-1 text-lg font-semibold" style={{ color: COLORS.neonGreen }}>
          {parseFloat(coinData?.balance ?? "0").toFixed(2)} {coinData?.symbol}
        </div>
        <div className="text-xs mt-1 flex items-center gap-1" style={{ color: COLORS.textGray }}>
          <FaLock /> Frozen: 0
        </div>
      </div>

      {/* Action Tabs */}
     <div className="max-w-2xl w-full mt-6 px-4">
  <div className="grid grid-cols-3 bg-[#181c2f] rounded-xl p-1 shadow border border-[#23232a]">
    {/* Receive Tab */}
    <button
      onClick={() => setActiveTab("receive")}
      className={`py-1 rounded-lg flex flex-row items-center justify-center font-semibold transition-all ${
        activeTab === "receive"
          ? "bg-[#232327] text-neonGreen"
          : "text-white hover:text-purple-400"
      }`}
    >
      <FaCoins size={12} />
      <span className="text-sm pl-1">Receive</span>
    </button>

    {/* Send Tab */}
    <button
      onClick={() => setActiveTab("send")}
      className={`py-1  rounded-lg flex flex-row items-center justify-center font-semibold transition-all ${
        activeTab === "send"
          ? "bg-[#232327] text-purple-500"
          : "text-white hover:text-purple-400"
      }`}
    >
      <FaPaperPlane size={12} />
      <span className="text-sm pl-1">Send</span>
    </button>

    {/* Convert Tab */}
    <button
      onClick={() => setActiveTab("convert")}
      className={`py-1 rounded-lg flex flex-row items-center justify-center font-semibold transition-all ${
        activeTab === "convert"
          ? "bg-[#232327] text-green-500"
          : "text-white hover:text-purple-400"
      }`}
    >
      <FaExchangeAlt size={12} />
      <span className="text-sm  pl-1">Convert</span>
    </button>
  </div>
</div>


      {/* Tab Content */}
      <div
        className="max-w-2xl w-full mt-6 rounded-2xl p-6 shadow-xl border"
        style={{
          background: COLORS.navy,
          borderColor: COLORS.purple,
          color: COLORS.textWhite
        }}
      >
        {activeTab === "receive" && (
          <div className="text-center pb-16">
            <span
              className="inline-block text-xs px-3 py-1 rounded-full mb-4 font-semibold tracking-wide"
              style={{
                background: COLORS.purple,
                color: COLORS.white,
                letterSpacing: 1.5
              }}
            >
              {coinData?.network}
            </span>
            <div
              className="mx-auto w-40 h-40 rounded-xl flex items-center justify-center mb-4"
              style={{
                background: "#181c2f",
                border: `2px solid ${COLORS.purple}`,
                boxShadow: `0 0 12px ${COLORS.purple}55`
              }}
            >
              {/* QR Code */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                  coinData?.address || ""
                )}`}
                alt="QR Code"
                className="w-36 h-36"
              />
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="break-all text-sm font-mono px-2 py-1 rounded bg-[#23232a]">{coinData?.address}</span>
              <button
                onClick={handleCopy}
                className="rounded-full p-2 transition"
                style={{
                  background: COLORS.purple,
                  color: COLORS.white
                }}
                aria-label="Copy address"
              >
                {copied ? (
                  <span className="text-xs font-semibold">Copied!</span>
                ) : (
                  <FaQrcode size={16} />
                )}
              </button>
            </div>
            <div className="mt-2 text-xs" style={{ color: COLORS.textGray }}>
              Scan or copy your address to receive funds.
            </div>
          </div>
        )}

        {activeTab === "send" && (
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: COLORS.purple }}>
              <FaPaperPlane /> Send {coin.toUpperCase()}
            </h3>
            <input
              type="text"
              placeholder="Recipient address"
              className="w-full p-3 mb-3 rounded-lg bg-[#23232a] border-none text-white placeholder:text-gray-400"
              style={{ background: "#23232a" }}
            />
            <input
              type="number"
              placeholder="Amount"
              className="w-full p-3 mb-3 rounded-lg bg-[#23232a] border-none text-white placeholder:text-gray-400"
              style={{ background: "#23232a" }}
            />
            <button
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition"
              onClick={() => setShowContactModal(true)}
            >
              Send Now
            </button>
            {/* Contact Customer Service Modal */}
            {showContactModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "#0a1026cc" }}>
                <div className="bg-[#181c2f] rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full border" style={{ borderColor: COLORS.purple }}>
                  <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.purple }}>
                    Contact Customer Service
                  </h2>
                  <p className="mb-6" style={{ color: COLORS.textGray }}>
                    To send funds, please contact our customer service team for assistance.
                  </p>
                  <Link href="/chat">
                    <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg font-semibold hover:scale-105 transition mb-2">
                      Go to Chat
                    </button>
                  </Link>
                  <button
                    className="block w-full mt-2 text-sm"
                    style={{ color: COLORS.textGray }}
                    onClick={() => setShowContactModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "convert" && (
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: "#22c55e" }}>
              <FaSync /> Convert {coin.toUpperCase()} to USDT
            </h3>
            <input
              type="number"
              placeholder="Amount"
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value)}
              className="w-full p-3 mb-3 rounded-lg bg-[#23232a] border-none text-white placeholder:text-gray-400"
              style={{ background: "#23232a" }}
              min="0"
              step="any"
            />
            <select
              className="w-full p-3 mb-3 rounded-lg bg-[#23232a] border-none text-white"
              style={{ background: "#23232a" }}
              disabled
            >
              <option>USDT</option>
            </select>
            <button
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition"
              onClick={async () => {
                const amt = parseFloat(convertAmount || '0');
                if (!amt || amt <= 0) return;

                try {
                  const res = await fetch('/api/convert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId: address || undefined, // TODO: replace with your authenticated user.id
                      fromSymbol: coin.toUpperCase(),
                      amount: amt,
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    // alert(data?.error || 'Conversion failed');
                    toast.error(data?.error || 'Conversion failed');
                    return;
                  }

                  // Update local balance if viewing the source coin
                  if (coinData?.symbol?.toUpperCase() === coin.toUpperCase()) {
                    const newBal = (parseFloat(coinData.balance || '0') - amt).toString();
                    setCoins({ ...coinData, balance: newBal });
                  }
                  setConvertAmount('');
                  // alert(`Converted ${amt} ${coin.toUpperCase()} → ${data.usdtCredited.toFixed(6)} USDT @ $${data.priceUsd}`);
                  toast.error(`Converted ${amt} ${coin.toUpperCase()} → ${data.usdtCredited.toFixed(6)} USDT @ $${data.priceUsd}`);
                } catch (e) {
                  // alert('Conversion failed');
                  toast.error('Conversion failed');
                }
              }}
            >
              Convert Now
            </button>
          </div>
        )}
      </div>
      {/* Footer */}
      {/* <div className="w-full max-w-2xl mx-auto mt-10 mb-4 flex justify-center gap-8">
        <div className="flex flex-col items-center">
          <FaWallet size={22} style={{ color: COLORS.purple }} />
          <span className="text-xs mt-1" style={{ color: COLORS.textGray }}>Wallet</span>
        </div>
        <div className="flex flex-col items-center">
          <FaCoins size={22} style={{ color: COLORS.neonGreen }} />
          <span className="text-xs mt-1" style={{ color: COLORS.textGray }}>Assets</span>
        </div>
        <div className="flex flex-col items-center">
          <FaExchangeAlt size={22} style={{ color: "#22c55e" }} />
          <span className="text-xs mt-1" style={{ color: COLORS.textGray }}>Exchange</span>
        </div>
      </div> */}
    </div>
  );
}
