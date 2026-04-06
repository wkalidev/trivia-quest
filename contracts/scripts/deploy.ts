import { network } from "hardhat";

const { viem, networkName } = await network.connect();
const [deployer] = await viem.getWalletClients();

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

console.log(`Deploying to ${networkName}...`);
console.log("Deployer:", deployer.account.address);

const wallet = deployer.account.address;

// ── 1. TriviaQToken ────────────────────────────────────────────────────────
console.log("\n1/3 Deploying TriviaQToken ($TRIVQ)...");
const triviaQToken = await viem.deployContract("TriviaQToken", [
  wallet, // liquidityWallet  (20%)
  wallet, // teamWallet       (15%)
  wallet, // ecosystemWallet  (10%)
  wallet, // marketingWallet  ( 5%)
]);
console.log("TriviaQToken deployed at:", triviaQToken.address);
await sleep(3000);

// ── 2. TriviaQuest — SANS argument ────────────────────────────────────────
console.log("\n2/3 Deploying TriviaQuest...");
const triviaQuest = await viem.deployContract("TriviaQuest");
console.log("TriviaQuest deployed at:", triviaQuest.address);
await sleep(3000);

// ── 3. Link token + set minter ────────────────────────────────────────────
console.log("\n3/3 Linking token & setting minter...");
await triviaQuest.write.setTrivqToken([triviaQToken.address]);
console.log("Token linked ✓");
await sleep(3000);
await triviaQToken.write.setMinter([triviaQuest.address]);
console.log("Minter set ✓");

// ── Résumé ─────────────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════");
console.log("NEXT_PUBLIC_TRIVQ_ADDRESS =", triviaQToken.address);
console.log("NEXT_PUBLIC_GAME_ADDRESS  =", triviaQuest.address);
console.log("══════════════════════════════════════════════════");
console.log("➜ Colle ces valeurs dans ton .env.local !");