import hre from "hardhat";

const TRIVQ_ADDRESS = "0xf50afd22d5285f0398bf1be433252ce6a9fd9579" as `0x${string}`;

async function main() {
  const { viem } = await hre.network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  console.log("Deployer:", deployer.account.address);

  console.log("\n1/3 Deploying new TriviaQuest with protocol fee...");
  const triviaQuest = await viem.deployContract("TriviaQuest");
  console.log("TriviaQuest deployed at:", triviaQuest.address);
  await new Promise(r => setTimeout(r, 3000));

  console.log("\n2/3 Linking TRIVQ token...");
  await triviaQuest.write.setTrivqToken([TRIVQ_ADDRESS]);
  console.log("✅ Token linked");
  await new Promise(r => setTimeout(r, 3000));

  console.log("\n3/3 Setting minter...");
  const trivq = await viem.getContractAt("TriviaQToken", TRIVQ_ADDRESS);
  await trivq.write.setMinter([triviaQuest.address]);
  console.log("✅ Minter set");

  console.log("\n══════════════════════════════════════════════");
  console.log("NEXT_PUBLIC_GAME_ADDRESS =", triviaQuest.address);
  console.log("Treasury (owner)         =", deployer.account.address);
  console.log("Protocol fee             = 10%");
  console.log("══════════════════════════════════════════════");
}

main().catch(err => {
  console.error("❌", err);
  process.exit(1);
});