import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    "@context": "https://trivia-quest-eight.vercel.app/api/agent-schema",
    "@type": "Agent",
    name: "TriviaQ AI Agent",
    type: "agent",
    status: "active",
    image: "https://trivia-quest-eight.vercel.app/icon-512.png",
    github: "https://github.com/wkalidev/trivia-quest",
    project: "TriviaQ",
    version: "3.2.0",
    homepage: "https://trivia-quest-eight.vercel.app",
    documentation: "https://github.com/wkalidev/trivia-quest",
    license: "MIT",
    created: "2026-05-01",
    updated: "2026-06-26",
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
    services: [
      {
        type: "mcp",
        url: "https://trivia-quest-eight.vercel.app/api/mcp",
        description: "TriviaQ MCP Server — generate questions, get stats, leaderboard, duel info"
      },
      {
        type: "a2a",
        url: "https://trivia-quest-eight.vercel.app/api/a2a",
        agentCard: "https://trivia-quest-eight.vercel.app/.well-known/agent.json",
        description: "TriviaQ A2A Agent — Agent-to-Agent protocol endpoint"
      },
      {
        type: "rest",
        url: "https://trivia-quest-eight.vercel.app/api/ai-question",
        description: "AI trivia question generator powered by Groq LLaMA 3.1",
        x402: true
      },
      {
        type: "rest",
        url: "https://trivia-quest-eight.vercel.app/api/stats",
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
    capabilities: ["trivia", "quiz", "ai-questions", "1v1-duel", "blockchain", "earn", "a2a", "x402"],
    tags: ["trivia", "quiz", "celo", "blockchain", "earn", "minipay", "farcaster", "ai", "a2a", "x402"],
    category: "gaming",
    subcategory: "quiz",
    supportedChains: [42220, 8453],
    x402: {
      enabled: true,
      endpoint: "https://trivia-quest-eight.vercel.app/api/ai-question",
      network: "celo",
      asset: "0x471EcE3750Da237f93B8E339c536989b8978a438",
      payTo: "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb",
      maxAmountRequired: "1000000000000000"
    },
    agentCard: "https://trivia-quest-eight.vercel.app/.well-known/agent.json",
    openapi: "https://trivia-quest-eight.vercel.app/.well-known/openapi.json",
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    }
  })
}
