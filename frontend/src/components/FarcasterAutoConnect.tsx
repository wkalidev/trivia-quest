"use client";
import { useEffect } from "react";
import { useConnect, useAccount } from "wagmi";
import { sdk } from "@farcaster/miniapp-sdk";

export default function FarcasterAutoConnect() {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    if (isConnected) return;

    // sdk.context only resolves inside a Farcaster client; race against a
    // 1.5s timeout so non-Farcaster environments don't stall or auto-connect
    const timer = new Promise<null>(res => setTimeout(() => res(null), 1500));
    Promise.race([sdk.context, timer]).then((ctx) => {
      if (!ctx) return;
      const injected = connectors.find(c => c.id === "injected");
      if (injected) connect({ connector: injected });
    });
  }, [isConnected, connect, connectors]);

  return null;
}
