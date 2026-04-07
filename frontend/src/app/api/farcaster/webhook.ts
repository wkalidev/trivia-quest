import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { event, data } = req.body;
  console.log("Farcaster webhook event:", event, data);

  // Gérer les events Farcaster
  switch (event) {
    case "frame_added":
      // Joueur a ajouté la Mini App
      console.log("New user added TriviaQ:", data?.fid);
      break;
    case "notifications_enabled":
      // Joueur a activé les notifs
      console.log("Notifications enabled for:", data?.fid);
      break;
    default:
      break;
  }

  res.status(200).json({ ok: true });
}