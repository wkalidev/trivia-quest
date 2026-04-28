"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { celo } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState, type ReactNode } from "react";

const lightConfig = createConfig({
  chains: [celo],
  transports: { [celo.id]: http("https://forno.celo.org") },
  ssr: false,
});

const queryClient = new QueryClient();

function LightProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={lightConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function FullWalletProviders({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [FullProviderComponent, setFullProviderComponent] = useState<
    React.ComponentType<{ children: ReactNode }> | null
  >(null);

  useEffect(() => {
    const hasSES = typeof (window as any).lockdown === "function" ||
      document.querySelector('script[src*="lockdown"]') !== null;

    if (hasSES) {
      setReady(true);
      return;
    }

    Promise.all([
      import("@rainbow-me/rainbowkit"),
      import("@/lib/fullConfig"),
    ]).then(([{ RainbowKitProvider }, { fullConfig }]) => {
      import("@rainbow-me/rainbowkit/styles.css");

      const Component = ({ children }: { children: ReactNode }) => (
        <WagmiProvider config={fullConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider showRecentTransactions={false}>
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      );
      setFullProviderComponent(() => Component);
      setReady(true);
    });
  }, []);

  if (!ready) return <LightProviders>{children}</LightProviders>;
  if (!FullProviderComponent) return <LightProviders>{children}</LightProviders>;

  return <FullProviderComponent>{children}</FullProviderComponent>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [isMiniPay, setIsMiniPay] = useState<boolean | null>(null);

  useEffect(() => {
    const mini = !!(window as any).ethereum?.isMiniPay;
    setIsMiniPay(mini);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {/*
        ✅ FIX: isMiniPay === null = pas encore hydraté (SSR / bots / PageSpeed).
        On monte FullWalletProviders par défaut au lieu de LightProviders.
        Ça évite le crash "Transaction hooks must be used within RainbowKitProvider"
        que PageSpeed rencontrait parce que ConnectButton était rendu sans RainbowKit.
        Les vrais utilisateurs MiniPay (isMiniPay === true) restent sur LightProviders.
      */}
      {isMiniPay === true
        ? <LightProviders>{children}</LightProviders>
        : <FullWalletProviders>{children}</FullWalletProviders>
      }
    </ThemeProvider>
  );
}