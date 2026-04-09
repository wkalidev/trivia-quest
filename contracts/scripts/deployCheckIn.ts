import hre from "hardhat";
import * as fs from "fs";

const TRIVQ_ADDRESS = "0xf50afd22d5285f0398bf1be433252ce6a9fd9579" as `0x${string}`;
const QUEST_ADDRESS = "0xedf1505c476a5a7de9e60f79844edb7774c03f0a" as `0x${string}`;

async function main() {
  const { viem } = await hre.network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  console.log("Deployer:", deployer.account.address);

  // ── 1. Deploy DailyCheckIn ────────────────────────────
  console.log("\n1/4 Deploying DailyCheckIn...");
  const checkIn = await viem.deployContract("DailyCheckIn", [TRIVQ_ADDRESS]);
  console.log("DailyCheckIn deployed at:", checkIn.address);

  await new Promise(r => setTimeout(r, 3000));

  // ── 2. Set DailyCheckIn as minter ────────────────────
  console.log("\n2/4 Setting minter...");
  const trivq = await viem.getContractAt("TriviaQToken", TRIVQ_ADDRESS);
  await trivq.write.setMinter([checkIn.address]);
  console.log("✅ Minter set to DailyCheckIn");

  await new Promise(r => setTimeout(r, 3000));

  // ── 3. Charger les URIs depuis nft-uris.json ─────────
  console.log("\n3/4 Loading NFT URIs...");
  const nftData = JSON.parse(fs.readFileSync("nft-uris.json", "utf-8")) as {
    id: number;
    categoryId: number;
    metadataUri: string;
  }[];

  // Upload URIs par batch de 20
  const batchSize = 20;
  for (let i = 0; i < nftData.length; i += batchSize) {
    const batch = nftData.slice(i, i + batchSize);
    const ids = batch.map(n => BigInt(n.id));
    const uris = batch.map(n => n.metadataUri);
    await checkIn.write.setBatchTokenURIs([ids, uris]);
    console.log(`  ✅ Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(nftData.length/batchSize)} uploaded`);
    await new Promise(r => setTimeout(r, 2000));
  }

  // ── 4. Configurer tokens par catégorie ────────────────
  console.log("\n4/4 Setting category tokens...");
  for (let catId = 1; catId <= 6; catId++) {
    const tokens = nftData
      .filter(n => n.categoryId === catId)
      .map(n => BigInt(n.id));
    await checkIn.write.setCategoryTokens([BigInt(catId), tokens]);
    console.log(`  ✅ Category ${catId}: ${tokens.length} tokens`);
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log("\n══════════════════════════════════════════════");
  console.log("NEXT_PUBLIC_CHECKIN_ADDRESS =", checkIn.address);
  console.log("══════════════════════════════════════════════");
}

main().catch(err => {
  console.error("❌", err);
  process.exit(1);
});