import hre from "hardhat";
import * as fs from "fs";

const CHECKIN_ADDRESS = "0x12a76267fd15f013daaf4f20824295afa4ebcd91" as `0x${string}`;

async function main() {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const checkIn = await viem.getContractAt("DailyCheckIn", CHECKIN_ADDRESS);

  const nftData = JSON.parse(fs.readFileSync("nft-uris.json", "utf-8")) as {
    id: number;
    categoryId: number;
    metadataUri: string;
  }[];

  // ── 1. Upload URIs par batch de 5 ────────────────────
  console.log("1/2 Uploading URIs (batch of 5)...");
  const batchSize = 5;

  for (let i = 0; i < nftData.length; i += batchSize) {
    const batch = nftData.slice(i, i + batchSize);
    const ids = batch.map(n => BigInt(n.id));
    const uris = batch.map(n => n.metadataUri);

    try {
      const tx = await checkIn.write.setBatchTokenURIs([ids, uris]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`  ✅ Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(nftData.length/batchSize)}`);
    } catch (err) {
      console.error(`  ❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, err);
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  // ── 2. Configurer tokens par catégorie ────────────────
  console.log("\n2/2 Setting category tokens...");
  for (let catId = 1; catId <= 6; catId++) {
    const tokens = nftData
      .filter(n => n.categoryId === catId)
      .map(n => BigInt(n.id));

    try {
      const tx = await checkIn.write.setCategoryTokens([BigInt(catId), tokens]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`  ✅ Category ${catId}: ${tokens.length} tokens`);
    } catch (err) {
      console.error(`  ❌ Category ${catId} failed:`, err);
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log("\n══════════════════════════════════════════════");
  console.log("✅ DailyCheckIn setup complete!");
  console.log("NEXT_PUBLIC_CHECKIN_ADDRESS =", CHECKIN_ADDRESS);
  console.log("══════════════════════════════════════════════");
}

main().catch(err => {
  console.error("❌", err);
  process.exit(1);
});