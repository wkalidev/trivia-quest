import hre from "hardhat";

async function main() {
  const { viem } = await hre.network.connect();
  const CONTRACT = "0xf44dfec3230bcf917ca7ccc59b4e67df2507e21f" as `0x${string}`;
  const [deployer] = await viem.getWalletClients();
  const wallet = deployer.account.address;

  const contract = await viem.getContractAt("TriviaQuest", CONTRACT);

  const roundId = await contract.read.currentRoundId();
  const score = await contract.read.roundScores([roundId, wallet]);
  const entryFee = await contract.read.entryFee();

  console.log("Wallet:", wallet);
  console.log("Round ID:", roundId.toString());
  console.log("Round score (0 = not joined):", score.toString());
  console.log("Entry Fee:", entryFee.toString());
}

main().catch(console.error);