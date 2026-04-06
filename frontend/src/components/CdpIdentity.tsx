"use client";

import { useAccount } from "wagmi";
import { Identity, Avatar, Name, Badge } from "@coinbase/onchainkit/identity";
import { celo } from "viem/chains";

export function CdpIdentity() {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) return null;

  return (
    <Identity
      address={address}
      chain={celo}
      schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
    >
      <Avatar className="w-8 h-8 rounded-full" />
      <Name className="text-white text-sm font-bold" />
      <Badge className="ml-1" />
    </Identity>
  );
}