import hre from "hardhat";
import { parseEther } from "viem";

async function main() {
  const { viem } = await hre.network.connect();
  const CONTRACT = "0xf44dfec3230bcf917ca7ccc59b4e67df2507e21f" as `0x${string}`;
  const contract = await viem.getContractAt("TriviaQuest", CONTRACT);

  // ✅ 0.00001 ETH ≈ $0.023 — prix raisonnable sur Base
  const newFee = parseEther("0.00001");
  const tx = await contract.write.setEntryFee([newFee]);
  console.log("✅ Entry fee updated! TX:", tx);
  console.log("New fee: 0.00001 ETH ≈ $0.023");
}

main().catch(console.error);