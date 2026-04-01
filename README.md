# Trivia Q 🎮

> Play. Learn. Earn on Celo.

Trivia Q is a blockchain-powered quiz game built on Celo where players earn real CELO rewards by answering questions about African culture, geography, and Web3.

## 🌍 Why Africa?

Celo's mission is financial inclusion for the unbanked. With 57% of African adults lacking bank accounts but owning smartphones, MiniPay is the perfect gateway. Trivia Q brings fun, education, and real micro-rewards to this audience.

## 🏗️ Architecture

- **Smart Contract** — Solidity on Celo Sepolia (TriviaQuest.sol)
- **Frontend** — Next.js 16 + TailwindCSS
- **Wallet** — RainbowKit + Wagmi + MiniPay hook
- **Deploy** — Vercel (PWA-ready)

## 🚀 Live Demo

👉 [trivia-quest-eight.vercel.app](https://trivia-quest-eight.vercel.app)

## 📱 MiniPay Compatible

Trivia Q detects MiniPay automatically and connects the wallet without any popup — seamless UX for mobile users in Africa.

## 🔗 Smart Contract

- **Network**: Celo Sepolia Testnet
- **Address**: `0x50b20728ba0ad803679b5428f267c89aede9a378`
- **Explorer**: [View on CeloScan](https://sepolia.celoscan.io/address/0x50b20728ba0ad803679b5428f267c89aede9a378)

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
- ✅ Deploy On Celo — Smart contract on Celo Sepolia
- ⬜ Prove Your Humanity — Self / Worldcoin / Coinbase
- ⬜ Submit Your Project

## 📋 Tech Stack

| Layer | Tech |
|---|---|
| Blockchain | Celo Sepolia |
| Smart Contract | Solidity 0.8.20 + OpenZeppelin |
| Frontend | Next.js 16 + TypeScript |
| Styling | TailwindCSS |
| Web3 | Wagmi + Viem + RainbowKit |
| Deploy | Vercel |

## 👤 Author

Built by [@wkalidev](https://github.com/wkalidev) for Celo Proof of Ship — April 2026