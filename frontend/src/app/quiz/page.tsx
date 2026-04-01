"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/web3";

const QUESTIONS = [
  {
    question: "Quelle est la capitale du Nigeria ?",
    options: ["Lagos", "Abuja", "Kano", "Ibadan"],
    answer: 1,
  },
  {
    question: "Quel pays africain a le plus grand PIB ?",
    options: ["Nigeria", "Afrique du Sud", "Égypte", "Kenya"],
    answer: 0,
  },
  {
    question: "Qu'est-ce que le cUSD sur Celo ?",
    options: ["Un NFT", "Un stablecoin", "Un token de gouvernance", "Un validateur"],
    answer: 1,
  },
  {
    question: "Combien de pays composent l'Afrique ?",
    options: ["48", "52", "54", "58"],
    answer: 2,
  },
  {
    question: "Quel est le fleuve le plus long d'Afrique ?",
    options: ["Congo", "Niger", "Zambèze", "Nil"],
    answer: 3,
  },
];

export default function QuizPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timer, setTimer] = useState(15);
  const [joined, setJoined] = useState(false);
  const [finished, setFinished] = useState(false);

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
    if (!joined || finished) return;
    if (timer === 0) {
      handleNext();
      return;
    }
    const t = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, joined, finished]);

  const handleJoin = () => {
  writeContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "joinRound",
    value: entryFee ?? parseEther("0.01"),
    chain: undefined,
    account: address,
  } as any, {
    onSuccess: () => setJoined(true),
  });
};

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === QUESTIONS[current].answer) {
      setScore((s) => s + 1);
    }
    setTimeout(() => handleNext(), 1000);
  };

  const handleNext = () => {
    setSelected(null);
    setTimer(15);
    if (current + 1 >= QUESTIONS.length) {
      setFinished(true);
      router.push(`/results?score=${score + (selected === QUESTIONS[current].answer ? 1 : 0)}&total=${QUESTIONS.length}`);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  if (!joined) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A2E] px-6">
        <div className="bg-white/10 rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="text-white font-black text-2xl mb-2">Rejoindre la partie</h2>
          <p className="text-white/60 mb-6">
            Mise d'entrée : <span className="text-[#FBCD00] font-bold">0.01 CELO</span>
          </p>
          <ul className="text-left text-white/70 text-sm mb-8 space-y-2">
            <li>✅ 5 questions de culture générale</li>
            <li>✅ 15 secondes par question</li>
            <li>✅ Récompenses en CELO pour les meilleurs</li>
          </ul>
          <button
            onClick={handleJoin}
            disabled={isPending}
            className="w-full bg-[#FBCD00] text-[#1A1A2E] font-black text-lg py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-50"
          >
            {isPending ? "Transaction..." : "Jouer pour 0.01 CELO"}
          </button>
        </div>
      </main>
    );
  }

  const q = QUESTIONS[current];

  return (
    <main className="min-h-screen flex flex-col bg-[#1A1A2E] px-6 pt-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <span className="text-white/60 text-sm">
          Question {current + 1}/{QUESTIONS.length}
        </span>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${timer <= 5 ? "bg-red-500" : "bg-[#FBCD00]"} text-[#1A1A2E]`}>
          {timer}
        </div>
        <span className="text-[#35D07F] font-bold">
          Score: {score}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-2 mb-8">
        <div
          className="bg-[#FBCD00] h-2 rounded-full transition-all"
          style={{ width: `${((current) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white/10 rounded-3xl p-6 mb-8">
        <p className="text-white font-bold text-xl leading-relaxed">
          {q.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-4">
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