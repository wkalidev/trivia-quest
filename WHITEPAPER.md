# TriviaQ — Whitepaper

**Version:** 1.0 — June 2026  
**Author:** wkalidev (zcodebase.eth)  
**Website:** https://trivia-quest-eight.vercel.app  
**GitHub:** https://github.com/wkalidev/trivia-quest  
**Token:** $TRIVQ — ERC-20 on Celo Mainnet & Base Mainnet

---

## 1. Executive Summary

TriviaQ is a play-to-earn blockchain trivia game deployed on Celo Mainnet and Base Mainnet. Players earn $TRIVQ tokens by answering quiz questions, maintaining daily streaks, competing in prize-pool rounds, and wagering on 1-versus-1 duels. The protocol is designed for MiniPay-native access, targeting underbanked smartphone users across Africa and emerging markets.

The game features 1,200+ questions across 6 categories (including African Geography and Web3 & Crypto), AI-generated questions via Groq LLaMA 3.1, real-time on-chain leaderboards, and a public SDK. Score submissions require an ECDSA wallet signature to prevent fraud. As of June 2026, TriviaQ has distributed 71,700 TRIVQ across 59 completed rounds, with 23 active players and 274 on-chain transfers across both chains.

---

## 2. Problem

**Financial exclusion is the default in sub-Saharan Africa.** Approximately 57% of adults across the continent remain unbanked, yet smartphone penetration continues to rise. Existing Web3 gaming protocols do not address this audience: they require pre-funded wallets, complex onboarding, and assume stable internet and desktop access.

Simultaneously, Web3 literacy remains low among emerging market users. Educational content exists but is passive — there is no financial incentive to engage with it, and no feedback loop that rewards learning.

The gap is a game that is:
- Playable on a smartphone with zero-click wallet connect
- Rewarding in a token with real on-chain utility
- Educational, covering African geography and Web3 fundamentals
- Self-sustaining, with protocol fees that do not depend on grants

---

## 3. Solution

TriviaQ is a mobile-first trivia game built natively for [MiniPay](https://www.opera.com/products/minipay) — Opera's lightweight stablecoin wallet, pre-installed on millions of Android devices across Africa. Players sign in automatically via their MiniPay wallet with no seed phrase entry, no MetaMask install, and no gas UX friction.

Every game action that affects a player's on-chain state — joining a round, submitting a score, completing a daily check-in, creating or joining a duel — is a signed blockchain transaction on Celo or Base. $TRIVQ rewards are minted directly to the player's wallet after each game. No custodial wallets, no off-chain point systems.

Key differentiators:
- MiniPay injected connector with automatic wallet aliasing (`injected()` + address fallback)
- ECDSA score signature verification — the server signs the score before the contract mints
- Rate limiting on score submissions (5/hour per wallet) enforced server-side
- AI-generated questions via Groq (LLaMA 3.1-8b-instant) for infinite variety
- Inline CELO → TRIVQ swap via Ubeswap V3 Universal Router, no external DEX needed
- Farcaster Mini App SDK integration with push notifications for daily check-in reminders

---

## 4. Social Impact

**Web3 literacy through play.** The *Crypto Master* category (Web3 & Crypto) teaches players about wallets, smart contracts, DeFi, and NFTs through active quiz engagement with a financial incentive. Each correct answer earns 100 TRIVQ, creating a direct reward loop for learning.

**African geography and culture on-chain.** The *Africa Explorer* category covers African geography, history, and culture — content largely absent from mainstream trivia games. This is intentional: the game is built for African users, not adapted for them.

**Micro-rewards for the unbanked.** For a MiniPay user in Nairobi or Lagos, earning TRIVQ and swapping it for CELO via Ubeswap is a real financial outcome from a 3-minute quiz session. The inline swap (CELO ↔ TRIVQ) requires no external DEX. The prize-pool round model means players compete for CELO — not just governance tokens.

**Multilingual access.** The app supports 8 languages: French, English, Spanish, Italian, Portuguese, Arabic, Chinese, and Kiswahili — covering the primary languages of Celo's target markets.

---

## 5. Game Mechanics

### Quiz Rounds
- 10 random questions per game, 15-second timer per question
- Questions drawn from 1,200+ pool across 6 categories, or generated live by AI
- Streak multiplier: 3+ consecutive correct answers = x2; 5+ = x3
- Score submitted on-chain via `submitScore(player, score, points)` with ECDSA server signature

### Prize Pools
- Players join a round by paying an entry fee in CELO
- Fees accumulate in the on-chain prize pool
- Round ends automatically via cron when the time window expires
- Top 3 players split the pool: 50% / 30% / 20%
- 10% protocol fee on duel winnings; fee recipient is the treasury address

### Daily Check-In
- Players call `checkIn(categoryId)` once every 24 hours
- Reward: 100 TRIVQ per check-in
- 7-day streak bonus: 2,000 TRIVQ
- 150 unique NFT badges (ERC-1155) awarded for milestone streaks, stored on Pinata IPFS

### Trivia Duel (1v1)
- Player A creates a duel with a CELO wager (0.01–0.5 CELO)
- Player B joins by matching the wager
- Both play independently — best score wins 90% of the total pot
- Tie: both players refunded minus fees
- Duel expires in 24 hours if no opponent joins → full refund to Player A
- Contract: `0xee7be00cd5454b9bea56d864d82076b8b5de5ca1` (Celo)

### Referral System
- Each player has a unique referral link
- Referred player registers via `registerReferral(referrer)` on-chain
- Both referrer and referee earn 500 TRIVQ
- Referral history is fully on-chain and verifiable

---

## 6. Token Economics

**Token:** $TRIVQ  
**Standard:** ERC-20  
**Chains:** Celo Mainnet, Base Mainnet  
**Decimals:** 18

### Distribution

| Allocation | % | Tokens |
|---|---|---|
| Player Rewards | 50% | 500,000,000 |
| Liquidity | 20% | 200,000,000 |
| Team | 15% | 150,000,000 |
| Ecosystem | 10% | 100,000,000 |
| Marketing | 5% | 50,000,000 |

### Token Utility

$TRIVQ has three concrete on-chain use cases enforced by deployed contracts:

1. **Prize round participation** — TRIVQ is minted to players on score submission (`submitScore`). Holding TRIVQ is the direct outcome of gameplay; future rounds may require a TRIVQ stake to access premium categories.

2. **Duel wager settlement** — Duel wagers are denominated in CELO (liquid and familiar to MiniPay users). TRIVQ rewards are minted additionally for duel participants, making duels dual-reward events.

3. **Referral payouts** — The referral contract mints 500 TRIVQ to both parties on successful referral registration. This is the primary TRIVQ distribution mechanism for new user acquisition.

4. **Governance (planned Q1 2027)** — TRIVQ holders will vote on question categories, reward rates, and protocol fee parameters via a DAO contract.

### Reward Rates

| Action | Reward |
|---|---|
| Per point scored | 100 TRIVQ |
| Daily check-in | 100 TRIVQ |
| 7-day streak bonus | 2,000 TRIVQ |
| Referral reward | 500 TRIVQ |
| Round winner 1st | 50% of CELO prize pool |
| Round winner 2nd | 30% of CELO prize pool |
| Round winner 3rd | 20% of CELO prize pool |
| Duel winner | 90% of total CELO wager |

---

## 7. Mint Authority

**Who can mint:** The `TriviaQToken` contract exposes a `mint(to, amount)` function restricted to a designated minter address. The minter role is set by the contract owner via `setMinter(address)` (script: `set-minter.ts`).

**Current minter:** The TriviaQuest game contract (`0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb` on Celo, `0x1e2c209412ec30915ccf922654f0593faf61fcfb` on Base). Minting is triggered exclusively by the on-chain `submitScore` function, which requires a valid ECDSA server signature.

**Supply ceiling:** Minting is capped at a maximum total supply of 500,000,000 TRIVQ. The token contract enforces this cap via a `require(totalSupply() + amount <= MAX_SUPPLY)` check.

**Minter role transfer:** The owner can reassign the minter role at any time via `setMinter`. There is no timelock on this operation. This will be addressed in the governance phase (Q1 2027) by transferring ownership to a multisig or DAO contract.

---

## 8. Supply Mechanics

- **Maximum supply:** 500,000,000 TRIVQ (hard cap enforced in contract)
- **Burn mechanism:** None. There is no burn function in the current token contract. All minted tokens remain in circulation.
- **Inflationary pressure:** Minting occurs exclusively on score submission, check-in, and referral. Rate limiting (5 submissions/hour per wallet) and the 24-hour check-in cooldown bound the daily emission rate.
- **Circulating supply:** As of June 2026, 71,700 TRIVQ has been distributed across 274 on-chain transfers.
- **Liquidity:** TRIVQ/CELO pool active on Ubeswap v3 (Celo). Inline swap available directly in the app.

---

## 9. Security & Audit Disclosure

**No external security audit has been performed on TriviaQ smart contracts.** Users should be aware of this risk before interacting with the protocol.

### Implemented mitigations

| Control | Detail |
|---|---|
| ECDSA score verification | The server signs `(player, score, points)` with a private key before `submitScore` is called. The contract verifies the signature on-chain — fake scores cannot be submitted without the server key. |
| Rate limiting | 5 score submissions per wallet per hour, enforced server-side before signing. |
| OpenZeppelin base | All contracts inherit from audited OpenZeppelin v4/v5 contracts: `ERC20`, `ERC1155`, `Ownable`, `ReentrancyGuard`. |
| Cron secret | The `finishRound` cron endpoint is protected by a `CRON_SECRET` environment variable; unauthenticated calls are rejected. |
| AI endpoint rate limit | 10 requests/minute; Self Protocol verified agents bypass via `X-Self-Signature` header. |
| No upgradeable proxies | Contracts are deployed as immutable implementations. No proxy admin can silently upgrade logic. |

### Known limitations

- No timelock on minter role transfer
- No multisig on owner functions (planned for Q1 2027 governance phase)
- Server signing key is a single point of failure for score minting

---

## 10. Traction

All figures are on-chain and verifiable via Celoscan and Basescan.

| Metric | Value |
|---|---|
| Total TRIVQ distributed | 71,700 TRIVQ |
| On-chain transfers | 274 |
| Rounds completed | 59 |
| Active players | 23 |
| TRIVQ holders (Celo) | 26 |
| TRIVQ holders (Base) | 5 |
| Chains live | 2 (Celo + Base) |
| Questions in pool | 1,200+ |
| Supported languages | 8 |
| SDK npm package | `@wkalidev/trivia-quest-sdk` v3.1.0 |
| Proof of Ship #9 | $250 prize claimed |

---

## 11. Technology Stack

| Layer | Technology |
|---|---|
| Blockchain | Celo Mainnet (chainId 42220) + Base Mainnet (chainId 8453) |
| Smart Contracts | Solidity 0.8.20 / 0.8.24 + OpenZeppelin v4/v5 |
| NFT Storage | Pinata IPFS (150 unique ERC-1155 badge URIs) |
| Frontend | Next.js 16 + TypeScript + TailwindCSS |
| Web3 Client | Wagmi v2 + Viem v2 + RainbowKit |
| Mobile Wallet | MiniPay (Opera) — `injected()` connector with address aliasing |
| DEX / Swap | Ubeswap V3 Universal Router (`0x3C255DED9B25f0BFB4EF1D14234BD2514d7A7A0d`) |
| Swap Path | `WRAP_ETH (0x0b)` → `V3_SWAP_EXACT_IN (0x00)` — WCELO → TRIVQ (0.30% fee) |
| AI Questions | Groq API — LLaMA 3.1-8b-instant |
| AI Agent | Self Protocol — verified onchain agent #103 |
| Social | Farcaster Mini App SDK + Supabase (push notifications) |
| Social Bot | Discord.js v14 + ethers.js v6 (hosted on Railway) |
| i18n | next-intl (FR, EN, ES, IT, PT, AR, ZH, SW) |
| Deploy | Vercel (frontend) + GitHub Actions (CI) |
| MCP Server | `/api/mcp` — Model Context Protocol endpoint |
| SDK | `@wkalidev/trivia-quest-sdk` v3.1.0 on npm |

---

## 12. Roadmap

| Phase | Date | Deliverables |
|---|---|---|
| Live | Q2 2026 (complete) | Celo + Base live, 9 contracts deployed, SDK v3.1.0, Duel 1v1, AI Mode, Self Agent #103, MCP server, 8 languages, inline swap |
| Phase 2 | Q3 2026 | 100 TRIVQ holders, Ubeswap v3 liquidity pool seeded with 10,000 CELO equivalent, MiniPay featured listing application |
| Phase 3 | Q4 2026 | 500 active players, governance vote mechanism deployed (TRIVQ-weighted snapshot), expanded question pool (2,000+) |
| Phase 4 | Q1 2027 | DAO contract deployed, owner functions transferred to multisig, additional chain expansion (Optimism or Arbitrum), external security audit |

---

## 13. Team

| Property | Value |
|---|---|
| Developer | wkalidev |
| ENS | zcodebase.eth |
| GitHub | https://github.com/wkalidev |
| Disclosure | Solo developer. Anonymous. Active Celo ecosystem builder since 2025. |
| KYC | No formal KYC. Wallet identity verifiable on-chain via zcodebase.eth. |

TriviaQ is a solo-built project. All smart contract development, frontend engineering, SDK authorship, Discord bot, and infrastructure are maintained by a single developer. No venture funding has been raised.

---

## 14. Contract Addresses

### Celo Mainnet (chainId 42220)

| Contract | Address |
|---|---|
| TriviaQToken ($TRIVQ) v2 | `0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5` |
| TriviaQuest v3 | `0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb` |
| TriviaDuel v1 | `0xee7be00cd5454b9bea56d864d82076b8b5de5ca1` |
| DailyCheckIn v2 | `0x8650e6c477f8ae3933dc6d61d85e65c90cf71828` |
| Referral v2 | `0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e` |

### Base Mainnet (chainId 8453)

| Contract | Address |
|---|---|
| TriviaQToken ($TRIVQ) | `0x8ecc1dc70f3bc5be941b61b42707eb7dbddb54c3` |
| TriviaQuest | `0x1e2c209412ec30915ccf922654f0593faf61fcfb` |
| DailyCheckIn | `0x0f19851d5cd905d110c000a7d26d74a2f21f8ff9` |
| Referral | `0x4fb5285263354e1e75f044c65166ab22c3840074` |
| Treasury (fee recipient) | `0x995aC10d5B6778B90eF060b7ab585D854C1Ed914` |

### Explorer Links

- Celo token: https://celoscan.io/token/0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5
- Base token: https://basescan.org/token/0x8ecc1dc70f3bc5be941b61b42707eb7dbddb54c3
- Celo game contract: https://celoscan.io/address/0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb
- Base game contract: https://basescan.org/address/0x1e2c209412ec30915ccf922654f0593faf61fcfb

---

*TriviaQ Whitepaper v1.0 — June 2026*  
*Version-controlled: https://github.com/wkalidev/trivia-quest/blob/main/WHITEPAPER.md*
