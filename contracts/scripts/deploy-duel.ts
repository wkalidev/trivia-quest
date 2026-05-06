import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying TriviaDuel...");

  const { viem } = await hre.network.connect();
  const triviaDuel = await viem.deployContract("TriviaDuel");

  console.log(`✅ TriviaDuel deployed at: ${triviaDuel.address}`);
  console.log(`📋 Network: ${process.env.HARDHAT_NETWORK ?? "unknown"}`);
  console.log(`\nAdd this to your .env and lib/contract.ts:`);
  console.log(`DUEL_CONTRACT=${triviaDuel.address}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});