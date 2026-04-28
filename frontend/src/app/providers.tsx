"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { miniPayConfig, isMiniPay, getFullConfig } from "@/lib/web3";
import { useEffect, useState } from "react";
import type { Config } from "wagmi";

const queryClient = new QueryClient();

// ── Provider MiniPay : léger, sans RainbowKit
function MiniPayProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={miniPayConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// ── Provider complet : RainbowKit chargé en lazy
function FullProviders({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [RainbowKit, setRainbowKit] = useState<{
    RainbowKitProvider: React.ComponentType<{ children: React.ReactNode; showRecentTransactions?: boolean }>;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      getFullConfig(),
      import("@rainbow-me/rainbowkit").then(m => ({ RainbowKitProvider: m.RainbowKitProvider })),
    ]).then(([cfg, rk]) => {
      setConfig(cfg as Config);
      setRainbowKit(rk);
    });
  }, []);

  if (!config || !RainbowKit) {
    // Render children sans wallet pendant le chargement — la page s'affiche immédiatement
    return (
      <WagmiProvider config={miniPayConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    );
  }

  const { RainbowKitProvider } = RainbowKit;

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

export function Providers({ children }: { children: React.ReactNode }) {
  const [isMini, setIsMini] = useState<boolean | null>(null);

  useEffect(() => {
    // Détection côté client uniquement
    setIsMini(isMiniPay());
  }, []);

  // Pendant la détection : render avec config légère
  if (isMini === null) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <MiniPayProviders>{children}</MiniPayProviders>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {isMini
        ? <MiniPayProviders>{children}</MiniPayProviders>
        : <FullProviders>{children}</FullProviders>
      }
    </ThemeProvider>
  );
}