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

const projectId = "566847bfda2443bb9a07f59f6c463e6e" // from cloud.walletconnect.com

// RainbowKit config
const config = getDefaultConfig({
  appName: "My Next.js dApp",
  projectId,
  chains: [mainnet, sepolia],
  ssr: true
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
