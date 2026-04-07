import { sdk } from "@farcaster/frame-sdk";

export async function initFarcaster() {
  try {
    const context = await sdk.context;
    return context;
  } catch {
    return null;
  }
}

export async function getFarcasterUser() {
  try {
    const context = await sdk.context;
    return context?.user ?? null;
  } catch {
    return null;
  }
}

export async function sendFarcasterNotification(
  fid: number,
  title: string,
  body: string
) {
  const res = await fetch("/api/farcaster/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fid, title, body }),
  });
  return res.json();
}