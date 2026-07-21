import hre from "hardhat";
import * as fs from "fs";

// deployAll.ts deploys DailyCheckIn but — unlike the standalone deployCheckIn.ts —
// does not load nft-uris.json or configure category tokens. Run this once against
// the already-deployed Minato DailyCheckIn to bring it in line with Celo/Base
// (same 150-design badge collection, same metadata, separate per-chain ERC1155
// contract/collection as decided).
const CHECKIN_ADDRESS = "0xa3da79f30ae5ff551643bdbe55d27ff4f13eeffb" as `0x${string}`;

async function main() {
  const { viem } = await hre.network.connect();
  const [deployer] = await viem.getWalletClients();
  const checkIn = await viem.getContractAt("DailyCheckIn", CHECKIN_ADDRESS);

  console.log("Deployer:", deployer.account.address);
  console.log("DailyCheckIn (Minato):", CHECKIN_ADDRESS);

  const nftData = JSON.parse(fs.readFileSync("nft-uris.json", "utf-8")) as {
    id: number;
    categoryId: number;
    metadataUri: string;
  }[];

  console.log(`\n1/2 Uploading ${nftData.length} token URIs...`);
  const batchSize = 20;
  for (let i = 0; i < nftData.length; i += batchSize) {
    const batch = nftData.slice(i, i + batchSize);
    const ids = batch.map(n => BigInt(n.id));
    const uris = batch.map(n => n.metadataUri);
    await checkIn.write.setBatchTokenURIs([ids, uris]);
    console.log(`  ✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(nftData.length / batchSize)} uploaded`);
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log("\n2/2 Setting category tokens...");
  for (let catId = 1; catId <= 6; catId++) {
    const tokens = nftData
      .filter(n => n.categoryId === catId)
      .map(n => BigInt(n.id));
    await checkIn.write.setCategoryTokens([BigInt(catId), tokens]);
    console.log(`  ✅ Category ${catId}: ${tokens.length} tokens`);
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log("\n✅ Minato DailyCheckIn now has the same 150-design badge collection as Celo.");
}

main().catch(err => {
  console.error("❌", err);
  process.exit(1);
});
