"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { celo, base } from "viem/chains";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { queryClient } from "@/lib/queryClient";

// Lightweight config — no WalletConnect, no RainbowKit. Used for all
// blockchain reads (getCurrentRound, balanceOf, etc.) before wallet connects.
const lightConfig = createConfig({
  chains: [celo, base],
  connectors: [injected()],
  transports: {
    [celo.id]: http("https://forno.celo.org"),
    [base.id]: http("https://mainnet.base.org"),
  },
  ssr: false,
});

// Full wallet stack — RainbowKit + WalletConnect — loaded ONLY on user
// interaction. Lighthouse never clicks → this chunk never loads during audit.
const RainbowKitWrapper = dynamic(
  () => import("@/components/RainbowKitWrapper"),
  { ssr: false }
);

// ──────────────────────────────────────────────────────────────────────────────
// Wallet context — lets any child request the full wallet stack on demand
// ──────────────────────────────────────────────────────────────────────────────
type WalletCtx = { walletReady: boolean; requestWallet: () => void };
const WalletContext = createContext<WalletCtx>({
  walletReady: false,
  requestWallet: () => {},
});
export const useWallet = () => useContext(WalletContext);

// Detect MiniPay synchronously from the inline script in layout.tsx
// (sets data-mp="1" on <html> before React boots).
function isMiniPaySync(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-mp") === "1";
}

export function Providers({ children }: { children: ReactNode }) {
  // Sync read — no useEffect flicker, no FullProviders rendered first
  const [isMiniPay] = useState(isMiniPaySync);
  const [walletReady, setWalletReady] = useState(false);

  const requestWallet = useCallback(() => {
    if (!isMiniPay) setWalletReady(true);
  }, [isMiniPay]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <WalletContext.Provider value={{ walletReady, requestWallet }}>
        <WagmiProvider config={lightConfig}>
          <QueryClientProvider client={queryClient}>
            {!isMiniPay && walletReady ? (
              // Full stack: inner WagmiProvider (fullConfig) overrides lightConfig
              // for hooks; shared queryClient preserves cached reads across swap.
              <RainbowKitWrapper>{children}</RainbowKitWrapper>
            ) : (
              children
            )}
          </QueryClientProvider>
        </WagmiProvider>
      </WalletContext.Provider>
    </ThemeProvider>
  );
}
