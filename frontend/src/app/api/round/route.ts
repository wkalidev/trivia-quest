import { finishExpiredRound } from "@/lib/finish-round";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory debounce: prevent concurrent requests on the same instance
// from all racing to call finishRound at once.
const lastAttemptMs = new Map<number, number>();
const DEBOUNCE_MS = 60_000;

// IP rate limit: max 5 calls/min per IP (round check is cheap when active, expensive only on expiry)
const roundRateLimit = new Map<string, { count: number; resetTime: number }>();
function isRoundRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = roundRateLimit.get(ip);
  if (!limit || now > limit.resetTime) {
    roundRateLimit.set(ip, { count: 1, resetTime: now + 60_000 });
    return false;
  }
  if (limit.count >= 5) return true;
  limit.count++;
  return false;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRoundRateLimited(ip)) {
    return Response.json({ ok: true, debounced: true });
  }

  const { searchParams } = new URL(request.url);
  const rawChain = searchParams.get("chain");
  const chainId = rawChain === "8453" ? 8453 : 42220;

  const last = lastAttemptMs.get(chainId);
  if (last && Date.now() - last < DEBOUNCE_MS) {
    return Response.json({ ok: true, debounced: true });
  }

  lastAttemptMs.set(chainId, Date.now());

  try {
    // Don't wait for receipt — tx is submitted and will mine; client refetches
    // via wagmi's 15s interval. Keeps well under Hobby's 10s function limit.
    const result = await finishExpiredRound(chainId as 42220 | 8453, {
      waitForReceipt: false,
    });
    return Response.json({ ok: true, ...result });
  } catch (err: any) {
    // Non-fatal: don't surface stack traces to the client
    console.error("[api/round] finishExpiredRound failed:", err?.message ?? err);
    return Response.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
