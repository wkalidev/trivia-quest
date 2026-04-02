# Trivia Q 🎮

> Play. Learn. Earn on Celo.

Trivia Q is a blockchain-powered quiz game built on Celo where players earn real CELO rewards by answering questions about African culture, geography, Web3, science, sports, and general knowledge.

## 🌍 Why Africa?

Celo's mission is financial inclusion for the unbanked. With 57% of African adults lacking bank accounts but owning smartphones, MiniPay is the perfect gateway. Trivia Q brings fun, education, and real micro-rewards to this audience.

## 🚀 Live Demo

👉 [trivia-quest-eight.vercel.app](https://trivia-quest-eight.vercel.app)

## 🎮 Game Features

- ✅ 446 questions dans 6 catégories
- ✅ 10 questions aléatoires par partie
- ✅ Timer de 15 secondes par question
- ✅ Système de Streak x2 / x3 multiplicateur de points
- ✅ Animations Framer Motion
- ✅ Sons & feedback audio (🔊/🔇 toggle)
- ✅ Leaderboard on-chain en temps réel
- ✅ Support 4 langues : 🇫🇷 FR / 🇬🇧 EN / 🇪🇸 ES / 🇮🇹 IT
- ✅ MiniPay compatible (détection automatique)
- ✅ PWA installable sur Android

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

- **Smart Contract** — Solidity 0.8.20 + OpenZeppelin sur Celo Mainnet
- **Frontend** — Next.js 16 + TypeScript + TailwindCSS
- **Animations** — Framer Motion
- **Wallet** — RainbowKit + Wagmi + Viem + MiniPay hook
- **i18n** — next-intl (FR, EN, ES, IT)
- **Deploy** — Vercel

## 🔗 Smart Contracts

| Network | Address |
|---|---|
| Celo Mainnet | `0xb215c82de33f98b270455f21f7edb7780da0d47d` |
| Celo Sepolia (testnet) | `0x50b20728ba0ad803679b5428f267c89aede9a378` |

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

## 🌍 Multi-Language Support

| Language | Code |
|---|---|
| 🇫🇷 Français | fr |
| 🇬🇧 English | en |
| 🇪🇸 Español | es |
| 🇮🇹 Italiano | it |

## 🛠️ Local Setup
```bash
# Clone
git clone https://github.com/wkalidev/trivia-quest.git
cd trivia-quest

# Frontend
cd frontend
yarn install
yarn dev

# Contracts
cd ../contracts
npm install
npx hardhat compile
```

## 🎯 Proof of Ship Checklist

- ✅ Build For MiniPay — MiniPay hook integrated
- ✅ Deploy On Celo — Smart contract on Celo Mainnet
- ✅ Prove Your Humanity — Coinbase Verification
- ✅ Submit Your Project

## 📋 Tech Stack

| Layer | Tech |
|---|---|
| Blockchain | Celo Mainnet |
| Smart Contract | Solidity 0.8.20 + OpenZeppelin |
| Frontend | Next.js 16 + TypeScript |
| Styling | TailwindCSS |
| Animations | Framer Motion |
| Web3 | Wagmi + Viem + RainbowKit |
| i18n | next-intl |
| Deploy | Vercel |

## 👤 Author

Built by [@wkalidev](https://github.com/wkalidev) for Celo Proof of Ship — April 2026