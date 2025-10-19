'use client';

import '@rainbow-me/rainbowkit/styles.css';
import React, { useMemo } from 'react';
import { WagmiProvider, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, polygon, arbitrum, optimism, bsc } from 'wagmi/chains';
import { custom, http } from 'viem';

// const chains = [mainnet, polygon, arbitrum, optimism, bsc] as const;
const chains = [mainnet] as const;

// Build injected-only transports (no remote RPC to avoid CORS)
function buildInjectedTransports() {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    const t = custom((window as any).ethereum);
    return Object.fromEntries(chains.map((c) => [c.id, t]));
  }
  const stub = { request: async () => { throw new Error('RPC disabled (no injected wallet).'); } };
  const t = custom(stub as any);
  return Object.fromEntries(chains.map((c) => [c.id, t]));
}

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  const config = useMemo(() => {
    // Strict default: injected-only. No WalletConnect, no remote http().
    return createConfig({
      chains,
      ssr: true,
      connectors: [injected()],
      // transports: buildInjectedTransports() as any,
      transports: {
    [mainnet.id]: http('https://rpc.ankr.com/eth/d9b3f05464a68ef472b6a2b1cbc8abcd0b82b49d4f328e24b59fede350d96d9d')
  },
    });
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#4b0082',
            accentColorForeground: '#39FF14',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}