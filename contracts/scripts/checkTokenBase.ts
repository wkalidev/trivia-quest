import hre from "hardhat";

async function main() {
  const { viem } = await hre.network.connect();
  const CONTRACT = "0xf44dfec3230bcf917ca7ccc59b4e67df2507e21f" as `0x${string}`;
  const contract = await viem.getContractAt("TriviaQuest", CONTRACT);

  const trivqToken = await contract.read.trivqToken();
  console.log("TRIVQ Token address:", trivqToken);
  console.log("Is zero?", trivqToken === "0x0000000000000000000000000000000000000000");
}

main().catch(console.error);