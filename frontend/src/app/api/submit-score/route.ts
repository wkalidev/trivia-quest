import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player, score, points } = body;

    if (!player || score === undefined || points === undefined) {
      return Response.json({ error: "Missing params" }, { status: 400 });
    }

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      return Response.json({ error: "Server config error" }, { status: 500 });
    }

    const account = privateKeyToAccount(`0x${privateKey}`);

    const walletClient = createWalletClient({
      account,
      chain: celo,
      transport: http("https://forno.celo.org"),
    });

    const publicClient = createPublicClient({
      chain: celo,
      transport: http("https://forno.celo.org"),
    });

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "submitScore",
      args: [player as `0x${string}`, BigInt(score), BigInt(points)],
      chain: celo,
      account,
    });

    await publicClient.waitForTransactionReceipt({ hash });

    return Response.json({ success: true, hash });

  } catch (error) {
    console.error("submitScore error:", error);
    return Response.json({ error: "Failed to submit score" }, { status: 500 });
  }
}