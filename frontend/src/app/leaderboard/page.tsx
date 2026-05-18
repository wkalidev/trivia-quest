"use client";

import { useReadContract, useEnsName } from "wagmi";
import { useRouter } from "next/navigation";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/web3";
import { motion, AnimatePresence } from "framer-motion";
import { mainnet } from "viem/chains";
import { useState, useEffect } from "react";

type LeaderboardEntry = {
  player: string;
  totalPoints: bigint;
  bestScore: bigint;
  gamesPlayed: bigint;
};

const RANK_CONFIG = [
  { bg: "rgba(251,205,0,0.1)", border: "rgba(251,205,0,0.4)", color: "#FBCD00", label: "🥇", glow: "rgba(251,205,0,0.3)" },
  { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.15)", color: "#ffffff", label: "🥈", glow: "rgba(255,255,255,0.15)" },
  { bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.3)", color: "#fb923c", label: "🥉", glow: "rgba(251,146,60,0.2)" },
];

function addressToAlias(address: string): string {
  const num = parseInt(address.slice(-4), 16) % 9999 + 1;
  return `Player #${num.toString().padStart(4, "0")}`;
}

function PlayerName({ address }: { address: string }) {
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
    query: { enabled: !!address },
  });
  return (
    <span className="flex items-center gap-1.5">
      {ensName ?? addressToAlias(address)}
      {ensName && (
        <span className="text-blue-400 text-xs px-1 rounded" style={{ background: "rgba(59,130,246,0.1)" }}>ENS</span>
      )}
    </span>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1 rounded-full overflow-hidden mt-1" style={{ background: "rgba(255,255,255,0.06)" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

function PodiumCard({ entry, rank, delay }: { entry: LeaderboardEntry; rank: number; delay: number }) {
  const cfg = RANK_CONFIG[rank];
  const heights = ["h-32", "h-36", "h-28"];
  const sizes = ["text-3xl", "text-4xl", "text-2xl"];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className={`${heights[rank === 0 ? 1 : rank === 1 ? 0 : 2]} rounded-2xl border flex flex-col items-center justify-center p-3 text-center relative overflow-hidden`}
      style={{ background: cfg.bg, borderColor: cfg.border, boxShadow: `0 0 20px ${cfg.glow}` }}
    >
      <div className="absolute inset-0 opacity-10" style={{
        background: `radial-gradient(circle at 50% 0%, ${cfg.color}, transparent 70%)`,
      }} />
      <motion.p
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2, delay: rank * 0.3 }}
        className={`${sizes[rank === 0 ? 1 : rank === 1 ? 0 : 2]} mb-1`}
      >{cfg.label}</motion.p>
      <p className="text-white text-xs font-bold truncate w-full text-center">
        <PlayerName address={entry.player} />
      </p>
      <p className="font-black text-sm mt-1" style={{ color: cfg.color }}>
        {Number(entry.totalPoints).toLocaleString()} pts
      </p>
      <p className="text-white/30 text-xs">{entry.gamesPlayed.toString()} games</p>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const { data: leaderboard, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getLeaderboard",
  });

  const { data: totalPlayers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTotalPlayers",
  });

  useEffect(() => { refetch(); }, [tick]);

  const entries = (leaderboard as LeaderboardEntry[] | undefined) ?? [];
  const maxPoints = entries.length > 0 ? Number(entries[0].totalPoints) : 1;

  return (
    <main className="min-h-screen flex flex-col px-4 pt-6 pb-8 relative"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, #1a2744 0%, #0a0b0f 60%)" }}>

      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="max-w-2xl mx-auto w-full z-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push("/")}
            className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.04)" }}>←</button>
          <div className="flex-1">
            <h1 className="text-white font-black text-2xl tracking-tight">🏆 Leaderboard</h1>
            <p className="text-white/30 text-xs mt-0.5">
              {totalPlayers?.toString() ?? "0"} players · Live on-chain
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => refetch()}
            className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            ↻
          </motion.button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-2 border-[#FBCD00] border-t-transparent rounded-full" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && entries.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎮</p>
            <p className="text-white font-bold text-lg mb-2">No players yet</p>
            <button onClick={() => router.push("/quiz")}
              className="bg-[#FBCD00] text-[#0a0b0f] font-black px-8 py-3 rounded-2xl">Play Now</button>
          </div>
        )}

        {/* Podium top 3 */}
        {!isLoading && entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 0, 2].map((rankIdx, colIdx) => (
              <PodiumCard key={rankIdx} entry={entries[rankIdx]} rank={rankIdx} delay={colIdx * 0.1} />
            ))}
          </div>
        )}

        {/* Full list */}
        {!isLoading && entries.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="rounded-2xl border border-white/8 overflow-hidden mb-4"
            style={{ background: "rgba(255,255,255,0.03)" }}>

            <div className="grid grid-cols-12 px-4 py-2 border-b border-white/5">
              <span className="col-span-1 text-white/30 text-xs">#</span>
              <span className="col-span-5 text-white/30 text-xs">Player</span>
              <span className="col-span-2 text-white/30 text-xs text-center">Games</span>
              <span className="col-span-2 text-white/30 text-xs text-center">Best</span>
              <span className="col-span-2 text-white/30 text-xs text-right">Points</span>
            </div>

            <AnimatePresence>
              {entries.map((entry, idx) => {
                const cfg = RANK_CONFIG[idx];
                const isTop3 = idx < 3;
                return (
                  <motion.div key={entry.player}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all"
                    style={isTop3 ? { background: cfg.bg } : {}}>
                    <div className="grid grid-cols-12 items-center">
                      <span className="col-span-1 text-lg">{cfg?.label ?? `${idx + 1}`}</span>
                      <span className="col-span-5 text-white font-bold text-sm">
                        <PlayerName address={entry.player} />
                      </span>
                      <span className="col-span-2 text-white/50 text-xs text-center">{entry.gamesPlayed.toString()}</span>
                      <span className="col-span-2 text-white/50 text-xs text-center">{entry.bestScore.toString()}/10</span>
                      <span className="col-span-2 font-black text-sm text-right" style={{ color: cfg?.color ?? "rgba(255,255,255,0.6)" }}>
                        {Number(entry.totalPoints).toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-12 mt-1 pl-8">
                      <ProgressBar value={Number(entry.totalPoints)} max={maxPoints} color={cfg?.color ?? "#FBCD00"} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/quiz")}
          className="w-full font-black text-base py-4 rounded-2xl"
          style={{ background: "linear-gradient(135deg, #FBCD00, #f0a500)", color: "#0a0b0f" }}>
          Play to Climb 🚀
        </motion.button>
      </div>
    </main>
  );
}