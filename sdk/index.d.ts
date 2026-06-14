export declare const SDK_VERSION = "3.1.0";
export declare const TRIVIA_QUEST_ADDRESS_CELO: "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb";
export declare const TRIVQ_TOKEN_ADDRESS_CELO: "0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5";
export declare const CHECKIN_ADDRESS_CELO: "0x8650e6c477f8ae3933dc6d61d85e65c90cf71828";
export declare const REFERRAL_ADDRESS_CELO: "0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e";
export declare const DUEL_ADDRESS_CELO: "0xee7be00cd5454b9bea56d864d82076b8b5de5ca1";
export declare const TRIVIA_QUEST_ADDRESS_BASE: "0x1e2c209412ec30915ccf922654f0593faf61fcfb";
export declare const TRIVQ_TOKEN_ADDRESS_BASE: "0x8ecc1dc70f3bc5be941b61b42707eb7dbddb54c3";
export declare const CHECKIN_ADDRESS_BASE: "0x0f19851d5cd905d110c000a7d26d74a2f21f8ff9";
export declare const REFERRAL_ADDRESS_BASE: "0x4fb5285263354e1e75f044c65166ab22c3840074";
export declare const TREASURY_ADDRESS_BASE: "0x995aC10d5B6778B90eF060b7ab585D854C1Ed914";
export declare const TOTAL_QUESTIONS: 1200;
export declare const LANGUAGES: readonly [
    { readonly code: "fr"; readonly name: "Français";  readonly flag: "🇫🇷" },
    { readonly code: "en"; readonly name: "English";   readonly flag: "🇬🇧" },
    { readonly code: "es"; readonly name: "Español";   readonly flag: "🇪🇸" },
    { readonly code: "it"; readonly name: "Italiano";  readonly flag: "🇮🇹" },
    { readonly code: "pt"; readonly name: "Português"; readonly flag: "🇧🇷" },
    { readonly code: "ar"; readonly name: "العربية";   readonly flag: "🇸🇦" },
    { readonly code: "zh"; readonly name: "中文";      readonly flag: "🇨🇳" },
    { readonly code: "sw"; readonly name: "Kiswahili"; readonly flag: "🇰🇪" },
];
export declare const CONTRACT_ADDRESS_MAINNET: "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb";
export declare const CONTRACT_ADDRESS_TESTNET: "0x50b20728ba0ad803679b5428f267c89aede9a378";
export declare const CELO_MAINNET: {
    id: number;
    name: string;
    rpcUrl: string;
    explorerUrl: string;
    contracts: {
        game: "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb";
        token: "0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5";
        checkin: "0x8650e6c477f8ae3933dc6d61d85e65c90cf71828";
        referral: "0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e";
        duel: "0xee7be00cd5454b9bea56d864d82076b8b5de5ca1";
    };
};
export declare const BASE_MAINNET: {
    id: number;
    name: string;
    rpcUrl: string;
    explorerUrl: string;
    contracts: {
        game: "0x1e2c209412ec30915ccf922654f0593faf61fcfb";
        token: "0x8ecc1dc70f3bc5be941b61b42707eb7dbddb54c3";
        checkin: "0x0f19851d5cd905d110c000a7d26d74a2f21f8ff9";
        referral: "0x4fb5285263354e1e75f044c65166ab22c3840074";
        duel: "";
    };
};
export declare const CELO_TESTNET: {
    id: number;
    name: string;
    rpcUrl: string;
    explorerUrl: string;
    contracts: {
        game: "0x50b20728ba0ad803679b5428f267c89aede9a378";
        token: "";
        checkin: "";
        referral: "";
        duel: "0xd9456518d7acbe6bcab494aa5894ce4cdf7c5ad7";
    };
};
export declare function getAddress(chainId: number, contract: "game" | "token" | "checkin" | "referral" | "duel"): `0x${string}`;
export declare const CONTRACT_ABI: readonly [{
    readonly name: "joinRound";
    readonly type: "function";
    readonly stateMutability: "payable";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
}, {
    readonly name: "getCurrentRound";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "id";
            readonly type: "uint256";
        }, {
            readonly name: "prizePool";
            readonly type: "uint256";
        }, {
            readonly name: "startTime";
            readonly type: "uint256";
        }, {
            readonly name: "endTime";
            readonly type: "uint256";
        }, {
            readonly name: "topWinners";
            readonly type: "address[]";
        }, {
            readonly name: "finished";
            readonly type: "bool";
        }];
    }];
}, {
    readonly name: "entryFee";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "getLeaderboard";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "tuple[]";
        readonly components: readonly [{
            readonly name: "player";
            readonly type: "address";
        }, {
            readonly name: "totalPoints";
            readonly type: "uint256";
        }, {
            readonly name: "bestScore";
            readonly type: "uint256";
        }, {
            readonly name: "gamesPlayed";
            readonly type: "uint256";
        }];
    }];
}, {
    readonly name: "getPlayerStats";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "player";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "score";
            readonly type: "uint256";
        }, {
            readonly name: "totalWinnings";
            readonly type: "uint256";
        }, {
            readonly name: "totalPoints";
            readonly type: "uint256";
        }, {
            readonly name: "gamesPlayed";
            readonly type: "uint256";
        }, {
            readonly name: "bestScore";
            readonly type: "uint256";
        }, {
            readonly name: "exists";
            readonly type: "bool";
        }];
    }];
}, {
    readonly name: "getTotalPlayers";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "submitScore";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "player";
        readonly type: "address";
    }, {
        readonly name: "score";
        readonly type: "uint256";
    }, {
        readonly name: "points";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
}, {
    readonly name: "finishRound";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "topWinners";
        readonly type: "address[]";
    }];
    readonly outputs: readonly [];
}, {
    readonly name: "setTreasury";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "_treasury";
        readonly type: "address";
    }];
    readonly outputs: readonly [];
}];
export declare const DUEL_ABI: readonly [{
    readonly name: "createDuel";
    readonly type: "function";
    readonly stateMutability: "payable";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "joinDuel";
    readonly type: "function";
    readonly stateMutability: "payable";
    readonly inputs: readonly [{
        readonly name: "duelId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
}, {
    readonly name: "cancelExpiredDuel";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "duelId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
}, {
    readonly name: "getDuel";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "duelId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "id";
            readonly type: "uint256";
        }, {
            readonly name: "playerA";
            readonly type: "address";
        }, {
            readonly name: "playerB";
            readonly type: "address";
        }, {
            readonly name: "wager";
            readonly type: "uint256";
        }, {
            readonly name: "scoreA";
            readonly type: "uint256";
        }, {
            readonly name: "scoreB";
            readonly type: "uint256";
        }, {
            readonly name: "scoreASubmitted";
            readonly type: "bool";
        }, {
            readonly name: "scoreBSubmitted";
            readonly type: "bool";
        }, {
            readonly name: "winner";
            readonly type: "address";
        }, {
            readonly name: "status";
            readonly type: "uint8";
        }, {
            readonly name: "createdAt";
            readonly type: "uint256";
        }, {
            readonly name: "expiresAt";
            readonly type: "uint256";
        }];
    }];
}, {
    readonly name: "getOpenDuels";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "limit";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly type: "tuple[]";
        readonly components: readonly [{
            readonly name: "id";
            readonly type: "uint256";
        }, {
            readonly name: "playerA";
            readonly type: "address";
        }, {
            readonly name: "playerB";
            readonly type: "address";
        }, {
            readonly name: "wager";
            readonly type: "uint256";
        }, {
            readonly name: "scoreA";
            readonly type: "uint256";
        }, {
            readonly name: "scoreB";
            readonly type: "uint256";
        }, {
            readonly name: "scoreASubmitted";
            readonly type: "bool";
        }, {
            readonly name: "scoreBSubmitted";
            readonly type: "bool";
        }, {
            readonly name: "winner";
            readonly type: "address";
        }, {
            readonly name: "status";
            readonly type: "uint8";
        }, {
            readonly name: "createdAt";
            readonly type: "uint256";
        }, {
            readonly name: "expiresAt";
            readonly type: "uint256";
        }];
    }];
}, {
    readonly name: "getPlayerDuels";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "player";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256[]";
    }];
}, {
    readonly name: "duelCounter";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}];
export declare const TRIVQ_ABI: readonly [{
    readonly name: "balanceOf";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "transfer";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly name: "totalSupply";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "decimals";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint8";
    }];
}];
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
export declare enum DuelStatus {
    Open = 0,
    Active = 1,
    Finished = 2,
    Cancelled = 3
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
export declare function getMultiplier(streak: number): number;
export declare function calculatePoints(correct: boolean, streak: number): number;
export declare function getStreakLabel(streak: number): string;
export declare function getDuelStatusLabel(status: DuelStatus): string;
export declare function formatWager(wager: bigint): string;
export declare function getDuelNetPrize(wager: bigint, feeBps?: number): bigint;
export declare function isDuelExpired(expiresAt: bigint): boolean;
export declare function isMiniPay(): boolean;
export declare function getMiniPayAccount(): Promise<string | null>;
export declare function formatAddress(address: string): string;
export declare function formatTrivq(raw: bigint): string;
export declare function formatCelo(wei: bigint): string;
export declare const CHECKIN_ABI: readonly [{
    readonly name: "checkIn";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "categoryId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
}, {
    readonly name: "getPlayerData";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "player";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "lastCheckIn";
        readonly type: "uint256";
    }, {
        readonly name: "streak";
        readonly type: "uint256";
    }, {
        readonly name: "totalCheckIns";
        readonly type: "uint256";
    }, {
        readonly name: "checkInAvailable";
        readonly type: "bool";
    }, {
        readonly name: "secondsUntilNext";
        readonly type: "uint256";
    }];
}, {
    readonly name: "totalCheckIns";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}];
export declare const REFERRAL_ABI: readonly [{
    readonly name: "registerReferral";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "referrer";
        readonly type: "address";
    }];
    readonly outputs: readonly [];
}, {
    readonly name: "getReferrer";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "user";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly type: "address";
    }];
}, {
    readonly name: "getReferralCount";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "referrer";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}];
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
export declare function fetchNetworkStats(): Promise<NetworkStats>;
export declare function getStreakBonus(streak: number): number;
export declare function getNextStreakMilestone(streak: number): number;
export declare function formatCountdown(seconds: number): string;
export declare const CATEGORIES: readonly [{
    readonly id: 1;
    readonly name: "Africa Explorer";
    readonly emoji: "🌍";
    readonly description: "African Geography";
}, {
    readonly id: 2;
    readonly name: "Crypto Master";
    readonly emoji: "⛓";
    readonly description: "Web3 & Crypto";
}, {
    readonly id: 3;
    readonly name: "Culture Keeper";
    readonly emoji: "📜";
    readonly description: "History & Culture";
}, {
    readonly id: 4;
    readonly name: "Tech Wizard";
    readonly emoji: "⚡";
    readonly description: "Science & Tech";
}, {
    readonly id: 5;
    readonly name: "Sport Champion";
    readonly emoji: "🏆";
    readonly description: "Sports";
}, {
    readonly id: 6;
    readonly name: "Trivia Legend";
    readonly emoji: "✨";
    readonly description: "General Knowledge";
}];
export declare function getCategoryById(id: number): {
    readonly id: 1;
    readonly name: "Africa Explorer";
    readonly emoji: "🌍";
    readonly description: "African Geography";
} | {
    readonly id: 2;
    readonly name: "Crypto Master";
    readonly emoji: "⛓";
    readonly description: "Web3 & Crypto";
} | {
    readonly id: 3;
    readonly name: "Culture Keeper";
    readonly emoji: "📜";
    readonly description: "History & Culture";
} | {
    readonly id: 4;
    readonly name: "Tech Wizard";
    readonly emoji: "⚡";
    readonly description: "Science & Tech";
} | {
    readonly id: 5;
    readonly name: "Sport Champion";
    readonly emoji: "🏆";
    readonly description: "Sports";
} | {
    readonly id: 6;
    readonly name: "Trivia Legend";
    readonly emoji: "✨";
    readonly description: "General Knowledge";
};
export declare function calculateRewards(params: {
    score: number;
    streak: number;
    isCheckIn?: boolean;
    isDuelWinner?: boolean;
    wager?: bigint;
}): {
    trivq: number;
    celoWin: bigint;
};
/** Returns the MCP server endpoint URL. */
export declare function getMCPEndpoint(): string;
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
export declare function generateQuestion(category?: string): Promise<GeneratedQuestion>;
export type StatsResponse = {
    players: number;
    roundId: number;
    prizePool: string;
    totalCheckins: number;
    chains: {
        celo: boolean;
        base: boolean;
    };
};
/**
 * Fetches live TriviaQ network statistics from the public stats API.
 */
export declare function getStats(): Promise<StatsResponse>;
//# sourceMappingURL=index.d.ts.map