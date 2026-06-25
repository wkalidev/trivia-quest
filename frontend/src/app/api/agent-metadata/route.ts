import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    "@context": "https://trivia-quest-eight.vercel.app/api/agent-schema",
    "@type": "Agent",
    name: "TriviaQ AI Agent",
    type: "agent",
    image: "https://trivia-quest-eight.vercel.app/icon-512.png",
    github: "https://github.com/wkalidev/trivia-quest",
    project: "TriviaQ",
    version: "3.2.0",
    services: [
      {
        type: "mcp",
        url: "https://trivia-quest-eight.vercel.app/api/mcp",
        description: "TriviaQ MCP Server — generate questions, get stats, leaderboard, duel info"
      },
      {
        type: "custom",
        endpoint: "https://trivia-quest-eight.vercel.app/api/ai-question",
        description: "AI trivia question generator powered by Groq LLaMA 3.1"
      },
      {
        type: "custom",
        endpoint: "https://trivia-quest-eight.vercel.app/api/stats",
        description: "TriviaQ public stats API — live on-chain data"
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
    capabilities: ["trivia", "quiz", "ai-questions", "1v1-duel", "blockchain", "earn"],
    tags: ["trivia", "quiz", "celo", "blockchain", "earn", "minipay", "farcaster", "ai"],
    category: "gaming",
    subcategory: "quiz",
    supportedChains: [42220, 8453],
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    }
  })
}
