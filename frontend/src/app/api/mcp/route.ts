import { NextRequest, NextResponse } from "next/server";

const APP_URL = "https://trivia-quest-eight.vercel.app";

const TOOLS = [
  {
    name: "generate_question",
    description: "Generate an AI trivia question using Groq LLaMA 3.1. Returns question, options (4), correct answer index, and category. Premium tool — direct REST access requires x402 payment (0.001 CELO).",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Question category. One of: African Geography, Web3 & Crypto, History & Culture, Science & Tech, Sports, General Knowledge",
          enum: ["African Geography", "Web3 & Crypto", "History & Culture", "Science & Tech", "Sports", "General Knowledge"]
        },
        language: {
          type: "string",
          description: "Response language",
          enum: ["en", "fr", "es", "it"],
          default: "en"
        }
      },
      required: []
    },
    x402: {
      required: true,
      directEndpoint: "https://trivia-quest-eight.vercel.app/api/ai-question",
      network: "celo",
      asset: "0x471EcE3750Da237f93B8E339c536989b8978a438",
      payTo: "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb",
      maxAmountRequired: "1000000000000000",
      description: "Pay 0.001 CELO per AI question to the TriviaQ prize pool"
    }
  },
  {
    name: "get_stats",
    description: "Get TriviaQ live on-chain stats: total players, current round, prize pool, contracts.",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "get_leaderboard",
    description: "Get the current TriviaQ leaderboard with top players and their scores.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of top players to return (max 10)",
          default: 5
        }
      },
      required: []
    }
  },
  {
    name: "get_duel_info",
    description: "Get information about TriviaQ 1v1 duel mode: how to create duels, wager amounts, contract address.",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  }
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { method, params, id } = body;

    if (method === "initialize") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: {
            name: "triviaq-mcp",
            version: "1.0.0",
          }
        }
      });
    }

    if (method === "tools/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: { tools: TOOLS }
      });
    }

    if (method === "tools/call") {
      const { name, arguments: args } = params;

      if (name === "generate_question") {
        const category = args?.category || "General Knowledge";
        const res = await fetch(
          `${APP_URL}/api/ai-question?category=${encodeURIComponent(category)}`,
          { headers: { "x-mcp-caller": "triviaq-mcp" } }
        );
        const data = await res.json();
        return NextResponse.json({
          jsonrpc: "2.0", id,
          result: {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
          }
        });
      }

      if (name === "get_stats") {
        const res = await fetch(`${APP_URL}/api/stats`);
        const data = await res.json();
        return NextResponse.json({
          jsonrpc: "2.0", id,
          result: {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
          }
        });
      }

      if (name === "get_leaderboard") {
        const limit = Math.min(args?.limit || 5, 10);
        return NextResponse.json({
          jsonrpc: "2.0", id,
          result: {
            content: [{
              type: "text",
              text: JSON.stringify({
                leaderboard_url: `${APP_URL}/leaderboard`,
                note: "View the live leaderboard at the URL above. On-chain data updates every round.",
                contracts: {
                  game: "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb",
                  network: "Celo Mainnet"
                },
                limit
              }, null, 2)
            }]
          }
        });
      }

      if (name === "get_duel_info") {
        return NextResponse.json({
          jsonrpc: "2.0", id,
          result: {
            content: [{
              type: "text",
              text: JSON.stringify({
                duel_url: `${APP_URL}/duel`,
                contract: "0xee7be00cd5454b9bea56d864d82076b8b5de5ca1",
                network: "Celo Mainnet",
                wager_range: "0.01 to 0.5 CELO",
                protocol_fee: "10%",
                winner_gets: "90% of total wager",
                expiry: "24 hours",
                how_to: "1. Create duel with wager → 2. Share duel ID → 3. Opponent joins → 4. Both play → 5. Best score wins"
              }, null, 2)
            }]
          }
        });
      }

      return NextResponse.json({
        jsonrpc: "2.0", id,
        error: { code: -32601, message: `Tool not found: ${name}` }
      });
    }

    if (method === "ping") {
      return NextResponse.json({ jsonrpc: "2.0", id, result: {} });
    }

    return NextResponse.json({
      jsonrpc: "2.0", id,
      error: { code: -32601, message: `Method not found: ${method}` }
    });

  } catch {
    return NextResponse.json({
      jsonrpc: "2.0", id: null,
      error: { code: -32700, message: "Parse error" }
    }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: "TriviaQ MCP Server",
    version: "1.0.0",
    protocol: "MCP 2024-11-05",
    tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
    status: "healthy",
    endpoint: "https://trivia-quest-eight.vercel.app/api/mcp"
  });
}
