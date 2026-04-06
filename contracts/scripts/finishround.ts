import hre from "hardhat";

const TRIVIAQUEST_ADDRESS = "0xEDf1505c476a5a7de9e60f79844Edb7774C03f0a" as `0x${string}`;

async function main() {
  const { viem } = await hre.network.connect();
  const [owner] = await viem.getWalletClients();
  const ownerAddress = owner.account.address;
  console.log("👤 Owner:", ownerAddress);

  const publicClient = await viem.getPublicClient();
  const contract = await viem.getContractAt("TriviaQuest", TRIVIAQUEST_ADDRESS);

  const round = await contract.read.getCurrentRound();
  const now = BigInt(Math.floor(Date.now() / 1000));

  console.log("\n📋 Round actuel :");
  console.log("  ID       :", round[0].toString());
  console.log("  Prize    :", round[1].toString(), "wei");
  console.log("  End Time :", new Date(Number(round[3]) * 1000).toLocaleString());
  console.log("  Finished :", round[5]);
  console.log("  Expiré   :", now >= round[3] ? "✅ OUI" : "❌ NON");

  if (round[5]) {
    console.log("\n⚠️  Ce round est déjà terminé. Rien à faire.");
    return;
  }

  if (now < round[3]) {
    console.log("\n⚠️  Le round n'est pas encore expiré.");
    console.log("   Il se termine le", new Date(Number(round[3]) * 1000).toLocaleString());
    return;
  }

  console.log("\n🚀 Appel de finishRound...");
  const tx = await contract.write.finishRound([[ownerAddress]]);
  console.log("  Tx hash:", tx);

  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("\n✅ Succès ! Nouveau round démarré automatiquement.");
}

main().catch((err) => {
  console.error("❌ Erreur:", err.message ?? err);
  process.exit(1);
});