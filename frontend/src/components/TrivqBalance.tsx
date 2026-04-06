"use client";

import { useAccount } from "wagmi";
import { useReadContract } from "wagmi";

const TRIVQ_ADDRESS = "0xF50AFD22D5285f0398Bf1Be433252cE6a9FD9579" as const;

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
] as const;

export function TrivqBalance() {
  const { address, isConnected } = useAccount();

  const { data: balance } = useReadContract({
    address: TRIVQ_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  if (!isConnected || !balance) return null;

  const formatted = (Number(balance) / 1e18).toLocaleString("fr-FR", {
    maximumFractionDigits: 0,
  });

  return (
    <div className="flex items-center gap-2 bg-[#FBCD00]/20 border border-[#FBCD00]/40 rounded-2xl px-4 py-2">
      <span className="text-[#FBCD00] font-black text-sm">{formatted}</span>
      <span className="text-white/60 text-xs">$TRIVQ</span>
    </div>
  );
}