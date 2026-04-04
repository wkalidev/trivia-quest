export const CONTRACT_ADDRESS = "0xe7faded5157341911a99cae5c49ad4c1eeb1116a" as const;

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
] as const;