"use client";

import { useEffect } from "react";
import { WagmiProvider, createConfig, http, useAccount, useConnect } from "wagmi";
import { soneium, soneiumMinato } from "viem/chains";
import { startaleConnector } from "@startale/app-sdk";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { ReactNode } from "react";

// Only imported/mounted once useStartale() (see StartaleAutoConnect) has confirmed
// sdk.context.startale is populated — keeps @startale/app-sdk out of the bundle for
// every other session (Celo/Base/MiniPay/Farcaster/Base App), same lazy-load
// discipline as RainbowKitWrapper.
//
// NOTE: chain order matters for which chain the connector treats as default —
// Soneium Mainnet first. The Startale host itself controls the *actual* active
// chain (Mainnet vs Minato) at runtime; wallet_switchEthereumChain is not available
// inside the host (docs.startale.com/miniapps/wallet-integration), so this app never
// attempts to force a switch — it just needs to recognize whichever of the two the
// host reports via eth_chainId.
const startaleConfig = createConfig({
  chains: [soneium, soneiumMinato],
  connectors: [
    startaleConnector({
      appName: "Trivia Q",
      appLogoUrl: "https://trivia-quest-eight.vercel.app/icon-512.png",
    }),
  ],
  transports: {
    [soneium.id]: http("https://rpc.soneium.org/"),
    [soneiumMinato.id]: http("https://rpc.minato.soneium.org/"),
  },
  ssr: false,
});

function StartaleConnectOnMount({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    if (isConnected) return;
    // Inside the Startale host, eth_requestAccounts needs no popup — the host
    // already knows the user's smart account. See docs.startale.com/miniapps/
    // wallet-integration: "eth_requestAccounts — Same as eth_accounts, no popup
    // needed inside the host."
    const connector = connectors[0];
    if (connector) connect({ connector });
  }, [isConnected, connect, connectors]);

  return <>{children}</>;
}

export default function StartaleWagmiWrapper({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={startaleConfig}>
      <QueryClientProvider client={queryClient}>
        <StartaleConnectOnMount>{children}</StartaleConnectOnMount>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
