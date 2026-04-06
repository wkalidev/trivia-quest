"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi"; // ← useReadContract ajouté
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import type { Locale } from "@/i18n/navigation";
import { formatUnits } from "viem"; // ← ajouté

// ── Adresses à remplir après déploiement ──────────────────────────────────
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
// ─────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { isInMiniPay, miniPayAddress, loading } = useMiniPay();
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;

  const isReady = isConnected || !!miniPayAddress;
  const walletAddress = address ?? miniPayAddress;

  // ── Lecture solde TRIVQ ─────────────────────────────────────────────────
  const { data: trivqBalance } = useReadContract({
    address: TRIVQ_ADDRESS,
    abi: TRIVQ_ABI,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress as `0x${string}`] : undefined,
    query: { enabled: !!walletAddress && TRIVQ_ADDRESS !== "0x0" },
  });

  const trivqFormatted = trivqBalance
    ? Number(formatUnits(trivqBalance, 18)).toFixed(0)
    : "0";
  // ────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isReady) router.prefetch("/quiz");
  }, [isReady, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A2E] px-6">

      <div className="absolute top-4 right-4">
        <LanguageSwitcher currentLocale={locale} />
      </div>

      <div className="mb-8 flex flex-col items-center">
        <Logo size={128} />
        <h1 className="text-5xl font-black text-white tracking-tight mt-4">
          Trivia<span className="text-[#FBCD00]">Q</span>
        </h1>
        <p className="text-[#35D07F] mt-2 text-lg font-medium">
          {t("tagline")}
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex flex-col items-center bg-white/10 rounded-2xl px-5 py-4">
          <span className="text-2xl font-bold text-[#FBCD00]">$5,000</span>
          <span className="text-white/60 text-sm">{t("prizePool")}</span>
        </div>
        <div className="flex flex-col items-center bg-white/10 rounded-2xl px-5 py-4">
          <span className="text-2xl font-bold text-[#35D07F]">50</span>
          <span className="text-white/60 text-sm">{t("winners")}</span>
        </div>
        <div className="flex flex-col items-center bg-white/10 rounded-2xl px-5 py-4">
          <span className="text-2xl font-bold text-white">26</span>
          <span className="text-white/60 text-sm">{t("daysLeft")}</span>
        </div>

        {/* ── AJOUT : badge TRIVQ (s'affiche uniquement si wallet connecté) ── */}
        {isReady && (
          <div className="flex flex-col items-center bg-white/10 rounded-2xl px-5 py-4">
            <span className="text-2xl font-bold text-purple-400">
              {trivqFormatted}
            </span>
            <span className="text-white/60 text-sm">$TRIVQ</span>
          </div>
        )}
        {/* ─────────────────────────────────────────────────────────────────── */}
      </div>

      {isInMiniPay && miniPayAddress && (
        <div className="bg-[#35D07F]/20 border border-[#35D07F]/40 rounded-2xl px-6 py-3 mb-6 text-center">
          <p className="text-[#35D07F] font-bold text-sm">{t("miniPayDetected")}</p>
          <p className="text-white/60 text-xs mt-1">
            {miniPayAddress.slice(0, 6)}...{miniPayAddress.slice(-4)}
          </p>
        </div>
      )}

      {!loading && !isInMiniPay && (
        <div className="mb-6">
          <ConnectButton label={t("connectWallet")} />
        </div>
      )}

      {isReady && (
        <button
          onClick={() => router.push("/quiz")}
          className="w-full max-w-xs bg-[#FBCD00] hover:bg-[#f0c000] text-[#1A1A2E] font-black text-xl py-4 rounded-2xl transition-all active:scale-95 mb-4"
        >
          {t("playNow")}
        </button>
      )}

      <div className="flex gap-3 mt-2">
        <button
          onClick={() => router.push("/leaderboard")}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
        >
          🏆 {tNav("leaderboard")}
        </button>
        {isConnected && (
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
          >
            👤 {tNav("profile")}
          </button>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="text-white/30 text-sm">{t("poweredBy")}</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <a href="https://twitter.com/willycodexwar" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-all text-sm">
            X @willycodexwar
          </a>
          <a href="https://warpcast.com/willywarrior" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-all text-sm">
            🟣 willywarrior
          </a>
          <a href="https://github.com/wkalidev" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-all text-sm">
            🐙 wkalidev
          </a>
        </div>
      </div>

    </main>
  );
}