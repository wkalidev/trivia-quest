import hre from "hardhat";

const TRIVIAQUEST_ADDRESS = "0xEDf1505c476a5a7de9e60f79844Edb7774C03f0a" as `0x${string}`;
const TRIVQTOKEN_ADDRESS  = "0xF50AFD22D5285f0398Bf1Be433252cE6a9FD9579" as `0x${string}`;

async function main() {
  const { viem } = await hre.network.connect();
  const [owner] = await viem.getWalletClients();
  console.log("👤 Owner:", owner.account.address);

  const publicClient = await viem.getPublicClient();
  const contract = await viem.getContractAt("TriviaQuest", TRIVIAQUEST_ADDRESS);

  const currentToken = await contract.read.trivqToken();
  console.log("\n🔍 Token actuel configuré:", currentToken);

  if (currentToken.toLowerCase() === TRIVQTOKEN_ADDRESS.toLowerCase()) {
    console.log("✅ Token déjà correctement configuré. Rien à faire.");
    return;
  }

  console.log("\n🚀 Configuration du token TRIVQ...");
  const tx = await contract.write.setTrivqToken([TRIVQTOKEN_ADDRESS]);
  console.log("  Tx hash:", tx);

  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("\n✅ Token TRIVQ connecté au contrat TriviaQuest !");

  const tokenContract = await viem.getContractAt("TriviaQToken", TRIVQTOKEN_ADDRESS);
  const minter = await tokenContract.read.minter();
  console.log("\n🔍 Minter actuel sur TriviaQToken:", minter);

  if (minter.toLowerCase() !== TRIVIAQUEST_ADDRESS.toLowerCase()) {
    console.log("\n⚠️  ATTENTION : le minter du token n'est pas TriviaQuest !");
    console.log("   Lance le script setMinter.ts pour corriger ça.");
  } else {
    console.log("✅ Minter correctement configuré sur TriviaQToken.");
  }
}

main().catch((err) => {
  console.error("❌ Erreur:", err.message ?? err);
  process.exit(1);
});