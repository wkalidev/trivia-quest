"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Suspense } from "react";
import { useTranslations } from "next-intl";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address } = useAccount();
  const t = useTranslations("results");

  const score = parseInt(searchParams.get("score") ?? "0");
  const total = parseInt(searchParams.get("total") ?? "10");
  const points = parseInt(searchParams.get("points") ?? "0");
  const percentage = Math.round((score / total) * 100);

  const getMessage = () => {
    if (percentage === 100) return { text: t("perfect"), color: "text-[#FBCD00]" };
    if (percentage >= 80) return { text: t("excellent"), color: "text-[#35D07F]" };
    if (percentage >= 60) return { text: t("good"), color: "text-blue-400" };
    return { text: t("keepGoing"), color: "text-white" };
  };

  const msg = getMessage();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A2E] px-6">
      <div className="bg-white/10 rounded-3xl p-8 max-w-sm w-full text-center">

        {/* Score circle */}
        <div className="w-32 h-32 rounded-full bg-[#FBCD00] flex flex-col items-center justify-center mx-auto mb-4">
          <span className="text-4xl font-black text-[#1A1A2E]">{score}/{total}</span>
          <span className="text-[#1A1A2E]/70 text-sm font-medium">{percentage}%</span>
        </div>

        {/* Points */}
        {points > 0 && (
          <div className="bg-[#FBCD00]/20 border border-[#FBCD00]/40 rounded-2xl px-6 py-3 mb-4">
            <p className="text-[#FBCD00] font-black text-2xl">{points} pts</p>
            <p className="text-white/60 text-xs">Total avec multiplicateurs streak</p>
          </div>
        )}

        <h2 className={`font-black text-3xl mb-2 ${msg.color}`}>
          {msg.text}
        </h2>

        <p className="text-white/60 mb-6 text-sm">
          {t("correctAnswers", { score, total })}
        </p>

        {percentage >= 60 && (
          <div className="bg-[#35D07F]/20 border border-[#35D07F]/40 rounded-2xl p-4 mb-6">
            <p className="text-[#35D07F] font-bold text-sm mb-1">
              🎯 {t("eligible")}
            </p>
            <p className="text-white/60 text-xs">
              {t("eligibleDesc")}
            </p>
          </div>
        )}

        {address && (
          <p className="text-white/30 text-xs mb-6 break-all">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push("/quiz")}
            className="w-full bg-[#FBCD00] text-[#1A1A2E] font-black text-lg py-4 rounded-2xl active:scale-95 transition-all"
          >
            {t("playAgain")}
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-white/10 text-white font-bold text-lg py-4 rounded-2xl active:scale-95 transition-all"
          >
            {t("home")}
          </button>
        </div>
      </div>
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