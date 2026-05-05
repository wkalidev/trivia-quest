import { celo, base } from "viem/chains";

// ✅ Adresses par chain
export const CONTRACTS = {
  [celo.id]: {
    game:    "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb" as `0x${string}`,
    token:   "0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5" as `0x${string}`,
    checkin: "0x8650e6c477f8ae3933dc6d61d85e65c90cf71828" as `0x${string}`,
    referral:"0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e" as `0x${string}`,
  },
 [base.id]: {
  game:    "0x1e2c209412ec30915ccf922654f0593faf61fcfb" as `0x${string}`,
  token:   "0x8ecc1dc70f3bc5be941b61b42707eb7dbddb54c3" as `0x${string}`,
  checkin: "0x0f19851d5cd905d110c000a7d26d74a2f21f8ff9" as `0x${string}`,
  referral:"0x4fb5285263354e1e75f044c65166ab22c3840074" as `0x${string}`,
},
} as const;

// ✅ Helpers
export function getContractAddress(chainId: number, contract: keyof typeof CONTRACTS[typeof celo.id]): `0x${string}` {
  const chain = CONTRACTS[chainId as keyof typeof CONTRACTS];
  if (!chain) return CONTRACTS[celo.id][contract]; // fallback Celo
  return chain[contract];
}

// ✅ Rétrocompatibilité — pointe sur Celo par défaut
export const CONTRACT_ADDRESS = CONTRACTS[celo.id].game;

export const CONTRACT_ABI = [
  {
    name: "joinRound",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
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
  {
    name: "finishRound",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "topWinners", type: "address[]" }],
    outputs: [],
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
    name: "entryFee",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getCurrentRound",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "prizePool", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "topWinners", type: "address[]" },
      { name: "finished", type: "bool" },
    ],
  },
  {
    name: "getPlayerScore",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{ type: "uint256" }],
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
    name: "protocolFeeBps",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "totalFeesCollected",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "treasury",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
] as const;