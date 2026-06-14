"use client";
import { useEffect } from "react";
import { useConnect, useAccount } from "wagmi";

export default function FarcasterAutoConnect() {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    if (isConnected) return;
    const isFarcaster =
      window.navigator.userAgent.includes("Farcaster") ||
      !!(window as any).ethereum?.isFarcaster;
    if (!isFarcaster) return;
    const injected = connectors.find(c => c.id === "injected");
    if (injected) connect({ connector: injected });
  }, [isConnected, connect, connectors]);

  return null;
}
