import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celo } from "viem/chains";

export { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";

export const config = getDefaultConfig({
  appName: "Trivia Q",
  projectId: "triviaquest123",
  chains: [celo],
  ssr: true,
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