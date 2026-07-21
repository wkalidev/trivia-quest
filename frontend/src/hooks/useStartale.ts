"use client";

import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

// Startale Mini Apps run on the same Farcaster Mini App protocol/SDK as
// Warpcast and Base App, but only the Startale host populates `sdk.context.startale`
// (starPoints / eoaWallets / language). That field's presence is the only reliable
// signal to tell "I'm inside the Startale App" apart from any other Farcaster-protocol
// host. Not yet part of @farcaster/miniapp-sdk's official types — see
// docs.startale.com/miniapps/runtime-context, "the cast is safe; the host always
// populates these fields when your Mini App runs inside the Startale App."
type StartaleRuntimeContext = {
  startale?: {
    starPoints?: number;
    eoaWallets?: string[];
    language?: "en" | "ja";
  };
};

interface UseStartaleResult {
  isStartale: boolean;
  starPoints: number;
  eoaWallets: string[];
  language: "en" | "ja";
  loading: boolean;
}

export function useStartale(): UseStartaleResult {
  const [isStartale, setIsStartale] = useState(false);
  const [starPoints, setStarPoints] = useState(0);
  const [eoaWallets, setEoaWallets] = useState<string[]>([]);
  const [language, setLanguage] = useState<"en" | "ja">("en");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // sdk.context only resolves inside a Farcaster-protocol host (Warpcast,
    // Base App, or Startale). Race a timeout, same pattern as FarcasterAutoConnect,
    // so a plain browser or MiniPay session never stalls on this.
    let cancelled = false;
    const timer = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));

    Promise.race([sdk.context, timer])
      .then((ctx) => {
        if (cancelled) return;
        const startale = (ctx as StartaleRuntimeContext | null)?.startale;
        if (!startale) return; // no ctx, or a Farcaster-protocol host that isn't Startale
        setIsStartale(true);
        setStarPoints(startale.starPoints ?? 0);
        setEoaWallets(startale.eoaWallets ?? []);
        setLanguage(startale.language ?? "en");
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isStartale, starPoints, eoaWallets, language, loading };
}
