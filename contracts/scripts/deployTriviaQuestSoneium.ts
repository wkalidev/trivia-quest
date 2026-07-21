import hre from "hardhat";
import { parseEther } from "viem";

// Existing Minato deploy from the first pass — token/checkin/referral are NOT being
// redeployed, only the game contract (TriviaQuest -> TriviaQuestSoneium fork).
const TRIVQ_ADDRESS = "0x50b20728ba0ad803679b5428f267c89aede9a378" as `0x${string}`;
// Old (unfixed) TriviaQuest game contract from the first Minato deploy — has the
// payable(...).transfer() bug. Removed as a TRIVQ minter below since nothing should
// call it anymore; it stays on-chain (immutable), just orphaned.
const OLD_GAME_ADDRESS = "0x23c8b7c1886b834a966b50d447a19378ba7a15fa" as `0x${string}`;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  const { viem } = await hre.network.connect();
  const [deployer] = await viem.getWalletClients();

  console.log("Deployer:", deployer.account.address);

  console.log("\n1/4 Deploying TriviaQuestSoneium (fixed payout logic)...");
  const triviaQuest = await viem.deployContract("TriviaQuestSoneium");
  console.log("✅ TriviaQuestSoneium:", triviaQuest.address);
  await sleep(3000);

  console.log("\n2/4 Linking existing TRIVQ token...");
  await triviaQuest.write.setTrivqToken([TRIVQ_ADDRESS]);
  console.log("✅ Token linked");
  await sleep(2000);

  console.log("\n3/4 Adding new contract as TRIVQ minter...");
  const trivq = await viem.getContractAt("TriviaQToken", TRIVQ_ADDRESS);
  await trivq.write.addMinter([triviaQuest.address]);
  console.log("✅ TriviaQuestSoneium can mint");
  await sleep(2000);

  console.log("\n4/5 Removing old (unfixed) TriviaQuest as minter...");
  await trivq.write.removeMinter([OLD_GAME_ADDRESS]);
  console.log("✅ Old game contract minter access revoked");
  await sleep(2000);

  // Contract default is 0.01 ether (~$19) — same as Celo's legacy default, way too
  // high for a real ETH-denominated chain. Match Base's 0.00001 ETH (~$0.02) instead
  // of leaving this as a separate manual step someone has to remember to run.
  console.log("\n5/5 Setting entry fee to 0.00001 ETH (matches Base)...");
  await triviaQuest.write.setEntryFee([parseEther("0.00001")]);
  console.log("✅ Entry fee set");

  console.log("\n══════════════════════════════════════════════════");
  console.log("NEXT_PUBLIC_GAME_ADDRESS (Minato) =", triviaQuest.address);
  console.log("══════════════════════════════════════════════════");
  console.log("➜ Paste into frontend/src/lib/contract.ts, CONTRACTS[soneiumMinato.id].game");
  console.log("➜ Old game address (now orphaned, do not use):", OLD_GAME_ADDRESS);
}

main().catch(err => {
  console.error("❌", err);
  process.exit(1);
});
