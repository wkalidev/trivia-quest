# Soneium (Minato → Mainnet) deploy

Staged for the Startale Mini App integration. TriviaDuel is **not** part of this
deploy — it ships in its own PR later (wager moves to native ETH on Soneium, TBD).

## Status

- ✅ Minato: `TriviaQToken`, `DailyCheckIn`, `Referral`, `TriviaQuestSoneium` all
  deployed and wired into `frontend/src/lib/contract.ts`.
  Game: `0x617dc22fec22d5681de90f025fe5b6f2b5ec70bd` — entry fee `0.00001 ETH`,
  minter access confirmed, old buggy `TriviaQuest` (`0x23c8...15fa`) minter access
  revoked (still on-chain, orphaned, do not use).
- ✅ Minato: `DailyCheckIn` NFT metadata (150 URIs + 6 category tokens) uploaded.
- ⬜ Mainnet: not started — needs mainnet ETH bridged first (see Part 1, step 1), and
  Minato E2E fully green (see the E2E test plan for the Startale Preview Tool).

## Part 1 — Token / DailyCheckIn / Referral (done on Minato, repeat for mainnet later)

### 1. Fund the deployer wallet

Deployer/operator address (same key used for `submitScore` + `finishRound` cron on
Celo/Base today): `0xDEAcDe6eC27Fd0cD972c1232C4f0d4171dda2357`

**Soneium Mainnet — needed before the mainnet deploy, not needed for Minato (already
funded/deployed):** bridge real ETH via [bridge.soneium.org](https://bridge.soneium.org).
Size it for more than the one-time deploy — this wallet also pays gas for every future
`submitScore` / `finishRound` cron call on Soneium mainnet, same as it does today on
Celo/Base. Startale's gasless paymaster only sponsors *end-user* smart-account
transactions signed inside the Mini App, not our backend's own server-signed calls.

### 2. Env vars

Nothing required — `hardhat.config.ts` already defaults `MINATO_RPC` /
`SONEIUM_RPC` to the public RPCs. `PRIVATE_KEY` in `contracts/.env` is already set.

### 3. Deploy

```bash
cd contracts
npx hardhat run scripts/deployAll.ts --network soneiumMinato   # done
npx hardhat run scripts/deployAll.ts --network soneium         # mainnet, later
```

Deploys `TriviaQToken` → `TriviaQuest` → `DailyCheckIn` → `Referral` and wires minters.
**On mainnet, ignore the `TriviaQuest` address it prints** — Part 2 replaces it before
anything goes live. (On Minato, deploying plain `TriviaQuest` first and forking after
was a one-time consequence of finding the bug mid-flow — for mainnet, deploy
`TriviaQuestSoneium` directly via Part 2's script instead of `deployAll.ts`'s `TriviaQuest`,
to skip the extra swap-out step.)

## Part 2 — TriviaQuestSoneium (payout fix)

`TriviaQuest.sol` pays winners with a bare `payable(w).transfer(prize)` (fixed 2300-gas
stipend) — reverts on most ERC-4337 smart-account recipients, which is every winner
inside the Startale host. `TriviaQuestSoneium.sol` fixes this with `.call{value:}` +
a `pendingWithdrawals` pull-pattern fallback. Full rationale in the contract's header
comment and in the root `README.md` "Smart Contracts" section. Celo/Base are
intentionally left on the unmodified `TriviaQuest.sol` — do not backport this.

```bash
cd contracts
npx hardhat run scripts/deployTriviaQuestSoneium.ts --network soneiumMinato
```

This one script does everything for the game contract:
1. Deploys `TriviaQuestSoneium`
2. Links the existing Minato `TriviaQToken` (`0x50b20728ba0ad803679b5428f267c89aede9a378`)
3. Adds it as a `TRIVQ` minter
4. Removes the old, unfixed `TriviaQuest` as a minter (orphans it — it stays on-chain,
   immutable, just can no longer mint)
5. Sets `entryFee` to `0.00001 ETH` (contract default is `0.01 ETH` — same legacy
   default Celo shipped with, far too expensive for a real-ETH chain; this matches
   what Base was brought down to)

Paste the printed `TriviaQuestSoneium` address into `frontend/src/lib/contract.ts`,
`CONTRACTS[soneiumMinato.id].game`.

For mainnet: same command with `--network soneium`, once mainnet ETH is bridged (Part 1,
step 1) and Minato E2E is fully green.

## Part 3 — DailyCheckIn NFT metadata

`deployAll.ts` deploys `DailyCheckIn` but, unlike the standalone `deployCheckIn.ts`,
never uploads `nft-uris.json` or configures category tokens — so check-ins mint
successfully but badges have no metadata yet. Soneium shares Celo's badge art/URIs
(same 150 designs, separate per-chain ERC1155 collection — confirmed decision, not
a placeholder).

```bash
cd contracts
npx hardhat run scripts/setupCheckInMinato.ts --network soneiumMinato
```

Uploads all 150 token URIs in batches of 20, then sets category tokens for categories
1-6, against the already-deployed Minato `DailyCheckIn`
(`0xa3da79f30ae5ff551643bdbe55d27ff4f13eeffb`). For mainnet, copy the script and swap
in the mainnet `DailyCheckIn` address once deployed.

## Sanity check before E2E

Paste each address into [soneium-minato.blockscout.com](https://soneium-minato.blockscout.com/)
and confirm contract creation succeeded and code is present. Full E2E (join round →
answer → submit score → check-in → referral → finish round) happens in the Startale
Preview Tool once Parts 2 and 3 are both done and the new game address is wired into
`contract.ts`.

## Known limitation

`badges/page.tsx` reads a single `NEXT_PUBLIC_CHECKIN_ADDRESS` env var directly and
ignores the connected chain — it always shows one chain's badge collection regardless
of what's connected (pre-existing behavior, not introduced by Soneium). Left as-is;
noted here rather than fixed silently since which chain it should default to is a
product call, not a mechanical one.

## Verification (optional)

`hardhat.config.ts` already has `sourcify.enabled: true`, which Blockscout supports —
no extra config needed if you want to verify source on
[soneium-minato.blockscout.com](https://soneium-minato.blockscout.com/) /
[soneium.blockscout.com](https://soneium.blockscout.com/).
