import { createWalletClient, createPublicClient, http, verifyMessage } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo, base } from "viem/chains";
import { CONTRACTS, CONTRACT_ABI } from "@/lib/contract";

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

// ✅ Anti-replay — nonces vus, single-use, expirés après leur fenêtre de validité.
// Empêche qu'une signature capturée soit rejouée pour re-mint des récompenses.
const usedNonces = new Map<string, number>(); // nonce -> expiry (ms)
const MAX_SIGNATURE_WINDOW_SECONDS = 10 * 60; // refuse tout exp trop éloigné dans le futur

function cleanupExpiredNonces(now: number) {
  for (const [nonce, expiresAt] of usedNonces) {
    if (now > expiresAt) usedNonces.delete(nonce);
  }
}

const CHAIN_CONFIG: Record<number, { chain: typeof celo | typeof base; rpc: string }> = {
  [celo.id]: { chain: celo, rpc: "https://forno.celo.org" },
  [base.id]: { chain: base, rpc: "https://mainnet.base.org" },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player, score, points, signature, message, chainId, exp, nonce } = body;

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

    if (!message.includes(score.toString()) || !message.includes(player.toLowerCase())) {
      return Response.json({ error: "Invalid message" }, { status: 401 });
    }

    // ✅ Anti-replay (exp + nonce). Backward-compatible: clients on an old cached
    // bundle (PWA/service worker) that don't send exp/nonce yet still fall back
    // to the legacy check below rather than being hard-rejected mid-rollout.
    const now = Date.now();
    if (exp !== undefined && nonce !== undefined) {
      if (!message.includes(`exp: ${exp}`) || !message.includes(`nonce: ${nonce}`)) {
        return Response.json({ error: "Invalid message" }, { status: 401 });
      }
      const expMs = Number(exp) * 1000;
      if (!Number.isFinite(expMs) || now > expMs) {
        return Response.json({ error: "Signature expired" }, { status: 401 });
      }
      if (expMs - now > MAX_SIGNATURE_WINDOW_SECONDS * 1000) {
        return Response.json({ error: "Invalid expiry" }, { status: 401 });
      }
      cleanupExpiredNonces(now);
      if (usedNonces.has(nonce)) {
        return Response.json({ error: "Signature already used" }, { status: 401 });
      }
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

    // Mark nonce as consumed only once signature + rate limit both pass —
    // avoids burning a legitimate nonce on a request that fails for another reason.
    if (exp !== undefined && nonce !== undefined) {
      usedNonces.set(nonce, Number(exp) * 1000);
    }

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      return Response.json({ error: "Server config error" }, { status: 500 });
    }

    const resolvedChainId = Number(chainId) === base.id ? base.id : celo.id;
    const { chain, rpc } = CHAIN_CONFIG[resolvedChainId];
    const contractAddress = CONTRACTS[resolvedChainId].game;

    console.log(`[submit-score] chainId=${resolvedChainId} contract=${contractAddress}`);

    const normalizedKey = (privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`) as `0x${string}`;
    const account = privateKeyToAccount(normalizedKey);

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(rpc),
    });

    const publicClient = createPublicClient({
      chain,
      transport: http(rpc),
    });

    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: CONTRACT_ABI,
      functionName: "submitScore",
      args: [player as `0x${string}`, BigInt(score), BigInt(points)],
      chain,
      account,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === "reverted") {
      console.error(`[submit-score] tx reverted: ${hash} chainId=${resolvedChainId} player=${player}`);
      return Response.json({ error: "Score submission reverted — player may not be in the current round", hash }, { status: 422 });
    }

    return Response.json({ success: true, hash });

  } catch (error) {
    console.error("submitScore error:", error);
    return Response.json({ error: "Failed to submit score" }, { status: 500 });
  }
}
