import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo, base } from "viem/chains";
import { CONTRACTS, CONTRACT_ABI } from "@/lib/contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLACEHOLDER_WINNER = "0x000000000000000000000000000000000000dEaD" as `0x${string}`;
const BASE_TREASURY = "0x995aC10d5B6778B90eF060b7ab585D854C1Ed914" as `0x${string}`;

async function finishExpiredRound(chainConfig: {
  chain: typeof celo | typeof base;
  rpc: string;
  gameAddress: `0x${string}`;
  account: ReturnType<typeof privateKeyToAccount>;
}) {
  const { chain, rpc, gameAddress, account } = chainConfig;

  const publicClient = createPublicClient({ chain, transport: http(rpc) });
  const walletClient = createWalletClient({ account, chain, transport: http(rpc) });

  const round = await publicClient.readContract({
    address: gameAddress,
    abi: CONTRACT_ABI,
    functionName: "getCurrentRound",
  } as any) as [bigint, bigint, bigint, bigint, `0x${string}`[], boolean];

  const endTime = round[3];
  const isFinished = round[5];
  const prizePool = round[1];
  const now = BigInt(Math.floor(Date.now() / 1000));

  if (isFinished) return { status: "already_finished" };
  if (now < endTime) {
    return { status: "active", endsAt: new Date(Number(endTime) * 1000).toISOString() };
  }

  const leaderboard = await publicClient.readContract({
    address: gameAddress,
    abi: CONTRACT_ABI,
    functionName: "getLeaderboard",
  } as any) as Array<{ player: `0x${string}`; totalPoints: bigint }>;

  let topWinners: `0x${string}`[];

  if (leaderboard.length === 0 || prizePool === BigInt(0)) {
    topWinners = [PLACEHOLDER_WINNER];
  } else {
    const candidates = leaderboard.slice(0, 3).map((e) => e.player);
    topWinners = await Promise.all(
      candidates.map(async (addr) => {
        const code = await publicClient.getBytecode({ address: addr });
        const isContract = code !== undefined && code !== "0x";
        return isContract ? BASE_TREASURY : addr;
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

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status === "reverted") throw new Error(`finishRound reverted: ${hash}`);

  return { status: "finished", hash, block: receipt.blockNumber.toString() };
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      return Response.json({ error: "Server config error" }, { status: 500 });
    }

    const account = privateKeyToAccount(`0x${privateKey}`);

    const [celoResult, baseResult] = await Promise.allSettled([
      finishExpiredRound({
        chain: celo,
        rpc: "https://forno.celo.org",
        gameAddress: CONTRACTS[celo.id].game,
        account,
      }),
      finishExpiredRound({
        chain: base,
        rpc: "https://mainnet.base.org",
        gameAddress: CONTRACTS[base.id].game,
        account,
      }),
    ]);

    return Response.json({
      ok: true,
      celo: celoResult.status === "fulfilled" ? celoResult.value : { error: (celoResult as PromiseRejectedResult).reason?.message },
      base: baseResult.status === "fulfilled" ? baseResult.value : { error: (baseResult as PromiseRejectedResult).reason?.message },
    });
  } catch (error) {
    console.error("Cron error:", error);
    return Response.json({ error: "Cron failed" }, { status: 500 });
  }
}
