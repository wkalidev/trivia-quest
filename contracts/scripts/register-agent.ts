import hre from "hardhat";
import { formatEther } from "viem";

// ── ERC-8004 Identity Registry — Celo Mainnet ─────────────
const IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as `0x${string}`;

const IDENTITY_ABI = [
  {
    name: "register",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "agentURI", type: "string" }],
    outputs: [{ name: "agentId", type: "uint256" }],
  },
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "address" }],
  },
  {
    name: "tokenURI",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
] as const;

// ✅ Métadonnées uploadées sur IPFS via Pinata
const AGENT_METADATA_URI = "ipfs://bafkreigejdeeqxkeli22c3tym2jmgyqaovhdeyezjkxmwel6tf4lnez2rm";

async function main() {
  console.log("🤖 Registering TriviaQ AI Agent on ERC-8004...");
  console.log(`📋 Metadata URI: ${AGENT_METADATA_URI}`);

  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();

  const account = walletClient.account;
  console.log(`👤 Registering from: ${account.address}`);

  // Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`💰 Balance: ${formatEther(balance)} CELO`);

  if (balance < BigInt(1e15)) {
    throw new Error("Insufficient balance — need at least 0.001 CELO for gas");
  }

  // ✅ Register the agent
  console.log("\n📡 Sending registration transaction...");
  const hash = await walletClient.writeContract({
    address: IDENTITY_REGISTRY,
    abi: IDENTITY_ABI,
    functionName: "register",
    args: [AGENT_METADATA_URI],
    chain: undefined,
    account,
  });

  console.log(`⏳ Transaction sent: ${hash}`);
  console.log("⏳ Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`✅ Confirmed in block: ${receipt.blockNumber}`);

  // ✅ Extract agentId from logs
  // The register function emits a Transfer event (ERC-721)
  // agentId is the tokenId in the Transfer log
  const transferLog = receipt.logs.find(
    (log) => log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
  );

  if (transferLog && transferLog.topics[3]) {
    const agentId = BigInt(transferLog.topics[3]);
    console.log(`\n🎉 TriviaQ AI Agent registered!`);
    console.log(`🆔 Agent ID: ${agentId.toString()}`);
    console.log(`🔗 Transaction: https://celoscan.io/tx/${hash}`);
    console.log(`📋 Metadata: https://ipfs.io/ipfs/bafkreigejdeeqxkeli22c3tym2jmgyqaovhdeyezjkxmwel6tf4lnez2rm`);
    console.log(`\n✅ Save this Agent ID: ${agentId.toString()}`);
    console.log(`Add to your .env: AGENT_ID=${agentId.toString()}`);
  } else {
    console.log(`\n✅ Agent registered!`);
    console.log(`🔗 Transaction: https://celoscan.io/tx/${hash}`);
    console.log("Check celoscan for your Agent ID (token ID in the Transfer event)");
  }
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});