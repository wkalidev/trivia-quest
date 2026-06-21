"use client";

import { useState } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { celo, base } from "viem/chains";
import { motion, AnimatePresence } from "framer-motion";
import { useMiniPay } from "@/hooks/useMiniPay";

const TRIVQ = "0xe65fc5cacaf9a5aeBBc0e151dEe08A53F24a05C5" as `0x${string}`;

const UBESWAP_URL =
  "https://app.ubeswap.org/#/swap?outputCurrency=0xe65fc5cacaf9a5aeBBc0e151dEe08A53F24a05C5";

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

function fmtTrivq(raw: bigint): string {
  const n = Number(formatUnits(raw, 18));
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

export default function SwapWidget() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [open, setOpen] = useState(false);

  const { isInMiniPay, miniPayAddress } = useMiniPay();
  const isOnCelo = chainId === celo.id;

  const { data: trivqBalance } = useReadContract({
    address: TRIVQ,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && isOnCelo },
  });

  return (
    <div className="w-full">
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(53,208,127,0.13)" }}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm"
        style={{
          background: open ? "rgba(53,208,127,0.15)" : "rgba(53,208,127,0.08)",
          border: `1px solid ${open ? "rgba(53,208,127,0.5)" : "rgba(53,208,127,0.25)"}`,
          color: "#35D07F",
        }}
      >
        💱 {open ? "Close" : "Buy TRIVQ"}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div
              className="mt-2 rounded-2xl p-4 space-y-3"
              style={{
                background: "rgba(53,208,127,0.04)",
                border: "1px solid rgba(53,208,127,0.15)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#35D07F]">CELO → TRIVQ</span>
                <span className="text-[10px] text-white/25">via Ubeswap V3</span>
              </div>

              {chainId === base.id && (
                <p className="text-xs text-[#0052FF]/80 font-bold text-center">
                  No TRIVQ liquidity pool on Base yet — switch to Celo
                </p>
              )}

              {/* TRIVQ balance */}
              {trivqBalance !== undefined && (
                <p className="text-[10px] text-center text-white/30">
                  Your TRIVQ: {fmtTrivq(trivqBalance as bigint)}
                </p>
              )}

              {/* Primary CTA — opens Ubeswap UI */}
              <motion.a
                href={UBESWAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-sm"
                style={{
                  background: "linear-gradient(135deg, rgba(53,208,127,0.3) 0%, rgba(35,160,95,0.2) 100%)",
                  border: "1px solid rgba(53,208,127,0.4)",
                  color: "#35D07F",
                }}
              >
                💱 Buy TRIVQ on Ubeswap ↗
              </motion.a>

              <p className="text-[10px] text-white/20 text-center">
                Opens Ubeswap — swap CELO for TRIVQ
              </p>

              {/* MiniPay receive deeplink */}
              {isInMiniPay && miniPayAddress && (
                <a
                  href={`celo://wallet/pay?address=${miniPayAddress}&token=TRIVQ`}
                  className="block text-center text-[10px] text-[#35D07F]/40 hover:text-[#35D07F]/70 transition-colors"
                >
                  💳 Receive TRIVQ via MiniPay
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
