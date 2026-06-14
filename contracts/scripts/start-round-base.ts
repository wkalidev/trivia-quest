import hre from "hardhat";

const BASE_GAME = "0x1e2c209412ec30915ccf922654f0593faf61fcfb" as `0x${string}`;
// Plain EOA used when prize pool is 0 — avoids contract-wallet fallback OOG on transfer()
const PLACEHOLDER_WINNER = "0x000000000000000000000000000000000000dEaD" as `0x${string}`;

async function main() {
  const { viem } = await hre.network.connect();
  const [owner] = await viem.getWalletClients();
  const ownerAddress = owner.account.address;
  console.log("Owner:", ownerAddress);

  const publicClient = await viem.getPublicClient();
  const contract = await viem.getContractAt("TriviaQuest", BASE_GAME);

  const round = await contract.read.getCurrentRound();
  const now = BigInt(Math.floor(Date.now() / 1000));

  console.log("\nCurrent round on Base:");
  console.log("  ID       :", round[0].toString());
  console.log("  Prize    :", round[1].toString(), "wei");
  console.log("  End Time :", new Date(Number(round[3]) * 1000).toLocaleString());
  console.log("  Finished :", round[5]);
  console.log("  Expired  :", now >= round[3] ? "YES" : "NO");

  if (round[5]) {
    console.log("\nRound is already finished. Nothing to do.");
    return;
  }

  if (now < round[3]) {
    console.log("\nRound has not expired yet.");
    console.log("  Ends at", new Date(Number(round[3]) * 1000).toLocaleString());
    return;
  }

  // When prize pool is 0 (no players), use a plain EOA as the winner to avoid
  // contract-wallet fallback OOG when transfer(0) is called by finishRound().
  const winners: `0x${string}`[] =
    round[1] === 0n ? [PLACEHOLDER_WINNER] : [ownerAddress];

  console.log("\nCalling finishRound to end expired round and start new one...");
  console.log("  Winners:", winners);
  const tx = await contract.write.finishRound([winners]);
  console.log("  Tx hash:", tx);

  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
  if (receipt.status === "reverted") {
    console.error("\nTransaction reverted ❌");
    process.exit(1);
  }

  console.log("\nSuccess! New round started automatically on Base.");

  const newRound = await contract.read.getCurrentRound();
  console.log("\nNew round:");
  console.log("  ID       :", newRound[0].toString());
  console.log("  End Time :", new Date(Number(newRound[3]) * 1000).toLocaleString());
}

main().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
