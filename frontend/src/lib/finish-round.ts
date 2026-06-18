import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo, base } from "viem/chains";
import { CONTRACTS, CONTRACT_ABI } from "@/lib/contract";

export const PLACEHOLDER_WINNER =
  "0x000000000000000000000000000000000000dEaD" as `0x${string}`;
// Used when a top-scorer is a smart-contract wallet to avoid OOG on transfer()
export const BASE_TREASURY =
  "0x995aC10d5B6778B90eF060b7ab585D854C1Ed914" as `0x${string}`;

export type FinishResult =
  | { status: "active"; endsAt: string }
  | { status: "already_finished" }
  | { status: "finished"; hash: string; block: string }
  | { status: "sent"; hash: string }; // tx submitted, not yet confirmed

interface Options {
  waitForReceipt?: boolean; // default true
}

export async function finishExpiredRound(
  chainId: 42220 | 8453,
  opts: Options = {}
): Promise<FinishResult> {
  const { waitForReceipt = true } = opts;

  const isBase = chainId === 8453;
  const chain = isBase ? base : celo;
  const rpc = isBase ? "https://mainnet.base.org" : "https://forno.celo.org";
  const gameAddress = isBase ? CONTRACTS[base.id].game : CONTRACTS[celo.id].game;

  const publicClient = createPublicClient({ chain, transport: http(rpc) });

  const round = (await publicClient.readContract({
    address: gameAddress,
    abi: CONTRACT_ABI,
    functionName: "getCurrentRound",
  } as any)) as [bigint, bigint, bigint, bigint, `0x${string}`[], boolean];

  const endTime = round[3];
  const isFinished = round[5];
  const prizePool = round[1];
  const now = BigInt(Math.floor(Date.now() / 1000));

  if (isFinished) return { status: "already_finished" };
  if (now < endTime)
    return { status: "active", endsAt: new Date(Number(endTime) * 1000).toISOString() };

  // Only need the private key from here — check late so active-round reads work without it
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY not set");

  const account = privateKeyToAccount(`0x${privateKey}` as `0x${string}`);
  const walletClient = createWalletClient({ account, chain, transport: http(rpc) });

  const leaderboard = (await publicClient.readContract({
    address: gameAddress,
    abi: CONTRACT_ABI,
    functionName: "getLeaderboard",
  } as any)) as Array<{ player: `0x${string}`; totalPoints: bigint }>;

  let topWinners: `0x${string}`[];

  if (leaderboard.length === 0 || prizePool === BigInt(0)) {
    topWinners = [PLACEHOLDER_WINNER];
  } else {
    const candidates = leaderboard.slice(0, 3).map((e) => e.player);
    topWinners = await Promise.all(
      candidates.map(async (addr) => {
        const code = await publicClient.getBytecode({ address: addr });
        return code && code !== "0x" ? BASE_TREASURY : addr;
      })
    );
  }

  const hash = await walletClient.writeContract({
    address: gameAddress,
    abi: CONTRACT_ABI,
    functionName: "finishRound",
    args: [topWinners],
    chain,
    account,
  });

  if (!waitForReceipt) return { status: "sent", hash };

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status === "reverted") throw new Error(`finishRound reverted: ${hash}`);

  return { status: "finished", hash, block: receipt.blockNumber.toString() };
}
