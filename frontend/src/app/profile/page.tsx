"use client";

import { useAccount, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/web3";
import { motion } from "framer-motion";

function getRank(pts: number) {
  if (pts >= 5000) return { label: "Legend", emoji: "🏆", color: "text-[#FBCD00]", next: null };
  if (pts >= 3000) return { label: "Diamond", emoji: "💎", color: "text-blue-400", next: 5000 };
  if (pts >= 2000) return { label: "Gold", emoji: "🥇", color: "text-yellow-400", next: 3000 };
  if (pts >= 1000) return { label: "Silver", emoji: "🥈", color: "text-gray-300", next: 2000 };
  if (pts >= 500) return { label: "Bronze", emoji: "🥉", color: "text-orange-400", next: 1000 };
  return { label: "Rookie", emoji: "🌱", color: "text-green-400", next: 500 };
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const { data: stats, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getPlayerStats",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  if (!isConnected) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#0a0b0f" }}
      >
        <div className="text-center">
          <p className="text-white font-bold text-lg mb-4">Connect your wallet</p>
          <button onClick={() => router.push("/")}
            className="bg-[#FBCD00] text-[#0a0b0f] font-black px-8 py-3 rounded-2xl"
          >Go Back</button>
        </div>
      </main>
    );
  }

  const pts = Number(stats?.totalPoints ?? BigInt(0));
  const rank = getRank(pts);
  const prevThreshold = [0, 500, 1000, 2000, 3000, 5000].findLast((t) => pts >= t) ?? 0;
  const progress = rank.next
    ? Math.min(((pts - prevThreshold) / (rank.next - prevThreshold)) * 100, 100)
    : 100;

  const statCards = [
    { label: "Total Points", value: pts.toLocaleString(), color: "text-[#FBCD00]", sub: "pts" },
    { label: "Games Played", value: stats?.gamesPlayed?.toString() ?? "0", color: "text-[#35D07F]", sub: "games" },
    { label: "Best Score", value: `${stats?.bestScore?.toString() ?? "0"}/10`, color: "text-white", sub: "score" },
    { label: "CELO Won", value: stats?.totalWinnings ? (Number(stats.totalWinnings) / 1e18).toFixed(4) : "0", color: "text-purple-400", sub: "CELO" },
  ];

  return (
    <main className="min-h-screen flex flex-col px-4 pt-6 pb-8 relative"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, #1a2744 0%, #0a0b0f 60%)" }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      <div className="max-w-md mx-auto w-full z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push("/")}
            className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >←</button>
          <h1 className="text-white font-black text-2xl tracking-tight">My Profile</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}
              className="w-10 h-10 border-2 border-[#FBCD00] border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Identity card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/8 p-5"
              style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-[#0a0b0f]"
                  style={{ background: "linear-gradient(135deg, #FBCD00, #f0a500)" }}
                >
                  {address?.slice(2, 4).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-bold">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                  <p className={`font-black text-lg ${rank.color}`}>{rank.emoji} {rank.label}</p>
                </div>
              </div>
            </motion.div>

            {/* Stats grid */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-2"
            >
              {statCards.map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/8 p-4"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <p className={`font-black text-2xl ${s.color}`}>{s.value}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Progress */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl border border-white/8 p-4"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <div className="flex justify-between items-center mb-3">
                <p className="text-white font-bold text-sm">Rank Progress</p>
                <p className="text-white/40 text-xs">{rank.next ? `${rank.next - pts} pts to next` : "MAX RANK"}</p>
              </div>
              <div className="w-full rounded-full h-2 mb-1" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  className="h-2 rounded-full"
                  style={{ background: "linear-gradient(90deg, #FBCD00, #35D07F)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/30 mt-1">
                <span>{rank.emoji} {pts} pts</span>
                <span>{rank.next ? `${rank.next} pts` : "LEGEND"}</span>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <button onClick={() => router.push("/quiz")}
                className="w-full font-black text-base py-4 rounded-2xl active:scale-95 transition-all"
                style={{ background: "linear-gradient(135deg, #FBCD00 0%, #f0a500 100%)", color: "#0a0b0f" }}
              >Play Now 🎮</button>
              <button onClick={() => router.push("/leaderboard")}
                className="w-full border border-white/10 text-white font-bold py-3 rounded-2xl active:scale-95 transition-all text-sm"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >🏆 Leaderboard</button>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}