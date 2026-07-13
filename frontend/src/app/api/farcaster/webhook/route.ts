import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
  type ParseWebhookEvent,
} from "@farcaster/miniapp-node";

// "miniapp_*" is the current (2025+) event naming. "frame_added" / "frame_removed"
// are kept for backwards compatibility with older Farcaster clients that may still
// send the legacy Frames v2 event names.
const ADD_EVENTS = new Set(["miniapp_added", "frame_added"]);
const REMOVE_EVENTS = new Set(["miniapp_removed", "frame_removed"]);
const KNOWN_EVENTS = new Set([...ADD_EVENTS, ...REMOVE_EVENTS, "notifications_disabled", "notifications_enabled"]);

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

type NotificationDetails = { token?: unknown; url?: unknown };

function isValidNotificationDetails(
  d: unknown
): d is { token: string; url: string } {
  if (!d || typeof d !== "object") return false;
  const nd = d as NotificationDetails;
  return (
    typeof nd.token === "string" &&
    nd.token.length >= 1 &&
    nd.token.length <= 512 &&
    isSafeHttpsUrl(nd.url)
  );
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const requestJson = await req.json();

    let eventName: string;
    let notificationDetails: unknown;
    let fidNum: number;

    // Preferred path: cryptographically verify the JSON Farcaster Signature (JFS)
    // envelope Farcaster clients actually send to webhookUrl. Requires a free
    // NEYNAR_API_KEY (https://neynar.com) -- verifyAppKeyWithNeynar checks the
    // signer's app key against the Farcaster network via Neynar's API.
    if (process.env.NEYNAR_API_KEY) {
      try {
        const data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
        fidNum = data.fid;
        eventName = data.event.event;
        notificationDetails =
          "notificationDetails" in data.event ? data.event.notificationDetails : undefined;
      } catch (e: unknown) {
        const error = e as ParseWebhookEvent.ErrorType;
        console.error("Webhook signature verification failed:", error?.name, error?.message);
        switch (error?.name) {
          case "VerifyJsonFarcasterSignature.InvalidDataError":
          case "VerifyJsonFarcasterSignature.InvalidEventDataError":
            return NextResponse.json({ error: "Invalid event data" }, { status: 400 });
          case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
            return NextResponse.json({ error: "Invalid app key" }, { status: 401 });
          default:
            // Internal/transient verification error -- ask the client to retry later
            return NextResponse.json({ error: "Verification error" }, { status: 500 });
        }
      }
    } else {
      // Fallback (unverified): NEYNAR_API_KEY is not configured yet, so we cannot
      // check the JFS signature. This trusts the raw POST body -- set NEYNAR_API_KEY
      // as soon as possible to close this gap.
      console.warn(
        "NEYNAR_API_KEY not set -- Farcaster webhook events are NOT signature-verified. " +
        "Sign up for a free key at https://neynar.com to enable verification."
      );
      const body = requestJson as { event?: unknown; notificationDetails?: unknown; fid?: unknown };
      if (typeof body.event !== "string" || !KNOWN_EVENTS.has(body.event)) {
        return NextResponse.json({ ok: true }); // silently ignore unknown events
      }
      const parsedFid = Number(body.fid);
      if (!Number.isInteger(parsedFid) || parsedFid <= 0) {
        return NextResponse.json({ error: "Invalid fid" }, { status: 400 });
      }
      eventName = body.event;
      notificationDetails = body.notificationDetails;
      fidNum = parsedFid;
    }

    if (ADD_EVENTS.has(eventName)) {
      if (notificationDetails) {
        if (!isValidNotificationDetails(notificationDetails)) {
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
      } else {
        // App added but client doesn't equate "added" with "notifications enabled"
        // (unlike Warpcast) -- no token yet, nothing to store.
      }
    }

    if (REMOVE_EVENTS.has(eventName) || eventName === "notifications_disabled") {
      await supabase
        .from("farcaster_notifications")
        .update({ enabled: false })
        .eq("fid", String(fidNum));
    }

    if (eventName === "notifications_enabled") {
      if (!isValidNotificationDetails(notificationDetails)) {
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
