"use client";
import { useEffect } from "react";
import { useStartale } from "@/hooks/useStartale";
import { useWallet } from "@/app/providers";

// Pure detector — renders nothing. Runs inside the always-mounted lightConfig
// WagmiProvider (no @startale/app-sdk import here, so this stays cheap for every
// non-Startale session). Once Startale is confirmed, it flips `isStartale` in the
// shared WalletContext so <Providers> mounts <StartaleWagmiWrapper>, which is the
// component that actually imports @startale/app-sdk and calls startaleConnector() —
// keeping that dependency out of the bundle for everyone else (Celo/Base/MiniPay/
// Farcaster/Base App users never pay for it).
export default function StartaleAutoConnect() {
  const { isStartale } = useStartale();
  const { markStartale } = useWallet();

  useEffect(() => {
    if (isStartale) markStartale();
  }, [isStartale, markStartale]);

  return null;
}
