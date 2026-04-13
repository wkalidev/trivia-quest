import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celo } from "viem/chains";
import { Attribution } from "ox/erc8021";

export { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";

// ── Base Builder Code attribution ─────────────────────────
const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_kkrhcgs3"],
});

export const config = getDefaultConfig({
  appName: "Trivia Q",
  projectId: "triviaquest123",
  chains: [celo],
  ssr: true,
  dataSuffix: DATA_SUFFIX,
});

// ── MiniPay Hook ──────────────────────────────────────────
type EthereumProvider = {
  request: (args: { method: string }) => Promise<string[]>;
};

type WindowWithEthereum = Window & {
  ethereum?: EthereumProvider;
};

export function isMiniPay(): boolean {
  if (typeof window === "undefined") return false;
  return window.navigator.userAgent.includes("MiniPay");
}

export async function getMiniPayAccount(): Promise<string | null> {
  if (!isMiniPay()) return null;
  try {
    const ethereum = (window as WindowWithEthereum).ethereum;
    if (!ethereum) return null;
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    return accounts[0] ?? null;
  } catch {
    return null;
  }
}