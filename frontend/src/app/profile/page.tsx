"use client";

import { useAccount, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/web3";
import { motion } from "framer-motion";

function getRank(totalPoints: bigint): string {
  const pts = Number(totalPoints);
  if (pts >= 5000) return "🏆 Légende";
  if (pts >= 3000) return "💎 Diamant";
  if (pts >= 2000) return "🥇 Or";
  if (pts >= 1000) return "🥈 Argent";
  if (pts >= 500) return "🥉 Bronze";
  return "🌱 Débutant";
}

function getRankColor(totalPoints: bigint): string {
  const pts = Number(totalPoints);
  if (pts >= 5000) return "text-[#FBCD00]";
  if (pts >= 3000) return "text-blue-400";
  if (pts >= 2000) return "text-yellow-400";
  if (pts >= 1000) return "text-gray-300";
  if (pts >= 500) return "text-orange-400";
  return "text-green-400";
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
      <main className="min-h-screen flex items-center justify-center bg-[#1A1A2E] px-6">
        <div className="text-center">
          <p className="text-white font-bold text-xl mb-4">Connecte ton wallet pour voir ton profil</p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#FBCD00] text-[#1A1A2E] font-black px-8 py-4 rounded-2xl"
          >
            Retour
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#1A1A2E] px-6 pt-12 pb-8">

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/")}
          className="text-white/60 hover:text-white text-2xl"
        >
          ←
        </button>
        <h1 className="text-white font-black text-3xl">Mon Profil 👤</h1>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-12 h-12 border-4 border-[#FBCD00] border-t-transparent rounded-full"
          />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-4">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 rounded-3xl p-6 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-[#FBCD00] flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-black text-[#1A1A2E]">
                {address?.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <p className="text-white font-bold text-lg">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <p className={`font-black text-2xl mt-2 ${getRankColor(stats?.totalPoints ?? BigInt(0))}`}>
              {getRank(stats?.totalPoints ?? BigInt(0))}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <p className="text-[#FBCD00] font-black text-3xl">
                {stats?.totalPoints?.toString() ?? "0"}
              </p>
              <p className="text-white/60 text-sm">Points totaux</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <p className="text-[#35D07F] font-black text-3xl">
                {stats?.gamesPlayed?.toString() ?? "0"}
              </p>
              <p className="text-white/60 text-sm">Parties jouées</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <p className="text-white font-black text-3xl">
                {stats?.bestScore?.toString() ?? "0"}/10
              </p>
              <p className="text-white/60 text-sm">Meilleur score</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <p className="text-purple-400 font-black text-3xl">
                {stats?.totalWinnings
                  ? (Number(stats.totalWinnings) / 1e18).toFixed(3)
                  : "0"}
              </p>
              <p className="text-white/60 text-sm">CELO gagnés</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 rounded-2xl p-4"
          >
            <p className="text-white font-bold mb-3">Progression vers le rang suivant</p>
            {(() => {
              const pts = Number(stats?.totalPoints ?? BigInt(0));
              const thresholds = [0, 500, 1000, 2000, 3000, 5000];
              const labels = ["🌱", "🥉", "🥈", "🥇", "💎", "🏆"];
              const currentIdx = thresholds.findLastIndex((t) => pts >= t);
              const nextThreshold = thresholds[currentIdx + 1];
              const currentThreshold = thresholds[currentIdx];
              const progress = nextThreshold
                ? Math.min(((pts - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100)
                : 100;
              return (
                <div>
                  <div className="flex justify-between text-sm text-white/60 mb-2">
                    <span>{labels[currentIdx]} {pts} pts</span>
                    <span>{nextThreshold ? `${labels[currentIdx + 1]} ${nextThreshold} pts` : "MAX"}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <motion.div
                      className="bg-[#FBCD00] h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </div>
              );
            })()}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <button
              onClick={() => router.push("/quiz")}
              className="w-full bg-[#FBCD00] text-[#1A1A2E] font-black text-lg py-4 rounded-2xl active:scale-95 transition-all"
            >
              Jouer maintenant 🎮
            </button>
            <button
              onClick={() => router.push("/leaderboard")}
              className="w-full bg-white/10 text-white font-bold text-lg py-4 rounded-2xl active:scale-95 transition-all"
            >
              🏆 Leaderboard
            </button>
          </motion.div>
        </div>
      )}
    </main>
  );
}