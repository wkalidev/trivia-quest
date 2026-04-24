"use client";

import { useEnsName } from "wagmi";
import { mainnet } from "viem/chains";

export function useDisplayName(address?: string): string {
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
    query: { enabled: !!address },
  });

  if (!address) return "—";
  if (ensName) return ensName;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}