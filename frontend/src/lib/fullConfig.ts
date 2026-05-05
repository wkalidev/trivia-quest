import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celo, base } from "viem/chains";
import { Attribution } from "ox/erc8021";
import { http } from "wagmi";

const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_kkrhcgs3"],
});

export const fullConfig = getDefaultConfig({
  appName: "Trivia Q",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  // ✅ Supprimé mainnet — eth.llamarpc.com était bloqué par ad-blockers
  // et causait 50+ erreurs ERR_BLOCKED_BY_CLIENT + React hydration error #418
  chains: [celo, base],
  transports: {
    [celo.id]: http("https://forno.celo.org"),
    [base.id]: http("https://mainnet.base.org"),
  },
  ssr: false,
  dataSuffix: DATA_SUFFIX,
});