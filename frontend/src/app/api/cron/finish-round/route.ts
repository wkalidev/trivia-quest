import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const publicClient = createPublicClient({
      chain: celo,
      transport: http("https://forno.celo.org"),
    });

    const walletClient = createWalletClient({
      account,
      chain: celo,
      transport: http("https://forno.celo.org"),
    });

    const round = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getCurrentRound",
    } as any) as [bigint, bigint, bigint, bigint, `0x${string}`[], boolean];

    const endTime = round[3];
    const isFinished = round[5];
    const now = BigInt(Math.floor(Date.now() / 1000));

    if (isFinished) {
      return Response.json({ ok: true, message: "Round already finished" });
    }

    if (now < endTime) {
      return Response.json({
        ok: true,
        message: `Round not expired. Ends at ${new Date(Number(endTime) * 1000).toLocaleString()}`
      });
    }

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "finishRound",
      args: [[account.address]],
      chain: celo,
      account,
    });

    await publicClient.waitForTransactionReceipt({ hash });

    return Response.json({ ok: true, message: "Round finished", hash });

  } catch (error) {
    console.error("Cron error:", error);
    return Response.json({ error: "Cron failed" }, { status: 500 });
  }
}