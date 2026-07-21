"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { celo, base, soneium, soneiumMinato } from "viem/chains";
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
// Soneium chains are included here (read-only metadata + transport, no
// @startale/app-sdk import) so useReadContract/useChainId work immediately
// inside the Startale host even before StartaleWagmiWrapper mounts.
const lightConfig = createConfig({
  chains: [celo, base, soneium, soneiumMinato],
  connectors: [injected()],
  transports: {
    [celo.id]: http("https://forno.celo.org"),
    [base.id]: http("https://mainnet.base.org"),
    [soneium.id]: http("https://rpc.soneium.org/"),
    [soneiumMinato.id]: http("https://rpc.minato.soneium.org/"),
  },
  ssr: false,
});

// Full wallet stack — RainbowKit + WalletConnect — loaded ONLY on user
// interaction. Lighthouse never clicks → this chunk never loads during audit.
const RainbowKitWrapper = dynamic(
  () => import("@/components/RainbowKitWrapper"),
  { ssr: false }
);

// Startale wallet stack — @startale/app-sdk's startaleConnector() on its own
// wagmi config (soneium + soneiumMinato) — loaded ONLY once StartaleAutoConnect
// confirms sdk.context.startale is populated. Never loaded for Celo/Base/MiniPay/
// Farcaster/Base App sessions.
const StartaleWagmiWrapper = dynamic(
  () => import("@/components/StartaleWagmiWrapper"),
  { ssr: false }
);

// ──────────────────────────────────────────────────────────────────────────────
// Wallet context — lets any child request the full wallet stack on demand,
// and lets StartaleAutoConnect report back that we're inside the Startale host.
// ──────────────────────────────────────────────────────────────────────────────
type WalletCtx = {
  walletReady: boolean;
  requestWallet: () => void;
  isStartale: boolean;
  markStartale: () => void;
};
const WalletContext = createContext<WalletCtx>({
  walletReady: false,
  requestWallet: () => {},
  isStartale: false,
  markStartale: () => {},
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
  // Flipped async by StartaleAutoConnect once sdk.context.startale resolves.
  // Starts false so non-Startale sessions (the overwhelming majority) never wait
  // on it or pay any Startale-related bundle cost — see StartaleAutoConnect.tsx.
  const [isStartale, setIsStartale] = useState(false);
  const markStartale = useCallback(() => setIsStartale(true), []);

  const requestWallet = useCallback(() => {
    if (!isMiniPay && !isStartale) setWalletReady(true);
  }, [isMiniPay, isStartale]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <WalletContext.Provider value={{ walletReady, requestWallet, isStartale, markStartale }}>
        <WagmiProvider config={lightConfig}>
          <QueryClientProvider client={queryClient}>
            {isStartale ? (
              // Startale host: its own wagmi config (startaleConnector, Soneium
              // chains). RainbowKit never mounts here — wallet_switchEthereumChain
              // isn't available inside the host, so RainbowKit's chain-mismatch UI
              // would just be a dead end. See docs.startale.com/miniapps/wallet-integration.
              <StartaleWagmiWrapper>{children}</StartaleWagmiWrapper>
            ) : !isMiniPay && walletReady ? (
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
