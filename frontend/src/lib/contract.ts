import { celo, base, celoAlfajores } from "viem/chains";

// ✅ Adresses par chain
export const CONTRACTS = {
  [celo.id]: {
    game:    "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb" as `0x${string}`,
    token:   "0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5" as `0x${string}`,
    checkin: "0x8650e6c477f8ae3933dc6d61d85e65c90cf71828" as `0x${string}`,
    referral:"0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e" as `0x${string}`,
    duel:    "" as `0x${string}`, // 🔜 Mainnet après test
  },
  [base.id]: {
    game:    "0x1e2c209412ec30915ccf922654f0593faf61fcfb" as `0x${string}`,
    token:   "0x8ecc1dc70f3bc5be941b61b42707eb7dbddb54c3" as `0x${string}`,
    checkin: "0x0f19851d5cd905d110c000a7d26d74a2f21f8ff9" as `0x${string}`,
    referral:"0x4fb5285263354e1e75f044c65166ab22c3840074" as `0x${string}`,
    duel:    "" as `0x${string}`,
  },
  [celoAlfajores.id]: {
    game:    "" as `0x${string}`,
    token:   "" as `0x${string}`,
    checkin: "" as `0x${string}`,
    referral:"" as `0x${string}`,
    duel: "0xee7be00cd5454b9bea56d864d82076b8b5de5ca1" as `0x${string}`,

  },
} as const;

// ✅ Helpers
export function getContractAddress(
  chainId: number,
  contract: keyof typeof CONTRACTS[typeof celo.id]
): `0x${string}` {
  const chain = CONTRACTS[chainId as keyof typeof CONTRACTS];
  if (!chain) return CONTRACTS[celo.id][contract];
  return chain[contract];
}

// ✅ Rétrocompatibilité
export const CONTRACT_ADDRESS = CONTRACTS[celo.id].game;

// ✅ ABI TriviaQuest (existant)
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

// ✅ ABI TriviaDuel
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