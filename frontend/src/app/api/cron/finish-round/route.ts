import { finishExpiredRound } from "@/lib/finish-round";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [celoResult, baseResult] = await Promise.allSettled([
    finishExpiredRound(42220),
    finishExpiredRound(8453),
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
  });
}
