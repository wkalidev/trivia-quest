"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CHECKIN_ADDRESS = (process.env.NEXT_PUBLIC_CHECKIN_ADDRESS ?? "0x0") as `0x${string}`;

const CHECKIN_ABI = [
  {
    name: "checkIn",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "categoryId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getPlayerData",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [
      { name: "lastCheckIn", type: "uint256" },
      { name: "streak", type: "uint256" },
      { name: "totalCheckIns", type: "uint256" },
      { name: "checkInAvailable", type: "bool" },
      { name: "secondsUntilNext", type: "uint256" },
    ],
  },
] as const;

const CATEGORIES = [
  { id: 1, name: "Africa Explorer", emoji: "🌍", color: "#F59E0B", desc: "Géographie Africaine" },
  { id: 2, name: "Crypto Master", emoji: "⛓", color: "#8B5CF6", desc: "Web3 & Crypto" },
  { id: 3, name: "Culture Keeper", emoji: "📜", color: "#D97706", desc: "Histoire & Culture" },
  { id: 4, name: "Tech Wizard", emoji: "⚡", color: "#06B6D4", desc: "Science & Tech" },
  { id: 5, name: "Sport Champion", emoji: "🏆", color: "#EF4444", desc: "Sports" },
  { id: 6, name: "Trivia Legend", emoji: "✨", color: "#35D07F", desc: "Culture Générale" },
];

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function CheckInPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: playerData, refetch } = useReadContract({
    address: CHECKIN_ADDRESS,
    abi: CHECKIN_ABI,
    functionName: "getPlayerData",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const { writeContract, isPending } = useWriteContract();

  const streak = Number(playerData?.[1] ?? 0);
  const totalCheckIns = Number(playerData?.[2] ?? 0);
  const canCheckIn = playerData?.[3] ?? true;
  const secondsUntilNext = Number(playerData?.[4] ?? 0);

  // Countdown timer
  useEffect(() => {
    if (!canCheckIn && secondsUntilNext > 0) {
      setCountdown(secondsUntilNext);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(interval); refetch(); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [canCheckIn, secondsUntilNext, refetch]);

  const handleCheckIn = () => {
    if (!selectedCategory) return;
    writeContract({
      address: CHECKIN_ADDRESS,
      abi: CHECKIN_ABI,
      functionName: "checkIn",
      args: [BigInt(selectedCategory)],
      chain: undefined,
      account: undefined,
    }, {
      onSuccess: () => {
        setShowSuccess(true);
        refetch();
        setTimeout(() => setShowSuccess(false), 3000);
      }
    });
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, #1a2744 0%, #0a0b0f 60%)" }}
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
          <div>
            <h1 className="text-white font-black text-2xl tracking-tight">Daily Check-in 🔥</h1>
            <p className="text-white/30 text-xs mt-0.5">Earn $TRIVQ + NFT badges every day</p>
          </div>
        </div>

        {/* Success popup */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl border border-[#35D07F]/30 p-4 mb-4 text-center"
              style={{ background: "rgba(53,208,127,0.1)" }}
            >
              <p className="text-[#35D07F] font-black text-lg">✅ Check-in réussi !</p>
              <p className="text-white/60 text-sm mt-1">
                +100 TRIVQ{streak === 7 ? " + 2000 TRIVQ BONUS 🎉" : ""} + NFT Badge mintés !
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streak card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/8 p-5 mb-4"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/40 text-xs mb-1">Current Streak</p>
              <div className="flex items-center gap-2">
                <span className="text-[#FBCD00] font-black text-4xl">{streak}</span>
                <span className="text-2xl">{streak >= 7 ? "🔥🔥🔥" : streak >= 3 ? "🔥🔥" : streak >= 1 ? "🔥" : ""}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs mb-1">Total Check-ins</p>
              <p className="text-white font-black text-2xl">{totalCheckIns}</p>
            </div>
          </div>

          {/* Streak progress — 7 jours */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-white/30 mb-2">
              <span>Week progress</span>
              <span>{Math.min(streak % 7 || (streak > 0 && streak % 7 === 0 ? 7 : 0), 7)}/7 → 2000 TRIVQ bonus</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => {
                const dayStreak = streak % 7 || (streak > 0 && streak % 7 === 0 ? 7 : 0);
                const filled = i < dayStreak;
                return (
                  <div key={i} className="flex-1 h-2 rounded-full transition-all"
                    style={{ background: filled ? "#FBCD00" : "rgba(255,255,255,0.08)" }}
                  />
                );
              })}
            </div>
          </div>

          {/* Rewards info */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-xl p-2 text-center"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p className="text-[#FBCD00] font-black text-sm">+100 TRIVQ</p>
              <p className="text-white/30 text-xs">per day</p>
            </div>
            <div className="rounded-xl p-2 text-center border border-[#FBCD00]/20"
              style={{ background: "rgba(251,205,0,0.06)" }}
            >
              <p className="text-[#FBCD00] font-black text-sm">+2000 TRIVQ</p>
              <p className="text-white/30 text-xs">day 7 bonus 🎁</p>
            </div>
          </div>
        </motion.div>

        {/* Category selector */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/8 p-4 mb-4"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <p className="text-white/40 text-xs mb-3">Choose your badge category</p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="rounded-xl p-3 text-center transition-all border"
                style={{
                  background: selectedCategory === cat.id
                    ? `${cat.color}22`
                    : "rgba(255,255,255,0.03)",
                  borderColor: selectedCategory === cat.id
                    ? `${cat.color}66`
                    : "rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-xl mb-1">{cat.emoji}</p>
                <p className="text-white text-xs font-bold leading-tight">{cat.name.split(" ")[0]}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Check-in button or countdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {canCheckIn ? (
            <button
              onClick={handleCheckIn}
              disabled={isPending || !selectedCategory}
              className="w-full font-black text-lg py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: selectedCategory
                  ? "linear-gradient(135deg, #FBCD00 0%, #f0a500 100%)"
                  : "rgba(255,255,255,0.06)",
                color: selectedCategory ? "#0a0b0f" : "rgba(255,255,255,0.3)"
              }}
            >
              {isPending ? "Minting..." : selectedCategory ? "✅ Check-in & Mint Badge" : "Select a category first"}
            </button>
          ) : (
            <div className="rounded-2xl border border-white/8 p-4 text-center"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p className="text-white/40 text-sm mb-1">Next check-in available in</p>
              <p className="text-[#FBCD00] font-black text-3xl font-mono">
                {formatCountdown(countdown)}
              </p>
            </div>
          )}
        </motion.div>

        {/* NFT info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 rounded-2xl border border-purple-500/20 p-4"
          style={{ background: "rgba(168,85,247,0.06)" }}
        >
          <p className="text-purple-300 font-bold text-sm mb-1">🎨 NFT Badges</p>
          <p className="text-white/40 text-xs">Each check-in mints a unique NFT badge from your chosen category. 150 unique designs on Celo mainnet.</p>
        </motion.div>

        {/* Nav */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => router.push("/quiz")}
            className="py-3 rounded-2xl border border-white/8 text-white/70 font-bold text-sm transition-all"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >🎮 Play Quiz</button>
          <button onClick={() => router.push("/profile")}
            className="py-3 rounded-2xl border border-white/8 text-white/70 font-bold text-sm transition-all"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >👤 My Profile</button>
        </div>
      </div>
    </main>
  );
}