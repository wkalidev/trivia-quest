// TriviaQuest SDK v3.0.0
// Blockchain quiz game on Celo & Base
// https://trivia-quest-eight.vercel.app

export const SDK_VERSION = "3.0.0";

// ── Contract Addresses ─────────────────────────────────────

// Celo Mainnet
export const TRIVIA_QUEST_ADDRESS_CELO = "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb" as const;
export const TRIVQ_TOKEN_ADDRESS_CELO   = "0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5" as const;
export const CHECKIN_ADDRESS_CELO       = "0x8650e6c477f8ae3933dc6d61d85e65c90cf71828" as const;
export const REFERRAL_ADDRESS_CELO      = "0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e" as const;
export const DUEL_ADDRESS_CELO          = "0xee7be00cd5454b9bea56d864d82076b8b5de5ca1" as const;

// Base Mainnet
export const TRIVIA_QUEST_ADDRESS_BASE  = "0x1e2c209412ec30915ccf922654f0593faf61fcfb" as const;
export const TRIVQ_TOKEN_ADDRESS_BASE   = "0x8ecc1dc70f3bc5be941b61b42707eb7dbddb54c3" as const;
export const CHECKIN_ADDRESS_BASE       = "0x0f19851d5cd905d110c000a7d26d74a2f21f8ff9" as const;
export const REFERRAL_ADDRESS_BASE      = "0x4fb5285263354e1e75f044c65166ab22c3840074" as const;

// Legacy exports (backwards compatibility)
export const CONTRACT_ADDRESS_MAINNET = TRIVIA_QUEST_ADDRESS_CELO;
export const CONTRACT_ADDRESS_TESTNET = "0x50b20728ba0ad803679b5428f267c89aede9a378" as const;

// ── Network Config ─────────────────────────────────────────

export const CELO_MAINNET = {
  id: 42220,
  name: "Celo Mainnet",
  rpcUrl: "https://forno.celo.org",
  explorerUrl: "https://celoscan.io",
  contracts: {
    game:    TRIVIA_QUEST_ADDRESS_CELO,
    token:   TRIVQ_TOKEN_ADDRESS_CELO,
    checkin: CHECKIN_ADDRESS_CELO,
    referral:REFERRAL_ADDRESS_CELO,
    duel:    DUEL_ADDRESS_CELO,
  },
};

export const BASE_MAINNET = {
  id: 8453,
  name: "Base Mainnet",
  rpcUrl: "https://mainnet.base.org",
  explorerUrl: "https://basescan.org",
  contracts: {
    game:    TRIVIA_QUEST_ADDRESS_BASE,
    token:   TRIVQ_TOKEN_ADDRESS_BASE,
    checkin: CHECKIN_ADDRESS_BASE,
    referral:REFERRAL_ADDRESS_BASE,
    duel:    "" as const,
  },
};

export const CELO_TESTNET = {
  id: 11142220,
  name: "Celo Sepolia",
  rpcUrl: "https://forno.celo-sepolia.celo-testnet.org",
  explorerUrl: "https://sepolia.celoscan.io",
  contracts: {
    game:    CONTRACT_ADDRESS_TESTNET,
    token:   "" as const,
    checkin: "" as const,
    referral:"" as const,
    duel:    "0xd9456518d7acbe6bcab494aa5894ce4cdf7c5ad7" as const,
  },
};

// ── Helper: get contract address by chainId ────────────────
export function getAddress(
  chainId: number,
  contract: "game" | "token" | "checkin" | "referral" | "duel"
): `0x${string}` {
  if (chainId === 42220) return CELO_MAINNET.contracts[contract] as `0x${string}`;
  if (chainId === 8453)  return BASE_MAINNET.contracts[contract] as `0x${string}`;
  return CELO_TESTNET.contracts[contract] as `0x${string}`;
}

// ── TriviaQuest ABI ────────────────────────────────────────
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
          { name: "topWinners", type: "address[]" },
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

// ── TriviaDuel ABI ─────────────────────────────────────────
export const DUEL_ABI = [
  {
    name: "createDuel",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "joinDuel",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "duelId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "cancelExpiredDuel",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "duelId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getDuel",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "duelId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "playerA", type: "address" },
          { name: "playerB", type: "address" },
          { name: "wager", type: "uint256" },
          { name: "scoreA", type: "uint256" },
          { name: "scoreB", type: "uint256" },
          { name: "scoreASubmitted", type: "bool" },
          { name: "scoreBSubmitted", type: "bool" },
          { name: "winner", type: "address" },
          { name: "status", type: "uint8" },
          { name: "createdAt", type: "uint256" },
          { name: "expiresAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getOpenDuels",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "limit", type: "uint256" }],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "playerA", type: "address" },
          { name: "playerB", type: "address" },
          { name: "wager", type: "uint256" },
          { name: "scoreA", type: "uint256" },
          { name: "scoreB", type: "uint256" },
          { name: "scoreASubmitted", type: "bool" },
          { name: "scoreBSubmitted", type: "bool" },
          { name: "winner", type: "address" },
          { name: "status", type: "uint8" },
          { name: "createdAt", type: "uint256" },
          { name: "expiresAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getPlayerDuels",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{ type: "uint256[]" }],
  },
  {
    name: "duelCounter",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

// ── TRIVQ Token ABI ────────────────────────────────────────
export const TRIVQ_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
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
  topWinners: string[];
  finished: boolean;
};

export enum DuelStatus {
  Open = 0,
  Active = 1,
  Finished = 2,
  Cancelled = 3,
}

export type Duel = {
  id: bigint;
  playerA: string;
  playerB: string;
  wager: bigint;
  scoreA: bigint;
  scoreB: bigint;
  scoreASubmitted: boolean;
  scoreBSubmitted: boolean;
  winner: string;
  status: DuelStatus;
  createdAt: bigint;
  expiresAt: bigint;
};

// ── Score & Streak Utils ───────────────────────────────────

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

// ── Duel Utils ─────────────────────────────────────────────

export function getDuelStatusLabel(status: DuelStatus): string {
  switch (status) {
    case DuelStatus.Open:      return "Open";
    case DuelStatus.Active:    return "Active";
    case DuelStatus.Finished:  return "Finished";
    case DuelStatus.Cancelled: return "Cancelled";
  }
}

export function formatWager(wager: bigint): string {
  const n = Number(wager) / 1e18;
  if (n < 0.001) return "<0.001 CELO";
  return `${n.toFixed(3)} CELO`;
}

export function getDuelNetPrize(wager: bigint, feeBps = 1000): bigint {
  const total = wager * BigInt(2);
  const fee = (total * BigInt(feeBps)) / BigInt(10000);
  return total - fee;
}

export function isDuelExpired(expiresAt: bigint): boolean {
  return Date.now() / 1000 > Number(expiresAt);
}

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

// ── Format Utils ───────────────────────────────────────────

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTrivq(raw: bigint): string {
  const n = Number(raw) / 1e18;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

export function formatCelo(wei: bigint): string {
  const n = Number(wei) / 1e18;
  if (n === 0)     return "0";
  if (n < 0.001)   return "<0.001";
  return n.toFixed(3);
}

// ── CheckIn ABI ────────────────────────────────────────────
export const CHECKIN_ABI = [
  {
    name: "checkIn",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "categoryId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getPlayerData",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [
      { name: "lastCheckIn", type: "uint256" },
      { name: "streak", type: "uint256" },
      { name: "totalCheckIns", type: "uint256" },
      { name: "checkInAvailable", type: "bool" },
      { name: "secondsUntilNext", type: "uint256" },
    ],
  },
  {
    name: "totalCheckIns",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

// ── Referral ABI ───────────────────────────────────────────
export const REFERRAL_ABI = [
  {
    name: "registerReferral",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "referrer", type: "address" }],
    outputs: [],
  },
  {
    name: "getReferrer",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "address" }],
  },
  {
    name: "getReferralCount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "referrer", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

// ── Types ──────────────────────────────────────────────────

export type CheckInData = {
  lastCheckIn: bigint;
  streak: bigint;
  totalCheckIns: bigint;
  checkInAvailable: boolean;
  secondsUntilNext: bigint;
};

export type NetworkStats = {
  players: number;
  roundId: number;
  prizePool: string;
  totalCheckins: number;
};

// ── Network Stats Fetcher ──────────────────────────────────

export async function fetchNetworkStats(): Promise<NetworkStats> {
  const res = await fetch("https://trivia-quest-eight.vercel.app/api/stats");
  const data = await res.json();
  return {
    players: data.live_stats?.players ?? 0,
    roundId: data.live_stats?.round_id ?? 0,
    prizePool: data.live_stats?.prize_pool ?? "0",
    totalCheckins: data.live_stats?.total_checkins ?? 0,
  };
}

// ── Streak Utils ───────────────────────────────────────────

export function getStreakBonus(streak: number): number {
  return streak > 0 && streak % 7 === 0 ? 2000 : 0;
}

export function getNextStreakMilestone(streak: number): number {
  return 7 - (streak % 7);
}

export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Category Utils ─────────────────────────────────────────

export const CATEGORIES = [
  { id: 1, name: "Africa Explorer",  emoji: "🌍", description: "African Geography" },
  { id: 2, name: "Crypto Master",    emoji: "⛓",  description: "Web3 & Crypto" },
  { id: 3, name: "Culture Keeper",   emoji: "📜", description: "History & Culture" },
  { id: 4, name: "Tech Wizard",      emoji: "⚡", description: "Science & Tech" },
  { id: 5, name: "Sport Champion",   emoji: "🏆", description: "Sports" },
  { id: 6, name: "Trivia Legend",    emoji: "✨", description: "General Knowledge" },
] as const;

export function getCategoryById(id: number) {
  return CATEGORIES.find(c => c.id === id) ?? null;
}

// ── Reward Calculator ──────────────────────────────────────

export function calculateRewards(params: {
  score: number;
  streak: number;
  isCheckIn?: boolean;
  isDuelWinner?: boolean;
  wager?: bigint;
}): { trivq: number; celoWin: bigint } {
  let trivq = 0;
  let celoWin = BigInt(0);

  if (params.score > 0) {
    trivq += params.score * 100 * getMultiplier(params.streak);
  }
  if (params.isCheckIn) {
    trivq += 100;
    trivq += getStreakBonus(params.streak);
  }
  if (params.isDuelWinner && params.wager) {
    celoWin = getDuelNetPrize(params.wager);
  }

  return { trivq, celoWin };
}

// ── MCP & AI ───────────────────────────────────────────────

const APP_URL = "https://trivia-quest-eight.vercel.app";

/** Returns the MCP server endpoint URL. */
export function getMCPEndpoint(): string {
  return `${APP_URL}/api/mcp`;
}

export type GeneratedQuestion = {
  question: string;
  options: string[];
  answer: number;
  category: string;
};

/**
 * Fetches an AI-generated question from the TriviaQ AI endpoint.
 * @param category Optional category (e.g. "Web3 & Crypto"). Uses random if omitted.
 */
export async function generateQuestion(category?: string): Promise<GeneratedQuestion> {
  const url = new URL(`${APP_URL}/api/ai-question`);
  if (category) url.searchParams.set("category", category);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`AI question fetch failed: ${res.status}`);
  const data = await res.json();
  return {
    question: data.question,
    options: data.options,
    answer: data.answer,
    category: data.category ?? category ?? "",
  };
}

export type StatsResponse = {
  players: number;
  roundId: number;
  prizePool: string;
  totalCheckins: number;
  chains: { celo: boolean; base: boolean };
};

/**
 * Fetches live TriviaQ network statistics from the public stats API.
 */
export async function getStats(): Promise<StatsResponse> {
  const res = await fetch(`${APP_URL}/api/stats`);
  if (!res.ok) throw new Error(`Stats fetch failed: ${res.status}`);
  const data = await res.json();
  return {
    players: data.live_stats?.players ?? 0,
    roundId: data.live_stats?.round_id ?? 0,
    prizePool: data.live_stats?.prize_pool ?? "0",
    totalCheckins: data.live_stats?.total_checkins ?? 0,
    chains: {
      celo: data.chains?.celo ?? true,
      base: data.chains?.base ?? false,
    },
  };
}