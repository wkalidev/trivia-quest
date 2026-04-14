import hre from "hardhat";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  const { viem } = await hre.network.connect();
  const [deployer] = await viem.getWalletClients();
  const wallet = deployer.account.address;

  console.log("Deployer:", wallet);

  // ── 1. TriviaQToken ───────────────────────────────────
  console.log("\n1/5 Deploying TriviaQToken...");
  const trivqToken = await viem.deployContract("TriviaQToken", [
    wallet, wallet, wallet, wallet,
  ]);
  console.log("✅ TriviaQToken:", trivqToken.address);
  await sleep(3000);

  // ── 2. TriviaQuest ────────────────────────────────────
  console.log("\n2/5 Deploying TriviaQuest...");
  const triviaQuest = await viem.deployContract("TriviaQuest");
  console.log("✅ TriviaQuest:", triviaQuest.address);
  await sleep(3000);

  // ── 3. DailyCheckIn ───────────────────────────────────
  console.log("\n3/5 Deploying DailyCheckIn...");
  const dailyCheckIn = await viem.deployContract("DailyCheckIn", [trivqToken.address]);
  console.log("✅ DailyCheckIn:", dailyCheckIn.address);
  await sleep(3000);

  // ── 4. Referral ───────────────────────────────────────
  console.log("\n4/5 Deploying Referral...");
  const referral = await viem.deployContract("Referral", [trivqToken.address]);
  console.log("✅ Referral:", referral.address);
  await sleep(3000);

  // ── 5. Set tous les minters ───────────────────────────
  console.log("\n5/5 Setting minters...");

  // Link TRIVQ token dans TriviaQuest
  await triviaQuest.write.setTrivqToken([trivqToken.address]);
  await sleep(2000);

  // Ajouter tous les minters
  await trivqToken.write.addMinter([triviaQuest.address]);
  console.log("  ✅ TriviaQuest can mint");
  await sleep(2000);

  await trivqToken.write.addMinter([dailyCheckIn.address]);
  console.log("  ✅ DailyCheckIn can mint");
  await sleep(2000);

  await trivqToken.write.addMinter([referral.address]);
  console.log("  ✅ Referral can mint");
  await sleep(2000);

  console.log("\n══════════════════════════════════════════════════");
  console.log("NEXT_PUBLIC_TRIVQ_ADDRESS   =", trivqToken.address);
  console.log("NEXT_PUBLIC_GAME_ADDRESS    =", triviaQuest.address);
  console.log("NEXT_PUBLIC_CHECKIN_ADDRESS =", dailyCheckIn.address);
  console.log("NEXT_PUBLIC_REFERRAL_ADDRESS=", referral.address);
  console.log("══════════════════════════════════════════════════");
  console.log("➜ Colle ces valeurs dans .env.local + Vercel !");
}

main().catch(err => {
  console.error("❌", err);
  process.exit(1);
});