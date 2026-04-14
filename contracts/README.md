# TriviaQ Smart Contracts

Solidity contracts for TriviaQ — deployed on Celo Mainnet.

## Contracts

| Contract | Address |
|---|---|
| TriviaQToken ($TRIVQ) v2 | Celo Mainnet | `0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5` |
| TriviaQuest v3 | Celo Mainnet | `0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb` |
| DailyCheckIn v2 | Celo Mainnet | `0x8650e6c477f8ae3933dc6d61d85e65c90cf71828` |
| Referral v2 | Celo Mainnet | `0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e` |

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
| `deployReferral.ts` | Deploy Referral contract |