import hre from "hardhat";

async function main() {
  const { viem } = await hre.network.connect();
  const CONTRACT = "0xf44dfec3230bcf917ca7ccc59b4e67df2507e21f" as `0x${string}`;
  const contract = await viem.getContractAt("TriviaQuest", CONTRACT);

  const treasury = await contract.read.treasury();
  const feeBps = await contract.read.protocolFeeBps();

  console.log("Treasury:", treasury);
  console.log("Protocol Fee BPS:", feeBps.toString());

  // ✅ Fix — set treasury to deployer wallet
  const [deployer] = await viem.getWalletClients();
  console.log("Deployer:", deployer.account.address);
  console.log("Same?", treasury.toLowerCase() === deployer.account.address.toLowerCase());
}

main().catch(console.error);