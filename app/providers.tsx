'use client';

import '@rainbow-me/rainbowkit/styles.css';
import React, { useMemo, useRef } from 'react';
import { WagmiProvider, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, polygon, arbitrum, optimism, bsc } from 'wagmi/chains';
import { custom, http } from 'viem';

const chains = [mainnet, polygon, arbitrum, optimism, bsc] as const;
const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const IS_PROD = process.env.NODE_ENV === 'production';

function buildInjectedTransports() {
  // Use injected provider (MetaMask, etc.) to avoid CORS in dev.
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    const t = custom((window as any).ethereum);
    return Object.fromEntries(chains.map((c) => [c.id, t]));
  }
  // No injected wallet: provide a stub transport that throws, to prevent remote RPC calls.
  const stubProvider = { request: async () => { throw new Error('No injected wallet available in development. Install MetaMask or set a local RPC.'); } };
  const t = custom(stubProvider as any);
  return Object.fromEntries(chains.map((c) => [c.id, t]));
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // Build config once on the client
  const configRef = useRef<any>(null);

  if (!configRef.current) {
    if (IS_PROD && PROJECT_ID) {
      // Production with WalletConnect projectId → use WC RPC
      configRef.current = getDefaultConfig({
        appName: 'EtherTrade',
        projectId: PROJECT_ID,
        chains,
        ssr: true,
      });
    } else {
      // Development OR missing projectId → injected-only, no remote RPC (prevents CORS)
      // Optional: if you run a local node, replace stub with http('http://127.0.0.1:8545')
      configRef.current = createConfig({
        chains,
        ssr: true,
        connectors: [injected()],
        transports: buildInjectedTransports() as any,
      });

      if (IS_PROD && !PROJECT_ID) {
        // Warn if building prod without projectId; still runs with injected-only
        // eslint-disable-next-line no-console
        console.warn('[providers] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is missing; falling back to injected-only config.');
      }
    }
  }

  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <WagmiProvider config={configRef.current}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#4b0082',          // COLORS.purple
            accentColorForeground: '#39FF14', // COLORS.neonGreen
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}