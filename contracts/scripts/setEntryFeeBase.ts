import hre from "hardhat";
import { parseEther } from "viem";

async function main() {
  const { viem } = await hre.network.connect();
  const CONTRACT = "0x1e2c209412ec30915ccf922654f0593faf61fcfb" as `0x${string}`;
  const contract = await viem.getContractAt("TriviaQuest", CONTRACT);

  // ✅ 0.00001 ETH ≈ $0.023 — prix raisonnable sur Base
  const newFee = parseEther("0.00001");
  const tx = await contract.write.setEntryFee([newFee]);
  console.log("✅ Entry fee updated! TX:", tx);
  console.log("New fee: 0.00001 ETH ≈ $0.023");
}

main().catch(console.error);