import hre from "hardhat";
import { formatUnits } from "viem";

const TRIVQ_ADDRESS = "0xf50afd22d5285f0398bf1be433252ce6a9fd9579" as `0x${string}`;
const WALLET = "0xdeacde6ec27fd0cd972c1232c4f0d4171dda2357" as `0x${string}`;

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const;

async function main() {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();

  // CELO balance
  const celoBalance = await publicClient.getBalance({ address: WALLET });
  console.log("💰 CELO balance :", formatUnits(celoBalance, 18), "CELO");

  // TRIVQ balance
  const trivq = await viem.getContractAt("TriviaQToken", TRIVQ_ADDRESS);
  const trivqBalance = await trivq.read.balanceOf([WALLET]);
  console.log("💎 TRIVQ balance:", formatUnits(trivqBalance as bigint, 18), "TRIVQ");

  console.log("\n📊 Recommandation liquidité Ubeswap :");
  const celo = Number(formatUnits(celoBalance, 18));
  if (celo >= 200) {
    console.log("  ✅ Tu peux créer une bonne pool avec 100-200 CELO");
  } else if (celo >= 50) {
    console.log("  ⚠️  Pool basique possible avec", Math.floor(celo * 0.5), "CELO");
  } else {
    console.log("  ❌ Pas assez de CELO — tu as besoin d'au moins 50 CELO");
  }
}

main().catch(err => {
  console.error("❌", err);
  process.exit(1);
});