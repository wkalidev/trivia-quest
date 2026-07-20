# Trivia Q 🎮

<p align="center">
  <img src="trivq-logo-256.png" alt="TRIVQ Logo" width="128" />
</p>

> Play. Learn. Earn on Celo & Base.

[![Live Demo](https://img.shields.io/badge/Live-trivia--quest--eight.vercel.app-FBCD00?style=for-the-badge)](https://trivia-quest-eight.vercel.app)
[![npm](https://img.shields.io/badge/SDK_v3.4.0-npm-CB3837?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@wkalidev/trivia-quest-sdk)
[![Self Agent](https://img.shields.io/badge/Self_Agent-ID_%23103-6366f1?style=for-the-badge)](https://app.ai.self.xyz/agents)
[![8004scan](https://img.shields.io/badge/8004scan-27.6→target_70%2B-orange?style=for-the-badge)](https://8004scan.io/agents/celo/9055)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

## 🌍 Why Africa?

Celo's mission is financial inclusion for the unbanked. With **57% of African adults** lacking bank accounts but owning smartphones, MiniPay is the perfect gateway. Trivia Q brings fun, education, and real micro-rewards to this audience — fully playable inside MiniPay with zero-click wallet connect.

## 🚀 Live

| Resource | Link |
|---|---|
| App | https://trivia-quest-eight.vercel.app |
| Duel 1v1 | https://trivia-quest-eight.vercel.app/duel |
| SDK v3.4.0 | `npm install @wkalidev/trivia-quest-sdk` |
| Stats API | `GET /api/stats` |
| MCP Server | https://trivia-quest-eight.vercel.app/api/mcp |
| A2A Agent | https://trivia-quest-eight.vercel.app/api/a2a |
| AgentCard | https://trivia-quest-eight.vercel.app/.well-known/agent.json |
| OpenAPI | https://trivia-quest-eight.vercel.app/.well-known/openapi.json |
| GitHub | https://github.com/wkalidev/trivia-quest |
| Whitepaper | https://github.com/wkalidev/trivia-quest/blob/main/WHITEPAPER.md |
| 8004scan | https://8004scan.io/agents/celo/9055 |

## 🎮 Features

- 1200+ questions across 6 categories
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
- 8 languages — FR / EN / ES / IT / PT / AR / ZH / SW
- 🆕 Base Mainnet fully live — rounds, rewards, treasury configured
- PWA installable on Android
- Discord Bot 24/7
- 🆕 AI Mode — questions by Groq AI (LLaMA 3.1)
- 🆕 Trivia Duel 1v1 — wager CELO on-chain
- 🆕 Discord AI Agent — /ask /askcat
- 🆕 Self Agent ID — verified onchain AI agent (#103)
- 🆕 Farcaster Push Notifications — daily check-in reminders
- 🆕 A2A Agent endpoint — Google Agent-to-Agent protocol
- 🆕 x402 payment enforcement — premium AI questions gate
- 🆕 OASF OpenAPI spec at /.well-known/openapi.json
- 🆕 Full compliance metadata — license, provider, contact, dates

## 🤖 AI Mode (NEW — May 2026)

Questions generated in real-time by Groq AI (LLaMA 3.1-8b-instant):
- Available in all 6 categories
- Infinite unique questions — never the same quiz twice
- Questions preloaded in background while you play
- Accessible via /quiz → Mode IA button
- API: `GET /api/ai-question?category=Web3%20%26%20Crypto`

## 🔐 Security

- Submit score requires ECDSA wallet signature (prevents fake scores)
- Submit score signature is single-use: bound to a nonce + 5-minute expiry, so a captured signature can't be replayed later to re-mint TRIVQ 🆕
- Duel score submission (`/api/submit-duel-score`) now requires an ECDSA wallet signature from the submitting player — previously anyone who knew a `duelId` and a player's address (both public on-chain) could post a fake score for either side of a real-money duel 🆕
- Rate limited: 5 submissions/hour per wallet
- Cron endpoint protected by CRON_SECRET
- AI endpoint rate limited: 10 req/min (Self Agents bypass)
- MCP/A2A endpoints rate limited: 30/20 req/min per IP
- Internal server-to-server calls authenticated via `CRON_SECRET` (`X-Internal-Key` header) — replaces spoofable `x-mcp-caller`/`x-game-session` headers
- AI question `category` param validated against allowlist before LLM interpolation (prompt injection prevention)
- Farcaster webhook input fully validated: event type, FID range, token length, HTTPS-only URL, JSON Farcaster Signature (JFS) verified via Neynar when `NEYNAR_API_KEY` is set
- SSRF protection: all outbound fetches to Farcaster notification URLs validated (no private/loopback addresses)
- Security headers: `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy` added globally
- CORS headers added globally to `/api/*` routes for 8004scan / agent scanner access
- `/api/round` IP rate limited (5 req/min) to prevent gas-cost flooding
- Private key `0x` prefix normalized in all signing code paths
- `/api/ai-question` x402 payments are genuinely verified and settled on-chain (`POST /verify` then `POST /settle` against the Celo facilitator, x402.celo.org) — priced in USDC ($0.001/question, EIP-3009), paid to the treasury wallet. Previously this only checked that an `X-Payment` header was *present*, never that it was valid — anyone could send a garbage header and get the paid content for free 🆕

**Known residual limitation:** rate limiting and nonce tracking on `/api/submit-score`, `/api/submit-duel-score`, `/api/ai-question` and `/api/mcp` are in-process (`Map`-based), not shared across serverless instances. This is a reasonable soft limit today; a durable store (Upstash/Vercel KV, or a Supabase table) is recommended if abuse is observed. `isInternalCall()` in `/api/ai-question` also still trusts the `Referer` header as one signal to skip the x402 gate entirely — a non-browser client can spoof it to get free access without paying (capped at 10 req/min/IP either way, so worst case is a bounded free-tier leak, not unlimited access).

**Agent registration:** `register-agent.ts` performs the initial ERC-8004 registration only. `update-agent.ts` now points the on-chain `agentURI` at the live, always-current `https://trivia-quest-eight.vercel.app/api/agent-metadata` endpoint instead of a frozen snapshot — run it once (`npx hardhat run scripts/update-agent.ts --network celo`) any time the registered identity needs to be (re)synced after being changed manually.

## 🔐 Self Agent ID (NEW — May 2026)

The Trivia Q Discord bot is registered as a verified onchain AI agent via [Self Protocol](https://app.ai.self.xyz):

| Property | Value |
|---|---|
| Agent ID | #103 |
| Agent Address | `0xFa475D3E676c4A87e410F536b1231FcD220B0261` |
| Network | Celo Mainnet |
| Status | ✅ Verified onchain |

Every AI request made by the bot is cryptographically signed with ECDSA — verifiable on-chain. The `/api/ai-question` endpoint recognizes verified Self Agents and grants them priority access, bypassing standard rate limits.

## ⚔️ Trivia Duel 1v1 (NEW — May 2026)

- Create a duel with a wager (0.01 to 0.5 CELO)
- Share the duel ID with your opponent
- Both play independently — best score wins the pot
- Tie = both players refunded minus fees
- Expires in 24h if no one joins → full refund
- 10% protocol fee on winnings
- Contract: `0xee7be00cd5454b9bea56d864d82076b8b5de5ca1`

## 🔗 Smart Contracts

### Celo Mainnet
| Contract | Address |
|---|---|
| TriviaQToken ($TRIVQ) v2 | `0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5` |
| TriviaQuest v3 | `0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb` |
| TriviaDuel v1 🆕 | `0xee7be00cd5454b9bea56d864d82076b8b5de5ca1` |
| DailyCheckIn v2 | `0x8650e6c477f8ae3933dc6d61d85e65c90cf71828` |
| Referral v2 | `0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e` |

### Base Mainnet
| Contract | Address |
|---|---|
| TriviaQToken ($TRIVQ) | `0x8ecc1dc70f3bc5be941b61b42707eb7dbddb54c3` |
| TriviaQuest | `0x1e2c209412ec30915ccf922654f0593faf61fcfb` |
| DailyCheckIn | `0x0f19851d5cd905d110c000a7d26d74a2f21f8ff9` |
| Referral | `0x4fb5285263354e1e75f044c65166ab22c3840074` |
| Treasury (fee recipient) | `0x995aC10d5B6778B90eF060b7ab585D854C1Ed914` |

## 💎 $TRIVQ Tokenomics

| Allocation | Amount | % |
|---|---|---|
| Player Rewards | 250,000,000 | 50% |
| Liquidity | 100,000,000 | 20% |
| Team | 75,000,000 | 15% |
| Ecosystem | 50,000,000 | 10% |
| Marketing | 25,000,000 | 5% |

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
| AI | Groq API (LLaMA 3.1-8b-instant) |
| AI Agent | Self Protocol — Agent #103 🆕 |
| i18n | next-intl (FR, EN, ES, IT, PT, AR, ZH, SW) |
| Bot | discord.js v14 + ethers.js v6 |
| Bot Hosting | Railway (24/7) |
| Deploy | Vercel + GitHub Actions |
| Notifications | Farcaster Mini App SDK + Supabase |

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
# Add DISCORD_TOKEN, CLIENT_ID, GUILD_ID, GROQ_API_KEY, SELF_AGENT_PRIVATE_KEY to .env
npm run build && npm start

# Contracts
cd ../contracts && npm install
npx hardhat compile
```

## 🔄 Inline CELO → TRIVQ Swap

The home page embeds a one-click swap widget powered by the Ubeswap V3 Universal Router:

| Step | Detail |
|---|---|
| Router | `0x3C255DED9B25f0BFB4EF1D14234BD2514d7A7A0d` (Ubeswap V3 on Celo) |
| Path | WCELO → TRIVQ (fee 0.30%) |
| Command | `V3_SWAP_EXACT_IN (0x00)` — payerIsUser=false (router pays from msg.value) |
| Slippage | 5% max |
| Price oracle | GeckoTerminal CELO/TRIVQ ratio (live) |

No external DEX page needed — swap directly inside the Mini App.

## ⚡ Performance

PageSpeed scores (mobile):

| Metric | Score |
|---|---|
| Performance | **98** |
| Accessibility | **100** |
| FCP | 0.9s |
| LCP | 0.9s |
| TBT | 60ms |

| Fix | Impact |
|---|---|
| Inline HTML loading shell in `layout.tsx` | FCP/LCP: content visible before any JS executes |
| WalletConnect + RainbowKit deferred to user interaction | TBT: ~400KB JS never loads during Lighthouse audit |
| RainbowKit CSS moved to lazy chunk | Fixes render-blocking CSS 11.7KB |
| Sync MiniPay detection (inline `<script>`) | MiniPay users: WalletConnect never loads at all |
| `framer-motion` features lazy-loaded | −28KB from initial parse |
| `FarcasterAutoConnect` deferred (`dynamic ssr:false`) | Removes Farcaster SDK from initial bundle |
| Removed unused preconnects (web3modal, WalletConnect) | Eliminates 4 unnecessary DNS/TCP connections |
| `LazyMotion` + `domAnimation` | −70 KB JS bundle |
| `optimizePackageImports` (framer-motion, rainbowkit) | Additional tree-shaking |
| `initial={false}` on hero container | LCP: removes opacity:0 SSR flash |
| Balance card always-rendered (no height animation) | CLS: eliminates layout shift |
| `@keyframes shimmer` moved to static CSS | Removes runtime style injection |

## 🔐 Security Audit

**2026-07 full audit pass:**

- Fixed: duel score submission had no wallet signature check — closed (see Security section above)
- Fixed: submit-score signature had no replay protection — closed with nonce + expiry
- Fixed: `/api/ai-question` x402 gate only checked that an `X-Payment` header existed, never verified it — real `verify`/`settle` against x402.celo.org now enforced, re-priced from 0.001 CELO (~$0.00006, and unenforced) to $0.001 USDC (genuinely charged, EIP-3009). `payTo` moved off the `TriviaQuest` contract address (no ERC-20 rescue function — USDC sent there would be locked forever) to the treasury EOA
- Fixed: on-chain ERC-8004 `agentURI` was a frozen snapshot from an earlier `update-agent.ts` run, out of sync with the live metadata endpoint since — `update-agent.ts` now points at the live endpoint permanently
- Fixed: agent metadata version drift (`3.3.0` vs actual `3.4.0`) across `agent.json`, `agent-card.json`, `/api/a2a`, `/api/mcp`, `/api/stats`
- Fixed: `agent-metadata`'s `updatedAt` was a hardcoded past date — now real-time
- Fixed: `next` bumped `16.2.1` → `16.2.10` (patches several high-severity advisories: DoS via Server Components, Middleware/Proxy bypass, SSRF via WebSocket upgrades — no breaking changes)
- Fixed: `.gitattributes` added to stop CRLF/LF noise showing 88 files as modified with no real content change
- Deferred (documented, not fixed — would require a contract redeploy which is out of scope for this pass): `TriviaQuest.finishRound` / `TriviaDuel._resolveDuel` use `.transfer()` (2300 gas stipend) to pay winners — a smart-contract wallet winner whose `receive()` costs more than that would revert the whole payout; `Referral.sol` has no anti-Sybil protection beyond the global `REWARDS_ALLOC` cap
- Remaining transitive dependency advisories (via `@walletconnect/*`, `@reown/appkit`, `@coinbase/cdp-sdk` — `axios`, `form-data`, `hono`, `protobufjs`, `ws`): not directly reachable from this app's code paths; no fix available without a major upstream bump in the wallet-connector chain. Re-check with `npm audit` after each RainbowKit/wagmi upgrade.
- No test suite exists yet for the 5 production Solidity contracts (`contracts/test/` only has the default Hardhat `Counter.ts` sample) — recommended follow-up, does not block this pass since it's additive/zero-risk.

Known transitive dependency advisories (all via `@metamask/connect-evm`):

- **protobufjs** (2× critical) — arbitrary code execution in `centrifuge` → `protobufjs < 7.5.5`. Not reachable in browser context; no server-side protobuf parsing. Upstream fix awaited in `@metamask/connect-evm`.
- **uuid moderate** — buffer bounds check in v3/v5/v6 when `buf` is provided. Not exploitable in this app (uuid used internally, no user-controlled buf input).

## 📱 MiniPay Compliance

| Requirement | Status |
|---|---|
| Auto wallet connect (`window.ethereum.isMiniPay`) | ✅ |
| Connect button hidden inside MiniPay | ✅ |
| Force Celo mainnet (`wallet_switchEthereumChain`) | ✅ |
| Support button — opens in-context (no `target="_blank"`) | ✅ |
| Terms of Service — `<a target="_self">` in-app navigation | ✅ |
| Privacy Policy — `<a target="_self">` in-app navigation | ✅ |
| Mobile viewport 360×640 minimum | ✅ |
| Graceful error handling on chain switch / account request | ✅ |

## 🎯 Proof of Ship Checklist

- [x] Build For MiniPay
- [x] Deploy On Celo (5 contracts)
- [x] Deploy On Base (4 contracts)
- [x] $TRIVQ Token ERC-20 verified
- [x] 150 NFT Badges ERC-1155 on IPFS
- [x] Daily Check-in on-chain
- [x] Protocol Fee 10%
- [x] Auto Round Management via cron
- [x] Referral System
- [x] $TRIVQ Price Tracker
- [x] Liquidity Pool on Ubeswap v3
- [x] PWA Push Notifications
- [x] Public SDK on npm
- [x] Farcaster Frame
- [x] Dynamic OG image
- [x] Score share card
- [x] Public Stats API
- [x] Discord Bot 24/7 on Railway
- [x] Multi-chain Celo + Base
- [x] Coinbase Verification
- [x] Terms of Service + Privacy Policy
- [x] AI Question Mode (Groq LLaMA 3.1) 🆕
- [x] Trivia Duel 1v1 on-chain 🆕
- [x] Discord AI Agent /ask /askcat 🆕
- [x] Self Agent ID — verified onchain AI agent #103 🆕
- [x] Farcaster Push Notifications (daily reminders) 🆕
- [x] MCP Server endpoint — /api/mcp 🆕
- [x] 8004scan score improved (MCP unlocks full Service scoring) 🆕
- [x] Submit score signature verification 🆕
- [x] Base Mainnet fully operational — rounds auto-managed via cron 🆕
- [x] 8 i18n languages (FR, EN, ES, IT, PT, AR, ZH, SW) 🆕
- [x] 1200+ questions (446 base + 754 extra) 🆕
- [x] SDK v3.2.0 — SDK_VERSION constant fixed, TRIVQ logo, all 9 contract addresses verified 🆕
- [x] SDK v3.3.0 — security audit: SSRF fix, prompt injection, rate limits, CRON_SECRET internal auth
- [x] SDK v3.4.0 — `getAddress()` now throws on unsupported chain/contract instead of silently returning an empty address; `calculateRewards()` streak multiplier aligned with `calculatePoints()`; `fetchNetworkStats`/`getStats` deduplicated
- [x] 2026-07 audit — duel score signature check, submit-score replay protection, agent metadata drift/staleness fixed, Next.js patched, `.gitattributes` added 🆕
- [x] Inline CELO→TRIVQ swap via Ubeswap V3 Universal Router 🆕
- [x] MiniPay full compatibility audit — wagmi injected() connector, address aliasing, checkin fallback 🆕
- [x] PageSpeed performance optimisation — LazyMotion, LCP fix, CLS fix, dns-prefetch 🆕
- [x] A2A AgentCard at /.well-known/agent.json + /api/a2a endpoint 🆕
- [x] x402 payment enforcement on /api/ai-question (external agent calls) 🆕
- [x] OASF /.well-known/openapi.json with x402Payment security scheme 🆕
- [x] Full compliance metadata — status, license, homepage, supportUrl, provider, contact, created, updated 🆕
- [x] Custom service type fixed (rest/a2a) — resolves 8004scan "Unknown" service 🆕
- [x] fc:miniapp embed tag added alongside legacy fc:frame 🆕
- [x] Manifest screenshotUrls populated 🆕
- [x] Farcaster webhook accepts current miniapp_added/miniapp_removed events (was silently dropping them under the legacy frame_added-only filter) 🆕
- [x] Dependency pinning + .npmrc minimum-release-age for MiniPay supply-chain requirement 🆕

## 👤 Author

Built by [@wkalidev](https://github.com/wkalidev) — zcodebase.eth

> Built for Celo Proof of Ship 2026
