import hre from "hardhat";
import { parseEther } from "viem";

async function main() {
  const { viem } = await hre.network.connect();
  const CONTRACT = "0xf44dfec3230bcf917ca7ccc59b4e67df2507e21f" as `0x${string}`;
  const contract = await viem.getContractAt("TriviaQuest", CONTRACT);

  const round = await contract.read.getCurrentRound();
  const entryFee = await contract.read.entryFee();
  const now = Math.floor(Date.now() / 1000);

  console.log("Round ID:", round[0].toString());
  console.log("End time:", new Date(Number(round[3]) * 1000).toLocaleString());
  console.log("Finished:", round[5]);
  console.log("Entry Fee:", entryFee.toString());
  console.log("Now:", now);
  console.log("Round expired?", now > Number(round[3]));

  // ✅ Test joinRound
  try {
    await contract.simulate.joinRound({ value: entryFee });
    console.log("✅ joinRound simulation OK!");
  } catch (e: any) {
    console.error("❌ joinRound simulation failed:", e.message);
  }
}

main().catch(console.error);