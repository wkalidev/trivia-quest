"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { config } from "@/lib/web3";
import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";

const queryClient = new QueryClient();

function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider showRecentTransactions={false}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

const Web3ProvidersNoSSR = dynamic(() => Promise.resolve(Web3Providers), {
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Web3ProvidersNoSSR>{children}</Web3ProvidersNoSSR>
    </ThemeProvider>
  );
}