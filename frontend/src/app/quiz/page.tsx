"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/web3";
import { getRandomQuestions, getQuestionsByCategory, CATEGORIES } from "@/lib/questions";
import type { Question } from "@/lib/questions";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useGameSounds } from "@/hooks/useGameSounds";

type WriteContractParams = {
  address: `0x${string}`;
  abi: typeof CONTRACT_ABI;
  functionName: "joinRound";
  value: bigint;
  chain: undefined;
  account: `0x${string}` | undefined;
};

function getMultiplier(streak: number): number {
  if (streak >= 5) return 3;
  if (streak >= 3) return 2;
  return 1;
}

function getStreakLabel(streak: number): string {
  if (streak >= 5) return "🔥🔥🔥 x3 MEGA";
  if (streak >= 3) return "🔥🔥 x2 HOT";
  if (streak >= 1) return "🔥 Streak";
  return "";
}

function getCategoryEmoji(cat: string): string {
  if (cat === "Géographie Africaine") return "🌍";
  if (cat === "Web3 & Crypto") return "💰";
  if (cat === "Histoire & Culture") return "📖";
  if (cat === "Science & Tech") return "🔬";
  if (cat === "Sports") return "⚽";
  return "🧠";
}

export default function QuizPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const t = useTranslations("quiz");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timer, setTimer] = useState(15);
  const [joined, setJoined] = useState(false);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showBonus, setShowBonus] = useState(false);
  const [bonusText, setBonusText] = useState("");
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { playCorrect, playWrong, playStreak, playTick } = useGameSounds();
  const { writeContract, isPending } = useWriteContract();

  const { data: entryFee } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "entryFee",
  });

  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

  useEffect(() => {
    if (selectedCategory === "all") {
      setQuestions(getRandomQuestions(10));
    } else {
      setQuestions(getQuestionsByCategory(selectedCategory, 10));
    }
  }, [selectedCategory]);

  const handleNext = useCallback(() => {
    if (questions.length === 0) return;
    setSelected((prev) => {
      const isCorrect = prev === questions[current]?.answer;
      setTimer(15);
      setIsCorrectAnswer(null);
      if (current + 1 >= questions.length) {
        setFinished(true);
        router.push(
          `/results?score=${score + (isCorrect ? 1 : 0)}&total=${questions.length}&points=${totalPoints}`
        );
      } else {
        setCurrent((c) => c + 1);
      }
      return null;
    });
  }, [questions, current, score, totalPoints, router]);

  useEffect(() => {
    if (!joined || finished || questions.length === 0) return;
    if (timer === 0) {
      handleNext();
      return;
    }
    if (timer <= 5 && soundEnabled) playTick();
    const tick = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(tick);
  }, [timer, joined, finished, questions, handleNext, playTick, soundEnabled]);

  const handleJoin = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "joinRound",
      value: entryFee ?? parseEther("0.01"),
      chain: undefined,
      account: address,
    } as WriteContractParams, {
      onSuccess: () => setJoined(true),
    });
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null || questions.length === 0) return;
    setSelected(idx);
    const isCorrect = idx === questions[current].answer;
    setIsCorrectAnswer(isCorrect);

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const multiplier = getMultiplier(newStreak);
      const points = 100 * multiplier;
      setTotalPoints((p) => p + points);
      setScore((s) => s + 1);
      if (multiplier > 1) {
        if (soundEnabled) playStreak();
        setBonusText(`+${points} pts ${getStreakLabel(newStreak)}`);
        setShowBonus(true);
        setTimeout(() => setShowBonus(false), 1500);
      } else {
        if (soundEnabled) playCorrect();
      }
    } else {
      if (soundEnabled) playWrong();
      setStreak(0);
    }

    setTimeout(() => handleNext(), 1200);
  };

  if (!joined) {
    return (
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A2E] px-6 py-12"
      >
        <div className="bg-white/10 rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="text-white font-black text-2xl mb-2">{t("joinTitle")}</h2>
          <p className="text-white/60 mb-4">
            {t("entryFee")} : <span className="text-[#FBCD00] font-bold">0.01 CELO</span>
          </p>

          {/* Category selector */}
          <div className="mb-6">
            <p className="text-white/60 text-sm mb-3 text-left font-bold">
              🎯 Choisir une catégorie :
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedCategory === "all"
                    ? "bg-[#FBCD00] text-[#1A1A2E]"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                🌐 Toutes
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                    selectedCategory === cat
                      ? "bg-[#FBCD00] text-[#1A1A2E]"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {getCategoryEmoji(cat)} {cat.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <ul className="text-left text-white/70 text-sm mb-6 space-y-2">
            <li>✅ {t("feature1")}</li>
            <li>✅ {t("feature2")}</li>
            <li>✅ {t("feature3")}</li>
            <li>🔥 Streak x2 / x3 bonus multiplier !</li>
          </ul>

          <button
            onClick={handleJoin}
            disabled={isPending}
            className="w-full bg-[#FBCD00] text-[#1A1A2E] font-black text-lg py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-50"
          >
            {isPending ? t("loading") : t("playButton")}
          </button>
        </div>
      </motion.main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#1A1A2E]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-[#FBCD00] border-t-transparent rounded-full"
        />
      </main>
    );
  }

  const q = questions[current];
  const multiplier = getMultiplier(streak);

  return (
    <main className="min-h-screen flex flex-col bg-[#1A1A2E] px-6 pt-10 relative overflow-hidden">

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 text-white/40 hover:text-white text-xl z-20"
      >
        {soundEnabled ? "🔊" : "🔇"}
      </button>

      {/* Flash background */}
      <AnimatePresence>
        {isCorrectAnswer !== null && (
          <motion.div
            key={isCorrectAnswer ? "correct" : "wrong"}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`absolute inset-0 z-10 pointer-events-none ${
              isCorrectAnswer ? "bg-green-500" : "bg-red-500"
            }`}
          />
        )}
      </AnimatePresence>

      {/* Bonus popup */}
      <AnimatePresence>
        {showBonus && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.8 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-[#FBCD00] text-[#1A1A2E] font-black text-lg px-6 py-3 rounded-2xl shadow-lg">
              {bonusText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-white/60 text-sm">
          {t("question")} {current + 1}/{questions.length}
        </span>
        <motion.div
          key={timer}
          animate={timer <= 5 ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${
            timer <= 5 ? "bg-red-500" : "bg-[#FBCD00]"
          } text-[#1A1A2E]`}
        >
          {timer}
        </motion.div>
        <div className="flex flex-col items-end">
          <span className="text-[#35D07F] font-bold text-sm">{t("score")}: {score}</span>
          <motion.span
            key={totalPoints}
            initial={{ scale: 1.3, color: "#FBCD00" }}
            animate={{ scale: 1 }}
            className="text-[#FBCD00] text-xs font-bold"
          >
            {totalPoints} pts
          </motion.span>
        </div>
      </div>

      {/* Streak bar */}
      <AnimatePresence>
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-2 mb-3"
          >
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
              multiplier >= 3 ? "bg-red-500 text-white" :
              multiplier >= 2 ? "bg-orange-500 text-white" :
              "bg-white/10 text-white"
            }`}>
              {getStreakLabel(streak)} — {streak} combo
            </div>
            {multiplier > 1 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="bg-[#FBCD00] text-[#1A1A2E] px-2 py-1 rounded-full text-xs font-black"
              >
                x{multiplier}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Catégorie active */}
      <div className="mb-3">
        <span className="text-xs text-white/40 bg-white/10 px-3 py-1 rounded-full">
          {getCategoryEmoji(q.category)} {q.category}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-2 mb-6">
        <motion.div
          className="bg-[#FBCD00] h-2 rounded-full"
          animate={{ width: `${(current / questions.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-white/10 rounded-3xl p-6 mb-6"
        >
          <p className="text-white font-bold text-xl leading-relaxed">
            {q.question}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <AnimatePresence mode="wait">
        <motion.div key={current} className="space-y-3">
          {q.options.map((opt, idx) => {
            let style = "bg-white/10 text-white hover:bg-white/20";
            if (selected !== null) {
              if (idx === q.answer) style = "bg-[#35D07F] text-white";
              else if (idx === selected) style = "bg-red-500 text-white";
              else style = "bg-white/5 text-white/40";
            }
            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAnswer(idx)}
                className={`w-full ${style} font-medium text-left px-6 py-4 rounded-2xl transition-all`}
              >
                {opt}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}