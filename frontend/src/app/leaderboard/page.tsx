"use client";

import { useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/web3";
import { motion } from "framer-motion";

type LeaderboardEntry = {
  player: string;
  totalPoints: bigint;
  bestScore: bigint;
  gamesPlayed: bigint;
};

function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getMedal(rank: number): string {
  if (rank === 0) return "🥇";
  if (rank === 1) return "🥈";
  if (rank === 2) return "🥉";
  return `#${rank + 1}`;
}

export default function LeaderboardPage() {
  const router = useRouter();

  const { data: leaderboard, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getLeaderboard",
  });

  const { data: totalPlayers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTotalPlayers",
  });

  return (
    <main className="min-h-screen flex flex-col bg-[#1A1A2E] px-6 pt-12 pb-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/")}
          className="text-white/60 hover:text-white text-2xl"
        >
          ←
        </button>
        <div>
          <h1 className="text-white font-black text-3xl">Leaderboard 🏆</h1>
          <p className="text-white/40 text-sm">
            {totalPlayers?.toString() ?? "0"} joueurs au total
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-12 h-12 border-4 border-[#FBCD00] border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!leaderboard || leaderboard.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🎮</div>
          <p className="text-white font-bold text-xl mb-2">Pas encore de joueurs !</p>
          <p className="text-white/40 text-sm mb-8">Sois le premier à jouer et apparaître ici.</p>
          <button
            onClick={() => router.push("/quiz")}
            className="bg-[#FBCD00] text-[#1A1A2E] font-black px-8 py-4 rounded-2xl"
          >
            Jouer maintenant 🎮
          </button>
        </div>
      )}

      {/* Leaderboard */}
      {!isLoading && leaderboard && leaderboard.length > 0 && (
        <div className="space-y-3">
          {(leaderboard as LeaderboardEntry[]).map((entry, idx) => (
            <motion.div
              key={entry.player}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-center gap-4 p-4 rounded-2xl ${
                idx === 0 ? "bg-[#FBCD00]/20 border border-[#FBCD00]/40" :
                idx === 1 ? "bg-white/10 border border-white/20" :
                idx === 2 ? "bg-orange-500/10 border border-orange-500/20" :
                "bg-white/5"
              }`}
            >
              {/* Rank */}
              <div className="w-10 text-center text-2xl font-black">
                {getMedal(idx)}
              </div>

              {/* Player info */}
              <div className="flex-1">
                <p className="text-white font-bold text-sm">
                  {shortAddress(entry.player)}
                </p>
                <p className="text-white/40 text-xs">
                  {entry.gamesPlayed.toString()} parties · Meilleur: {entry.bestScore.toString()}/10
                </p>
              </div>

              {/* Points */}
              <div className="text-right">
                <p className={`font-black text-lg ${
                  idx === 0 ? "text-[#FBCD00]" :
                  idx === 1 ? "text-white" :
                  idx === 2 ? "text-orange-400" :
                  "text-white/60"
                }`}>
                  {entry.totalPoints.toString()}
                </p>
                <p className="text-white/40 text-xs">pts</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Play CTA */}
      <div className="mt-8">
        <button
          onClick={() => router.push("/quiz")}
          className="w-full bg-[#FBCD00] text-[#1A1A2E] font-black text-lg py-4 rounded-2xl active:scale-95 transition-all"
        >
          Jouer pour monter 🚀
        </button>
      </div>
    </main>
  );
}