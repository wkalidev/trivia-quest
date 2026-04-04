export declare const CONTRACT_ADDRESS_MAINNET: "0xe7faded5157341911a99cae5c49ad4c1eeb1116a";
export declare const CONTRACT_ADDRESS_TESTNET: "0x50b20728ba0ad803679b5428f267c89aede9a378";
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
            readonly name: "winner";
            readonly type: "address";
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
    winner: string;
    finished: boolean;
};
export declare function isMiniPay(): boolean;
export declare function getMiniPayAccount(): Promise<string | null>;
export declare function getMultiplier(streak: number): number;
export declare function calculatePoints(correct: boolean, streak: number): number;
export declare function getStreakLabel(streak: number): string;
export declare const CELO_MAINNET: {
    id: number;
    name: string;
    rpcUrl: string;
    explorerUrl: string;
    contractAddress: "0xe7faded5157341911a99cae5c49ad4c1eeb1116a";
};
export declare const CELO_TESTNET: {
    id: number;
    name: string;
    rpcUrl: string;
    explorerUrl: string;
    contractAddress: "0x50b20728ba0ad803679b5428f267c89aede9a378";
};
export declare const SDK_VERSION = "1.0.0";
//# sourceMappingURL=index.d.ts.map