"use client";

import { useAccount, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { getContractAddress } from "@/lib/contract";
import { useChainId } from "wagmi";
import { formatUnits } from "viem";

const REFERRAL_ABI = [
  {
    name: "getReferralStats",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "referralCount", type: "uint256" },
      { name: "totalEarned", type: "uint256" },
    ],
  },
] as const;

export default function ReferralPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [copied, setCopied] = useState(false);

  const REFERRAL_ADDRESS = getContractAddress(chainId, "referral");

  const { data: stats } = useReadContract({
    address: REFERRAL_ADDRESS,
    abi: REFERRAL_ABI,
    functionName: "getReferralStats",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const referralLink = address
    ? `https://trivia-quest-eight.vercel.app?ref=${address}`
    : null;

  const copyLink = useCallback(() => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [referralLink]);

  const shareOnFarcaster = () => {
    const text = encodeURIComponent(`🎮 Play TriviaQ and earn $TRIVQ tokens on Celo!\n\nAnswer questions, win prizes, check in daily.\n\n${referralLink}`)
    window.open(`https://warpcast.com/~/compose?text=${text}`, "_blank")
  }

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`🎮 Play TriviaQ and earn $TRIVQ tokens on Celo!\n\nAnswer questions, win prizes, check in daily 🔥\n\n${referralLink}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank")
  }

  const referralCount = stats ? Number(stats[0]) : 0
  const totalEarned = stats ? parseFloat(formatUnits(stats[1], 18)).toFixed(0) : "0"

  return (
    <main className="min-h-screen px-4 pt-6 pb-12 relative"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, #1a2744 0%, #0a0b0f 60%)" }}>

      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="max-w-md mx-auto w-full z-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push("/")}
            className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.04)" }}>←</button>
          <div>
            <h1 className="text-white font-black text-2xl tracking-tight">🔗 Invite & Earn</h1>
            <p className="text-white/30 text-xs mt-0.5">500 TRIVQ per referral</p>
          </div>
        </div>

        {/* Stats */}
        {isConnected && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl p-4 text-center border border-[#FBCD00]/20"
              style={{ background: "rgba(251,205,0,0.06)" }}>
              <p className="text-[#FBCD00] font-black text-3xl">{referralCount}</p>
              <p className="text-white/40 text-xs mt-1">Friends Invited</p>
            </div>
            <div className="rounded-2xl p-4 text-center border border-[#35D07F]/20"
              style={{ background: "rgba(53,208,127,0.06)" }}>
              <p className="text-[#35D07F] font-black text-3xl">{totalEarned}</p>
              <p className="text-white/40 text-xs mt-1">TRIVQ Earned</p>
            </div>
          </motion.div>
        )}

        {/* How it works */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 border border-white/8 mb-4"
          style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-white/40 text-xs mb-4 uppercase tracking-wider">How it works</p>
          <div className="space-y-3">
            {[
              { step: "1", text: "Copy your unique referral link", icon: "🔗" },
              { step: "2", text: "Share it with friends", icon: "📤" },
              { step: "3", text: "They play their first game", icon: "🎮" },
              { step: "4", text: "You both earn 500 TRIVQ!", icon: "💰" },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: "rgba(251,205,0,0.15)", color: "#FBCD00" }}>{s.step}</div>
                <span className="text-white/60 text-sm">{s.icon} {s.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Referral link */}
        {isConnected && referralLink ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl p-4 border border-white/8 mb-4"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">Your referral link</p>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl px-3 py-2 text-xs font-mono text-white/50 overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {referralLink}
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={copyLink}
                className="px-4 py-2 rounded-xl font-bold text-sm flex-shrink-0 transition-all"
                style={{
                  background: copied ? "rgba(53,208,127,0.15)" : "rgba(251,205,0,0.1)",
                  border: copied ? "1px solid rgba(53,208,127,0.3)" : "1px solid rgba(251,205,0,0.3)",
                  color: copied ? "#35D07F" : "#FBCD00",
                }}>
                {copied ? "✅ Copied!" : "Copy"}
              </motion.button>
            </div>
          </motion.div>
        ) : !isConnected ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl p-5 border border-white/8 mb-4 text-center"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-white/40 text-sm">Connect your wallet to get your referral link</p>
          </motion.div>
        ) : null}

        {/* Share buttons */}
        {isConnected && referralLink && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={shareOnFarcaster}
              className="py-3 rounded-2xl font-bold text-sm transition-all"
              style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "#A78BFA" }}>
              🟣 Share on Warpcast
            </button>
            <button onClick={shareOnTwitter}
              className="py-3 rounded-2xl font-bold text-sm transition-all"
              style={{ background: "rgba(29,161,242,0.1)", border: "1px solid rgba(29,161,242,0.3)", color: "#60A5FA" }}>
              𝕏 Share on Twitter
            </button>
          </motion.div>
        )}

        {/* Reward info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="rounded-2xl p-4 border border-[#35D07F]/20"
          style={{ background: "rgba(53,208,127,0.04)" }}>
          <p className="text-[#35D07F] font-bold text-sm mb-2">💎 Referral Rewards</p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">You earn</span>
              <span className="text-[#35D07F] font-bold">500 TRIVQ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Your friend earns</span>
              <span className="text-[#35D07F] font-bold">500 TRIVQ</span>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}