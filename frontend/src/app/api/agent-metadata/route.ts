import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    name: "TriviaQ AI Agent",
    type: "agent",
    image: "https://trivia-quest-eight.vercel.app/icon-512.png",
    github: "https://github.com/wkalidev/trivia-quest",
    project: "TriviaQ",
    version: "1.0.0",
    services: [
      {
        type: "custom",
        endpoint: "https://trivia-quest-eight.vercel.app/api/ai-question",
        description: "AI trivia question generator powered by Groq LLaMA 3.1"
      },
      {
        type: "custom",
        endpoint: "https://trivia-quest-eight.vercel.app/api/stats",
        description: "TriviaQ public stats API"
      }
    ],
    registrations: [
      {
        chainId: 42220,
        address: "0xdeacde6ec27fd0cd972c1232c4f0d4171dda2357"
      }
    ],
    description: "AI agent that generates trivia questions on Celo, powers 1v1 duels and runs Discord commands /ask /askcat. Powered by Groq LLaMA 3.1.",
    supportedTrust: ["reputation"]
  })
}