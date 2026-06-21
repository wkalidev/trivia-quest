"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useChainId,
  useWriteContract,
  useReadContract,
  useBalance,
} from "wagmi";
import {
  parseEther,
  formatUnits,
  encodeAbiParameters,
  encodePacked,
} from "viem";
import { celo, base } from "viem/chains";
import { motion, AnimatePresence } from "framer-motion";
import { useMiniPay } from "@/hooks/useMiniPay";

// Ubeswap V3 Universal Router on Celo mainnet
const UBESWAP_ROUTER = "0x3C255DED9B25f0BFB4EF1D14234BD2514d7A7A0d" as `0x${string}`;
// Wrapped CELO
const WCELO = "0x471EcE3750Da237f93B8E339c536989b8978a438" as `0x${string}`;
// TRIVQ on Celo
const TRIVQ = "0xe65fc5cacaf9a5aeBBc0e151dEe08A53F24a05C5" as `0x${string}`;
const POOL_FEE = 3000; // 0.30%

// Fallback price derived from seeded pool: 2,999,990 TRIVQ / 30 CELO
const FALLBACK_RATIO = 100_000; // TRIVQ per CELO

// On Celo, native CELO IS the ERC-20 at 0x471... — no WETH9 exists.
// The router's WETH9 slot is a revert stub, so WRAP_ETH (0x0b) always reverts.
// Strategy: send native CELO as msg.value; the router's CELO ERC-20 balance
// increases automatically (Celo native feature), then V3_SWAP_EXACT_IN uses
// that balance directly (payerIsUser=false → router pays via IERC20.transfer).
const COMMANDS = "0x00" as `0x${string}`; // V3_SWAP_EXACT_IN only

// Magic recipient constants for the Universal Router
const MSG_SENDER = "0x0000000000000000000000000000000000000001" as `0x${string}`; // TRIVQ output → msg.sender

const ROUTER_ABI = [
  {
    name: "execute",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "commands", type: "bytes" },
      { name: "inputs", type: "bytes[]" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

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
  const {
    writeContract,
    isPending,
    data: txHash,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const [open, setOpen] = useState(false);
  const [celoInput, setCeloInput] = useState("1");
  const [estimatedOut, setEstimatedOut] = useState<bigint | null>(null);
  const [priceLabel, setPriceLabel] = useState("~100,000 TRIVQ / CELO");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { isInMiniPay, miniPayAddress } = useMiniPay();
  const isOnCelo = chainId === celo.id;

  const { data: trivqBalance, refetch: refetchBalance } = useReadContract({
    address: TRIVQ,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && isOnCelo },
  });

  const { data: celoBalance } = useBalance({
    address,
    query: { enabled: !!address && isOnCelo },
  });

  // Debounced price estimate via GeckoTerminal (TRIVQ/USD ÷ CELO/USD)
  useEffect(() => {
    const val = parseFloat(celoInput);
    if (!celoInput.trim() || isNaN(val) || val <= 0) {
      setEstimatedOut(null);
      return;
    }

    setQuoteLoading(true);
    const ctrl = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const [trivqRes, celoRes] = await Promise.all([
          fetch(
            "https://api.geckoterminal.com/api/v2/networks/celo/tokens/0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5",
            { signal: ctrl.signal }
          ),
          fetch(
            "https://api.geckoterminal.com/api/v2/networks/celo/tokens/0x471ece3750da237f93b8e339c536989b8978a438",
            { signal: ctrl.signal }
          ),
        ]);

        const trivqJson = await trivqRes.json();
        const celoJson = await celoRes.json();
        const trivqUsd = parseFloat(trivqJson?.data?.attributes?.price_usd ?? "0");
        const celoUsd = parseFloat(celoJson?.data?.attributes?.price_usd ?? "0");

        if (trivqUsd > 0 && celoUsd > 0) {
          const ratio = celoUsd / trivqUsd;
          setEstimatedOut(BigInt(Math.floor(val * ratio * 1e18)));
          setPriceLabel(`1 CELO ≈ ${Math.round(ratio).toLocaleString()} TRIVQ`);
        } else {
          // GeckoTerminal has no price yet — use known pool seed ratio
          setEstimatedOut(BigInt(Math.floor(val * FALLBACK_RATIO * 1e18)));
          setPriceLabel("~100,000 TRIVQ / CELO");
        }
      } catch {
        // Network error — fall back to pool ratio
        setEstimatedOut(BigInt(Math.floor(val * FALLBACK_RATIO * 1e18)));
        setPriceLabel("~100,000 TRIVQ / CELO");
      } finally {
        setQuoteLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [celoInput]);

  // Refresh TRIVQ balance after tx confirms
  useEffect(() => {
    if (!txHash) return;
    const t1 = setTimeout(() => refetchBalance(), 5_000);
    const t2 = setTimeout(() => refetchBalance(), 15_000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [txHash, refetchBalance]);

  const handleSwap = useCallback(() => {
    if (!address || !estimatedOut) return;
    setLocalError(null);
    resetWrite();

    const val = parseFloat(celoInput.trim());
    if (!celoInput.trim() || isNaN(val) || val <= 0) {
      setLocalError("Enter a valid CELO amount");
      return;
    }

    let amountIn: bigint;
    try {
      amountIn = parseEther(celoInput.trim());
    } catch {
      setLocalError("Invalid CELO amount");
      return;
    }

    const amountOutMin = (estimatedOut * BigInt(95)) / BigInt(100); // 5% slippage
    console.log("[SwapWidget] amountOutMinimum:", amountOutMin.toString(), "estimatedOut:", estimatedOut.toString());
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 min

    // Path: native CELO (as ERC-20 at WCELO address) → TRIVQ, 0.30% pool
    const path = encodePacked(
      ["address", "uint24", "address"],
      [WCELO, POOL_FEE, TRIVQ]
    );

    // payerIsUser=false → router pays from its own CELO ERC-20 balance.
    // Native CELO sent as msg.value auto-increments the router's ERC-20 balance
    // (Celo native feature: CELO ERC-20 and native token share the same balance).
    // The callback uses IERC20(CELO).transfer(pool, amount) — no WRAP_ETH needed.
    const swapInput = encodeAbiParameters(
      [
        { type: "address" },
        { type: "uint256" },
        { type: "uint256" },
        { type: "bytes" },
        { type: "bool" },
      ],
      [MSG_SENDER, amountIn, amountOutMin, path, false]
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    writeContract({
      address: UBESWAP_ROUTER,
      abi: ROUTER_ABI,
      functionName: "execute",
      args: [COMMANDS, [swapInput], deadline],
      value: amountIn,
      account: address,
      chain: celo,
    });
  }, [address, celoInput, estimatedOut, writeContract, resetWrite]);

  const handleToggle = () => {
    setOpen((o) => !o);
    setLocalError(null);
  };

  const setMax = () => {
    if (!celoBalance) return;
    const max = Math.max(0, parseFloat(celoBalance.formatted) - 0.01);
    setCeloInput(max > 0 ? max.toFixed(4) : "0");
    resetWrite();
    setLocalError(null);
  };

  const errorMsg =
    localError ??
    (writeError
      ? (writeError.message?.split("\n")[0]?.substring(0, 120) ?? "Swap failed")
      : null);

  return (
    <div className="w-full">
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(53,208,127,0.13)" }}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm"
        style={{
          background: open ? "rgba(53,208,127,0.15)" : "rgba(53,208,127,0.08)",
          border: `1px solid ${open ? "rgba(53,208,127,0.5)" : "rgba(53,208,127,0.25)"}`,
          color: "#35D07F",
        }}
      >
        💱 {open ? "Close Swap" : "Buy TRIVQ"}
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

              {!isOnCelo ? (
                <div className="py-3 text-center space-y-1.5">
                  {chainId === base.id ? (
                    <>
                      <p className="text-xs text-[#0052FF]/80 font-bold">No TRIVQ liquidity pool on Base yet.</p>
                      <p className="text-[10px] text-white/30">Switch to Celo to swap CELO → TRIVQ</p>
                      <a
                        href="celo://wallet/add-token?address=0x8ecc1dc70f3bc5be941b61b42707eb7dbddb54c3&chainId=8453"
                        className="block text-[10px] text-[#0052FF]/50 hover:text-[#0052FF] transition-colors mt-1"
                      >
                        + Add TRIVQ (Base) to wallet ↗
                      </a>
                    </>
                  ) : (
                    <p className="text-xs text-[#FBCD00]/80">
                      Switch to Celo network to swap inline
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-[10px] text-white/35 text-center">{priceLabel}</p>

                  {/* CELO input */}
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <span className="text-xs text-white/40 shrink-0 font-medium">CELO</span>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={celoInput}
                      onChange={(e) => {
                        setCeloInput(e.target.value);
                        resetWrite();
                        setLocalError(null);
                      }}
                      className="flex-1 bg-transparent text-right text-white font-mono text-sm outline-none"
                      placeholder="0.0"
                    />
                    {celoBalance && (
                      <button
                        onClick={setMax}
                        className="text-[10px] text-[#35D07F]/50 hover:text-[#35D07F] transition-colors shrink-0 font-bold"
                      >
                        MAX
                      </button>
                    )}
                  </div>

                  <div className="text-center text-white/20 text-xs leading-none">↓</div>

                  {/* TRIVQ output estimate */}
                  <div
                    className="flex items-center justify-between rounded-xl px-3 py-2.5"
                    style={{
                      background: "rgba(251,205,0,0.04)",
                      border: "1px solid rgba(251,205,0,0.1)",
                    }}
                  >
                    <span className="text-xs text-[#FBCD00]/50 font-medium">TRIVQ</span>
                    <span className="font-mono text-sm text-[#FBCD00]">
                      {quoteLoading
                        ? "…"
                        : estimatedOut
                        ? `≈ ${fmtTrivq(estimatedOut)}`
                        : "—"}
                    </span>
                  </div>

                  <p className="text-[10px] text-white/20 text-center">5% max slippage</p>

                  {/* Buy button */}
                  <motion.button
                    onClick={handleSwap}
                    disabled={
                      !address ||
                      isPending ||
                      !estimatedOut ||
                      !celoInput.trim() ||
                      parseFloat(celoInput || "0") <= 0
                    }
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-black text-sm disabled:opacity-40 transition-opacity"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(53,208,127,0.3) 0%, rgba(35,160,95,0.2) 100%)",
                      border: "1px solid rgba(53,208,127,0.4)",
                      color: "#35D07F",
                    }}
                  >
                    {isPending
                      ? "⏳ Confirming…"
                      : !address
                      ? "Connect Wallet"
                      : "💱 BUY TRIVQ"}
                  </motion.button>

                  {/* TRIVQ balance */}
                  {trivqBalance !== undefined && (
                    <p className="text-[10px] text-center text-white/25">
                      Your TRIVQ: {fmtTrivq(trivqBalance as bigint)}
                    </p>
                  )}

                  {/* MiniPay deeplinks */}
                  {isInMiniPay && celoBalance && parseFloat(celoBalance.formatted) < parseFloat(celoInput || "0") && (
                    <a
                      href="https://minipay.opera.com/add_cash"
                      className="block text-center text-[10px] text-[#35D07F]/60 hover:text-[#35D07F] transition-colors"
                    >
                      Low CELO — Add cash via MiniPay ↗
                    </a>
                  )}
                  {isInMiniPay && miniPayAddress && (
                    <a
                      href={`celo://wallet/pay?address=${miniPayAddress}&token=TRIVQ`}
                      className="block text-center text-[10px] text-[#35D07F]/40 hover:text-[#35D07F]/70 transition-colors"
                    >
                      💳 Receive TRIVQ via MiniPay
                    </a>
                  )}

                  {/* Success / TX link */}
                  {txHash && (
                    <a
                      href={`https://celoscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[10px] text-center text-[#35D07F]/60 hover:text-[#35D07F] transition-colors"
                    >
                      ✅ Swap submitted · View on CeloScan ↗
                    </a>
                  )}

                  {/* Error */}
                  {errorMsg && !txHash && (
                    <p className="text-[10px] text-center text-red-400/70 break-words">
                      {errorMsg}
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
