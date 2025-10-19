"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet, sepolia } from "wagmi/chains";
import { custom } from "viem";
import { ReactNode } from "react";

const isProd = process.env.NODE_ENV === "production";
// const chains = [mainnet, sepolia] as const;
const chains = [mainnet] as const;

function buildDevTransports() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    const t = custom((window as any).ethereum);
    return Object.fromEntries(chains.map((c) => [c.id, t]));
  }
  // Optional: local node fallback if present; remove if you want to strictly require injected wallet
  const t = http("http://127.0.0.1:8545");
  return Object.fromEntries(chains.map((c) => [c.id, t]));
}

const config = isProd
  ? getDefaultConfig({
      appName: "My Next.js dApp",
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
      chains,
      ssr: true,
      // enableEns: false,
    })
  : createConfig({
      chains,
      ssr: true,
      connectors: [injected()],
      // transports: buildDevTransports() as any,
      transports: {
          [mainnet.id]: http('https://rpc.ankr.com/eth/d9b3f05464a68ef472b6a2b1cbc8abcd0b82b49d4f328e24b59fede350d96d9d')
        },
    });

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider showRecentTransactions={false}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
