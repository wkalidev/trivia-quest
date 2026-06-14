# Trivia Q 🎮

> Play. Learn. Earn on Celo & Base.

[![Live Demo](https://img.shields.io/badge/Live-trivia--quest--eight.vercel.app-FBCD00?style=for-the-badge)](https://trivia-quest-eight.vercel.app)
[![npm](https://img.shields.io/badge/SDK_v3.1.0-npm-CB3837?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@wkalidev/trivia-quest-sdk)
[![Self Agent](https://img.shields.io/badge/Self_Agent-ID_%23103-6366f1?style=for-the-badge)](https://app.ai.self.xyz/agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

## 🌍 Why Africa?

Celo's mission is financial inclusion for the unbanked. With **57% of African adults** lacking bank accounts but owning smartphones, MiniPay is the perfect gateway. Trivia Q brings fun, education, and real micro-rewards to this audience — fully playable inside MiniPay with zero-click wallet connect.

## 🚀 Live

| Resource | Link |
|---|---|
| App | https://trivia-quest-eight.vercel.app |
| Duel 1v1 | https://trivia-quest-eight.vercel.app/duel |
| SDK v3.1.0 | `npm install @wkalidev/trivia-quest-sdk` |
| Stats API | `GET /api/stats` |
| MCP Server | https://trivia-quest-eight.vercel.app/api/mcp |
| GitHub | https://github.com/wkalidev/trivia-quest |

## 🎮 Features

- 1200+ questions across 6 categories
- 10 random questions per game, 15s timer
- Streak system x2 / x3 multiplier
- $TRIVQ tokens minted on-chain after every game
- Daily Check-in — 100 TRIVQ/day + NFT badge
- 7-day streak bonus — 2,000 TRIVQ + Legendary badge
- 150 unique NFT badges (ERC-1155) on Pinata IPFS
- Round-based prize pool — top 3 players split the pot
- Referral system — invite & earn 500 TRIVQ
- Real-time on-chain leaderboard
- $TRIVQ live price tracker (Ubeswap v3)
- MiniPay compatible — auto wallet connect
- Multi-chain — Celo Mainnet + Base Mainnet
- 8 languages — FR / EN / ES / IT / PT / AR / ZH / SW
- 🆕 Base Mainnet fully live — rounds, rewards, treasury configured
- PWA installable on Android
- Discord Bot 24/7
- 🆕 AI Mode — questions by Groq AI (LLaMA 3.1)
- 🆕 Trivia Duel 1v1 — wager CELO on-chain
- 🆕 Discord AI Agent — /ask /askcat
- 🆕 Self Agent ID — verified onchain AI agent (#103)
- 🆕 Farcaster Push Notifications — daily check-in reminders

## 🤖 AI Mode (NEW — May 2026)

Questions generated in real-time by Groq AI (LLaMA 3.1-8b-instant):
- Available in all 6 categories
- Infinite unique questions — never the same quiz twice
- Questions preloaded in background while you play
- Accessible via /quiz → Mode IA button
- API: `GET /api/ai-question?category=Web3%20%26%20Crypto`

## 🔐 Security

- Submit score requires ECDSA wallet signature (prevents fake scores)
- Rate limited: 5 submissions/hour per wallet
- Cron endpoint protected by CRON_SECRET
- AI endpoint rate limited: 10 req/min (Self Agents bypass)

**Agent registration note:** The ERC-8004 `register-agent.ts` script only supports initial registration. To update the on-chain `agentURI` to `https://trivia-quest-eight.vercel.app/api/agent-metadata`, the owner must call `updateAgent` directly on the ERC-8004 Identity Registry (`0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`) on Celo Mainnet.

## 🔐 Self Agent ID (NEW — May 2026)

The Trivia Q Discord bot is registered as a verified onchain AI agent via [Self Protocol](https://app.ai.self.xyz):

| Property | Value |
|---|---|
| Agent ID | #103 |
| Agent Address | `0xFa475D3E676c4A87e410F536b1231FcD220B0261` |
| Network | Celo Mainnet |
| Status | ✅ Verified onchain |

Every AI request made by the bot is cryptographically signed with ECDSA — verifiable on-chain. The `/api/ai-question` endpoint recognizes verified Self Agents and grants them priority access, bypassing standard rate limits.

## ⚔️ Trivia Duel 1v1 (NEW — May 2026)

- Create a duel with a wager (0.01 to 0.5 CELO)
- Share the duel ID with your opponent
- Both play independently — best score wins the pot
- Tie = both players refunded minus fees
- Expires in 24h if no one joins → full refund
- 10% protocol fee on winnings
- Contract: `0xee7be00cd5454b9bea56d864d82076b8b5de5ca1`

## 🔗 Smart Contracts

### Celo Mainnet
| Contract | Address |
|---|---|
| TriviaQToken ($TRIVQ) v2 | `0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5` |
| TriviaQuest v3 | `0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb` |
| TriviaDuel v1 🆕 | `0xee7be00cd5454b9bea56d864d82076b8b5de5ca1` |
| DailyCheckIn v2 | `0x8650e6c477f8ae3933dc6d61d85e65c90cf71828` |
| Referral v2 | `0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e` |

### Base Mainnet
| Contract | Address |
|---|---|
| TriviaQToken ($TRIVQ) | `0x8ecc1dc70f3bc5be941b61b42707eb7dbddb54c3` |
| TriviaQuest | `0x1e2c209412ec30915ccf922654f0593faf61fcfb` |
| DailyCheckIn | `0x0f19851d5cd905d110c000a7d26d74a2f21f8ff9` |
| Referral | `0x4fb5285263354e1e75f044c65166ab22c3840074` |
| Treasury (fee recipient) | `0x995aC10d5B6778B90eF060b7ab585D854C1Ed914` |

## 💎 $TRIVQ Tokenomics

| Allocation | Amount | % |
|---|---|---|
| Player Rewards | 500,000,000 | 50% |
| Liquidity | 200,000,000 | 20% |
| Team | 150,000,000 | 15% |
| Ecosystem | 100,000,000 | 10% |
| Marketing | 50,000,000 | 5% |

## 🔥 Reward System

| Action | Reward |
|---|---|
| Per point scored | 100 TRIVQ |
| Daily check-in | 100 TRIVQ |
| 7-day streak bonus | 2,000 TRIVQ |
| Referral | 500 TRIVQ |
| Round winner 1st | 50% prize pool |
| Round winner 2nd | 30% prize pool |
| Round winner 3rd | 20% prize pool |
| Duel winner | 90% of total wager |

## 🏗️ Architecture

| Layer | Tech |
|---|---|
| Blockchain | Celo Mainnet + Base Mainnet |
| Smart Contracts | Solidity 0.8.20/0.8.24 + OpenZeppelin |
| NFT Storage | Pinata IPFS |
| Frontend | Next.js 16 + TypeScript + TailwindCSS |
| Web3 | Wagmi + Viem + RainbowKit |
| AI | Groq API (LLaMA 3.1-8b-instant) |
| AI Agent | Self Protocol — Agent #103 🆕 |
| i18n | next-intl (FR, EN, ES, IT, PT, AR, ZH, SW) |
| Bot | discord.js v14 + ethers.js v6 |
| Bot Hosting | Railway (24/7) |
| Deploy | Vercel + GitHub Actions |
| Notifications | Farcaster Mini App SDK + Supabase |

## 🛠️ Local Setup

```bash
git clone https://github.com/wkalidev/trivia-quest.git
cd trivia-quest

# Frontend
cd frontend && yarn install
# Add GROQ_API_KEY to .env.local
yarn dev

# Bot
cd ../bot && npm install
# Add DISCORD_TOKEN, CLIENT_ID, GUILD_ID, GROQ_API_KEY, SELF_AGENT_PRIVATE_KEY to .env
npm run build && npm start

# Contracts
cd ../contracts && npm install
npx hardhat compile
```

## 🎯 Proof of Ship Checklist

- [x] Build For MiniPay
- [x] Deploy On Celo (5 contracts)
- [x] Deploy On Base (4 contracts)
- [x] $TRIVQ Token ERC-20 verified
- [x] 150 NFT Badges ERC-1155 on IPFS
- [x] Daily Check-in on-chain
- [x] Protocol Fee 10%
- [x] Auto Round Management via cron
- [x] Referral System
- [x] $TRIVQ Price Tracker
- [x] Liquidity Pool on Ubeswap v3
- [x] PWA Push Notifications
- [x] Public SDK on npm
- [x] Farcaster Frame
- [x] Dynamic OG image
- [x] Score share card
- [x] Public Stats API
- [x] Discord Bot 24/7 on Railway
- [x] Multi-chain Celo + Base
- [x] Coinbase Verification
- [x] Terms of Service + Privacy Policy
- [x] AI Question Mode (Groq LLaMA 3.1) 🆕
- [x] Trivia Duel 1v1 on-chain 🆕
- [x] Discord AI Agent /ask /askcat 🆕
- [x] Self Agent ID — verified onchain AI agent #103 🆕
- [x] Farcaster Push Notifications (daily reminders) 🆕
- [x] MCP Server endpoint — /api/mcp 🆕
- [x] 8004scan score improved (MCP unlocks full Service scoring) 🆕
- [x] Submit score signature verification 🆕
- [x] Base Mainnet fully operational — rounds auto-managed via cron 🆕
- [x] 8 i18n languages (FR, EN, ES, IT, PT, AR, ZH, SW) 🆕
- [x] 1200+ questions (446 base + 754 extra) 🆕
- [x] SDK v3.1.0 — treasury, LANGUAGES, TOTAL_QUESTIONS, finishRound ABI 🆕

## 👤 Author

Built by [@wkalidev](https://github.com/wkalidev) — zcodebase.eth

> Built for Celo Proof of Ship 2026