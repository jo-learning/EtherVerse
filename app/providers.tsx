'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum, optimism, bsc } from 'wagmi/chains';

const config = getDefaultConfig({
  appName: 'EtherTrade',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!, // required
  chains: [mainnet, polygon, arbitrum, optimism, bsc],
  ssr: true,
  // autoConnect is enabled internally by default config
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