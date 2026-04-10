# Trivia Q 🎮

> Play. Learn. Earn on Celo.

Trivia Q is a blockchain-powered quiz game built on Celo where players earn real CELO rewards, $TRIVQ tokens, and unique NFT badges by answering questions about African culture, geography, Web3, science, sports, and general knowledge.

## 🌍 Why Africa?

Celo's mission is financial inclusion for the unbanked. With 57% of African adults lacking bank accounts but owning smartphones, MiniPay is the perfect gateway. Trivia Q brings fun, education, and real micro-rewards to this audience.

## 🚀 Live Demo

👉 [trivia-quest-eight.vercel.app](https://trivia-quest-eight.vercel.app)

## 🎮 Game Features

- ✅ 446 questions dans 6 catégories
- ✅ 10 questions aléatoires par partie
- ✅ Timer de 15 secondes par question
- ✅ Système de Streak x2 / x3 multiplicateur de points
- ✅ Récompenses $TRIVQ mintées on-chain à chaque partie
- ✅ Daily Check-in — 100 TRIVQ/jour + NFT badge unique
- ✅ 7-day streak bonus — 2000 TRIVQ + badge Legendary
- ✅ 150 NFT badges uniques (ERC-1155) sur Pinata IPFS
- ✅ Animations Framer Motion
- ✅ Sons & feedback audio (🔊/🔇 toggle)
- ✅ Leaderboard on-chain en temps réel
- ✅ Support 4 langues : 🇫🇷 FR / 🇬🇧 EN / 🇪🇸 ES / 🇮🇹 IT
- ✅ MiniPay compatible (détection automatique)
- ✅ PWA installable sur Android
- ✅ Cron auto-finish rounds (GitHub Actions)

## 📚 Question Categories

| Catégorie | Nb questions |
|---|---|
| 🌍 Géographie Africaine | ~80 |
| 💰 Web3 & Crypto | ~100 |
| 📖 Histoire & Culture | ~60 |
| 🔬 Science & Tech | ~80 |
| ⚽ Sports | ~40 |
| 🌐 Culture Générale | ~86 |

## 🏗️ Architecture

- **Smart Contracts** — Solidity 0.8.20/0.8.24 + OpenZeppelin sur Celo Mainnet
- **Frontend** — Next.js 16 + TypeScript + TailwindCSS
- **Animations** — Framer Motion
- **Wallet** — RainbowKit + Wagmi + Viem + MiniPay hook
- **NFT Storage** — Pinata IPFS (150 NFTs)
- **i18n** — next-intl (FR, EN, ES, IT)
- **Deploy** — Vercel + GitHub Actions (cron)

## 🔗 Smart Contracts

| Contract | Network | Address |
|---|---|---|
| TriviaQuest | Celo Mainnet | `0xedf1505c476a5a7de9e60f79844edb7774c03f0a` |
| TriviaQToken ($TRIVQ) | Celo Mainnet | `0xf50afd22d5285f0398bf1be433252ce6a9fd9579` |
| DailyCheckIn (ERC-1155) | Celo Mainnet | `0x12a76267fd15f013daaf4f20824295afa4ebcd91` |
| TriviaQuest | Celo Sepolia (testnet) | `0xa93422cb14278ac5d1a6f60f95b03aa723e6448e` |
| TriviaQToken ($TRIVQ) | Celo Sepolia (testnet) | `0xa829214ea492f32818efa2c58cc7e9090572c17c` |

## 💎 $TRIVQ Tokenomics

| Allocation | Amount | % |
|---|---|---|
| 🎮 Player Rewards | 500,000,000 | 50% |
| 💧 Liquidity | 200,000,000 | 20% |
| 👥 Team | 150,000,000 | 15% |
| 🌱 Ecosystem | 100,000,000 | 10% |
| 📣 Marketing | 50,000,000 | 5% |

- **Total Supply** : 1,000,000,000 $TRIVQ
- **Reward Rate** : 100 TRIVQ par point marqué
- **Daily Check-in** : 100 TRIVQ/jour + 2000 TRIVQ bonus (7 jours consécutifs)
- **Minting** : uniquement par TriviaQuest + DailyCheckIn (cap 500M)

## 🎨 NFT Badges (ERC-1155)

150 badges uniques générés on-chain et stockés sur Pinata IPFS :

| Badge | Catégorie | Rareté |
|---|---|---|
| 🌍 Africa Explorer | Géographie Africaine | Common → Legendary |
| ⛓ Crypto Master | Web3 & Crypto | Common → Legendary |
| 📜 Culture Keeper | Histoire & Culture | Common → Legendary |
| ⚡ Tech Wizard | Science & Tech | Common → Legendary |
| 🏆 Sport Champion | Sports | Common → Legendary |
| ✨ Trivia Legend | Culture Générale | Common → Legendary |

Chaque badge est unique grâce aux combinaisons de palettes, backgrounds et frames.

## 🔥 Daily Check-in System

| Jour | Récompense |
|---|---|
| Jour 1-6 | 100 TRIVQ + NFT badge |
| Jour 7 🎁 | 100 TRIVQ + 2000 TRIVQ BONUS + NFT badge |
| Reset | Si miss > 48h, streak repart à 0 |

## 📱 MiniPay Compatible

Trivia Q detects MiniPay automatically and connects the wallet without any popup — seamless UX for mobile users in Africa.

## 🔥 Streak System

| Streak | Multiplicateur | Points par bonne réponse |
|---|---|---|
| 0-2 | x1 | 100 pts |
| 3-4 | x2 🔥🔥 | 200 pts |
| 5+ | x3 🔥🔥🔥 | 300 pts |

## 🏆 Leaderboard On-Chain

Le leaderboard est stocké directement sur la blockchain Celo. Chaque joueur accumule des points, et les 10 meilleurs sont affichés en temps réel.

## 🏆 Prize Distribution (Multi-Winner)

| Position | Share |
|---|---|
| 🥇 1st place | 50% |
| 🥈 2nd place | 30% |
| 🥉 3rd place | 20% |

## 🌍 Multi-Language Support

| Language | Code |
|---|---|
| 🇫🇷 Français | fr |
| 🇬🇧 English | en |
| 🇪🇸 Español | es |
| 🇮🇹 Italiano | it |

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
cp .env.example .env.local  # puis remplis les valeurs
yarn dev

# Contracts
cd ../contracts
npm install
npx hardhat compile
```

## ⚙️ Environment Variables

```env
NEXT_PUBLIC_TRIVQ_ADDRESS=0xf50afd22d5285f0398bf1be433252ce6a9fd9579
NEXT_PUBLIC_GAME_ADDRESS=0xedf1505c476a5a7de9e60f79844edb7774c03f0a
NEXT_PUBLIC_CHECKIN_ADDRESS=0x12a76267fd15f013daaf4f20824295afa4ebcd91
NEXT_PUBLIC_CHAIN_ID=42220
```

## 🎯 Proof of Ship Checklist

- ✅ Build For MiniPay — MiniPay hook integrated
- ✅ Deploy On Celo — Smart contracts on Celo Mainnet
- ✅ $TRIVQ Token — ERC20 reward token with 1B supply
- ✅ NFT Badges — 150 unique ERC-1155 badges on IPFS
- ✅ Daily Check-in — On-chain streak system with rewards
- ✅ Auto Round Management — GitHub Actions cron
- ✅ Prove Your Humanity — Coinbase Verification
- ✅ Submit Your Project

## 📋 Tech Stack

| Layer | Tech |
|---|---|
| Blockchain | Celo Mainnet |
| Smart Contracts | Solidity 0.8.20/0.8.24 + OpenZeppelin |
| NFT Storage | Pinata IPFS |
| Frontend | Next.js 16 + TypeScript |
| Styling | TailwindCSS |
| Animations | Framer Motion |
| Web3 | Wagmi + Viem + RainbowKit |
| i18n | next-intl |
| Deploy | Vercel + GitHub Actions |

## 👤 Author

Built with 💙 by [@wkalidev](zcodebase)(https://github.com/wkalidev) for Celo Proof of Ship — April 2026