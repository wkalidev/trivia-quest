"use strict";
// TriviaQuest SDK v2.0.0
// Blockchain quiz game on Celo & Base
// https://trivia-quest-eight.vercel.app
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuelStatus = exports.TRIVQ_ABI = exports.DUEL_ABI = exports.CONTRACT_ABI = exports.CELO_TESTNET = exports.BASE_MAINNET = exports.CELO_MAINNET = exports.CONTRACT_ADDRESS_TESTNET = exports.CONTRACT_ADDRESS_MAINNET = exports.REFERRAL_ADDRESS_BASE = exports.CHECKIN_ADDRESS_BASE = exports.TRIVQ_TOKEN_ADDRESS_BASE = exports.TRIVIA_QUEST_ADDRESS_BASE = exports.DUEL_ADDRESS_CELO = exports.REFERRAL_ADDRESS_CELO = exports.CHECKIN_ADDRESS_CELO = exports.TRIVQ_TOKEN_ADDRESS_CELO = exports.TRIVIA_QUEST_ADDRESS_CELO = exports.SDK_VERSION = void 0;
exports.getAddress = getAddress;
exports.getMultiplier = getMultiplier;
exports.calculatePoints = calculatePoints;
exports.getStreakLabel = getStreakLabel;
exports.getDuelStatusLabel = getDuelStatusLabel;
exports.formatWager = formatWager;
exports.getDuelNetPrize = getDuelNetPrize;
exports.isDuelExpired = isDuelExpired;
exports.isMiniPay = isMiniPay;
exports.getMiniPayAccount = getMiniPayAccount;
exports.formatAddress = formatAddress;
exports.formatTrivq = formatTrivq;
exports.formatCelo = formatCelo;
exports.SDK_VERSION = "2.0.0";
// ── Contract Addresses ─────────────────────────────────────
// Celo Mainnet
exports.TRIVIA_QUEST_ADDRESS_CELO = "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb";
exports.TRIVQ_TOKEN_ADDRESS_CELO = "0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5";
exports.CHECKIN_ADDRESS_CELO = "0x8650e6c477f8ae3933dc6d61d85e65c90cf71828";
exports.REFERRAL_ADDRESS_CELO = "0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e";
exports.DUEL_ADDRESS_CELO = "0xee7be00cd5454b9bea56d864d82076b8b5de5ca1";
// Base Mainnet
exports.TRIVIA_QUEST_ADDRESS_BASE = "0x1e2c209412ec30915ccf922654f0593faf61fcfb";
exports.TRIVQ_TOKEN_ADDRESS_BASE = "0x8ecc1dc70f3bc5be941b61b42707eb7dbddb54c3";
exports.CHECKIN_ADDRESS_BASE = "0x0f19851d5cd905d110c000a7d26d74a2f21f8ff9";
exports.REFERRAL_ADDRESS_BASE = "0x4fb5285263354e1e75f044c65166ab22c3840074";
// Legacy exports (backwards compatibility)
exports.CONTRACT_ADDRESS_MAINNET = exports.TRIVIA_QUEST_ADDRESS_CELO;
exports.CONTRACT_ADDRESS_TESTNET = "0x50b20728ba0ad803679b5428f267c89aede9a378";
// ── Network Config ─────────────────────────────────────────
exports.CELO_MAINNET = {
    id: 42220,
    name: "Celo Mainnet",
    rpcUrl: "https://forno.celo.org",
    explorerUrl: "https://celoscan.io",
    contracts: {
        game: exports.TRIVIA_QUEST_ADDRESS_CELO,
        token: exports.TRIVQ_TOKEN_ADDRESS_CELO,
        checkin: exports.CHECKIN_ADDRESS_CELO,
        referral: exports.REFERRAL_ADDRESS_CELO,
        duel: exports.DUEL_ADDRESS_CELO,
    },
};
exports.BASE_MAINNET = {
    id: 8453,
    name: "Base Mainnet",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    contracts: {
        game: exports.TRIVIA_QUEST_ADDRESS_BASE,
        token: exports.TRIVQ_TOKEN_ADDRESS_BASE,
        checkin: exports.CHECKIN_ADDRESS_BASE,
        referral: exports.REFERRAL_ADDRESS_BASE,
        duel: "",
    },
};
exports.CELO_TESTNET = {
    id: 11142220,
    name: "Celo Sepolia",
    rpcUrl: "https://forno.celo-sepolia.celo-testnet.org",
    explorerUrl: "https://sepolia.celoscan.io",
    contracts: {
        game: exports.CONTRACT_ADDRESS_TESTNET,
        token: "",
        checkin: "",
        referral: "",
        duel: "0xd9456518d7acbe6bcab494aa5894ce4cdf7c5ad7",
    },
};
// ── Helper: get contract address by chainId ────────────────
function getAddress(chainId, contract) {
    if (chainId === 42220)
        return exports.CELO_MAINNET.contracts[contract];
    if (chainId === 8453)
        return exports.BASE_MAINNET.contracts[contract];
    return exports.CELO_TESTNET.contracts[contract];
}
// ── TriviaQuest ABI ────────────────────────────────────────
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
];
// ── TriviaDuel ABI ─────────────────────────────────────────
exports.DUEL_ABI = [
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
];
// ── TRIVQ Token ABI ────────────────────────────────────────
exports.TRIVQ_ABI = [
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
];
var DuelStatus;
(function (DuelStatus) {
    DuelStatus[DuelStatus["Open"] = 0] = "Open";
    DuelStatus[DuelStatus["Active"] = 1] = "Active";
    DuelStatus[DuelStatus["Finished"] = 2] = "Finished";
    DuelStatus[DuelStatus["Cancelled"] = 3] = "Cancelled";
})(DuelStatus || (exports.DuelStatus = DuelStatus = {}));
// ── Score & Streak Utils ───────────────────────────────────
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
// ── Duel Utils ─────────────────────────────────────────────
function getDuelStatusLabel(status) {
    switch (status) {
        case DuelStatus.Open: return "Open";
        case DuelStatus.Active: return "Active";
        case DuelStatus.Finished: return "Finished";
        case DuelStatus.Cancelled: return "Cancelled";
    }
}
function formatWager(wager) {
    const n = Number(wager) / 1e18;
    if (n < 0.001)
        return "<0.001 CELO";
    return `${n.toFixed(3)} CELO`;
}
function getDuelNetPrize(wager, feeBps = 1000) {
    const total = wager * BigInt(2);
    const fee = (total * BigInt(feeBps)) / BigInt(10000);
    return total - fee;
}
function isDuelExpired(expiresAt) {
    return Date.now() / 1000 > Number(expiresAt);
}
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
// ── Format Utils ───────────────────────────────────────────
function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
function formatTrivq(raw) {
    const n = Number(raw) / 1e18;
    if (n >= 1000000000)
        return `${(n / 1000000000).toFixed(1)}B`;
    if (n >= 1000000)
        return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000)
        return `${(n / 1000).toFixed(1)}K`;
    return n.toFixed(0);
}
function formatCelo(wei) {
    const n = Number(wei) / 1e18;
    if (n === 0)
        return "0";
    if (n < 0.001)
        return "<0.001";
    return n.toFixed(3);
}
//# sourceMappingURL=index.js.map