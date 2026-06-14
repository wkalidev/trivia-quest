"use client";
import { useEffect } from "react";
import { useConnect, useAccount } from "wagmi";
import { injected } from "wagmi/connectors";
import { sdk } from "@farcaster/miniapp-sdk";

export default function FarcasterAutoConnect() {
  const { isConnected } = useAccount();
  const { connect } = useConnect();

  useEffect(() => {
    if (isConnected) return;

    // sdk.context resolves only inside a Farcaster client; race a 1.5s
    // timeout so non-Farcaster environments never stall or auto-connect
    const timer = new Promise<null>(res => setTimeout(() => res(null), 1500));
    Promise.race([sdk.context, timer]).then((ctx) => {
      if (!ctx) return;
      // Build connector from sdk.wallet.ethProvider, NOT window.ethereum.
      // This bypasses MetaMask (which claims window.ethereum in Warpcast web)
      // and routes directly to the Farcaster embedded wallet via postMessage.
      connect({
        connector: injected({
          target() {
            return {
              id: "farcasterWallet",
              name: "Farcaster Wallet",
              provider: sdk.wallet.ethProvider as typeof window.ethereum,
            };
          },
        }),
      });
    });
  }, [isConnected, connect]);

  return null;
}
