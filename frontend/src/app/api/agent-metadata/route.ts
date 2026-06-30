import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    "@context": "https://trivia-quest-eight.vercel.app/api/agent-schema",
    "@type": "Agent",
    name: "TriviaQ AI Agent",
    type: "agent",
    // spec field names: active (bool), updatedAt (unix timestamp)
    active: true,
    image: "https://trivia-quest-eight.vercel.app/icon-512.png",
    github: "https://github.com/wkalidev/trivia-quest",
    project: "TriviaQ",
    version: "3.3.0",
    homepage: "https://trivia-quest-eight.vercel.app",
    documentation: "https://github.com/wkalidev/trivia-quest",
    license: "MIT",
    updatedAt: 1782820800,
    provider: {
      name: "wkalidev",
      url: "https://github.com/wkalidev",
      email: "wkalidev@gmail.com"
    },
    contact: {
      email: "wkalidev@gmail.com",
      support: "mailto:wkalidev@gmail.com"
    },
    supportUrl: "mailto:wkalidev@gmail.com",
    // spec: services use "name" + "endpoint" (not "type" + "url")
    services: [
      {
        name: "MCP",
        endpoint: "https://trivia-quest-eight.vercel.app/api/mcp",
        version: "2024-11-05",
        description: "TriviaQ MCP Server — generate questions, get stats, leaderboard, duel info"
      },
      {
        name: "A2A",
        endpoint: "https://trivia-quest-eight.vercel.app/api/a2a",
        version: "0.3.0",
        agentCard: "https://trivia-quest-eight.vercel.app/.well-known/agent-card.json",
        description: "TriviaQ A2A Agent — Agent-to-Agent protocol endpoint"
      },
      {
        name: "agentWallet",
        endpoint: "eip155:42220:0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb",
        description: "TriviaQ prize pool wallet on Celo Mainnet — x402 payment recipient"
      },
      {
        name: "web",
        endpoint: "https://trivia-quest-eight.vercel.app",
        description: "TriviaQ app — Play. Learn. Earn on Celo."
      }
    ],
    registrations: [
      {
        chainId: 42220,
        address: "0xdeacde6ec27fd0cd972c1232c4f0d4171dda2357"
      }
    ],
    description: "AI agent that generates trivia questions on Celo, powers 1v1 duels and runs Discord commands /ask /askcat. Powered by Groq LLaMA 3.1.",
    supportedTrust: ["reputation"],
    capabilities: ["trivia", "quiz", "ai-questions", "1v1-duel", "blockchain", "earn", "a2a", "x402"],
    tags: ["trivia", "quiz", "celo", "blockchain", "earn", "minipay", "farcaster", "ai", "a2a", "x402"],
    category: "gaming",
    subcategory: "quiz",
    supportedChains: [42220, 8453],
    // spec field name: x402Support (boolean)
    x402Support: true,
    agentCard: "https://trivia-quest-eight.vercel.app/.well-known/agent-card.json",
    openapi: "https://trivia-quest-eight.vercel.app/.well-known/openapi.json",
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    }
  })
}
