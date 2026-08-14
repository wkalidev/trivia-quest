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
- Duel score submission (`/api/submit-duel-score`) requires an ECDSA wallet signature from the submitting player — verified **off-chain**, in the API route (`viem.verifyMessage`), before the server's own key calls the contract's `onlyOwner submitScore`. **The deployed `TriviaDuel` contract on Celo (the only chain it's deployed on — no Base duel contract exists) does not verify any signature on-chain itself**; it has no `submitScoreVerified`/ECDSA path — that was added to this repo after the Celo deployment and was never redeployed (see [Contract Verification](#-contract-verification)). Protection today is entirely API-layer: real, but it depends on the server and `PRIVATE_KEY` behaving correctly, not on a trustless on-chain guarantee 🆕
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

## 🔎 Contract Verification

Checked directly against Celoscan/Basescan (not assumed from deploy logs). **9/9 deployed contracts have verified source code**, confirmed by reopening each explorer page after verification, not just a successful CLI exit code:

| Contract | Chain | Verified? | Explorer |
|---|---|---|---|
| TriviaQToken ($TRIVQ) v2 | Celo | ✅ Exact Match | [Celoscan](https://celoscan.io/address/0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5#code) |
| TriviaQuest v3 | Celo | ✅ Exact Match | [Celoscan](https://celoscan.io/address/0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb#code) |
| TriviaDuel v1 | Celo | ✅ Exact Match | [Celoscan](https://celoscan.io/address/0xee7be00cd5454b9bea56d864d82076b8b5de5ca1#code) |
| DailyCheckIn v2 | Celo | ✅ Exact Match | [Celoscan](https://celoscan.io/address/0x8650e6c477f8ae3933dc6d61d85e65c90cf71828#code) |
| Referral v2 | Celo | ✅ Exact Match | [Celoscan](https://celoscan.io/address/0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e#code) |
| TriviaQToken ($TRIVQ) | Base | ✅ Exact Match | [Basescan](https://basescan.org/address/0x8ecc1dc70f3bc5be941b61b42707eb7dbddb54c3#code) |
| TriviaQuest | Base | ✅ Exact Match | [Basescan](https://basescan.org/address/0x1e2c209412ec30915ccf922654f0593faf61fcfb#code) |
| DailyCheckIn | Base | ✅ Exact Match | [Basescan](https://basescan.org/address/0x0f19851d5cd905d110c000a7d26d74a2f21f8ff9#code) |
| Referral | Base | ✅ Exact Match | [Basescan](https://basescan.org/address/0x4fb5285263354e1e75f044c65166ab22c3840074#code) |

The 6 previously-unverified contracts were verified via Sourcify (no API key needed; the 2 Base ones were additionally verified on Basescan directly via the existing `BASESCAN_API_KEY`, which works as a unified Etherscan V2 key across chains). No contract was redeployed and no address changed — this only publishes the source code that already matches the bytecode running on-chain.

**Important finding from this process, not just a formality:** before verifying, the locally-compiled bytecode was diffed against the live on-chain bytecode (`eth_getCode`) for every contract. Two did **not** match the current repository `HEAD`:
- **TriviaDuel (Celo)** matches commit `3a80636` — the initial deploy, before the ECDSA-signature-verification work (`acb6bc2`→`162d757`) was added to the source.
- **DailyCheckIn (Celo)** matches commit `45d418d` — the very first version, before the streak-freeze mechanism (`b092bbf`) and a later fix (`cc4f76f`) were added.

Both were verified using that exact historical source (not current `HEAD`), because that's what's actually deployed. **See the Security section below for what this means in practice** — the code currently in this repo for `TriviaDuel.sol` and `DailyCheckIn.sol` is not what's running on Celo mainnet today. Base's `DailyCheckIn` and both chains' `TriviaQuest`/`Referral`/`TriviaQToken` do match current `HEAD`.

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
- Fixed (superseded 2026-08, see below): `next` bumped `16.2.1` → `16.2.10` — this bump was believed to close several high-severity advisories, but `16.2.10` was still inside the vulnerable range for a later batch of disclosures (`>=16.0.0 <16.2.11`); see the 2026-08 pass for the actual fix
- Fixed: `.gitattributes` added to stop CRLF/LF noise showing 88 files as modified with no real content change
- Deferred (documented, not fixed — would require a contract redeploy which is out of scope for this pass): `TriviaQuest.finishRound` / `TriviaDuel._resolveDuel` use `.transfer()` (2300 gas stipend) to pay winners — a smart-contract wallet winner whose `receive()` costs more than that would revert the whole payout; `Referral.sol` has no anti-Sybil protection beyond the global `REWARDS_ALLOC` cap. **Still open as of 2026-08.** — **Source fixed 2026-08-13** (see below), **not yet redeployed**.
- No test suite exists yet for the 5 production Solidity contracts (`contracts/test/` doesn't currently exist — not even the default Hardhat sample) — recommended follow-up, does not block this pass since it's additive/zero-risk. **Still true as of 2026-08-13** — same for `frontend/` and `bot/`, neither has a test runner configured.

**2026-08 audit pass:**

- Fixed: `next` bumped `16.2.10` → `16.3.0` — `16.2.10` (the previous "fixed" version above) was actually still inside the vulnerable range for 3 high-severity advisories disclosed after the July pass: SSRF via attacker-controlled rewrite hostname (GHSA-p9j2-gv94-2wf4), Middleware/Proxy bypass on Turbopack + single-locale App Router (GHSA-6gpp-xcg3-4w24), DoS via Server Actions (GHSA-m99w-x7hq-7vfj), plus 6 moderate. `16.3.0` is the first version outside the vulnerable range. `eslint-config-next` bumped to match.
- Fixed: `agent-metadata`'s `type` field — was the freeform value `"agent"`, which 8004scan flags as invalid (WA002); now the spec's versioned registration identifier `"https://eips.ethereum.org/EIPS/eip-8004#registration-v1"`
- Fixed: `agent-metadata`'s `registrations[0]` was missing the `agentRegistry` field (WA012); added `agentRegistry: "eip155:42220:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"` and `agentId: 9055`, both confirmed by reading `tokenURI(9055)` directly from the ERC-8004 Identity Registry on Celo mainnet
- Fixed: GoodDollar referral link on the results screen used `http://`, not `https://` — mixed-content link from an HTTPS PWA
- Removed: dead legacy Farcaster webhook handler (`api/farcaster/webhook.ts`, Pages Router style, not routed by App Router, no JFS/SSRF checks) that shadowed nothing live but risked being mistaken for a real endpoint
- Fixed: `sdk/package.json` (nested) still read `3.3.0` while the published root `package.json` was already `3.4.0` — the same version-drift class of bug logged as fixed in July, missed in this one file
- `npm audit --audit-level=high` is now run across all 3 dependency trees that ship code (`frontend/`, `bot/`, `contracts/`), not just the two isolated advisories previously called out here. Current state after `npm audit fix` (no `--force`, no breaking bumps applied):
  - `frontend/`: 60 → 53 (0 critical, 10 high, 36 moderate, 7 low). `protobufjs` (critical, via `@metamask/connect-evm`) fully resolved. `@coinbase/cdp-sdk` is pinned to `1.46.1` via `resolutions`/`overrides` — `npm audit fix`'s own suggested (semver-"non-breaking") resolution silently jumps it to `1.55.0`, which now declares `@x402/core`/`@x402/evm`/`@x402/svm` as **peerDependencies** this app never installs; Turbopack fails to resolve them at build time (`Module not found: Can't resolve '@x402/evm/upto/client'`). The pin trades "fewer advisories on paper" for "the app actually builds." All 10 remaining `high` entries (`axios`, `ws`, `@base-org/account`, `@reown/appkit*`, `@wagmi/connectors`, `@walletconnect/ethereum-provider`) resolve through `@coinbase/cdp-sdk`'s and `wagmi`'s dependency chain and require `wagmi@3.7.6` (major, breaking) to clear for real — confirmed via `npm audit --json`, every remaining high has `fixAvailable.isSemVerMajor: true`.
  - `bot/`: 6 → **0** — fully clean.
  - `contracts/`: 21 → 13 (0 critical, 1 high, 1 moderate, 11 low) — dev-only Hardhat tooling. Residual: `undici` (high) via `@nomicfoundation/hardhat-ignition` → `hardhat-verify`, no non-breaking fix published yet.
  - None of the residual `frontend/` or `contracts/` highs are reachable from user-facing runtime code paths (wallet-connector UI chain and Hardhat dev-tooling respectively); re-run `npm audit` after the next wagmi major or Hardhat upgrade — and re-test the build if `@coinbase/cdp-sdk`'s pin is ever lifted.

**2026-08-13 audit pass** (re-verified every MiniPay compliance claim against real code/deployment instead of trusting this README):

- Fixed: `TriviaQuest.finishRound`/`joinRound` and `TriviaDuel._resolveDuel`/`cancelExpiredDuel` switched from `.transfer()` to `.call{value:}("")` with a `require(sent, ...)` check — a smart-contract-wallet winner whose `receive()`/`fallback()` costs more than the 2300 gas stipend no longer reverts the whole payout. All call sites are already behind `nonReentrant` and follow checks-effects-interactions (state written before the external call), so this is a safe drop-in change. Compiles cleanly (`npx hardhat compile`). **Source-only — the deployed Celo/Base contracts still run the old `.transfer()` bytecode. Redeploying changes contract addresses and requires migrating `frontend/src/lib/contract.ts`, env vars, and the SDK — not done in this pass, needs an explicit decision.**
- Fixed: `/api/mcp`'s `GET` handler hardcoded `version: "1.0.0"` while the JSON-RPC `initialize` handler in the same file correctly returned `3.4.0` — the exact version-drift bug the July pass claimed to have closed for this endpoint, just in a spot that was missed. Now `3.4.0`.
- Fixed: `next.config.ts` still preconnected to `api.web3modal.org`, which the Performance section below claims was removed and which nothing in `frontend/src` references anymore. Removed.
- Fixed: dependency pinning (`.npmrc`) was frontend-only and, worse, silently inert everywhere — see the MiniPay Compliance table above for the `min-release-age` key-name/unit bug. Now correct and present in `frontend/`, `bot/`, and `contracts/`.
- Found, not fixed: `SupportButton.tsx` is a `mailto:` link, not an in-context support surface; `checkin/page.tsx`'s check-in transaction has no error UI on failure.
- Confirmed accurate (checked, not just trusted): live deployment matches `HEAD` (`agentRegistry`/`agentId` fix from `f1b919a` is live), icons are real 512×512/192×192 PNGs, `screenshotUrls` point to real ~400KB screenshots (not placeholders), GoodDollar link is HTTPS, ToS/Privacy links are `target="_self"`, connect button is correctly hidden in MiniPay with no regressions.
- Not verified this pass (tooling limits, not code issues): live PageSpeed Insights re-run hit a 429 rate limit with no API key available; couldn't independently confirm the "98" performance score is still current. Recommend re-running manually.
- Confirmed: no trace anywhere in this repo (issues, PRs, commits, notes) of an actual submission via `developer.minipay.to/mini-app-listing`. The 4 open/closed GitHub issues and PRs found are all about contract security features, unrelated to a MiniPay listing submission. **Code compliance is not the same as being listed — nobody has filled out the submission form yet, and that can't be done from this repo.**

**2026-08-14 audit pass:**

- Fixed: 6 of 9 deployed contracts were unverified on Celoscan/Basescan (`TriviaQuest`/`TriviaDuel`/`DailyCheckIn`/`Referral` on Celo, `DailyCheckIn`/`Referral` on Base) — all 9 now verified, see [Contract Verification](#-contract-verification). Verified via Sourcify (no API key needed) plus Basescan directly for the 2 Base contracts, using the existing `BASESCAN_API_KEY` as a unified Etherscan V2 key. No contract was redeployed; no address changed — this only published source code matching what was already on-chain.
- Found in the process of verifying, not a bug fix: before verifying, local bytecode was diffed against live on-chain bytecode for every contract. `TriviaDuel` and `DailyCheckIn` on Celo did not match current `HEAD` — they matched older commits (`3a80636` and `45d418d` respectively), predating later feature work on those files. Both were verified using that exact historical source, since that's what's actually deployed. Full detail in [Contract Verification](#-contract-verification).
- Documented as a known, deliberate architecture choice (not a bug, not a newly-introduced issue): score submission — for both the regular game (`/api/submit-score`) and duels (`/api/submit-duel-score`) — relies on a real ECDSA signature check, but that check happens entirely in the API layer, not on-chain. The player signs the score client-side; the Next.js API route verifies that signature with `viem.verifyMessage()`; only after it passes does the API's server-held `PRIVATE_KEY` (the contract `owner`) call `submitScore`, which is a plain `onlyOwner` function with no signature-verification logic of its own in either `TriviaQuest.sol` or `TriviaDuel.sol`. Practical consequence: the security guarantee rests on the API server and `PRIVATE_KEY` being uncompromised, not on a trustless on-chain check — the contracts trust whoever holds the owner key, full stop. `TriviaDuel` on Celo (the only chain it's deployed on) additionally has no on-chain signature-verification path at all, not even an optional one (`submitScoreVerified` was added to this repo after that deployment — see the finding above). `WHITEPAPER.md` previously described this as the contract verifying the signature on-chain, which was inaccurate; corrected in this pass. A more trustless design would move the signature check into the contract itself (e.g. wiring up the already-written `submitScoreVerified`/`ECDSA.recover` path for duels, and an equivalent for the main game), removing the need to trust the API layer — no timeline committed to that here, just noting it as the direction available.

## 📱 MiniPay Compliance

Re-verified 2026-08-13 against the live code and deployment, not just self-reported checkmarks:

| Requirement | Status |
|---|---|
| Auto wallet connect (`window.ethereum.isMiniPay`) | ✅ `useMiniPay.ts` + sync inline-script detection in `layout.tsx`/`providers.tsx`, no regressions found |
| Connect button hidden inside MiniPay | ✅ only rendered in `app/page.tsx`, gated on `!isInMiniPay` in both spots it appears |
| Force Celo mainnet (`wallet_switchEthereumChain`) | ✅ `useMiniPay.ts` requests the switch; failure is swallowed silently (empty `catch`), which is safe today only because MiniPay never runs on another chain |
| Support button — opens in-context (no `target="_blank"`) | ⚠️ no `target="_blank"` (true), but `SupportButton.tsx` is a `mailto:` link — it hands off to the OS mail client, not an in-app/in-context support surface. Passes the literal MiniPay checklist item, arguably doesn't meet its intent |
| Terms of Service — `<a target="_self">` in-app navigation | ✅ `layout.tsx:134` |
| Privacy Policy — `<a target="_self">` in-app navigation | ✅ `layout.tsx:145` |
| Mobile viewport 360×640 minimum | ✅ (static check) `viewport` meta is `width=device-width`, no hardcoded `min-width` over 360px in `globals.css`; not confirmed with an actual 360×640 device/emulator render |
| Graceful error handling on chain switch / account request | ⚠️ partial — `useMiniPay.ts`'s switch/account-request calls are wrapped in try/catch and degrade cleanly. `app/checkin/page.tsx`'s `writeContract` call for the check-in transaction has no `onError`/error surfaced to the user at all (only `isPending` is read) — a rejected tx or RPC failure fails silently with no UI feedback |
| Dependency pinning / supply-chain (`.npmrc`) | ❌ was broken repo-wide until this pass: only `frontend/.npmrc` existed (`bot/`, `contracts/` had none), and its `minimum-release-age=10080` key was wrong on both counts — the real npm config is `min-release-age` (not `minimum-release-age`, silently ignored by npm as an unrecognized key) and its unit is **days**, not minutes (`10080` would have meant ~27 years once the key name was fixed, blocking effectively every install). Fixed in this pass: `min-release-age=7` + `ignore-scripts=true` now in all three `.npmrc` files. Still requires npm ≥12 in CI/Vercel to actually take effect — npm 11 and earlier warn and ignore it |
| Contracts verified on-chain (Celoscan / Basescan) | ✅ 9/9 verified as of 2026-08-14 — see [Contract Verification](#-contract-verification) below (2 of the 9 are verified as an older historical source version, not current `HEAD` — see that section) |

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
- [x] Dependency pinning + `.npmrc` `min-release-age` for MiniPay supply-chain requirement — fixed 2026-08-13 (wrong key name/unit, frontend-only; now correct in `frontend/`, `bot/`, `contracts/`, still needs npm ≥12 in CI to actually enforce) 🆕
- [x] All 9 deployed contracts verified on Celoscan/Basescan — fixed 2026-08-14, see [Contract Verification](#-contract-verification) 🆕
- [ ] Actual MiniPay listing submission via developer.minipay.to/mini-app-listing — no evidence this has ever been filed; this is a human action, not something fixable in code 🆕

## 👤 Author

Built by [@wkalidev](https://github.com/wkalidev) — zcodebase.eth

> Built for Celo Proof of Ship 2026
