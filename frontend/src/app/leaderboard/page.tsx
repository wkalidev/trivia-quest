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

const RANK_CONFIG = [
  { bg: "rgba(251,205,0,0.08)", border: "rgba(251,205,0,0.3)", color: "text-[#FBCD00]", label: "🥇", badge: "bg-[#FBCD00]/20 text-[#FBCD00]" },
  { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.12)", color: "text-white", label: "🥈", badge: "bg-white/10 text-white/70" },
  { bg: "rgba(251,146,60,0.06)", border: "rgba(251,146,60,0.2)", color: "text-orange-400", label: "🥉", badge: "bg-orange-500/10 text-orange-400" },
];

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
    <main className="min-h-screen flex flex-col px-4 pt-6 pb-8 relative"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, #1a2744 0%, #0a0b0f 60%)" }}
    >
      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      <div className="max-w-2xl mx-auto w-full z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/")}
            className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            ←
          </button>
          <div>
            <h1 className="text-white font-black text-2xl tracking-tight">Leaderboard</h1>
            <p className="text-white/30 text-xs mt-0.5">
              {totalPlayers?.toString() ?? "0"} players · On-chain rankings
            </p>
          </div>
        </div>

        {/* Top 3 podium */}
        {!isLoading && leaderboard && leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 0, 2].map((rankIdx, colIdx) => {
              const entry = (leaderboard as LeaderboardEntry[])[rankIdx];
              const cfg = RANK_CONFIG[rankIdx];
              const heights = ["h-24", "h-28", "h-20"];
              return (
                <motion.div
                  key={rankIdx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: colIdx * 0.1 }}
                  className={`${heights[colIdx]} rounded-2xl border flex flex-col items-center justify-center p-3 text-center`}
                  style={{ background: cfg.bg, borderColor: cfg.border }}
                >
                  <p className="text-2xl mb-1">{cfg.label}</p>
                  <p className="text-white text-xs font-bold">{shortAddress(entry.player)}</p>
                  <p className={`font-black text-sm ${cfg.color}`}>{entry.totalPoints.toString()} pts</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-10 h-10 border-2 border-[#FBCD00] border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* Empty */}
        {!isLoading && (!leaderboard || leaderboard.length === 0) && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎮</p>
            <p className="text-white font-bold text-lg mb-2">No players yet</p>
            <p className="text-white/30 text-sm mb-6">Be the first to appear on-chain</p>
            <button onClick={() => router.push("/quiz")}
              className="bg-[#FBCD00] text-[#0a0b0f] font-black px-8 py-3 rounded-2xl"
            >Play Now</button>
          </div>
        )}

        {/* Full list */}
        {!isLoading && leaderboard && leaderboard.length > 0 && (
          <div className="rounded-2xl border border-white/8 overflow-hidden mb-4"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            {/* Table header */}
            <div className="grid grid-cols-12 px-4 py-2 border-b border-white/5">
              <span className="col-span-1 text-white/30 text-xs">#</span>
              <span className="col-span-5 text-white/30 text-xs">Player</span>
              <span className="col-span-2 text-white/30 text-xs text-center">Games</span>
              <span className="col-span-2 text-white/30 text-xs text-center">Best</span>
              <span className="col-span-2 text-white/30 text-xs text-right">Points</span>
            </div>

            {(leaderboard as LeaderboardEntry[]).map((entry, idx) => {
              const cfg = RANK_CONFIG[idx] ?? { color: "text-white/60", label: `${idx + 1}` };
              return (
                <motion.div
                  key={entry.player}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="grid grid-cols-12 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all items-center"
                >
                  <span className="col-span-1 text-lg">{cfg.label}</span>
                  <span className="col-span-5 text-white font-bold text-sm">{shortAddress(entry.player)}</span>
                  <span className="col-span-2 text-white/50 text-xs text-center">{entry.gamesPlayed.toString()}</span>
                  <span className="col-span-2 text-white/50 text-xs text-center">{entry.bestScore.toString()}/10</span>
                  <span className={`col-span-2 font-black text-sm text-right ${cfg.color}`}>
                    {entry.totalPoints.toString()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => router.push("/quiz")}
          className="w-full font-black text-base py-4 rounded-2xl transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg, #FBCD00 0%, #f0a500 100%)", color: "#0a0b0f" }}
        >
          Play to Climb 🚀
        </button>
      </div>
    </main>
  );
}