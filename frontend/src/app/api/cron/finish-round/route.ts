import { finishExpiredRound } from "@/lib/finish-round";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Soneium Mainnet (1868) intentionally excluded until the mainnet deploy lands —
  // finishExpiredRound() throws cleanly on a missing contract address, but no
  // point calling it every cron tick before then.
  const [celoResult, baseResult, minatoResult] = await Promise.allSettled([
    finishExpiredRound(42220),
    finishExpiredRound(8453),
    finishExpiredRound(1946),
  ]);

  return Response.json({
    ok: true,
    celo:
      celoResult.status === "fulfilled"
        ? celoResult.value
        : { error: (celoResult as PromiseRejectedResult).reason?.message },
    base:
      baseResult.status === "fulfilled"
        ? baseResult.value
        : { error: (baseResult as PromiseRejectedResult).reason?.message },
    soneiumMinato:
      minatoResult.status === "fulfilled"
        ? minatoResult.value
        : { error: (minatoResult as PromiseRejectedResult).reason?.message },
  });
}
