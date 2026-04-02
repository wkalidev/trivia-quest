"use strict";
// TriviaQuest SDK
// Blockchain quiz game on Celo
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDK_VERSION = exports.CELO_TESTNET = exports.CELO_MAINNET = exports.CONTRACT_ABI = exports.CONTRACT_ADDRESS_TESTNET = exports.CONTRACT_ADDRESS_MAINNET = void 0;
exports.isMiniPay = isMiniPay;
exports.getMiniPayAccount = getMiniPayAccount;
exports.getMultiplier = getMultiplier;
exports.calculatePoints = calculatePoints;
exports.getStreakLabel = getStreakLabel;
exports.CONTRACT_ADDRESS_MAINNET = "0xb215c82de33f98b270455f21f7edb7780da0d47d";
exports.CONTRACT_ADDRESS_TESTNET = "0x50b20728ba0ad803679b5428f267c89aede9a378";
exports.CONTRACT_ABI = [
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
];
// ── MiniPay Utils ──────────────────────────────────────────
function isMiniPay() {
    if (typeof window === "undefined")
        return false;
    return window.navigator.userAgent.includes("MiniPay");
}
async function getMiniPayAccount() {
    if (!isMiniPay())
        return null;
    try {
        const ethereum = window.ethereum;
        if (!ethereum)
            return null;
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        return accounts[0] ?? null;
    }
    catch {
        return null;
    }
}
// ── Score Utils ────────────────────────────────────────────
function getMultiplier(streak) {
    if (streak >= 5)
        return 3;
    if (streak >= 3)
        return 2;
    return 1;
}
function calculatePoints(correct, streak) {
    if (!correct)
        return 0;
    return 100 * getMultiplier(streak + 1);
}
function getStreakLabel(streak) {
    if (streak >= 5)
        return "🔥🔥🔥 x3 MEGA";
    if (streak >= 3)
        return "🔥🔥 x2 HOT";
    if (streak >= 1)
        return "🔥 Streak";
    return "";
}
// ── Network Config ─────────────────────────────────────────
exports.CELO_MAINNET = {
    id: 42220,
    name: "Celo Mainnet",
    rpcUrl: "https://forno.celo.org",
    explorerUrl: "https://celoscan.io",
    contractAddress: exports.CONTRACT_ADDRESS_MAINNET,
};
exports.CELO_TESTNET = {
    id: 11142220,
    name: "Celo Sepolia",
    rpcUrl: "https://forno.celo-sepolia.celo-testnet.org",
    explorerUrl: "https://sepolia.celoscan.io",
    contractAddress: exports.CONTRACT_ADDRESS_TESTNET,
};
exports.SDK_VERSION = "1.0.0";
//# sourceMappingURL=index.js.map