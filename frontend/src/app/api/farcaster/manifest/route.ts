import { NextResponse } from "next/server";

const manifest = {
  accountAssociation: {
    header:
      "eyJmaWQiOjkxNDc5MywidHlwZSI6ImF1dGgiLCJrZXkiOiIweERFQWNEZTZlQzI3RmQwY0Q5NzJjMTIzMkM0ZjBkNDE3MWRkYTIzNTcifQ",
    payload: "eyJkb21haW4iOiJ0cml2aWEtcXVlc3QtZWlnaHQudmVyY2VsLmFwcCJ9",
    signature:
      "Ih/sWw2ashC589I9lhZi0hlAjh2FUe7UEUSv/YpcqPY3aYqySR00Wtyl8wiJ6Osdy4k9uzo9rU8WEPlA+Wnjcxs=",
  },
  frame: {
    version: "1",
    name: "TriviaQ",
    iconUrl: "https://trivia-quest-eight.vercel.app/icon-512.png",
    homeUrl: "https://trivia-quest-eight.vercel.app",
    imageUrl: "https://trivia-quest-eight.vercel.app/opengraph-image",
    buttonTitle: "Play and Earn 🎮",
    splashImageUrl: "https://trivia-quest-eight.vercel.app/icon-512.png",
    splashBackgroundColor: "#0a0f1e",
    webhookUrl: "https://trivia-quest-eight.vercel.app/api/farcaster/webhook",
    subtitle: "Play. Learn. Earn on Celo.",
    description:
      "Blockchain quiz game on Celo. Answer questions about Africa, Web3 and Science. Earn TRIVQ tokens, climb the on-chain leaderboard, win the prize pool. MiniPay compatible.",
    primaryCategory: "games",
    tags: ["quiz", "celo", "web3", "gamefi", "minipay"],
    tagline: "Answer. Learn. Earn on Celo.",
    heroImageUrl: "https://trivia-quest-eight.vercel.app/opengraph-image",
    ogTitle: "TriviaQ - Play. Learn. Earn.",
    ogDescription:
      "Quiz game with real token rewards. 1200+ questions, on-chain leaderboard, MiniPay compatible.",
    token: "eip155:42220/erc20:0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5",
    ogImageUrl: "https://trivia-quest-eight.vercel.app/opengraph-image",
    castShareUrl: "https://trivia-quest-eight.vercel.app",
    screenshotUrls: [],
  },
};

export async function GET() {
  return NextResponse.json(manifest, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
