"use client";

import { useEffect, useState } from "react";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  isMiniPay?: boolean;
};

type WindowWithEthereum = Window & {
  ethereum?: EthereumProvider;
};

export function useMiniPay() {
  const [isInMiniPay, setIsInMiniPay] = useState(false);
  const [miniPayAddress, setMiniPayAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detect = async () => {
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const ethereum = (window as WindowWithEthereum).ethereum;

      if (ethereum && ethereum.isMiniPay) {
        setIsInMiniPay(true);
        // Force Celo mainnet (chainId 42220 = 0xA4EC) — MiniPay only runs on Celo
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xA4EC" }],
          });
        } catch {
          // MiniPay is always on Celo; ignore if switch is unnecessary or unsupported
        }
        try {
          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
            params: [],
          }) as string[];
          setMiniPayAddress(accounts[0] ?? null);
        } catch {
          setMiniPayAddress(null);
        }
      }

      setLoading(false);
    };

    detect();
  }, []);

  return { isInMiniPay, miniPayAddress, loading };
}