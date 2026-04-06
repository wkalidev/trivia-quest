import hre from "hardhat";

const TRIVIAQUEST_ADDRESS = "0xEDf1505c476a5a7de9e60f79844Edb7774C03f0a" as `0x${string}`;
const TRIVQTOKEN_ADDRESS  = "0xF50AFD22D5285f0398Bf1Be433252cE6a9FD9579" as `0x${string}`;

async function main() {
  const { viem } = await hre.network.connect();
  const [owner] = await viem.getWalletClients();
  console.log("👤 Owner:", owner.account.address);

  const publicClient = await viem.getPublicClient();
  const tokenContract = await viem.getContractAt("TriviaQToken", TRIVQTOKEN_ADDRESS);

  const currentMinter = await tokenContract.read.minter();
  console.log("\n🔍 Minter actuel:", currentMinter);

  if (currentMinter.toLowerCase() === TRIVIAQUEST_ADDRESS.toLowerCase()) {
    console.log("✅ Minter déjà correctement configuré. Rien à faire.");
    return;
  }

  console.log("\n🚀 Configuration du minter → TriviaQuest...");
  const tx = await tokenContract.write.setMinter([TRIVIAQUEST_ADDRESS]);
  console.log("  Tx hash:", tx);

  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("\n✅ Minter configuré ! TriviaQuest peut maintenant minter des TRIVQ.");
}

main().catch((err) => {
  console.error("❌ Erreur:", err.message ?? err);
  process.exit(1);
});