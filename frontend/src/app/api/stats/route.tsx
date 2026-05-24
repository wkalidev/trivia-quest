import { NextResponse, NextRequest } from 'next/server'
import { encodeFunctionData, decodeFunctionResult } from 'viem'

export const revalidate = 30

const rateLimit = new Map<string, { count: number; resetTime: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimit.get(ip);
  if (!limit || now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + 60_000 });
    return false;
  }
  if (limit.count >= 30) return true;
  limit.count++;
  return false;
}

const ABI = [
  { name: 'getTotalPlayers', type: 'function', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { name: 'getCurrentRound', type: 'function', inputs: [], outputs: [{ type: 'uint256' }, { type: 'uint256' }], stateMutability: 'view' },
] as const

async function celoCall(to: string, functionName: 'getTotalPlayers' | 'getCurrentRound') {
  const data = encodeFunctionData({ abi: ABI, functionName })
  const res = await fetch('https://forno.celo.org', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to, data }, 'latest'] }),
  })
  const json = await res.json()
  if (!json.result || json.result === '0x') return null
  return decodeFunctionResult({ abi: ABI, functionName, data: json.result })
}

const GAME = '0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb'

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let players = null, prizePool = null, roundId = null

  try {
    const [p, round] = await Promise.all([
      celoCall(GAME, 'getTotalPlayers'),
      celoCall(GAME, 'getCurrentRound'),
    ])

    if (p != null)     players   = Number(p as bigint)
    if (round != null) {
      const [id, pool] = round as [bigint, bigint]
      roundId   = Number(id)
      prizePool = pool.toString()
    }
  } catch (e) {
    console.error('[api/stats] onchain error:', e)
  }

  return NextResponse.json({
    project: 'TriviaQ',
    version: '3.0',
    description: 'Blockchain quiz game on Celo — earn TRIVQ tokens by answering questions',
    network: 'celo-mainnet',
    chainId: 42220,
    contracts: {
      game: GAME,
      token: '0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5',
      checkin: '0x8650e6c477f8ae3933dc6d61d85e65c90cf71828',
      referral: '0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e',
      duel: '0xee7be00cd5454b9bea56d864d82076b8b5de5ca1',
    },
    live_stats: {
      players,
      round_id: roundId,
      prize_pool_wei: prizePool,
      total_checkins: null,
      last_updated: new Date().toISOString(),
    },
    game: {
      questions: 446,
      categories: ['African Geography', 'Web3 & Crypto', 'History & Culture', 'Science & Tech', 'Sports', 'General Knowledge'],
      languages: ['en', 'fr', 'es', 'it'],
      questions_per_game: 10,
      timer_seconds: 15,
      ai_mode: true,
      duel_mode: true,
    },
    rewards: {
      per_point: '100 TRIVQ',
      daily_checkin: '100 TRIVQ',
      streak_7_days: '2000 TRIVQ',
      referral: '500 TRIVQ',
      duel_winner: '90% of wager',
      prize_pool_distribution: { first: '50%', second: '30%', third: '20%' },
    },
    sdk: {
      npm: '@wkalidev/trivia-quest-sdk',
      install: 'npm install @wkalidev/trivia-quest-sdk',
      version: '2.0.0',
      weekly_downloads: 20,
    },
    links: {
      app: 'https://trivia-quest-eight.vercel.app',
      github: 'https://github.com/wkalidev/trivia-quest',
      leaderboard: 'https://trivia-quest-eight.vercel.app/leaderboard',
      duel: 'https://trivia-quest-eight.vercel.app/duel',
    },
  })
}