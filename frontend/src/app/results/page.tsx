"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address } = useAccount();
  const t = useTranslations("results");
  const [submitted, setSubmitted] = useState(false);

  const score = parseInt(searchParams.get("score") ?? "0");
  const total = parseInt(searchParams.get("total") ?? "10");
  const points = parseInt(searchParams.get("points") ?? "0");
  const percentage = Math.round((score / total) * 100);

  useEffect(() => {
    if (!address || submitted) return;
    const submitScore = async () => {
      try {
        await fetch("/api/submit-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ player: address, score, points }),
        });
        setSubmitted(true);
      } catch (error) {
        console.error("Failed to submit score:", error);
      }
    };
    submitScore();
  }, [address, score, points, submitted]);

  const getPerf = () => {
    if (percentage === 100) return { label: t("perfect"), color: "text-[#FBCD00]", glow: "#FBCD00", emoji: "🏆" };
    if (percentage >= 80) return { label: t("excellent"), color: "text-[#35D07F]", glow: "#35D07F", emoji: "🎉" };
    if (percentage >= 60) return { label: t("good"), color: "text-blue-400", glow: "#60a5fa", emoji: "👏" };
    return { label: t("keepGoing"), color: "text-white", glow: "#ffffff", emoji: "💪" };
  };

  const perf = getPerf();

  const shareOnTwitter = () => {
    const text = `${perf.emoji} Je viens de scorer ${score}/${total} (${percentage}%) sur TriviaQ!\n\n🔥 ${points} points gagnés sur @Celo\n🌍 Questions sur l'Afrique, le Web3 et la culture\n\nJoue et gagne du vrai $CELO 👇\ntrivia-quest-eight.vercel.app\n\n#Celo #Web3Africa #TriviaQ #GameFi`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareOnFarcaster = () => {
    const text = `${perf.emoji} Je viens de scorer ${score}/${total} (${percentage}%) sur TriviaQ!\n\n🔥 ${points} points gagnés sur @celo\n🌍 Questions sur l'Afrique, le Web3 et la culture\n\nJoue et gagne du vrai $CELO 👇\ntrivia-quest-eight.vercel.app\n\n/celo /web3 /gamefi`;
    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, #1a2744 0%, #0a0b0f 60%)" }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm z-10"
      >
        {/* Score card — like a tx receipt */}
        <div className="rounded-2xl border border-white/8 overflow-hidden mb-3"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)" }}
        >
          {/* Top accent */}
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${perf.glow}, transparent)` }} />

          <div className="p-6 text-center">
            {/* Score ring */}
            <div className="relative w-28 h-28 mx-auto mb-4">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={perf.glow} strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - percentage / 100) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white font-black text-2xl">{score}/{total}</span>
                <span className="text-white/40 text-xs">{percentage}%</span>
              </div>
            </div>

            <p className={`font-black text-2xl mb-1 ${perf.color}`}>{perf.emoji} {perf.label}</p>
            <p className="text-white/40 text-sm">{t("correctAnswers", { score, total })}</p>
          </div>

          {/* Stats row */}
          <div className="border-t border-white/5 grid grid-cols-2 divide-x divide-white/5">
            <div className="p-4 text-center">
              <p className="text-[#FBCD00] font-black text-xl">{points}</p>
              <p className="text-white/40 text-xs">Points earned</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-[#35D07F] font-black text-xl">{percentage}%</p>
              <p className="text-white/40 text-xs">Accuracy</p>
            </div>
          </div>

          {/* Blockchain confirmation */}
          {submitted && (
            <div className="border-t border-white/5 px-4 py-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#35D07F] animate-pulse" />
              <p className="text-[#35D07F] text-xs font-bold">Score recorded on Celo blockchain</p>
            </div>
          )}
        </div>

        {/* Eligible banner */}
        {percentage >= 60 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-[#35D07F]/20 p-3 mb-3 flex items-center gap-3"
            style={{ background: "rgba(53,208,127,0.06)" }}
          >
            <span className="text-xl">🎯</span>
            <div>
              <p className="text-[#35D07F] font-bold text-sm">{t("eligible")}</p>
              <p className="text-white/40 text-xs">{t("eligibleDesc")}</p>
            </div>
          </motion.div>
        )}

        {/* Share */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button onClick={shareOnTwitter}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/10 text-white font-bold text-sm transition-all active:scale-95"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >𝕏 Twitter</button>
          <button onClick={shareOnFarcaster}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-purple-500/20 text-purple-300 font-bold text-sm transition-all active:scale-95"
            style={{ background: "rgba(168,85,247,0.08)" }}
          >🟣 Farcaster</button>
        </div>

        {address && (
          <p className="text-white/20 text-xs text-center mb-3">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button onClick={() => router.push("/quiz")}
            className="w-full font-black text-base py-4 rounded-2xl active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg, #FBCD00 0%, #f0a500 100%)", color: "#0a0b0f" }}
          >{t("playAgain")} 🎮</button>
          <button onClick={() => router.push("/leaderboard")}
            className="w-full border border-white/10 text-white font-bold py-3 rounded-2xl active:scale-95 transition-all text-sm"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >🏆 Leaderboard</button>
          <button onClick={() => router.push("/")}
            className="w-full text-white/30 font-bold py-2 rounded-2xl active:scale-95 transition-all text-sm"
          >{t("home")}</button>
        </div>
      </motion.div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}