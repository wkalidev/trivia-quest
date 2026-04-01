"use client";

import { useEffect, useState } from "react";
import { isMiniPay, getMiniPayAccount } from "@/lib/web3";

export function useMiniPay() {
  const [isInMiniPay, setIsInMiniPay] = useState(false);
  const [miniPayAddress, setMiniPayAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detect = async () => {
      const detected = isMiniPay();
      setIsInMiniPay(detected);

      if (detected) {
        const account = await getMiniPayAccount();
        setMiniPayAddress(account);
      }
      setLoading(false);
    };

    detect();
  }, []);

  return { isInMiniPay, miniPayAddress, loading };
}