"use client";

import { sdk } from '@farcaster/miniapp-sdk';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import TrivqPrice from "@/components/TrivqPrice";
import type { Locale } from "@/i18n/navigation";
import { formatUnits } from "viem";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";

const TRIVQ_ADDRESS = (process.env.NEXT_PUBLIC_TRIVQ_ADDRESS ?? "0x0") as `0x${string}`;
const TRIVQ_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function formatTrivq(raw: bigint): string {
  const n = Number(formatUnits(raw, 18));
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

function formatCelo(wei: bigint): string {
  const n = Number(formatUnits(wei, 18));
  if (n === 0) return "0";
  if (n < 0.001) return "<0.001";
  return n.toFixed(3);
}

function formatCountdown(endTime: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = Number(endTime) - now;
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

// Animated background patterns
function AfricanPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Kente-inspired geometric grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="kente" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="30" height="30" fill="none" stroke="#FBCD00" strokeWidth="0.5"/>
            <rect x="30" y="30" width="30" height="30" fill="none" stroke="#FBCD00" strokeWidth="0.5"/>
            <line x1="0" y1="30" x2="30" y2="0" stroke="#35D07F" strokeWidth="0.3"/>
            <line x1="30" y1="60" x2="60" y2="30" stroke="#35D07F" strokeWidth="0.3"/>
            <circle cx="15" cy="15" r="3" fill="none" stroke="#FBCD00" strokeWidth="0.3"/>
            <circle cx="45" cy="45" r="3" fill="none" stroke="#FBCD00" strokeWidth="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kente)"/>
      </svg>

      {/* Glowing orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #FBCD00, transparent)" }}
      />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl"
        style={{ background: "radial-gradient(circle, #35D07F, transparent)" }}
      />
      <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full opacity-6 blur-3xl"
        style={{ background: "radial-gradient(circle, #8B5CF6, transparent)" }}
      />
    </div>
  );
}

// Animated pulse ring for LIVE indicator
function LivePulse() {
  return (
    <div className="relative flex items-center gap-2">
      <div className="relative">
        <div className="w-2 h-2 rounded-full bg-[#35D07F]"/>
        <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#35D07F] animate-ping opacity-75"/>
      </div>
      <span className="text-[#35D07F] font-bold text-xs tracking-widest uppercase">Live</span>
    </div>
  );
}

// Action button with hover glow
function ActionButton({
  onClick, children, variant = "default", className = ""
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "gold" | "green" | "purple" | "blue" | "default";
  className?: string;
}) {
  const styles = {
    gold: { bg: "rgba(251,205,0,0.08)", border: "rgba(251,205,0,0.25)", text: "#FBCD00", glow: "#FBCD00" },
    green: { bg: "rgba(53,208,127,0.08)", border: "rgba(53,208,127,0.25)", text: "#35D07F", glow: "#35D07F" },
    purple: { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.25)", text: "#A78BFA", glow: "#8B5CF6" },
    blue: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", text: "#93C5FD", glow: "#3B82F6" },
    default: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", text: "rgba(255,255,255,0.7)", glow: "transparent" },
  };
  const s = styles[variant];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${s.glow}22` }}
      whileTap={{ scale: 0.97 }}
      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-colors ${className}`}
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      {children}
    </motion.button>
  );
}

export default function Home() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { isInMiniPay, miniPayAddress, loading } = useMiniPay();
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;
  const [tick, setTick] = useState(0);

  const isReady = isConnected || !!miniPayAddress;
  const walletAddress = address ?? miniPayAddress;

  const { data: trivqBalance } = useReadContract({
    address: TRIVQ_ADDRESS,
    abi: TRIVQ_ABI,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress as `0x${string}`] : undefined,
    query: { enabled: !!walletAddress && TRIVQ_ADDRESS !== "0x0" },
  });

  const { data: currentRound } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getCurrentRound",
    query: { refetchInterval: 15_000 },
  });

  const { data: totalPlayers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTotalPlayers",
    query: { refetchInterval: 30_000 },
  });

  // Live countdown tick
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const trivqFormatted = trivqBalance ? formatTrivq(trivqBalance as bigint) : "—";
  const prizePool = currentRound ? formatCelo(currentRound[1]) : "0";
  const endTime = currentRound ? currentRound[3] : BigInt(0);
  const countdown = endTime > BigInt(0) ? formatCountdown(endTime) : "—";
  const players = totalPlayers ? totalPlayers.toString() : "0";
  const isExpired = countdown === "Expired";
  const referralLink = address ? `https://trivia-quest-eight.vercel.app?ref=${address}` : null;

  const copyReferral = () => {
    if (referralLink) navigator.clipboard.writeText(referralLink);
  };

  useEffect(() => {
    sdk.actions.ready();
    if (isReady) router.prefetch("/quiz");
  }, [isReady, router]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start px-4 pt-20 pb-8 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0a0f1e 0%, #050709 50%, #0a0f1e 100%)" }}
    >
      <AfricanPattern />

      {/* Top navigation bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3"
        style={{
          background: "rgba(5,7,9,0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(251,205,0,0.08)"
        }}
      >
        <div className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="font-black text-white text-lg tracking-tight">
            Trivia<span className="text-[#FBCD00]">Q</span>
          </span>
          <LivePulse />
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher currentLocale={locale} />
          {!loading && !isInMiniPay && (
            <ConnectButton label={t("connectWallet")} showBalance={false} />
          )}
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-md z-10 space-y-3"
      >
        {/* Hero card — token identity */}
        <motion.div variants={itemVariants}>
          <div
            className="rounded-3xl p-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(251,205,0,0.06) 0%, rgba(53,208,127,0.03) 100%)",
              border: "1px solid rgba(251,205,0,0.15)",
            }}
          >
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10"
              style={{ background: "radial-gradient(circle at top right, #FBCD00, transparent)" }}
            />

            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Logo size={48} />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#35D07F] border-2 border-[#050709] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"/>
                  </div>
                </div>
                <div>
                  <h1 className="text-white font-black text-2xl tracking-tight leading-none">
                    Trivia<span className="text-[#FBCD00]">Q</span>
                  </h1>
                  <p className="text-white/40 text-xs mt-0.5">$TRIVQ · Celo Mainnet</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/20 text-xs mb-1">Network</div>
                <div className="flex items-center gap-1.5 justify-end">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#35D07F] animate-pulse"/>
                  <span className="text-[#35D07F] text-xs font-bold">Mainnet</span>
                </div>
              </div>
            </div>

            {/* Round stats */}
            <div className="grid grid-cols-3 gap-2">
              {/* Prize Pool */}
              <div className="rounded-2xl p-3 text-center relative overflow-hidden"
                style={{ background: "rgba(251,205,0,0.06)", border: "1px solid rgba(251,205,0,0.1)" }}
              >
                <p className="text-[#FBCD00] font-black text-xl leading-none">
                  {prizePool}
                </p>
                <p className="text-[#FBCD00]/40 text-xs mt-1">CELO Pool</p>
              </div>

              {/* Players */}
              <div className="rounded-2xl p-3 text-center"
                style={{ background: "rgba(53,208,127,0.06)", border: "1px solid rgba(53,208,127,0.1)" }}
              >
                <p className="text-[#35D07F] font-black text-xl leading-none">{players}</p>
                <p className="text-[#35D07F]/40 text-xs mt-1">Players</p>
              </div>

              {/* Countdown */}
              <div className="rounded-2xl p-3 text-center"
                style={{
                  background: isExpired ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.04)",
                  border: isExpired ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.08)"
                }}
              >
                <p className={`font-black text-base leading-none ${isExpired ? "text-red-400" : "text-white"}`}>
                  {countdown}
                </p>
                <p className={`text-xs mt-1 ${isExpired ? "text-red-400/40" : "text-white/30"}`}>
                  {isExpired ? "Expired" : "Time Left"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Price tracker */}
        <motion.div variants={itemVariants}>
          <TrivqPrice />
        </motion.div>

        {/* TRIVQ balance — only if connected */}
        <AnimatePresence>
          {isReady && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div
                className="rounded-2xl p-4 flex items-center justify-between"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.03))",
                  border: "1px solid rgba(139,92,246,0.2)"
                }}
              >
                <div>
                  <p className="text-purple-400/60 text-xs mb-1">Your $TRIVQ Balance</p>
                  <motion.p
                    key={trivqFormatted}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-purple-300 font-black text-3xl tracking-tight"
                  >
                    {trivqFormatted}
                  </motion.p>
                </div>
                <div className="text-right">
                  <p className="text-white/20 text-xs">Rewards cap</p>
                  <p className="text-white/40 text-sm font-bold mt-0.5">500M total</p>
                  <div className="mt-2 w-20 h-1 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-[#FBCD00]"
                      style={{ width: `${Math.min((Number(trivqBalance ? formatUnits(trivqBalance as bigint, 18) : 0) / 500_000_000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MiniPay banner */}
        {isInMiniPay && miniPayAddress && (
          <motion.div variants={itemVariants}
            className="rounded-2xl p-3 flex items-center gap-3"
            style={{ background: "rgba(53,208,127,0.06)", border: "1px solid rgba(53,208,127,0.15)" }}
          >
            <span className="text-xl">📱</span>
            <div>
              <p className="text-[#35D07F] font-bold text-sm">{t("miniPayDetected")}</p>
              <p className="text-white/30 text-xs">{miniPayAddress.slice(0, 6)}...{miniPayAddress.slice(-4)}</p>
            </div>
          </motion.div>
        )}

        {/* MAIN PLAY BUTTON */}
        <motion.div variants={itemVariants}>
          {isReady ? (
            <motion.button
              onClick={() => router.push("/quiz")}
              whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(251,205,0,0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-5 rounded-2xl font-black text-xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #FBCD00 0%, #f0a500 60%, #e09000 100%)",
                color: "#0a0f1e",
              }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                  animation: "shimmer 2.5s infinite"
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {t("playNow")} 🎮
              </span>
            </motion.button>
          ) : (
            <div className="rounded-2xl p-5 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-white/30 text-sm mb-3">Connect your wallet to start earning</p>
              {!loading && !isInMiniPay && (
                <ConnectButton label={t("connectWallet")} showBalance={false} />
              )}
            </div>
          )}
        </motion.div>

        {/* Action grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2">
          <ActionButton onClick={() => router.push("/badges")} variant="purple">
            🎨 My Badges
          </ActionButton>
          <ActionButton onClick={() => router.push("/checkin")} variant="gold">
            🔥 Check-in
          </ActionButton>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2">
          {isReady && referralLink && (
            <ActionButton onClick={copyReferral} variant="blue">
              🔗 Invite & Earn
            </ActionButton>
          )}
          <ActionButton
            onClick={() => window.open(
              `https://app.ubeswap.org/#/swap?outputCurrency=${TRIVQ_ADDRESS}`,
              "_blank"
            )}
            variant="green"
            className={isReady && referralLink ? "" : "col-span-2"}
          >
            💱 Swap $TRIVQ
          </ActionButton>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2">
          <ActionButton onClick={() => router.push("/leaderboard")} variant="default">
            🏆 {tNav("leaderboard")}
          </ActionButton>
          {isConnected && (
            <ActionButton onClick={() => router.push("/profile")} variant="default">
              👤 {tNav("profile")}
            </ActionButton>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants}
          className="pt-2 flex items-center justify-center gap-6"
        >
          {[
            { href: "https://twitter.com/willycodexwar", label: "𝕏" },
            { href: "https://warpcast.com/willywarrior", label: "🟣" },
            { href: "https://github.com/wkalidev", label: "🐙" },
          ].map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              className="text-white/20 hover:text-white/60 text-sm transition-all"
            >
              {l.label}
            </a>
          ))}
        </motion.div>
      </motion.div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </main>
  );
}