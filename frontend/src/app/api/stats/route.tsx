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

async function rpcCall(rpcUrl: string, to: string, functionName: 'getTotalPlayers' | 'getCurrentRound') {
  const data = encodeFunctionData({ abi: ABI, functionName })
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to, data }, 'latest'] }),
  })
  const json = await res.json()
  if (!json.result || json.result === '0x') return null
  return decodeFunctionResult({ abi: ABI, functionName, data: json.result })
}

const CELO_GAME    = '0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb'
const BASE_GAME    = '0x1e2c209412ec30915ccf922654f0593faf61fcfb'
const CELO_CHECKIN = '0x8650e6c477f8ae3933dc6d61d85e65c90cf71828'
const CHECKIN_TOPIC = '0x621d62c6c0c4a0c35e883c6b27ad50ecc3093f08bfaf8aa5f58127d351feeb21'
const CHECKIN_DEPLOY_BLOCK = '0x3d00000'

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let players = null, prizePool = null, roundId = null
  let basePlayers = null, basePrizePool = null, baseRoundId = null
  let totalCheckins: number | null = null

  try {
    const [celoP, celoRound, baseP, baseRound, checkinLogs] = await Promise.allSettled([
      rpcCall('https://forno.celo.org', CELO_GAME, 'getTotalPlayers'),
      rpcCall('https://forno.celo.org', CELO_GAME, 'getCurrentRound'),
      rpcCall('https://mainnet.base.org', BASE_GAME, 'getTotalPlayers'),
      rpcCall('https://mainnet.base.org', BASE_GAME, 'getCurrentRound'),
      fetch('https://forno.celo.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 2, method: 'eth_getLogs',
          params: [{ fromBlock: CHECKIN_DEPLOY_BLOCK, toBlock: 'latest', address: CELO_CHECKIN, topics: [CHECKIN_TOPIC] }],
        }),
      }).then(r => r.json()),
    ])

    if (celoP.status === 'fulfilled' && celoP.value != null)
      players = Number(celoP.value as bigint)
    if (celoRound.status === 'fulfilled' && celoRound.value != null) {
      const [id, pool] = celoRound.value as [bigint, bigint]
      roundId = Number(id); prizePool = pool.toString()
    }
    if (baseP.status === 'fulfilled' && baseP.value != null)
      basePlayers = Number(baseP.value as bigint)
    if (baseRound.status === 'fulfilled' && baseRound.value != null) {
      const [id, pool] = baseRound.value as [bigint, bigint]
      baseRoundId = Number(id); basePrizePool = pool.toString()
    }
    if (checkinLogs.status === 'fulfilled' && Array.isArray(checkinLogs.value?.result))
      totalCheckins = checkinLogs.value.result.length
  } catch (e) {
    console.error('[api/stats] onchain error:', e)
  }

  return NextResponse.json({
    project: 'TriviaQ',
    version: '3.1',
    description: 'Blockchain quiz game on Celo & Base — earn TRIVQ tokens by answering questions',
    chains: { celo: true, base: true },
    live_stats: {
      players,
      round_id: roundId,
      prize_pool_wei: prizePool,
      total_checkins: totalCheckins,
      last_updated: new Date().toISOString(),
    },
    base_stats: {
      players: basePlayers,
      round_id: baseRoundId,
      prize_pool_wei: basePrizePool,
    },
    contracts: {
      celo: {
        game: CELO_GAME,
        token: '0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5',
        checkin: '0x8650e6c477f8ae3933dc6d61d85e65c90cf71828',
        referral: '0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e',
        duel: '0xee7be00cd5454b9bea56d864d82076b8b5de5ca1',
      },
      base: {
        game: BASE_GAME,
        token: '0x8ecc1dc70f3bc5be941b61b42707eb7dbddb54c3',
        checkin: '0x0f19851d5cd905d110c000a7d26d74a2f21f8ff9',
        referral: '0x4fb5285263354e1e75f044c65166ab22c3840074',
        treasury: '0x995aC10d5B6778B90eF060b7ab585D854C1Ed914',
      },
    },
    game: {
      questions: 1200,
      categories: ['African Geography', 'Web3 & Crypto', 'History & Culture', 'Science & Tech', 'Sports', 'General Knowledge'],
      languages: ['en', 'fr', 'es', 'it', 'pt', 'ar', 'zh', 'sw'],
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
      version: '3.1.0',
    },
    links: {
      app: 'https://trivia-quest-eight.vercel.app',
      github: 'https://github.com/wkalidev/trivia-quest',
      leaderboard: 'https://trivia-quest-eight.vercel.app/leaderboard',
      duel: 'https://trivia-quest-eight.vercel.app/duel',
      mcp: 'https://trivia-quest-eight.vercel.app/api/mcp',
    },
  })
}