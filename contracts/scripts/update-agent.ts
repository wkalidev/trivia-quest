import hre from "hardhat";
import { formatEther } from "viem";

// ── ERC-8004 Identity Registry — Celo Mainnet ─────────────
// Same address as register-agent.ts (vanity-deployed at the same address on
// every chain the 8004 team supports — see erc-8004/erc-8004-contracts).
const IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as `0x${string}`;

// Agent ID from register-agent.ts — same one shown at
// https://8004scan.io/agents/celo/9055
const AGENT_ID = 9055n;

// ✅ v2 of this script: previously (commit 63f7f87) this baked the metadata into
// a `data:application/json;base64,...` URI and pushed it on-chain as a frozen
// snapshot (v3.2.0). Every time agent-metadata/route.ts was corrected afterwards
// (df41de0, 63f7f87 itself, and this security-audit round bumping to v3.4.0 with
// a live `updatedAt`), that on-chain snapshot did NOT follow — 8004scan has been
// reading a stale, pre-correction copy ever since.
//
// Fix: point agentURI at the live HTTPS endpoint instead of a static snapshot.
// From now on, any edit to agent-metadata/route.ts is reflected on-chain
// automatically, with zero further gas cost.
const NEW_AGENT_URI = "https://trivia-quest-eight.vercel.app/api/agent-metadata";

const IDENTITY_ABI = [
  {
    name: "setAgentURI",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "agentURI", type: "string" },
    ],
    outputs: [],
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

async function main() {
  console.log("🤖 Updating TriviaQ agentURI on ERC-8004 Identity Registry...");
  console.log(`🆔 Agent ID: ${AGENT_ID}`);
  console.log(`📋 New URI: ${NEW_AGENT_URI}`);

  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();
  const account = walletClient.account;

  console.log(`👤 Wallet: ${account.address}`);

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`💰 Balance: ${formatEther(balance)} CELO`);

  const owner = await publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: IDENTITY_ABI,
    functionName: "ownerOf",
    args: [AGENT_ID],
  });
  console.log(`👑 Token owner: ${owner}`);

  if (owner.toLowerCase() !== account.address.toLowerCase()) {
    throw new Error(`Wallet ${account.address} is NOT the owner of agent #${AGENT_ID} (owner: ${owner})`);
  }

  const currentUri = await publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: IDENTITY_ABI,
    functionName: "tokenURI",
    args: [AGENT_ID],
  });
  console.log(`📋 Current on-chain agentURI (${currentUri.length} chars): ${currentUri.slice(0, 80)}${currentUri.length > 80 ? "..." : ""}`);

  if (currentUri === NEW_AGENT_URI) {
    console.log("✅ Already pointing at the live endpoint — nothing to do.");
    return;
  }

  // ── Simulate first (staticCall) so a bad ABI/args reverts here, not on-chain ──
  await publicClient.simulateContract({
    address: IDENTITY_REGISTRY,
    abi: IDENTITY_ABI,
    functionName: "setAgentURI",
    args: [AGENT_ID, NEW_AGENT_URI],
    account,
  });
  console.log("✅ Simulation passed — safe to broadcast.");

  console.log("📡 Sending setAgentURI transaction...");
  const hash = await walletClient.writeContract({
    address: IDENTITY_REGISTRY,
    abi: IDENTITY_ABI,
    functionName: "setAgentURI",
    args: [AGENT_ID, NEW_AGENT_URI],
    chain: undefined,
    account,
  });

  console.log(`⏳ Transaction: ${hash}`);
  console.log("⏳ Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`✅ Confirmed in block: ${receipt.blockNumber}`);
  console.log(`🔗 Celoscan: https://celoscan.io/tx/${hash}`);
  console.log("");
  console.log("Agent metadata now points at the live endpoint — it will never");
  console.log("go stale again. 8004scan should re-index within minutes:");
  console.log(`https://8004scan.io/agents/celo/${AGENT_ID}`);
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
