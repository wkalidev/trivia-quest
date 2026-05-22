"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatUnits } from "viem";

interface StatsData {
  live_stats: {
    players: number | null;
    round_id: number | null;
    prize_pool_wei: number | null;
    total_checkins: number | null;
    last_updated: string;
  };
  game: {
    questions: number;
    categories: string[];
    languages: string[];
    ai_mode: boolean;
    duel_mode: boolean;
  };
  rewards: Record<string, string>;
  sdk: {
    npm: string;
    version: string;
    weekly_downloads: number;
  };
}

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  async function fetchStats() {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
      setLastRefresh(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const prizePool = stats?.live_stats.prize_pool_wei
    ? parseFloat(formatUnits(BigInt(stats.live_stats.prize_pool_wei), 18)).toFixed(3)
    : "0";

  return (
    <main className="min-h-screen px-4 pt-6 pb-12 relative"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, #1a2744 0%, #0a0b0f 60%)" }}>

      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="max-w-2xl mx-auto w-full z-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push("/")}
            className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.04)" }}>←</button>
          <div className="flex-1">
            <h1 className="text-white font-black text-2xl tracking-tight">📊 Live Stats</h1>
            <p className="text-white/30 text-xs mt-0.5">
              Updated {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={fetchStats}
            className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.04)" }}>↻</motion.button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-2 border-[#FBCD00] border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && stats && (
          <div className="space-y-4">

            {/* Live onchain stats */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">🔴 Live On-Chain</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Players", value: stats.live_stats.players?.toLocaleString() ?? "—", color: "#FBCD00", icon: "👥" },
                  { label: "Prize Pool", value: `${prizePool} CELO`, color: "#35D07F", icon: "🏆" },
                  { label: "Current Round", value: `#${stats.live_stats.round_id ?? "—"}`, color: "#8B5CF6", icon: "🎮" },
                  { label: "Total Check-ins", value: stats.live_stats.total_checkins?.toLocaleString() ?? "—", color: "#06B6D4", icon: "🔥" },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-4 border"
                    style={{ background: `${s.color}08`, borderColor: `${s.color}25` }}>
                    <p className="text-lg mb-1">{s.icon}</p>
                    <p className="font-black text-xl" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-white/40 text-xs mt-1">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Game stats */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl p-5 border border-white/8"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-4">🎮 Game</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Questions", value: stats.game.questions },
                  { label: "Categories", value: stats.game.categories.length },
                  { label: "Languages", value: stats.game.languages.length },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-white font-black text-2xl">{s.value}</p>
                    <p className="text-white/30 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {stats.game.ai_mode && (
                  <span className="text-xs px-2 py-1 rounded-lg font-bold"
                    style={{ background: "rgba(139,92,246,0.15)", color: "#A78BFA", border: "1px solid rgba(139,92,246,0.3)" }}>
                    🤖 AI Mode
                  </span>
                )}
                {stats.game.duel_mode && (
                  <span className="text-xs px-2 py-1 rounded-lg font-bold"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#F87171", border: "1px solid rgba(239,68,68,0.3)" }}>
                    ⚔️ Duel 1v1
                  </span>
                )}
                <span className="text-xs px-2 py-1 rounded-lg font-bold"
                  style={{ background: "rgba(53,208,127,0.15)", color: "#35D07F", border: "1px solid rgba(53,208,127,0.3)" }}>
                  📱 MiniPay
                </span>
                <span className="text-xs px-2 py-1 rounded-lg font-bold"
                  style={{ background: "rgba(251,205,0,0.15)", color: "#FBCD00", border: "1px solid rgba(251,205,0,0.3)" }}>
                  ⛓ Multi-chain
                </span>
              </div>
            </motion.div>

            {/* Rewards */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="rounded-2xl p-5 border border-[#35D07F]/20"
              style={{ background: "rgba(53,208,127,0.04)" }}>
              <p className="text-[#35D07F] font-bold text-sm mb-3">🔥 Reward System</p>
              <div className="space-y-2">
                {Object.entries(stats.rewards).filter(([k]) => k !== 'prize_pool_distribution').map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-white/50 text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-[#35D07F] font-bold text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* SDK */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl p-5 border border-[#8B5CF6]/20"
              style={{ background: "rgba(139,92,246,0.04)" }}>
              <p className="text-purple-400 font-bold text-sm mb-3">📦 Public SDK</p>
              <code className="text-xs text-purple-300 block mb-3 p-2 rounded-lg"
                style={{ background: "rgba(139,92,246,0.1)" }}>
                npm install {stats.sdk.npm}
              </code>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Version</span>
                <span className="text-purple-400 font-bold">v{stats.sdk.version}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-white/40">Weekly downloads</span>
                <span className="text-purple-400 font-bold">{stats.sdk.weekly_downloads}</span>
              </div>
            </motion.div>

            {/* API endpoint */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="rounded-2xl p-4 border border-white/8"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Public API</p>
              <a href="/api/stats" target="_blank" rel="noreferrer"
                className="text-[#FBCD00] text-sm font-mono hover:underline">
                GET /api/stats ↗
              </a>
            </motion.div>

          </div>
        )}
      </div>
    </main>
  );
}