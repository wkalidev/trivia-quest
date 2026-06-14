import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const body = await req.json();
    const { event, notificationDetails, fid } = body;

    if (event === "frame_added" && notificationDetails) {
      await supabase
        .from("farcaster_notifications")
        .upsert({
          fid: String(fid),
          token: notificationDetails.token,
          url: notificationDetails.url,
          enabled: true,
        }, { onConflict: "fid" });
    }

    if (event === "notifications_disabled") {
      await supabase
        .from("farcaster_notifications")
        .update({ enabled: false })
        .eq("fid", String(fid));
    }

    if (event === "notifications_enabled" && notificationDetails) {
      await supabase
        .from("farcaster_notifications")
        .upsert({
          fid: String(fid),
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