# Trivia Q 🎮

> Play. Learn. Earn on Celo.

Trivia Q is a blockchain-powered quiz game built on Celo where players earn real CELO rewards, $TRIVQ tokens, and unique NFT badges by answering questions about African culture, geography, Web3, science, sports, and general knowledge.

## 🌍 Why Africa?

Celo's mission is financial inclusion for the unbanked. With 57% of African adults lacking bank accounts but owning smartphones, MiniPay is the perfect gateway. Trivia Q brings fun, education, and real micro-rewards to this audience.

## 🚀 Live Demo

👉 [trivia-quest-eight.vercel.app](https://trivia-quest-eight.vercel.app)

## 📊 Public Stats API

```bash
GET https://trivia-quest-eight.vercel.app/api/stats
```

Returns live player count, contract addresses, reward rates, and SDK info.

## 🖼️ Dynamic Share Image

After each game, players get a shareable score card with their rank, points & accuracy:

```
https://trivia-quest-eight.vercel.app/api/share-image?score=8&total=10&points=1200&rank=3
```

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

👉 [npm package](https://www.npmjs.com/package/@wkalidev/trivia-quest-sdk)

## 🎮 Game Features

- ✅ 446 questions across 6 categories
- ✅ 10 random questions per game
- ✅ 15-second timer per question
- ✅ Streak system x2 / x3 point multiplier
- ✅ $TRIVQ tokens minted on-chain after every game
- ✅ Daily Check-in — 100 TRIVQ/day + unique NFT badge
- ✅ 7-day streak bonus — 2000 TRIVQ + Legendary badge
- ✅ 150 unique NFT badges (ERC-1155) on Pinata IPFS
- ✅ Badges collection page `/badges`
- ✅ Protocol fee 10% on each round
- ✅ Framer Motion animations
- ✅ Sound & audio feedback (🔊/🔇 toggle)
- ✅ Real-time on-chain leaderboard
- ✅ 4 languages: 🇫🇷 FR / 🇬🇧 EN / 🇪🇸 ES / 🇮🇹 IT
- ✅ MiniPay compatible (auto wallet connect)
- ✅ PWA installable on Android
- ✅ PWA push notifications
- ✅ Auto round management via GitHub Actions cron
- ✅ Referral system — invite & earn 500 TRIVQ
- ✅ $TRIVQ live price tracker
- ✅ Dynamic OG image with live stats
- ✅ Score share card (Twitter / Farcaster / Native share)
- ✅ Public Stats API
- ✅ Farcaster Frame ready
- ✅ Public SDK on npm (@wkalidev/trivia-quest-sdk)
- ✅ Liquidity pool TRIVQ/CELO on Ubeswap v3

## 📚 Question Categories

| Category | Questions |
|---|---|
| 🌍 African Geography | ~80 |
| 💰 Web3 & Crypto | ~100 |
| 📖 History & Culture | ~60 |
| 🔬 Science & Tech | ~80 |
| ⚽ Sports | ~40 |
| 🌐 General Knowledge | ~86 |

## 🏗️ Architecture

- **Smart Contracts** — Solidity 0.8.20/0.8.24 + OpenZeppelin on Celo Mainnet
- **Frontend** — Next.js 15 + TypeScript + TailwindCSS
- **Animations** — Framer Motion
- **Wallet** — RainbowKit + Wagmi + Viem + MiniPay hook
- **NFT Storage** — Pinata IPFS (150 NFTs)
- **i18n** — next-intl (FR, EN, ES, IT)
- **OG Images** — next/og edge runtime
- **Deploy** — Vercel + GitHub Actions (cron)

## 🔗 Smart Contracts

| Contract | Network | Address |
|---|---|---|
| TriviaQToken ($TRIVQ) v2 | Celo Mainnet | `0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5` |
| TriviaQuest v3 | Celo Mainnet | `0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb` |
| DailyCheckIn v2 | Celo Mainnet | `0x8650e6c477f8ae3933dc6d61d85e65c90cf71828` |
| Referral v2 | Celo Mainnet | `0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e` |
| TriviaQuest | Celo Sepolia | `0xa93422cb14278ac5d1a6f60f95b03aa723e6448e` |
| TriviaQToken ($TRIVQ) | Celo Sepolia | `0xa829214ea492f32818efa2c58cc7e9090572c17c` |

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
- **Daily Check-in**: 100 TRIVQ/day + 2000 TRIVQ bonus (7 consecutive days)
- **Minting**: by TriviaQuest + DailyCheckIn only (cap 500M)
- **Liquidity**: TRIVQ/CELO pool on Ubeswap v3

## 🎨 NFT Badges (ERC-1155)

150 unique badges generated on-chain and stored on Pinata IPFS:

| Badge | Category | Rarity |
|---|---|---|
| 🌍 Africa Explorer | African Geography | Common → Legendary |
| ⛓ Crypto Master | Web3 & Crypto | Common → Legendary |
| 📜 Culture Keeper | History & Culture | Common → Legendary |
| ⚡ Tech Wizard | Science & Tech | Common → Legendary |
| 🏆 Sport Champion | Sports | Common → Legendary |
| ✨ Trivia Legend | General Knowledge | Common → Legendary |

## 🔥 Daily Check-in System

| Day | Reward |
|---|---|
| Day 1–6 | 100 TRIVQ + NFT badge |
| Day 7 🎁 | 100 TRIVQ + 2000 TRIVQ BONUS + NFT badge |
| Reset | If missed > 48h, streak resets to 0 |

## 💰 Protocol Fee

| Parameter | Value |
|---|---|
| Fee | 10% on each entry fee |
| Treasury | `0xdeacde6ec27fd0cd972c1232c4f0d4171dda2357` |
| Max fee | 20% (hardcoded cap) |

## 🔥 Streak System

| Streak | Multiplier | Points per correct answer |
|---|---|---|
| 0–2 | x1 | 100 pts |
| 3–4 | x2 🔥🔥 | 200 pts |
| 5+ | x3 🔥🔥🔥 | 300 pts |

## 💰 Reward Rates

| Action | Reward |
|---|---|
| 🎮 Per point scored | 100 TRIVQ |
| 🔥 Daily check-in | 100 TRIVQ |
| 🎁 7-day streak bonus | 2,000 TRIVQ |
| 🔗 Referral reward | 500 TRIVQ |

## 🏆 Prize Distribution

| Position | Share |
|---|---|
| 🥇 1st place | 50% |
| 🥈 2nd place | 30% |
| 🥉 3rd place | 20% |

## 📱 MiniPay Compatible

Trivia Q detects MiniPay automatically and connects the wallet without any popup — seamless UX for mobile users in Africa.

## ⚙️ Automation

Rounds are automatically finished every hour via GitHub Actions cron job — no manual intervention needed.

## 🛠️ Local Setup

```bash
# Clone
git clone https://github.com/wkalidev/trivia-quest.git
cd trivia-quest

# Frontend
cd frontend
yarn install
cp .env.example .env.local
yarn dev

# Contracts
cd ../contracts
npm install
npx hardhat compile
```

## ⚙️ Environment Variables

```env
NEXT_PUBLIC_TRIVQ_ADDRESS=0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5
NEXT_PUBLIC_GAME_ADDRESS=0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb
NEXT_PUBLIC_CHECKIN_ADDRESS=0x8650e6c477f8ae3933dc6d61d85e65c90cf71828
NEXT_PUBLIC_REFERRAL_ADDRESS=0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e
NEXT_PUBLIC_CHAIN_ID=42220
```

## 🎯 Proof of Ship Checklist

- ✅ Build For MiniPay — MiniPay hook integrated
- ✅ Deploy On Celo — Smart contracts on Celo Mainnet
- ✅ $TRIVQ Token — ERC20 reward token with 1B supply
- ✅ NFT Badges — 150 unique ERC-1155 badges on IPFS
- ✅ Daily Check-in — On-chain streak system with rewards
- ✅ Protocol Fee — 10% revenue on every round
- ✅ Auto Round Management — GitHub Actions cron
- ✅ Prove Your Humanity — Coinbase Verification
- ✅ Referral System — 500 TRIVQ per referral
- ✅ $TRIVQ Price Tracker — live on Ubeswap
- ✅ PWA Push Notifications
- ✅ Public SDK on npm
- ✅ Liquidity pool on Ubeswap v3
- ✅ Farcaster Frame
- ✅ Dynamic OG image with live stats
- ✅ Score share card (Twitter / Farcaster / Native)
- ✅ Public Stats API
- ✅ Submit Your Project

## 📋 Tech Stack

| Layer | Tech |
|---|---|
| Blockchain | Celo Mainnet |
| Smart Contracts | Solidity 0.8.20/0.8.24 + OpenZeppelin |
| NFT Storage | Pinata IPFS |
| Frontend | Next.js 15 + TypeScript |
| Styling | TailwindCSS |
| Animations | Framer Motion |
| Web3 | Wagmi + Viem + RainbowKit |
| i18n | next-intl |
| OG Images | next/og (edge runtime) |
| Deploy | Vercel + GitHub Actions |

## 👤 Author

Built with 💙 by [@wkalidev](https://github.com/wkalidev) for Celo Proof of Ship — 2026