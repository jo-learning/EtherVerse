'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum, optimism, bsc } from 'wagmi/chains';
import { custom } from 'viem';

const chains = [mainnet, polygon, arbitrum, optimism, bsc] as const;
const isProd = process.env.NODE_ENV === 'production';

// Build dev transports avoiding remote RPCs to prevent CORS
function buildDevTransports() {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    const t = custom((window as any).ethereum);
    return Object.fromEntries(chains.map((c) => [c.id, t]));
  }
  // Optional: local node fallback if present
  const t = http('http://127.0.0.1:8545');
  return Object.fromEntries(chains.map((c) => [c.id, t]));
}

const config = isProd
  ? getDefaultConfig({
      appName: 'EtherTrade',
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!, // production only
      chains,
      ssr: true,
    })
  : createConfig({
      chains,
      ssr: true,
      connectors: [injected()], // use injected wallet only to avoid CORS
      transports: buildDevTransports() as any,
    });

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
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