import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const KNOWN_EVENTS = new Set(["frame_added", "notifications_disabled", "notifications_enabled"]);

// Reject private/loopback/link-local URLs to prevent SSRF via poisoned DB rows
function isSafeHttpsUrl(raw: unknown): boolean {
  if (typeof raw !== "string") return false;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  const h = parsed.hostname;
  if (
    h === "localhost" ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    /^169\.254\./.test(h) ||
    h === "0.0.0.0" ||
    // Block all raw IPv6 literals (covers ::1, ::ffff:127.0.0.1, fc00::, fe80::, etc.)
    h.startsWith("[")
  ) return false;
  return true;
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const body = await req.json();
    const { event, notificationDetails, fid } = body;

    // Validate event type
    if (typeof event !== "string" || !KNOWN_EVENTS.has(event)) {
      return NextResponse.json({ ok: true }); // silently ignore unknown events
    }

    // Validate fid is a positive integer
    const fidNum = Number(fid);
    if (!Number.isInteger(fidNum) || fidNum <= 0) {
      return NextResponse.json({ error: "Invalid fid" }, { status: 400 });
    }

    if (event === "frame_added" && notificationDetails) {
      if (
        typeof notificationDetails.token !== "string" ||
        notificationDetails.token.length < 1 ||
        notificationDetails.token.length > 512 ||
        !isSafeHttpsUrl(notificationDetails.url)
      ) {
        return NextResponse.json({ error: "Invalid notification details" }, { status: 400 });
      }
      await supabase
        .from("farcaster_notifications")
        .upsert({
          fid: String(fidNum),
          token: notificationDetails.token,
          url: notificationDetails.url,
          enabled: true,
        }, { onConflict: "fid" });
    }

    if (event === "notifications_disabled") {
      await supabase
        .from("farcaster_notifications")
        .update({ enabled: false })
        .eq("fid", String(fidNum));
    }

    if (event === "notifications_enabled" && notificationDetails) {
      if (
        typeof notificationDetails.token !== "string" ||
        notificationDetails.token.length < 1 ||
        notificationDetails.token.length > 512 ||
        !isSafeHttpsUrl(notificationDetails.url)
      ) {
        return NextResponse.json({ error: "Invalid notification details" }, { status: 400 });
      }
      await supabase
        .from("farcaster_notifications")
        .upsert({
          fid: String(fidNum),
          token: notificationDetails.token,
          url: notificationDetails.url,
          enabled: true,
        }, { onConflict: "fid" });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}