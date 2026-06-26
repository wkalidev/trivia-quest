import hre from "hardhat";
import { formatEther } from "viem";

const IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as `0x${string}`;
const AGENT_ID = 9055n;

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

const METADATA = {
  type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  name: "TriviaQ AI Agent",
  description:
    "AI agent that generates trivia questions on Celo, powers 1v1 duels and runs Discord commands /ask /askcat. Powered by Groq LLaMA 3.1.",
  image: "https://trivia-quest-eight.vercel.app/icon-512.png",
  version: "3.2.0",
  homepage: "https://trivia-quest-eight.vercel.app",
  documentation: "https://github.com/wkalidev/trivia-quest",
  license: "MIT",
  updatedAt: 1782432000,
  provider: {
    name: "wkalidev",
    url: "https://github.com/wkalidev",
    email: "wkalidev@gmail.com",
  },
  contact: {
    email: "wkalidev@gmail.com",
    support: "mailto:wkalidev@gmail.com",
  },
  supportUrl: "mailto:wkalidev@gmail.com",
  services: [
    {
      name: "MCP",
      endpoint: "https://trivia-quest-eight.vercel.app/api/mcp",
      version: "2024-11-05",
      description: "TriviaQ MCP Server — generate questions, stats, leaderboard, duel info",
    },
    {
      name: "A2A",
      endpoint: "https://trivia-quest-eight.vercel.app/api/a2a",
      version: "0.3.0",
      agentCard: "https://trivia-quest-eight.vercel.app/.well-known/agent-card.json",
      description: "TriviaQ A2A Agent — Agent-to-Agent protocol endpoint",
    },
    {
      name: "agentWallet",
      endpoint: "eip155:42220:0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb",
      description: "TriviaQ prize pool wallet on Celo Mainnet — x402 payment recipient",
    },
    {
      name: "web",
      endpoint: "https://trivia-quest-eight.vercel.app",
      description: "TriviaQ app — Play. Learn. Earn on Celo.",
    },
  ],
  registrations: [
    {
      chainId: 42220,
      agentRegistry: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
      tokenId: 9055,
      address: "0xdeacde6ec27fd0cd972c1232c4f0d4171dda2357",
    },
  ],
  supportedTrusts: ["reputation"],
  active: true,
  x402Support: true,
  category: "gaming",
  subcategory: "quiz",
  supportedChains: [42220, 8453],
  capabilities: ["trivia", "quiz", "ai-questions", "1v1-duel", "blockchain", "earn", "a2a", "x402"],
  tags: ["trivia", "quiz", "celo", "blockchain", "earn", "minipay", "farcaster", "ai", "a2a", "x402"],
  agentCard: "https://trivia-quest-eight.vercel.app/.well-known/agent-card.json",
  openapi: "https://trivia-quest-eight.vercel.app/.well-known/openapi.json",
};

function buildDataURI(metadata: typeof METADATA): string {
  const json = JSON.stringify(metadata);
  const b64 = Buffer.from(json, "utf-8").toString("base64");
  return `data:application/json;base64,${b64}`;
}

async function main() {
  console.log("Updating TriviaQ AI Agent on-chain tokenURI (agent #9055)...");

  const dataURI = buildDataURI(METADATA);
  console.log(`New URI length: ${dataURI.length} chars`);
  console.log(`URI prefix: ${dataURI.slice(0, 50)}...`);

  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();
  const account = walletClient.account;

  console.log(`Wallet: ${account.address}`);

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Balance: ${formatEther(balance)} CELO`);

  const owner = await publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: IDENTITY_ABI,
    functionName: "ownerOf",
    args: [AGENT_ID],
  });
  console.log(`Token owner: ${owner}`);

  if (owner.toLowerCase() !== account.address.toLowerCase()) {
    throw new Error(`Wallet ${account.address} is NOT the owner of agent #9055 (owner: ${owner})`);
  }

  console.log("Sending setAgentURI transaction...");
  const hash = await walletClient.writeContract({
    address: IDENTITY_REGISTRY,
    abi: IDENTITY_ABI,
    functionName: "setAgentURI",
    args: [AGENT_ID, dataURI],
    chain: undefined,
    account,
  });

  console.log(`Transaction: ${hash}`);
  console.log("Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Confirmed in block: ${receipt.blockNumber}`);
  console.log(`Celoscan: https://celoscan.io/tx/${hash}`);
  console.log("");
  console.log("Agent metadata updated. 8004scan should rescan within minutes.");
  console.log("Check score at: https://8004scan.io/agents/celo/9055");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
