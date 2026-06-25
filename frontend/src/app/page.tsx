"use client";

import { sdk } from '@farcaster/miniapp-sdk';
import { useWallet } from "@/app/providers";
import { useAccount, useReadContract, useChainId } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback, memo } from "react";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import type { Locale } from "@/i18n/navigation";
import { formatUnits } from "viem";
import { LazyMotion, m, type Variants } from "framer-motion";

// Lazy-load domAnimation features — defers ~28KB from initial parse
const loadDomAnimation = () => import("framer-motion").then((mod) => mod.domAnimation);
import { CONTRACT_ABI, getContractAddress } from "@/lib/contract";
import dynamic_ from "next/dynamic";

// Loaded only when wallet stack is ready (user clicked connect)
const ConnectButton = dynamic_(
  () => import("@rainbow-me/rainbowkit").then((m) => ({ default: m.ConnectButton })),
  { ssr: false }
);

const TrivqPrice = dynamic_(() => import("@/components/TrivqPrice"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl h-16 animate-pulse" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
  ),
});

const SwapWidget = dynamic_(() => import("@/components/SwapWidget"), {
  ssr: false,
  loading: () => (
    <div className="h-12 rounded-2xl animate-pulse" style={{ background: "rgba(53,208,127,0.08)", border: "1px solid rgba(53,208,127,0.2)" }} />
  ),
});

const TRIVQ_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const TRIVQ_REWARDS_ABI = [
  {
    name: "rewardsRemaining",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
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

function addressToAlias(address: string): string {
  const num = parseInt(address.slice(-4), 16) % 9999 + 1;
  return `Player #${num.toString().padStart(4, "0")}`;
}

const Countdown = memo(function Countdown({ endTime }: { endTime: bigint }) {
  const [display, setDisplay] = useState("—");

  useEffect(() => {
    const compute = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Number(endTime) - now;
      if (diff <= 0) { setDisplay("Expired"); return; }
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setDisplay(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  const isExpired = display === "Expired";
  return (
    <div className="rounded-2xl p-3 text-center"
      style={{
        background: isExpired ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.04)",
        border: isExpired ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.08)"
      }}
    >
      <p className={`font-black text-base leading-none ${isExpired ? "text-red-400" : "text-white"}`}>
        {display}
      </p>
      <p className={`text-xs mt-1 ${isExpired ? "text-red-400/40" : "text-white/30"}`}>
        {isExpired ? "Expired" : "Time Left"}
      </p>
    </div>
  );
});

function AfricanPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, rgba(251,205,0,0.4) 0%, transparent 70%)" }}
      />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-8"
        style={{ background: "radial-gradient(circle, rgba(53,208,127,0.3) 0%, transparent 70%)" }}
      />
      <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full opacity-6"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)" }}
      />
    </div>
  );
}

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

function ActionButton({
  onClick, children, variant = "default", className = ""
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "gold" | "green" | "purple" | "blue" | "default";
  className?: string;
}) {
  const styles = {
    gold:    { bg: "rgba(251,205,0,0.08)",   border: "rgba(251,205,0,0.25)",   text: "#FBCD00",               glow: "#FBCD00"  },
    green:   { bg: "rgba(53,208,127,0.08)",  border: "rgba(53,208,127,0.25)",  text: "#35D07F",               glow: "#35D07F"  },
    purple:  { bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.25)",  text: "#A78BFA",               glow: "#8B5CF6"  },
    blue:    { bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.25)",  text: "#93C5FD",               glow: "#3B82F6"  },
    default: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)",  text: "rgba(255,255,255,0.7)", glow: "transparent" },
  };
  const s = styles[variant];

  return (
    <m.button
      onClick={onClick}
      whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${s.glow}22` }}
      whileTap={{ scale: 0.97 }}
      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-colors ${className}`}
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      {children}
    </m.button>
  );
}

export default function Home() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { isInMiniPay, miniPayAddress, loading } = useMiniPay();
  const { walletReady, requestWallet } = useWallet();
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;
  const [copied, setCopied] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const chainId = useChainId();
  const CONTRACT_ADDRESS = getContractAddress(chainId, "game");
  const TRIVQ_ADDR = getContractAddress(chainId, "token");

  const chainLabel = chainId === 8453 ? "Base Mainnet" : "Celo Mainnet";
  const tokenLabel = chainId === 8453 ? "TRIVQ · Base" : "TRIVQ · Celo";

  const isReady = isConnected || !!miniPayAddress;
  const walletAddress = address ?? miniPayAddress;

  useEffect(() => {
    sdk.actions.ready();
    const shell = document.getElementById("tq-shell");
    if (shell) {
      shell.style.opacity = "0";
      shell.style.transition = "opacity 0.2s";
      setTimeout(() => { shell.style.display = "none"; }, 200);
    }
  }, []);

  useEffect(() => {
    if (isReady) router.prefetch("/quiz");
  }, [isReady, router]);

  const { data: trivqBalance } = useReadContract({
    address: TRIVQ_ADDR,
    abi: TRIVQ_ABI,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress as `0x${string}`] : undefined,
    query: { enabled: !!walletAddress },
  });

  const { data: currentRound, refetch: refetchRound } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getCurrentRound",
    query: { refetchInterval: 15_000 },
  });

  // On-demand round management: when the client detects an expired round, hit
  // the server-side API to call finishRound on-chain immediately, without
  // waiting for any cron or manual trigger.
  const roundFixSent = useRef(false);
  useEffect(() => {
    if (!currentRound) return;
    const now = Math.floor(Date.now() / 1000);
    const isExpired = !currentRound[5] && now > Number(currentRound[3]);
    if (!isExpired) {
      roundFixSent.current = false; // reset so next expiry triggers a new call
      return;
    }
    if (roundFixSent.current) return;
    roundFixSent.current = true;
    fetch(`/api/round?chain=${chainId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "sent" || data.status === "finished") {
          // Tx submitted — poll wagmi until the new round lands
          setTimeout(() => refetchRound(), 4_000);
          setTimeout(() => refetchRound(), 10_000);
        }
      })
      .catch(() => {});
  }, [currentRound, chainId, refetchRound]);

  const { data: totalPlayers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTotalPlayers",
    query: { refetchInterval: 30_000 },
  });

  const { data: rewardsRemaining } = useReadContract({
    address: TRIVQ_ADDR,
    abi: TRIVQ_REWARDS_ABI,
    functionName: "rewardsRemaining",
    query: { refetchInterval: 60_000 },
  });

  const trivqFormatted = trivqBalance ? formatTrivq(trivqBalance as bigint) : "—";
  const prizePool = currentRound ? formatCelo(currentRound[1]) : "0";
  const endTime = currentRound ? currentRound[3] : BigInt(0);
  const players = totalPlayers ? totalPlayers.toString() : "0";
  const APP_URL = "https://trivia-quest-eight.vercel.app";
  const referralLink = address ? `${APP_URL}?ref=${address}` : APP_URL;

  const copyReferral = useCallback(() => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [referralLink]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
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
          {mounted && !loading && !isInMiniPay && (
            walletReady
              ? <ConnectButton label={t("connectWallet")} showBalance={false} />
              : <button
                  onClick={requestWallet}
                  onMouseEnter={() => import("@/components/RainbowKitWrapper")}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("connectWallet")}
                </button>
          )}
        </div>
      </div>

      <LazyMotion features={loadDomAnimation}>
      <m.div
        variants={containerVariants}
        initial={false}
        animate="show"
        className="w-full max-w-md z-10 space-y-3"
      >
        <m.div variants={itemVariants}>
          <div
            className="rounded-3xl p-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(251,205,0,0.06) 0%, rgba(53,208,127,0.03) 100%)",
              border: "1px solid rgba(251,205,0,0.15)",
            }}
          >
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
                  <p className="text-white/40 text-xs mt-0.5">{tokenLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/20 text-xs mb-1">Network</div>
                <div className="flex items-center gap-1.5 justify-end">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#35D07F] animate-pulse"/>
                  <span className="text-[#35D07F] text-xs font-bold">{chainLabel}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl p-3 text-center relative overflow-hidden"
                style={{ background: "rgba(251,205,0,0.06)", border: "1px solid rgba(251,205,0,0.1)" }}
              >
                <p className="text-[#FBCD00] font-black text-xl leading-none">{prizePool}</p>
                <p className="text-[#FBCD00]/40 text-xs mt-1">Prize Pool</p>
              </div>
              <div className="rounded-2xl p-3 text-center"
                style={{ background: "rgba(53,208,127,0.06)", border: "1px solid rgba(53,208,127,0.1)" }}
              >
                <p className="text-[#35D07F] font-black text-xl leading-none">{players}</p>
                <p className="text-[#35D07F]/40 text-xs mt-1">Players</p>
              </div>
              <Countdown endTime={endTime} />
            </div>
          </div>
        </m.div>

        <m.div variants={itemVariants}>
          <TrivqPrice />
        </m.div>

        <div
          className="rounded-2xl p-4 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.03))",
            border: "1px solid rgba(139,92,246,0.2)"
          }}
        >
          <div>
            <p className="text-purple-400/60 text-xs mb-1">Your TRIVQ Balance</p>
            <m.p
              key={trivqFormatted}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-purple-300 font-black text-3xl tracking-tight"
            >
              {isReady ? trivqFormatted : "—"}
            </m.p>
          </div>
          <div className="text-right">
            <p className="text-white/20 text-xs">Rewards cap</p>
            <p className="text-white/40 text-sm font-bold mt-0.5">500M total</p>
            <div className="mt-2 w-20 h-1 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-[#FBCD00]"
                style={{ width: isReady ? `${Math.min((Number(trivqBalance ? formatUnits(trivqBalance as bigint, 18) : 0) / 500_000_000) * 100, 100)}%` : "0%" }}
              />
            </div>
          </div>
        </div>

        {/* ⚡ Bandeau cap rewards */}
        {rewardsRemaining !== undefined && rewardsRemaining < BigInt("10000000000000000000000000") && (
          <m.div variants={itemVariants}
            className="rounded-xl p-3 text-center text-xs font-bold"
            style={{ background: "rgba(251,205,0,0.08)", border: "1px solid rgba(251,205,0,0.25)", color: "#FBCD00" }}
          >
            {t("tokenV3Banner")}
          </m.div>
        )}

        {isInMiniPay && miniPayAddress && (
          <m.div variants={itemVariants}
            className="rounded-2xl p-3 flex items-center justify-between"
            style={{ background: "rgba(53,208,127,0.06)", border: "1px solid rgba(53,208,127,0.15)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📱</span>
              <div>
                <p className="text-[#35D07F] font-bold text-sm">{t("miniPayDetected")}</p>
                <p className="text-white/30 text-xs">{addressToAlias(miniPayAddress)}</p>
              </div>
            </div>
            <a
              href={`celo://wallet/pay?address=${miniPayAddress}&token=TRIVQ`}
              className="text-[10px] text-[#35D07F]/50 hover:text-[#35D07F] transition-colors shrink-0"
            >
              💳 Receive
            </a>
          </m.div>
        )}

        <m.div variants={itemVariants}>
          {isReady ? (
            <m.button
              onClick={() => router.push("/quiz")}
              whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(251,205,0,0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-5 rounded-2xl font-black text-xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #FBCD00 0%, #f0a500 60%, #e09000 100%)",
                color: "#0a0f1e",
              }}
            >
              <div className="absolute inset-0 -translate-x-full"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                  animation: "shimmer 2.5s infinite"
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {t("playNow")}
              </span>
            </m.button>
          ) : (
            <div className="rounded-2xl p-5 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-white/30 text-sm mb-3">Connect your wallet to start earning</p>
              {mounted && !loading && !isInMiniPay && (
                walletReady
                  ? <ConnectButton label={t("connectWallet")} showBalance={false} />
                  : <button
                      onClick={requestWallet}
                      onMouseEnter={() => import("@/components/RainbowKitWrapper")}
                      style={{
                        padding: "12px 24px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg,#FBCD00,#f0a500)",
                        border: "none",
                        color: "#0a0f1e",
                        fontSize: "15px",
                        fontWeight: 900,
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      {t("connectWallet")}
                    </button>
              )}
            </div>
          )}
        </m.div>

        <m.div variants={itemVariants} className="grid grid-cols-2 gap-2">
          <ActionButton onClick={() => router.push("/badges")} variant="purple">🎨 My Badges</ActionButton>
          <ActionButton onClick={() => router.push("/checkin")} variant="gold">🔥 Check-in</ActionButton>
        </m.div>

        <m.div variants={itemVariants}>
          <m.button
            onClick={() => router.push("/duel")}
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(139,92,246,0.3)" }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl font-black text-base relative overflow-hidden flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(109,40,217,0.1) 100%)",
              border: "1px solid rgba(139,92,246,0.4)",
              color: "#A78BFA",
            }}
          >
            <span>⚔️</span>
            <span>Trivia Duel</span>
            <span className="text-purple-400/50 text-sm font-normal">— {t("duelChallenge")}</span>
            <span className="absolute right-4 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
              NEW
            </span>
          </m.button>
        </m.div>

        <m.div variants={itemVariants} className="grid grid-cols-2 gap-2 items-start">
          <ActionButton onClick={copyReferral} variant="blue">
            {copied ? "✅ Copied!" : "🔗 Invite & Earn"}
          </ActionButton>
          <div>
            <SwapWidget />
          </div>
        </m.div>

        <m.div variants={itemVariants} className="grid grid-cols-2 gap-2">
          <ActionButton onClick={() => router.push("/leaderboard")} variant="default">
            🏆 {tNav("leaderboard")}
          </ActionButton>
          {isConnected && (
            <ActionButton onClick={() => router.push("/profile")} variant="default">
              👤 {tNav("profile")}
            </ActionButton>
          )}
        </m.div>

        <m.div variants={itemVariants} className="grid grid-cols-3 gap-2">
          <ActionButton onClick={() => router.push("/stats")} variant="default">
            📊 Stats
          </ActionButton>
          <ActionButton onClick={() => router.push("/about")} variant="default">
            ℹ️ About
          </ActionButton>
          <ActionButton onClick={() => router.push("/referral")} variant="default">
            🔗 Referral
          </ActionButton>
        </m.div>

        <m.div variants={itemVariants} className="pt-2 flex items-center justify-center gap-6">
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
        </m.div>
      </m.div>
      </LazyMotion>
    </main>
  );
}