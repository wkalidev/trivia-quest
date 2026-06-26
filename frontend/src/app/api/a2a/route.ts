import { NextRequest, NextResponse } from "next/server";

const APP_URL = "https://trivia-quest-eight.vercel.app";

function a2aResult(id: unknown, text: string) {
  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    result: {
      id,
      status: {
        state: "completed",
        timestamp: new Date().toISOString(),
      },
      artifacts: [
        {
          parts: [{ type: "text", text }],
        },
      ],
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, method, params } = body;

    if (method === "tasks/send") {
      const message = params?.message;
      const userText: string =
        message?.parts?.find((p: { type: string; text?: string }) => p.type === "text")
          ?.text ?? "";
      const lower = userText.toLowerCase();

      if (lower.includes("stat") || lower.includes("player") || lower.includes("round")) {
        const res = await fetch(`${APP_URL}/api/stats`);
        const data = await res.json();
        return a2aResult(id, JSON.stringify(data, null, 2));
      }

      if (lower.includes("leaderboard") || lower.includes("top player") || lower.includes("ranking")) {
        return a2aResult(
          id,
          JSON.stringify(
            {
              leaderboard_url: `${APP_URL}/leaderboard`,
              note: "View the live leaderboard at the URL above. On-chain data updates every round.",
              contracts: { game: "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb", network: "Celo Mainnet" },
            },
            null,
            2
          )
        );
      }

      if (lower.includes("duel") || lower.includes("wager") || lower.includes("1v1")) {
        return a2aResult(
          id,
          JSON.stringify(
            {
              duel_url: `${APP_URL}/duel`,
              contract: "0xee7be00cd5454b9bea56d864d82076b8b5de5ca1",
              network: "Celo Mainnet",
              wager_range: "0.01 to 0.5 CELO",
              protocol_fee: "10%",
              winner_gets: "90% of total wager",
              expiry: "24 hours",
            },
            null,
            2
          )
        );
      }

      // Default: generate trivia question
      const category = (() => {
        if (lower.includes("geography") || lower.includes("afric")) return "African Geography";
        if (lower.includes("web3") || lower.includes("crypto")) return "Web3 & Crypto";
        if (lower.includes("history") || lower.includes("culture")) return "History & Culture";
        if (lower.includes("science") || lower.includes("tech")) return "Science & Tech";
        if (lower.includes("sport")) return "Sports";
        return "General Knowledge";
      })();

      const res = await fetch(
        `${APP_URL}/api/ai-question?category=${encodeURIComponent(category)}`,
        { headers: { "x-mcp-caller": "triviaq-a2a" } }
      );
      const data = await res.json();
      return a2aResult(id, JSON.stringify(data, null, 2));
    }

    if (method === "tasks/get") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: "Stateless agent — tasks/get not supported" },
      });
    }

    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    });
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: "TriviaQ A2A Agent",
    protocol: "A2A",
    version: "3.2.0",
    skills: ["generate_question", "get_stats", "get_leaderboard", "get_duel_info"],
    agentCard: `${APP_URL}/.well-known/agent.json`,
    status: "healthy",
  });
}
