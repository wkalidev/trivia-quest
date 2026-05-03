import { NextResponse } from 'next/server'

export const revalidate = 60 // cache 60s

export async function GET() {
  let players = null
  let totalTransactions = null

  try {
    // getTotalPlayers()
    const res = await fetch('https://forno.celo.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'eth_call',
        params: [{ to: '0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb', data: '0x63f28e0d' }, 'latest']
      }),
    })
    const data = await res.json()
    if (data.result && data.result !== '0x') {
      players = parseInt(data.result, 16)
    }
  } catch {}

  return NextResponse.json({
    project: 'TriviaQ',
    description: 'Blockchain quiz game on Celo — earn $TRIVQ tokens by answering questions',
    network: 'celo-mainnet',
    chainId: 42220,
    contracts: {
      game: '0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb',
      token: '0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5',
      checkin: '0x8650e6c477f8ae3933dc6d61d85e65c90cf71828',
      referral: '0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e',
    },
    live_stats: {
      players: players,
      last_updated: new Date().toISOString(),
    },
    game: {
      questions: 446,
      categories: ['African Geography', 'Web3 & Crypto', 'History & Culture', 'Science & Tech', 'Sports', 'General Knowledge'],
      languages: ['en', 'fr', 'es', 'it'],
      questions_per_game: 10,
      timer_seconds: 15,
    },
    rewards: {
      per_point: '100 TRIVQ',
      daily_checkin: '100 TRIVQ',
      streak_7_days: '2000 TRIVQ',
      referral: '500 TRIVQ',
      prize_pool_distribution: { first: '50%', second: '30%', third: '20%' },
    },
    sdk: {
      npm: '@wkalidev/trivia-quest-sdk',
      install: 'npm install @wkalidev/trivia-quest-sdk',
      docs: 'https://github.com/wkalidev/trivia-quest',
    },
    links: {
      app: 'https://trivia-quest-eight.vercel.app',
      github: 'https://github.com/wkalidev/trivia-quest',
      ubeswap: 'https://app.ubeswap.org/#/swap?outputCurrency=0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5',
    },
  })
}