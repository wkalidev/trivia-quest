import hre from "hardhat";

const TRIVQ_ADDRESS = "0xf50afd22d5285f0398bf1be433252ce6a9fd9579" as `0x${string}`;

async function main() {
  const { viem } = await hre.network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  console.log("Deployer:", deployer.account.address);

  console.log("\n1/2 Deploying Referral contract...");
  const referral = await viem.deployContract("Referral", [TRIVQ_ADDRESS]);
  console.log("Referral deployed at:", referral.address);
  await new Promise(r => setTimeout(r, 3000));

  console.log("\n2/2 Setting minter...");
  const trivq = await viem.getContractAt("TriviaQToken", TRIVQ_ADDRESS);
  await trivq.write.setMinter([referral.address]);
  console.log("✅ Minter set to Referral!");

  console.log("\n══════════════════════════════════════════════");
  console.log("NEXT_PUBLIC_REFERRAL_ADDRESS =", referral.address);
  console.log("══════════════════════════════════════════════");
}

main().catch(err => {
  console.error("❌", err);
  process.exit(1);
});