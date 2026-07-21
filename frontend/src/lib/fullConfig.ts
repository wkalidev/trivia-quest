import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celo, base, soneium, soneiumMinato } from "viem/chains";
import { Attribution } from "ox/erc8021";
import { http } from "wagmi";

const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_kkrhcgs3"],
});

// This config is only ever mounted standalone (regular browser, user clicked
// Connect — see RainbowKitWrapper.tsx). It never mounts inside the Startale
// host (that path uses StartaleWagmiWrapper + startaleConnector instead), but
// Soneium is included here too so a MetaMask/WalletConnect user visiting the
// site directly can still connect to Soneium like any other supported chain.
export const fullConfig = getDefaultConfig({
  appName: "Trivia Q",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  // ✅ Supprimé mainnet — eth.llamarpc.com était bloqué par ad-blockers
  // et causait 50+ erreurs ERR_BLOCKED_BY_CLIENT + React hydration error #418
  chains: [celo, base, soneium, soneiumMinato],
  transports: {
    [celo.id]: http("https://forno.celo.org"),
    [base.id]: http("https://mainnet.base.org"),
    [soneium.id]: http("https://rpc.soneium.org/"),
    [soneiumMinato.id]: http("https://rpc.minato.soneium.org/"),
  },
  ssr: false,
  dataSuffix: DATA_SUFFIX,
});