import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celo } from "viem/chains";

export const config = getDefaultConfig({
  appName: "Trivia Q",
  projectId: "triviaquest123",
  chains: [celo],
  ssr: true,
});
export const CONTRACT_ADDRESS = "0xe679f3ec6042f63977064f9725da84aad75d2ff2" as const;
export const CONTRACT_ABI = [
  {
    name: "joinRound",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    name: "getCurrentRound",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "prizePool", type: "uint256" },
          { name: "startTime", type: "uint256" },
          { name: "endTime", type: "uint256" },
          { name: "winner", type: "address" },
          { name: "finished", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "entryFee",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getPlayerScore",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getLeaderboard",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "player", type: "address" },
          { name: "totalPoints", type: "uint256" },
          { name: "bestScore", type: "uint256" },
          { name: "gamesPlayed", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getPlayerStats",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "score", type: "uint256" },
          { name: "totalWinnings", type: "uint256" },
          { name: "totalPoints", type: "uint256" },
          { name: "gamesPlayed", type: "uint256" },
          { name: "bestScore", type: "uint256" },
          { name: "exists", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "getTotalPlayers",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "submitScore",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "player", type: "address" },
      { name: "score", type: "uint256" },
      { name: "points", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

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