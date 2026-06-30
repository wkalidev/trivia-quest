import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: users } = await supabase
    .from("farcaster_notifications")
    .select("*")
    .eq("enabled", true);

  if (!users || users.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const results = await Promise.allSettled(
    users.map(async (user) => {
      // SSRF guard: validate URL, then fetch without following redirects
      let parsed: URL;
      try { parsed = new URL(user.url); } catch { throw new Error(`Invalid URL for fid ${user.fid}`); }
      if (parsed.protocol !== "https:") throw new Error(`Non-HTTPS URL for fid ${user.fid}`);
      const h = parsed.hostname;
      if (
        h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") ||
        /^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(h) || /^169\.254\./.test(h) ||
        h === "0.0.0.0" ||
        // Block all raw IPv6 literals (Farcaster notification endpoints always use FQDNs)
        h.startsWith("[")
      ) throw new Error(`Blocked URL for fid ${user.fid}`);

      const res = await fetch(user.url, {
        method: "POST",
        redirect: "error", // never follow redirects — redirect target bypasses hostname validation
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId: `checkin-${Date.now()}`,
          title: "🔥 Daily Check-in Available!",
          body: "Come check in on TriviaQ to keep your streak alive!",
          targetUrl: "https://trivia-quest-eight.vercel.app/checkin",
          tokens: [user.token],
        }),
      });
      if (!res.ok) throw new Error(`Failed for fid ${user.fid}`);
    })
  );

  const sent = results.filter(r => r.status === "fulfilled").length;
  return NextResponse.json({ sent, total: users.length });
}