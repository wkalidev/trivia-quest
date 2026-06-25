"use client";

import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { fullConfig } from "@/lib/fullConfig";
import { queryClient } from "@/lib/queryClient";
import type { ReactNode } from "react";

export default function RainbowKitWrapper({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={fullConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider showRecentTransactions={false}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
