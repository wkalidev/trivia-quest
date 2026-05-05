import hre from "hardhat";
import { parseEther, decodeErrorResult } from "viem";

async function main() {
  const { viem } = await hre.network.connect();
  const CONTRACT = "0xf44dfec3230bcf917ca7ccc59b4e67df2507e21f" as `0x${string}`;
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  console.log("Testing with wallet:", deployer.account.address);

  try {
    const result = await publicClient.simulateContract({
      address: CONTRACT,
      abi: [
        {
          name: "joinRound",
          type: "function",
          stateMutability: "payable",
          inputs: [],
          outputs: [],
        }
      ],
      functionName: "joinRound",
      value: BigInt("10000000000000"),
      account: deployer.account,
    });
    console.log("✅ Simulation OK!", result);
  } catch (e: any) {
    console.error("❌ Error details:", e.cause?.reason ?? e.cause?.message ?? e.message);
  }
}

main().catch(console.error);