# Trivia Q 🎮

> Play. Learn. Earn on Celo & Base.

[![Live Demo](https://img.shields.io/badge/Live-trivia--quest--eight.vercel.app-FBCD00?style=for-the-badge)](https://trivia-quest-eight.vercel.app)
[![npm](https://img.shields.io/badge/SDK-npm-CB3837?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@wkalidev/trivia-quest-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

## 🌍 Why Africa?

Celo's mission is financial inclusion for the unbanked. With **57% of African adults** lacking bank accounts but owning smartphones, MiniPay is the perfect gateway. Trivia Q brings fun, education, and real micro-rewards to this audience — fully playable inside MiniPay with zero-click wallet connect.

## 🚀 Live

| Resource | Link |
|---|---|
| App | https://trivia-quest-eight.vercel.app |
| Duel 1v1 | https://trivia-quest-eight.vercel.app/duel |
| SDK | npm install @wkalidev/trivia-quest-sdk |
| Stats API | GET /api/stats |
| GitHub | https://github.com/wkalidev/trivia-quest |

## 🎮 Features

- 446 questions across 6 categories
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
- 4 languages — FR / EN / ES / IT
- PWA installable on Android
- Discord Bot 24/7
- 🆕 AI Mode — questions by Groq AI (LLaMA 3.1)
- 🆕 Trivia Duel 1v1 — wager CELO on-chain
- 🆕 Discord AI Agent — /ask /askcat

## 🤖 AI Mode (NEW — May 2026)

Questions generated in real-time by Groq AI (LLaMA 3.1-8b-instant):
- Available in all 6 categories
- Infinite unique questions — never the same quiz twice
- Questions preloaded in background while you play
- Accessible via /quiz → Mode IA button
- API: GET /api/ai-question?category=Web3%20%26%20Crypto

## ⚔️ Trivia Duel 1v1 (NEW — May 2026)

- Create a duel with a wager (0.01 to 0.5 CELO)
- Share the duel ID with your opponent
- Both play independently — best score wins the pot
- Tie = both players refunded minus fees
- Expires in 24h if no one joins → full refund
- 10% protocol fee on winnings
- Contract: 0xee7be00cd5454b9bea56d864d82076b8b5de5ca1

## 🔗 Smart Contracts

### Celo Mainnet
| Contract | Address |
|---|---|
| TriviaQToken ($TRIVQ) v2 | 0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5 |
| TriviaQuest v3 | 0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb |
| TriviaDuel v1 NEW | 0xee7be00cd5454b9bea56d864d82076b8b5de5ca1 |
| DailyCheckIn v2 | 0x8650e6c477f8ae3933dc6d61d85e65c90cf71828 |
| Referral v2 | 0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e |

### Base Mainnet
| Contract | Address |
|---|---|
| TriviaQToken ($TRIVQ) | 0x3217e21a74a068779902213ab06ad3301a8e6a02 |
| TriviaQuest | 0xf44dfec3230bcf917ca7ccc59b4e67df2507e21f |
| DailyCheckIn | 0x8a6f59c5f1f11a7ae75c54b1eb95c477405f1bda |
| Referral | 0x4dafb4d844ce8bd52ce3ad4cee2a4e73780d0c91 |

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
| AI | Groq API (LLaMA 3.1-8b-instant) NEW |
| i18n | next-intl (FR, EN, ES, IT) |
| Bot | discord.js v14 + ethers.js v6 |
| Bot Hosting | Railway (24/7) |
| Deploy | Vercel + GitHub Actions |

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
# Add DISCORD_TOKEN, CLIENT_ID, GUILD_ID, GROQ_API_KEY to .env
npm run build && npm start

# Contracts
cd ../contracts && npm install
npx hardhat compile
```

## 🎯 Proof of Ship Checklist

- Build For MiniPay
- Deploy On Celo (5 contracts)
- Deploy On Base (4 contracts)
- $TRIVQ Token ERC-20 verified
- 150 NFT Badges ERC-1155 on IPFS
- Daily Check-in on-chain
- Protocol Fee 10%
- Auto Round Management via cron
- Referral System
- $TRIVQ Price Tracker
- Liquidity Pool on Ubeswap v3
- PWA Push Notifications
- Public SDK on npm
- Farcaster Frame
- Dynamic OG image
- Score share card
- Public Stats API
- Discord Bot 24/7 on Railway
- Multi-chain Celo + Base
- Coinbase Verification
- Terms of Service + Privacy Policy
- 🆕 AI Question Mode (Groq LLaMA 3.1)
- 🆕 Trivia Duel 1v1 on-chain
- 🆕 Discord AI Agent /ask /askcat

## 👤 Author

Built by [@wkalidev](https://github.com/wkalidev) — zcodebase.eth

> Built for Celo Proof of Ship 2026