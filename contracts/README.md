# TriviaQ Smart Contracts

Solidity contracts for TriviaQ — deployed on Celo Mainnet.

## Contracts

| Contract | Address |
|---|---|
| TriviaQuest | `0x002570e6fee3e4f0ab1708a1e8b3aaf7d6a5578f` |
| TriviaQToken ($TRIVQ) | `0xf50afd22d5285f0398bf1be433252ce6a9fd9579` |
| DailyCheckIn (ERC-1155) | `0x12a76267fd15f013daaf4f20824295afa4ebcd91` |

## Setup

```bash
npm install
npx hardhat compile
```

## Deploy

```bash
npx hardhat run scripts/deploy.ts --network celo
```

## Scripts

| Script | Description |
|---|---|
| `deploy.ts` | Deploy TriviaQToken + TriviaQuest |
| `deployCheckIn.ts` | Deploy DailyCheckIn + setup NFTs |
| `deployTriviaQuest.ts` | Deploy TriviaQuest with protocol fee |
| `setupCheckIn.ts` | Upload NFT URIs + configure categories |
| `checkRound.ts` | Check + finish expired round |
| `set-minter.ts` | Set minter on TriviaQToken |
| `generateNFTs.ts` | Generate 150 NFTs + upload to Pinata |