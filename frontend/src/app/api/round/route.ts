import { finishExpiredRound } from "@/lib/finish-round";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory debounce: prevent concurrent requests on the same instance
// from all racing to call finishRound at once.
const lastAttemptMs = new Map<number, number>();
const DEBOUNCE_MS = 60_000;

export async function GET(request: Request) {
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
