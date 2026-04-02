# Trivia Q 🎮

> Play. Learn. Earn on Celo.

Trivia Q is a blockchain-powered quiz game built on Celo where players earn real CELO rewards by answering questions about African culture, geography, and Web3.

## 🌍 Why Africa?

Celo's mission is financial inclusion for the unbanked. With 57% of African adults lacking bank accounts but owning smartphones, MiniPay is the perfect gateway. Trivia Q brings fun, education, and real micro-rewards to this audience.

## 🏗️ Architecture

- **Smart Contract** — Solidity on Celo Mainnet (TriviaQuest.sol)
- **Frontend** — Next.js 16 + TailwindCSS
- **Wallet** — RainbowKit + Wagmi + MiniPay hook
- **Deploy** — Vercel (PWA-ready)

## 🚀 Live Demo

👉 [trivia-quest-eight.vercel.app](https://trivia-quest-eight.vercel.app)

## 📱 MiniPay Compatible

Trivia Q detects MiniPay automatically and connects the wallet without any popup — seamless UX for mobile users in Africa.

## 🔗 Smart Contracts

| Network | Address |
|---|---|
| Celo Mainnet | `0x1b006fab43cc79b3a091c6b0a9e1761f035340b0` |
| Celo Sepolia (testnet) | `0x50b20728ba0ad803679b5428f267c89aede9a378` |

## 🎯 Quiz Features

- ✅ 446 questions dans 6 catégories
- ✅ Géographie Africaine
- ✅ Web3 & Crypto
- ✅ Histoire & Culture
- ✅ Science & Tech
- ✅ Sports
- ✅ Culture Générale
- ✅ 10 questions aléatoires par partie
- ✅ Timer de 15 secondes par question
- ✅ Récompenses en CELO pour les meilleurs

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
| Web3 | Wagmi + Viem + RainbowKit |
| Deploy | Vercel |

## 👤 Author

Built by [@wkalidev](https://github.com/wkalidev) for Celo Proof of Ship — April 2026