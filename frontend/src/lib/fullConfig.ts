import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celo, mainnet, base } from "viem/chains";
import { Attribution } from "ox/erc8021";
import { http } from "wagmi";

const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_kkrhcgs3"],
});

export const fullConfig = getDefaultConfig({
  appName: "Trivia Q",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  chains: [celo, base, mainnet],
  transports: {
    [celo.id]: http("https://forno.celo.org"),
    [base.id]: http("https://mainnet.base.org"),
    [mainnet.id]: http("https://eth.llamarpc.com"),
  },
  ssr: false,
  dataSuffix: DATA_SUFFIX,
});