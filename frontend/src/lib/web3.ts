import { http, createConfig } from "wagmi";
import { celo } from "viem/chains";

export { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";

// ── Config légère pour MiniPay (pas de RainbowKit, pas de WalletConnect, pas d'ENS)
// Utilisée quand window.ethereum.isMiniPay === true
export const miniPayConfig = createConfig({
  chains: [celo],
  transports: {
    [celo.id]: http("https://forno.celo.org"),
  },
  ssr: false,
});

// ── Config complète pour les autres wallets (RainbowKit + WalletConnect + ENS)
// Chargée en lazy via dynamic import uniquement si pas MiniPay
export async function getFullConfig() {
  const [
    { getDefaultConfig },
    { celo: celoChain, mainnet },
    { Attribution },
  ] = await Promise.all([
    import("@rainbow-me/rainbowkit"),
    import("viem/chains"),
    import("ox/erc8021"),
  ]);

  const DATA_SUFFIX = Attribution.toDataSuffix({
    codes: ["bc_kkrhcgs3"],
  });

  return getDefaultConfig({
    appName: "Trivia Q",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
    chains: [celoChain, mainnet],
    transports: {
      [celoChain.id]: http("https://forno.celo.org"),
      [mainnet.id]: http("https://eth.llamarpc.com"),
    },
    ssr: false,
    dataSuffix: DATA_SUFFIX,
  });
}

// ── Détection MiniPay (synchrone, utilisable partout)
export function isMiniPay(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as any).ethereum?.isMiniPay;
}