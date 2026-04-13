"use client";

import { sdk } from '@farcaster/miniapp-sdk'; 
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import  TrivqPrice  from "@/components/TrivqPrice";
import type { Locale } from "@/i18n/navigation";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
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
  if (n >= 1_000_000_000) return `${Math.round(n / 1_000_000_000)}B`;
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return Math.round(n).toString();
}

function formatCelo(wei: bigint): string {
  const n = Number(formatUnits(wei, 18));
  if (n === 0) return "0";
  if (n < 0.01) return "<0.01";
  return n.toFixed(3);
}

function formatCountdown(endTime: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = Number(endTime) - now;
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${h}h ${m}m`;
}

export default function Home() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { isInMiniPay, miniPayAddress, loading } = useMiniPay();
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;

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
    query: { refetchInterval: 30_000 },
  });

  const { data: totalPlayers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTotalPlayers",
    query: { refetchInterval: 30_000 },
  });

  const trivqFormatted = trivqBalance ? formatTrivq(trivqBalance as bigint) : "—";
  const prizePool = currentRound ? formatCelo(currentRound[1]) : "0";
  const endTime = currentRound ? currentRound[3] : BigInt(0);
  const countdown = endTime > BigInt(0) ? formatCountdown(endTime) : "—";
  const players = totalPlayers ? totalPlayers.toString() : "0";

  // Referral link
  const referralLink = address
    ? `https://trivia-quest-eight.vercel.app?ref=${address}`
    : null;

  const copyReferral = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
  };

  useEffect(() => {
    sdk.actions.ready();
    if (isReady) router.prefetch("/quiz");
  }, [isReady, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, #1a2744 0%, #0a0b0f 60%)" }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-white font-black text-lg tracking-tight">Trivia<span className="text-[#FBCD00]">Q</span></span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={locale} />
          {!loading && !isInMiniPay && (
            <ConnectButton label={t("connectWallet")} showBalance={false} />
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mt-16 z-10"
      >
        {/* Token header */}
        <div className="rounded-2xl border border-white/8 p-5 mb-3"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Logo size={40} />
              <div>
                <p className="text-white font-black text-xl tracking-tight">Trivia<span className="text-[#FBCD00]">Q</span></p>
                <p className="text-white/40 text-xs">$TRIVQ · Celo Network</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[#35D07F] font-black text-sm">● LIVE</p>
              <p className="text-white/40 text-xs">Mainnet</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p className="font-black text-lg text-[#FBCD00]">
                {prizePool} <span className="text-xs">CELO</span>
              </p>
              <p className="text-white/40 text-xs mt-0.5">Prize Pool</p>
            </div>
            <div className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p className="font-black text-lg text-[#35D07F]">{players}</p>
              <p className="text-white/40 text-xs mt-0.5">Players</p>
            </div>
            <div className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p className="font-black text-base text-white">{countdown}</p>
              <p className="text-white/40 text-xs mt-0.5">Time Left</p>
            </div>
          </div>
        </div>

        {/* ── Price tracker ────────────────────────────────── */}
        <div className="mb-3">
          <TrivqPrice />
        </div>

        {/* TRIVQ balance card */}
        {isReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-purple-500/20 p-4 mb-3 flex items-center justify-between"
            style={{ background: "rgba(168,85,247,0.06)", backdropFilter: "blur(20px)" }}
          >
            <div>
              <p className="text-white/50 text-xs mb-0.5">Your $TRIVQ Balance</p>
              <p className="text-purple-300 font-black text-2xl">{trivqFormatted}</p>
            </div>
            <div className="text-right">
              <p className="text-white/30 text-xs">Rewards cap</p>
              <p className="text-white/50 text-sm font-bold">500M total</p>
            </div>
          </motion.div>
        )}

        {/* MiniPay banner */}
        {isInMiniPay && miniPayAddress && (
          <div className="rounded-2xl border border-[#35D07F]/20 p-3 mb-3 flex items-center gap-3"
            style={{ background: "rgba(53,208,127,0.06)" }}
          >
            <span className="text-xl">📱</span>
            <div>
              <p className="text-[#35D07F] font-bold text-sm">{t("miniPayDetected")}</p>
              <p className="text-white/40 text-xs">{miniPayAddress.slice(0, 6)}...{miniPayAddress.slice(-4)}</p>
            </div>
          </div>
        )}

        {/* Play button */}
        {isReady ? (
          <button
            onClick={() => router.push("/quiz")}
            className="w-full font-black text-lg py-4 rounded-2xl transition-all active:scale-95 mb-3 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #FBCD00 0%, #f0a500 100%)", color: "#0a0b0f" }}
          >
            <span className="relative z-10">{t("playNow")}</span>
          </button>
        ) : (
          <div className="rounded-2xl border border-white/8 p-4 mb-3 text-center"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <p className="text-white/40 text-sm mb-3">Connect your wallet to play</p>
            {!loading && !isInMiniPay && (
              <ConnectButton label={t("connectWallet")} showBalance={false} />
            )}
          </div>
        )}

        {/* Badges */}
        <button
          onClick={() => router.push("/badges")}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-purple-500/20 text-purple-300 hover:border-purple-500/40 font-bold text-sm transition-all mb-2"
          style={{ background: "rgba(168,85,247,0.06)" }}
        >
          🎨 My Badges
        </button>

        {/* Daily Check-in */}
        <button
          onClick={() => router.push("/checkin")}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#FBCD00]/20 text-[#FBCD00] hover:border-[#FBCD00]/40 font-bold text-sm transition-all mb-2"
          style={{ background: "rgba(251,205,0,0.06)" }}
        >
          🔥 Daily Check-in & Earn TRIVQ
        </button>

        {/* ── Referral ──────────────────────────────────────── */}
        {isReady && referralLink && (
          <button
            onClick={copyReferral}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-blue-500/20 text-blue-300 hover:border-blue-500/40 font-bold text-sm transition-all mb-2"
            style={{ background: "rgba(59,130,246,0.06)" }}
          >
            🔗 Invite & Earn 500 TRIVQ
          </button>
        )}

        {/* Swap */}
        {isReady && (
          <button
            onClick={() => window.open(
              `https://app.ubeswap.org/#/swap?outputCurrency=${TRIVQ_ADDRESS}`,
              "_blank"
            )}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#35D07F]/20 text-[#35D07F] hover:border-[#35D07F]/40 font-bold text-sm transition-all mb-2"
            style={{ background: "rgba(53,208,127,0.06)" }}
          >
            💱 Buy / Sell $TRIVQ on Ubeswap
          </button>
        )}

        {/* Nav grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => router.push("/leaderboard")}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/8 text-white/70 hover:text-white hover:border-white/20 font-bold text-sm transition-all"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            🏆 {tNav("leaderboard")}
          </button>
          {isConnected && (
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/8 text-white/70 hover:text-white hover:border-white/20 font-bold text-sm transition-all"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              👤 {tNav("profile")}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-5 flex-wrap">
          {[
            { href: "https://twitter.com/willycodexwar", label: "𝕏 Twitter" },
            { href: "https://warpcast.com/willywarrior", label: "🟣 Farcaster" },
            { href: "https://github.com/wkalidev", label: "🐙 GitHub" },
          ].map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              className="text-white/30 hover:text-white/60 text-xs transition-all"
            >
              {l.label}
            </a>
          ))}
        </div>
      </motion.div>
    </main>
  );
}