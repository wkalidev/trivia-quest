"use client";
import { useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CONTRACT_ABI, getContractAddress } from "@/lib/contract";
import { formatUnits } from "viem";
import { useChainId } from "wagmi";

const STATS = [
  { label: "Questions", value: "1200+", icon: "❓", color: "#FBCD00" },
  { label: "Categories", value: "6", icon: "🎯", color: "#35D07F" },
  { label: "Languages", value: "8", icon: "🌍", color: "#8B5CF6" },
  { label: "NFT Badges", value: "150", icon: "🎨", color: "#EF4444" },
  { label: "Contracts", value: "9", icon: "📜", color: "#06B6D4" },
  { label: "Chains", value: "2", icon: "⛓", color: "#FBCD00" },
]

const CONTRACTS = [
  { name: "TriviaQuest v3", address: "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb", chain: "Celo" },
  { name: "TRIVQ Token v2", address: "0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5", chain: "Celo" },
  { name: "DailyCheckIn v2", address: "0x8650e6c477f8ae3933dc6d61d85e65c90cf71828", chain: "Celo" },
  { name: "TriviaDuel v1", address: "0xee7be00cd5454b9bea56d864d82076b8b5de5ca1", chain: "Celo" },
  { name: "Referral v2", address: "0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e", chain: "Celo" },
]

const TEAM = [
  { role: "Builder", handle: "@wkalidev", link: "https://github.com/wkalidev" },
]

export default function AboutPage() {
  const router = useRouter()
  const chainId = useChainId()
  const CONTRACT_ADDRESS = getContractAddress(chainId, "game")

  const { data: totalPlayers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTotalPlayers",
  })

  const { data: currentRound } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getCurrentRound",
  })

  const players = totalPlayers ? totalPlayers.toString() : "..."
  const prizePool = currentRound ? parseFloat(formatUnits(currentRound[1], 18)).toFixed(3) : "..."

  return (
    <main className="min-h-screen px-4 pt-20 pb-12 relative"
      style={{ background: "linear-gradient(160deg, #0a0f1e 0%, #050709 50%, #0a0f1e 100%)" }}>

      {/* Back button */}
      <button onClick={() => router.push("/")}
        className="fixed top-4 left-4 z-50 w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
        style={{ background: "rgba(255,255,255,0.04)" }}>←</button>

      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center">
          <h1 className="text-white font-black text-3xl tracking-tight mb-2">
            About <span className="text-[#FBCD00]">TriviaQ</span>
          </h1>
          <p className="text-white/40 text-sm">Play. Learn. Earn on Celo & Base.</p>
        </motion.div>

        {/* Live stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 border border-white/8"
          style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-white/40 text-xs mb-4 uppercase tracking-wider">Live On-Chain Stats</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(251,205,0,0.06)", border: "1px solid rgba(251,205,0,0.15)" }}>
              <p className="text-[#FBCD00] font-black text-2xl">{players}</p>
              <p className="text-white/40 text-xs mt-1">Total Players</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(53,208,127,0.06)", border: "1px solid rgba(53,208,127,0.15)" }}>
              <p className="text-[#35D07F] font-black text-2xl">{prizePool}</p>
              <p className="text-white/40 text-xs mt-1">Prize Pool (CELO)</p>
            </div>
          </div>
        </motion.div>

        {/* Static stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="grid grid-cols-3 gap-3">
            {STATS.map((s, i) => (
              <div key={i} className="rounded-2xl p-4 text-center border border-white/8"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="font-black text-xl" style={{ color: s.color }}>{s.value}</p>
                <p className="text-white/30 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mission */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-5 border border-[#FBCD00]/20"
          style={{ background: "rgba(251,205,0,0.04)" }}>
          <p className="text-[#FBCD00] font-bold text-sm mb-2">🌍 Mission</p>
          <p className="text-white/60 text-sm leading-relaxed">
            57% of African adults lack bank accounts but own smartphones. TriviaQ brings fun, education, and real micro-rewards to the unbanked — fully playable inside MiniPay with zero-click wallet connect.
          </p>
        </motion.div>

        {/* Smart Contracts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl p-5 border border-white/8"
          style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-white/40 text-xs mb-4 uppercase tracking-wider">Smart Contracts · Celo Mainnet</p>
          <div className="space-y-2">
            {CONTRACTS.map((c, i) => (
              <a key={i} href={`https://celoscan.io/address/${c.address}`} target="_blank" rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <p className="text-white text-sm font-bold">{c.name}</p>
                  <p className="text-white/30 text-xs font-mono">{c.address.slice(0, 10)}...{c.address.slice(-8)}</p>
                </div>
                <span className="text-white/20 text-xs">{c.chain} ↗</span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Reward system */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-5 border border-[#35D07F]/20"
          style={{ background: "rgba(53,208,127,0.04)" }}>
          <p className="text-[#35D07F] font-bold text-sm mb-3">🔥 Reward System</p>
          <div className="space-y-2">
            {[
              { action: "Per point scored", reward: "100 TRIVQ" },
              { action: "Daily check-in", reward: "100 TRIVQ" },
              { action: "7-day streak bonus", reward: "2,000 TRIVQ" },
              { action: "Referral", reward: "500 TRIVQ" },
              { action: "Duel winner", reward: "90% of wager" },
            ].map((r, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-white/50 text-sm">{r.action}</span>
                <span className="text-[#35D07F] font-bold text-sm">{r.reward}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Author */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl p-5 border border-white/8 text-center"
          style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">Built by</p>
          <a href="https://github.com/wkalidev" target="_blank" rel="noreferrer"
            className="text-[#FBCD00] font-black text-lg hover:underline">
            @wkalidev
          </a>
          <p className="text-white/30 text-xs mt-1">zcodebase.eth · Celo Proof of Ship 2026</p>
        </motion.div>

        {/* CTA */}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          onClick={() => router.push("/quiz")}
          className="w-full py-4 rounded-2xl font-black text-lg"
          style={{ background: "linear-gradient(135deg, #FBCD00, #f0a500)", color: "#0a0f1e" }}>
          🎮 Play Now
        </motion.button>
      </div>
    </main>
  )
}