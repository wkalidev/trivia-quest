import hre from "hardhat";

async function main() {
  const { viem } = await hre.network.connect();
  const CONTRACT = "0xf44dfec3230bcf917ca7ccc59b4e67df2507e21f" as `0x${string}`;
  const contract = await viem.getContractAt("TriviaQuest", CONTRACT);

  const round = await contract.read.getCurrentRound();
  const entryFee = await contract.read.entryFee();

  console.log("Round ID:", round[0].toString());
  console.log("Prize Pool:", round[1].toString());
  console.log("End time:", new Date(Number(round[3]) * 1000).toLocaleString());
  console.log("Finished:", round[5]);
  console.log("Entry Fee:", entryFee.toString());
  console.log("Now:", new Date().toLocaleString());
}

main().catch(console.error);