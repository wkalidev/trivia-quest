# Trivia Q 🎮

> Play. Learn. Earn on Celo & Base.

Trivia Q is a blockchain-powered quiz game built on **Celo** and **Base** where players earn real rewards, $TRIVQ tokens, and unique NFT badges by answering questions about African culture, geography, Web3, science, sports, and general knowledge.

[![Live Demo](https://img.shields.io/badge/Live-trivia--quest--eight.vercel.app-FBCD00?style=for-the-badge)](https://trivia-quest-eight.vercel.app)
[![npm](https://img.shields.io/badge/SDK-npm-CB3837?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@wkalidev/trivia-quest-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 🌍 Why Africa?

Celo's mission is financial inclusion for the unbanked. With **57% of African adults** lacking bank accounts but owning smartphones, MiniPay is the perfect gateway. Trivia Q brings fun, education, and real micro-rewards to this audience — fully playable inside MiniPay with zero-click wallet connect.

---

## 🚀 Live

| Resource | Link |
|---|---|
| 🎮 App | https://trivia-quest-eight.vercel.app |
| 📦 SDK | `npm install @wkalidev/trivia-quest-sdk` |
| 📊 Stats API | `GET /api/stats` |
| 🖼️ Share Image | `GET /api/share-image?score=8&total=10&points=1200` |
| 🐙 GitHub | https://github.com/wkalidev/trivia-quest |
| 🤖 Discord | Trivia Quest server |

---

## 🎮 Features

- ✅ **446 questions** across 6 categories
- ✅ 10 random questions per game · 15s timer per question
- ✅ Streak system **x2 / x3** point multiplier
- ✅ **$TRIVQ tokens** minted on-chain after every game
- ✅ **Daily Check-in** — 100 TRIVQ/day + unique NFT badge
- ✅ **7-day streak bonus** — 2,000 TRIVQ + Legendary badge
- ✅ **150 unique NFT badges** (ERC-1155) on Pinata IPFS
- ✅ **Round-based prize pool** — top 3 players split the pot
- ✅ **Referral system** — invite & earn 500 TRIVQ
- ✅ **Real-time on-chain leaderboard**
- ✅ **$TRIVQ live price tracker** (Ubeswap v3)
- ✅ **Liquidity pool** TRIVQ/CELO on Ubeswap v3
- ✅ **Farcaster Frame** ready
- ✅ **Dynamic OG image** with live stats
- ✅ **Score share card** (Twitter / Farcaster / Native share)
- ✅ **Public Stats API** — live player count + contract data
- ✅ **Public SDK** on npm (`@wkalidev/trivia-quest-sdk`)
- ✅ **MiniPay compatible** — auto wallet connect, zero popup
- ✅ **Multi-chain** — Celo Mainnet + Base Mainnet
- ✅ **4 languages** — 🇫🇷 FR / 🇬🇧 EN / 🇪🇸 ES / 🇮🇹 IT
- ✅ **PWA** installable on Android + push notifications
- ✅ **Bot Discord** 24/7 — `/stats` `/play` `/leaderboard`
- ✅ Auto round management via GitHub Actions cron

---

## 📚 Question Categories

| Category | Questions |
|---|---|
| 🌍 African Geography | ~80 |
| 💰 Web3 & Crypto | ~100 |
| 📖 History & Culture | ~60 |
| 🔬 Science & Tech | ~80 |
| ⚽ Sports | ~40 |
| 🌐 General Knowledge | ~86 |

---

## 🔗 Smart Contracts

### Celo Mainnet
| Contract | Address |
|---|---|
| TriviaQToken ($TRIVQ) v2 | [`0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5`](https://celoscan.io/address/0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5) |
| TriviaQuest v3 | [`0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb`](https://celoscan.io/address/0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb) |
| DailyCheckIn v2 | [`0x8650e6c477f8ae3933dc6d61d85e65c90cf71828`](https://celoscan.io/address/0x8650e6c477f8ae3933dc6d61d85e65c90cf71828) |
| Referral v2 | [`0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e`](https://celoscan.io/address/0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e) |

### Base Mainnet
| Contract | Address |
|---|---|
| TriviaQToken ($TRIVQ) | [`0x3217e21a74a068779902213ab06ad3301a8e6a02`](https://basescan.org/address/0x3217e21a74a068779902213ab06ad3301a8e6a02) |
| TriviaQuest | [`0xf44dfec3230bcf917ca7ccc59b4e67df2507e21f`](https://basescan.org/address/0xf44dfec3230bcf917ca7ccc59b4e67df2507e21f) |
| DailyCheckIn | [`0x8a6f59c5f1f11a7ae75c54b1eb95c477405f1bda`](https://basescan.org/address/0x8a6f59c5f1f11a7ae75c54b1eb95c477405f1bda) |
| Referral | [`0x4dafb4d844ce8bd52ce3ad4cee2a4e73780d0c91`](https://basescan.org/address/0x4dafb4d844ce8bd52ce3ad4cee2a4e73780d0c91) |

> All contracts verified on Celoscan and Basescan.

---

## 📦 SDK

```bash
npm install @wkalidev/trivia-quest-sdk
```

```typescript
import {
  TRIVQ_TOKEN_ADDRESS,
  TRIVIA_QUEST_ADDRESS,
  TRIVQ_ABI,
  TRIVIA_QUEST_ABI,
} from "@wkalidev/trivia-quest-sdk";
```

---

## 📊 Public Stats API

```bash
GET https://trivia-quest-eight.vercel.app/api/stats
```

Returns live player count, contract addresses, reward rates, and SDK info.

---

## 💎 $TRIVQ Tokenomics

| Allocation | Amount | % |
|---|---|---|
| 🎮 Player Rewards | 500,000,000 | 50% |
| 💧 Liquidity | 200,000,000 | 20% |
| 👥 Team | 150,000,000 | 15% |
| 🌱 Ecosystem | 100,000,000 | 10% |
| 📣 Marketing | 50,000,000 | 5% |

- **Total Supply**: 1,000,000,000 $TRIVQ
- **Reward Rate**: 100 TRIVQ per point scored
- **Daily Check-in**: 100 TRIVQ/day + 2,000 TRIVQ bonus (7-day streak)
- **Minting**: TriviaQuest + DailyCheckIn only (cap 500M)
- **DEX**: TRIVQ/CELO pool live on [Ubeswap v3](https://app.ubeswap.org)

---

## 🎨 NFT Badges (ERC-1155)

150 unique badges on Pinata IPFS — Common → Legendary rarity:

| Badge | Category |
|---|---|
| 🌍 Africa Explorer | African Geography |
| ⛓ Crypto Master | Web3 & Crypto |
| 📜 Culture Keeper | History & Culture |
| ⚡ Tech Wizard | Science & Tech |
| 🏆 Sport Champion | Sports |
| ✨ Trivia Legend | General Knowledge |

---

## 🔥 Reward System

| Action | Reward |
|---|---|
| 🎮 Per point scored | 100 TRIVQ |
| 🔥 Daily check-in | 100 TRIVQ |
| 🎁 7-day streak bonus | 2,000 TRIVQ |
| 🔗 Referral | 500 TRIVQ |
| 🥇 Round winner (1st) | 50% prize pool |
| 🥈 Round winner (2nd) | 30% prize pool |
| 🥉 Round winner (3rd) | 20% prize pool |

---

## 🔥 Streak & Multiplier

| Streak | Multiplier | Points/correct answer |
|---|---|---|
| 0–2 answers | x1 | 100 pts |
| 3–4 answers | x2 🔥🔥 | 200 pts |
| 5+ answers | x3 🔥🔥🔥 | 300 pts |

---

## 🏗️ Architecture

| Layer | Tech |
|---|---|
| Blockchain | Celo Mainnet + Base Mainnet |
| Smart Contracts | Solidity 0.8.20/0.8.24 + OpenZeppelin |
| NFT Storage | Pinata IPFS |
| Frontend | Next.js 16 + TypeScript + TailwindCSS |
| Animations | Framer Motion |
| Web3 | Wagmi + Viem + RainbowKit |
| i18n | next-intl (FR, EN, ES, IT) |
| OG Images | next/og (edge runtime) |
| Bot | discord.js v14 + ethers.js v6 |
| Bot Hosting | Railway (24/7) |
| Deploy | Vercel + GitHub Actions (cron) |

---

## 🛠️ Local Setup

```bash
# Clone
git clone https://github.com/wkalidev/trivia-quest.git
cd trivia-quest

# Frontend
cd frontend
yarn install
cp .env.example .env.local  # fill in your values
yarn dev

# Contracts
cd ../contracts
npm install
npx hardhat compile

# Discord Bot
cd ../bot
npm install
cp .env.example .env
npm run dev
```

## ⚙️ Environment Variables

```env
NEXT_PUBLIC_TRIVQ_ADDRESS=0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5
NEXT_PUBLIC_GAME_ADDRESS=0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb
NEXT_PUBLIC_CHECKIN_ADDRESS=0x8650e6c477f8ae3933dc6d61d85e65c90cf71828
NEXT_PUBLIC_REFERRAL_ADDRESS=0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e
NEXT_PUBLIC_CHAIN_ID=42220
```

---

## 🎯 Proof of Ship Checklist

- ✅ Build For MiniPay — MiniPay hook + auto-connect
- ✅ Deploy On Celo — 4 contracts on Celo Mainnet
- ✅ Deploy On Base — 4 contracts on Base Mainnet
- ✅ $TRIVQ Token — ERC-20, 1B supply, verified
- ✅ NFT Badges — 150 unique ERC-1155 on IPFS
- ✅ Daily Check-in — on-chain streak system
- ✅ Protocol Fee — 10% on every round
- ✅ Auto Round Management — GitHub Actions cron
- ✅ Referral System — 500 TRIVQ per referral
- ✅ $TRIVQ Price Tracker — live Ubeswap v3
- ✅ Liquidity Pool — TRIVQ/CELO on Ubeswap v3
- ✅ PWA Push Notifications
- ✅ Public SDK — `@wkalidev/trivia-quest-sdk` on npm
- ✅ Farcaster Frame
- ✅ Dynamic OG image with live stats
- ✅ Score share card (Twitter / Farcaster / Native)
- ✅ Public Stats API
- ✅ Discord Bot 24/7 (Railway)
- ✅ Multi-chain — Celo + Base
- ✅ Prove Your Humanity — Coinbase Verification
- ✅ Terms of Service + Privacy Policy
- ✅ Submit Your Project

---

## 👤 Author

Built with 💙 by [@wkalidev](https://github.com/wkalidev) — zcodebase.eth

> Built for Celo Proof of Ship 2026