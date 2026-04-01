"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.prefetch("/quiz");
    }
  }, [isConnected, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A2E] px-6">

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-32 h-32 rounded-full bg-[#FBCD00] flex items-center justify-center mb-4 shadow-lg">
          <span className="text-6xl font-black text-white">Q</span>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tight">
          Trivia<span className="text-[#FBCD00]">Q</span>
        </h1>
        <p className="text-[#35D07F] mt-2 text-lg font-medium">
          Play. Learn. Earn on Celo.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-10">
        <div className="flex flex-col items-center bg-white/10 rounded-2xl px-6 py-4">
          <span className="text-2xl font-bold text-[#FBCD00]">$5,000</span>
          <span className="text-white/60 text-sm">Prize Pool</span>
        </div>
        <div className="flex flex-col items-center bg-white/10 rounded-2xl px-6 py-4">
          <span className="text-2xl font-bold text-[#35D07F]">50</span>
          <span className="text-white/60 text-sm">Winners</span>
        </div>
        <div className="flex flex-col items-center bg-white/10 rounded-2xl px-6 py-4">
          <span className="text-2xl font-bold text-white">26</span>
          <span className="text-white/60 text-sm">Days left</span>
        </div>
      </div>

      {/* Connect Wallet */}
      <div className="mb-6">
        <ConnectButton label="Connect Wallet to Play" />
      </div>

      {/* Play Button */}
      {isConnected && (
        <button
          onClick={() => router.push("/quiz")}
          className="w-full max-w-xs bg-[#FBCD00] hover:bg-[#f0c000] text-[#1A1A2E] font-black text-xl py-4 rounded-2xl transition-all active:scale-95 shadow-lg"
        >
          Play Now 🎮
        </button>
      )}

      {/* Footer */}
      <p className="mt-12 text-white/30 text-sm">
        Powered by Celo blockchain
      </p>
    </main>
  );
}