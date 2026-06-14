import { createWalletClient, createPublicClient, http, verifyMessage } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";

const scoreRateLimit = new Map<string, { count: number; resetTime: number }>();
function isScoreRateLimited(player: string): boolean {
  const now = Date.now();
  const limit = scoreRateLimit.get(player.toLowerCase());
  if (!limit || now > limit.resetTime) {
    scoreRateLimit.set(player.toLowerCase(), { count: 1, resetTime: now + 3600_000 });
    return false;
  }
  if (limit.count >= 5) return true;
  limit.count++;
  return false;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player, score, points, signature, message } = body;

    if (!player || score === undefined || points === undefined) {
      return Response.json({ error: "Missing params" }, { status: 400 });
    }

    // Max possible score: 10 questions × 3x multiplier × 100 points = 3000
    if (score < 0 || score > 10 || points < 0 || points > 3000) {
      return Response.json({ error: "Invalid score range" }, { status: 400 });
    }

    if (!signature || !message) {
      return Response.json({ error: "Missing signature" }, { status: 401 });
    }

    const expectedMessage = `TriviaQ score: ${score} points: ${points} player: ${player.toLowerCase()}`;
    if (!message.includes(score.toString()) || !message.includes(player.toLowerCase())) {
      return Response.json({ error: "Invalid message" }, { status: 401 });
    }

    const isValid = await verifyMessage({
      address: player as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
    if (!isValid) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (isScoreRateLimited(player)) {
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
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
