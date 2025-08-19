"use client"

import "@rainbow-me/rainbowkit/styles.css"
import {
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { mainnet, sepolia } from "wagmi/chains"
import { ReactNode } from "react"

const projectId = "YOUR_WALLETCONNECT_PROJECT_ID" // from cloud.walletconnect.com

// RainbowKit config
const config = getDefaultConfig({
  appName: "My Next.js dApp",
  projectId,
  chains: [mainnet, sepolia],
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
