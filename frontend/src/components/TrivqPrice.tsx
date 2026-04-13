"use client";

import { useEffect, useState } from "react";

type PriceData = {
  price: number;
  change24h: number;
  volume24h: number;
};

export default function TrivqPrice() {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(
          "https://api.geckoterminal.com/api/v2/networks/celo/tokens/0xf50afd22d5285f0398bf1be433252ce6a9fd9579"
        );
        const json = await res.json();
        const attrs = json?.data?.attributes;
        if (attrs) {
          setData({
            price: parseFloat(attrs.price_usd ?? "0"),
            change24h: parseFloat(attrs.price_change_percentage?.h24 ?? "0"),
            volume24h: parseFloat(attrs.volume_usd?.h24 ?? "0"),
          });
        }
      } catch {
        setData({ price: 0.0000025, change24h: 0, volume24h: 0 });
      } finally {
        setLoading(false);
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000);
    return () => clearInterval(interval);
  }, []);

  const SWAP_URL = "https://app.ubeswap.org/#/swap?outputCurrency=0xf50afd22d5285f0398bf1be433252ce6a9fd9579";
  const isPositive = (data?.change24h ?? 0) >= 0;

  if (loading) {
    return (
      <div
        className="rounded-2xl border border-white/8 p-4 animate-pulse"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <div className="h-3 w-24 bg-white/10 rounded mb-2" />
        <div className="h-5 w-32 bg-white/10 rounded" />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-[#FBCD00]/20 p-4"
      style={{ background: "rgba(251,205,0,0.04)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#FBCD00]">$TRIVQ</span>
          <span className="text-white/30 text-xs">· Celo</span>
        </div>
        
        <a
          href={SWAP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#FBCD00]/60 hover:text-[#FBCD00] transition-all"
        >Trade ↗</a>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-white font-black text-lg">
            ${data?.price ? data.price.toFixed(8) : "—"}
          </p>
          <p className="text-white/30 text-xs mt-0.5">per TRIVQ</p>
        </div>
        <div className="text-right">
          <p className={`font-bold text-sm ${isPositive ? "text-[#35D07F]" : "text-red-400"}`}>
            {isPositive ? "▲" : "▼"} {Math.abs(data?.change24h ?? 0).toFixed(2)}%
          </p>
          <p className="text-white/30 text-xs mt-0.5">24h</p>
        </div>
      </div>

      {(data?.volume24h ?? 0) > 0 && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <p className="text-white/30 text-xs">
            Vol 24h: ${data!.volume24h.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}