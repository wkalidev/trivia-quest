"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/web3";
import { getRandomQuestions } from "@/lib/questions";
import type { Question } from "@/lib/questions";
import { useTranslations } from "next-intl";

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

export default function QuizPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const t = useTranslations("quiz");
  const [questions, setQuestions] = useState<Question[]>([]);
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
    setQuestions(getRandomQuestions(10));
  }, []);

  const handleNext = useCallback(() => {
    if (questions.length === 0) return;
    setSelected((prev) => {
      const isCorrect = prev === questions[current]?.answer;
      setTimer(15);
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
    const t = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, joined, finished, questions, handleNext]);

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

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const multiplier = getMultiplier(newStreak);
      const points = 100 * multiplier;
      setTotalPoints((p) => p + points);
      setScore((s) => s + 1);

      if (multiplier > 1) {
        setBonusText(`+${points} pts ${getStreakLabel(newStreak)}`);
        setShowBonus(true);
        setTimeout(() => setShowBonus(false), 1500);
      }
    } else {
      setStreak(0);
    }

    setTimeout(() => handleNext(), 1200);
  };

  if (!joined) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A2E] px-6">
        <div className="bg-white/10 rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="text-white font-black text-2xl mb-2">{t("joinTitle")}</h2>
          <p className="text-white/60 mb-6">
            {t("entryFee")} : <span className="text-[#FBCD00] font-bold">0.01 CELO</span>
          </p>
          <ul className="text-left text-white/70 text-sm mb-8 space-y-2">
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
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#1A1A2E]">
        <p className="text-white">Chargement...</p>
      </main>
    );
  }

  const q = questions[current];
  const multiplier = getMultiplier(streak);

  return (
    <main className="min-h-screen flex flex-col bg-[#1A1A2E] px-6 pt-10 relative overflow-hidden">

      {/* Bonus popup */}
      {showBonus && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-[#FBCD00] text-[#1A1A2E] font-black text-lg px-6 py-3 rounded-2xl shadow-lg">
            {bonusText}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-white/60 text-sm">
          {t("question")} {current + 1}/{questions.length}
        </span>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${timer <= 5 ? "bg-red-500" : "bg-[#FBCD00]"} text-[#1A1A2E]`}>
          {timer}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[#35D07F] font-bold text-sm">{t("score")}: {score}</span>
          <span className="text-[#FBCD00] text-xs font-bold">{totalPoints} pts</span>
        </div>
      </div>

      {/* Streak bar */}
      <div className="flex items-center gap-2 mb-3">
        {streak > 0 && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
            multiplier >= 3 ? "bg-red-500 text-white" :
            multiplier >= 2 ? "bg-orange-500 text-white" :
            "bg-white/10 text-white"
          }`}>
            {getStreakLabel(streak)} — {streak} combo
          </div>
        )}
        {multiplier > 1 && (
          <div className="bg-[#FBCD00] text-[#1A1A2E] px-2 py-1 rounded-full text-xs font-black">
            x{multiplier}
          </div>
        )}
      </div>

      {/* Catégorie */}
      <div className="mb-3">
        <span className="text-xs text-white/40 bg-white/10 px-3 py-1 rounded-full">
          {q.category}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-2 mb-6">
        <div
          className="bg-[#FBCD00] h-2 rounded-full transition-all"
          style={{ width: `${(current / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white/10 rounded-3xl p-6 mb-6">
        <p className="text-white font-bold text-xl leading-relaxed">
          {q.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {q.options.map((opt, idx) => {
          let style = "bg-white/10 text-white";
          if (selected !== null) {
            if (idx === q.answer) style = "bg-[#35D07F] text-white";
            else if (idx === selected) style = "bg-red-500 text-white";
          }
          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full ${style} font-medium text-left px-6 py-4 rounded-2xl transition-all active:scale-95`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </main>
  );
}