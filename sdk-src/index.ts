// TriviaQuest SDK
// Blockchain quiz game on Celo

export const CONTRACT_ADDRESS_MAINNET = "0xe7faded5157341911a99cae5c49ad4c1eeb1116a" as const;
export const CONTRACT_ADDRESS_TESTNET = "0x50b20728ba0ad803679b5428f267c89aede9a378" as const;

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

// ── Types ──────────────────────────────────────────────────
export type LeaderboardEntry = {
  player: string;
  totalPoints: bigint;
  bestScore: bigint;
  gamesPlayed: bigint;
};

export type PlayerStats = {
  score: bigint;
  totalWinnings: bigint;
  totalPoints: bigint;
  gamesPlayed: bigint;
  bestScore: bigint;
  exists: boolean;
};

export type Round = {
  id: bigint;
  prizePool: bigint;
  startTime: bigint;
  endTime: bigint;
  winner: string;
  finished: boolean;
};

// ── MiniPay Utils ──────────────────────────────────────────
export function isMiniPay(): boolean {
  if (typeof window === "undefined") return false;
  return window.navigator.userAgent.includes("MiniPay");
}

type EthereumProvider = {
  request: (args: { method: string }) => Promise<string[]>;
};

type WindowWithEthereum = Window & {
  ethereum?: EthereumProvider;
};

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

// ── Score Utils ────────────────────────────────────────────
export function getMultiplier(streak: number): number {
  if (streak >= 5) return 3;
  if (streak >= 3) return 2;
  return 1;
}

export function calculatePoints(correct: boolean, streak: number): number {
  if (!correct) return 0;
  return 100 * getMultiplier(streak + 1);
}

export function getStreakLabel(streak: number): string {
  if (streak >= 5) return "🔥🔥🔥 x3 MEGA";
  if (streak >= 3) return "🔥🔥 x2 HOT";
  if (streak >= 1) return "🔥 Streak";
  return "";
}

// ── Network Config ─────────────────────────────────────────
export const CELO_MAINNET = {
  id: 42220,
  name: "Celo Mainnet",
  rpcUrl: "https://forno.celo.org",
  explorerUrl: "https://celoscan.io",
  contractAddress: CONTRACT_ADDRESS_MAINNET,
};

export const CELO_TESTNET = {
  id: 11142220,
  name: "Celo Sepolia",
  rpcUrl: "https://forno.celo-sepolia.celo-testnet.org",
  explorerUrl: "https://sepolia.celoscan.io",
  contractAddress: CONTRACT_ADDRESS_TESTNET,
};

export const SDK_VERSION = "1.0.0";