"use client";

import { useEffect, useState } from "react";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<string[]>;
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
        try {
          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
            params: [],
          });
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