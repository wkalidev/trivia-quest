import hre from "hardhat";
import { parseUnits, formatUnits } from "viem";

const BASE_GAME  = "0x1e2c209412ec30915ccf922654f0593faf61fcfb" as `0x${string}`;
const BASE_TOKEN = "0x8ecc1dc70f3bc5be941b61b42707eb7dbddb54c3" as `0x${string}`;
const AMOUNT     = parseUnits("100000", 18); // 100,000 TRIVQ

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to",     type: "address" },
      { name: "value",  type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

async function main() {
  const { viem } = await hre.network.connect();
  const [owner]  = await viem.getWalletClients();
  const ownerAddress = owner.account.address;
  const publicClient = await viem.getPublicClient();

  // 1. Read balances before
  const ownerBefore = await publicClient.readContract({
    address: BASE_TOKEN, abi: ERC20_ABI,
    functionName: "balanceOf", args: [ownerAddress],
  });
  const gameBefore = await publicClient.readContract({
    address: BASE_TOKEN, abi: ERC20_ABI,
    functionName: "balanceOf", args: [BASE_GAME],
  });

  console.log("Owner:", ownerAddress);
  console.log("\nBalances BEFORE transfer:");
  console.log("  Owner      :", formatUnits(ownerBefore, 18), "TRIVQ");
  console.log("  Game (Base):", formatUnits(gameBefore,  18), "TRIVQ");
  console.log("\nTransferring", formatUnits(AMOUNT, 18), "TRIVQ to Base game contract...");

  if (ownerBefore < AMOUNT) {
    console.error("Insufficient owner balance.");
    process.exit(1);
  }

  // 2. Send transfer
  const tx = await owner.writeContract({
    address: BASE_TOKEN, abi: ERC20_ABI,
    functionName: "transfer", args: [BASE_GAME, AMOUNT],
  });
  console.log("  Tx hash:", tx);

  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
  if (receipt.status === "reverted") {
    console.error("\nTransfer reverted ❌");
    process.exit(1);
  }

  // 3. Verify balances after
  const ownerAfter = await publicClient.readContract({
    address: BASE_TOKEN, abi: ERC20_ABI,
    functionName: "balanceOf", args: [ownerAddress],
  });
  const gameAfter = await publicClient.readContract({
    address: BASE_TOKEN, abi: ERC20_ABI,
    functionName: "balanceOf", args: [BASE_GAME],
  });

  console.log("\nBalances AFTER transfer:");
  console.log("  Owner      :", formatUnits(ownerAfter, 18), "TRIVQ");
  console.log("  Game (Base):", formatUnits(gameAfter,  18), "TRIVQ");

  const delta = gameAfter - gameBefore;
  if (delta === AMOUNT) {
    console.log("\nTransfer verified ✅ —", formatUnits(delta, 18), "TRIVQ received by game contract.");
  } else {
    console.error("\nBalance mismatch after transfer ❌");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
