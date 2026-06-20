"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { celo } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { ThemeProvider } from "next-themes";
import { useEffect, useState, type ReactNode } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { fullConfig } from "@/lib/fullConfig";

// Lightweight config for MiniPay — no WalletConnect, no eval.
// Must include injected() so wagmi auto-reconnects to window.ethereum (MiniPay)
// after the provider switch, keeping isConnected=true on all pages.
const lightConfig = createConfig({
  chains: [celo],
  connectors: [injected()],
  transports: { [celo.id]: http("https://forno.celo.org") },
  ssr: false,
});

const queryClient = new QueryClient();

function MiniPayProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={lightConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function FullProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={fullConfig}>
      <QueryClientProvider client={queryClient}>
        {/*
          RainbowKitProvider est toujours présent ici — import statique.
          ConnectButton dans page.tsx est conditionné par `mounted`
          (useEffect) donc il ne se rend qu'après hydratation côté client.
          PageSpeed et les bots ne verront jamais ConnectButton → pas de crash.
        */}
        <RainbowKitProvider showRecentTransactions={false}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [isMiniPay, setIsMiniPay] = useState(false);

  useEffect(() => {
    setIsMiniPay(!!(window as any).ethereum?.isMiniPay);
  }, []);

  /*
   * isMiniPay démarre à false → FullProviders est toujours monté en premier.
   * RainbowKit est disponible dès le départ.
   * Le ConnectButton est protégé par `mounted` dans page.tsx.
   */
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {isMiniPay
        ? <MiniPayProviders>{children}</MiniPayProviders>
        : <FullProviders>{children}</FullProviders>
      }
    </ThemeProvider>
  );
}