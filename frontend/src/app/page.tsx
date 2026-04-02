"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import type { Locale } from "@/i18n/navigation";

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const { isInMiniPay, miniPayAddress, loading } = useMiniPay();
  const t = useTranslations("home");
  const locale = useLocale() as Locale;

  const isReady = isConnected || !!miniPayAddress;

  useEffect(() => {
    if (isReady) router.prefetch("/quiz");
  }, [isReady, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A2E] px-6">

      {/* Language switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher currentLocale={locale} />
      </div>

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <Logo size={128} />
        <h1 className="text-5xl font-black text-white tracking-tight mt-4">
          Trivia<span className="text-[#FBCD00]">Q</span>
        </h1>
        <p className="text-[#35D07F] mt-2 text-lg font-medium">
          {t("tagline")}
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-10">
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
      </div>

      {/* MiniPay detected */}
      {isInMiniPay && miniPayAddress && (
        <div className="bg-[#35D07F]/20 border border-[#35D07F]/40 rounded-2xl px-6 py-3 mb-6 text-center">
          <p className="text-[#35D07F] font-bold text-sm">
            {t("miniPayDetected")}
          </p>
          <p className="text-white/60 text-xs mt-1">
            {miniPayAddress.slice(0, 6)}...{miniPayAddress.slice(-4)}
          </p>
        </div>
      )}

      {/* Connect Wallet */}
      {!loading && !isInMiniPay && (
        <div className="mb-6">
          <ConnectButton label={t("connectWallet")} />
        </div>
      )}

      {/* Play Button */}
      {isReady && (
        <button
          onClick={() => router.push("/quiz")}
          className="w-full max-w-xs bg-[#FBCD00] hover:bg-[#f0c000] text-[#1A1A2E] font-black text-xl py-4 rounded-2xl transition-all active:scale-95"
        >
          {t("playNow")}
        </button>
      )}

      {/* Leaderboard button */}
       <button
            onClick={() => router.push("/leaderboard")}
            className="mt-4 text-white/40 hover:text-white/70 text-sm underline transition-all"
        >
            🏆 Leaderboard
        </button>

      {/* Footer */}
      <p className="mt-12 text-white/30 text-sm">
        {t("poweredBy")}
      </p>
    </main>
  );
}