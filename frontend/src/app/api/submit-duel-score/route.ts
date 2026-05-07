import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { getContractAddress } from "@/lib/contract";

const DUEL_CONTRACT = getContractAddress(42220, "duel");

// ✅ ABI minimal — onlyOwner, utilisé côté serveur uniquement
const SUBMIT_SCORE_ABI = [
  {
    name: "submitScore",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "duelId", type: "uint256" },
      { name: "player", type: "address" },
      { name: "score", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

// ✅ ABI pour lire le duel on-chain
const GET_DUEL_ABI = [
  {
    name: "getDuel",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "duelId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "playerA", type: "address" },
          { name: "playerB", type: "address" },
          { name: "wager", type: "uint256" },
          { name: "scoreA", type: "uint256" },
          { name: "scoreB", type: "uint256" },
          { name: "scoreASubmitted", type: "bool" },
          { name: "scoreBSubmitted", type: "bool" },
          { name: "winner", type: "address" },
          { name: "status", type: "uint8" },
          { name: "createdAt", type: "uint256" },
          { name: "expiresAt", type: "uint256" },
        ],
      },
    ],
  },
] as const;

// ✅ Rate limiting — 1 soumission par (wallet + duelId)
const submitted = new Map<string, boolean>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player, duelId, score } = body;

    // ── 1. Validation basique ──────────────────────────
    if (!player || duelId === undefined || score === undefined) {
      return Response.json({ error: "Missing params" }, { status: 400 });
    }
    if (typeof score !== "number" || score < 0 || score > 10) {
      return Response.json({ error: "Score must be 0-10" }, { status: 400 });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(player)) {
      return Response.json({ error: "Invalid player address" }, { status: 400 });
    }

    // ── 2. Rate limit — 1 soumission par wallet par duel ──
    const key = `${player.toLowerCase()}:${duelId}`;
    if (submitted.get(key)) {
      return Response.json({ error: "Score already submitted for this duel" }, { status: 429 });
    }

    // ── 3. Vérification on-chain ──────────────────────
    const publicClient = createPublicClient({
      chain: celo,
      transport: http("https://forno.celo.org"),
    });

    const duel = await publicClient.readContract({
      address: DUEL_CONTRACT,
      abi: GET_DUEL_ABI,
      functionName: "getDuel",
      args: [BigInt(duelId)],
    } as any) as any;

    // Le duel doit être actif (status === 1)
    if (duel.status !== 1) {
      return Response.json({ error: "Duel is not active" }, { status: 400 });
    }

    // Le joueur doit être dans le duel
    const playerLower = player.toLowerCase();
    const isPlayerA = duel.playerA.toLowerCase() === playerLower;
    const isPlayerB = duel.playerB.toLowerCase() === playerLower;
    if (!isPlayerA && !isPlayerB) {
      return Response.json({ error: "Player not in this duel" }, { status: 403 });
    }

    // Le score ne doit pas déjà avoir été soumis
    if (isPlayerA && duel.scoreASubmitted) {
      return Response.json({ error: "Score already submitted on-chain" }, { status: 400 });
    }
    if (isPlayerB && duel.scoreBSubmitted) {
      return Response.json({ error: "Score already submitted on-chain" }, { status: 400 });
    }

    // ── 4. Marque comme soumis avant la tx (évite double-submit) ──
    submitted.set(key, true);

    // ── 5. Soumet le score on-chain ───────────────────
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      submitted.delete(key); // rollback si config manquante
      return Response.json({ error: "Server config error" }, { status: 500 });
    }

    const account = privateKeyToAccount(`0x${privateKey}`);
    const walletClient = createWalletClient({
      account,
      chain: celo,
      transport: http("https://forno.celo.org"),
    });

    const hash = await walletClient.writeContract({
      address: DUEL_CONTRACT,
      abi: SUBMIT_SCORE_ABI,
      functionName: "submitScore",
      args: [BigInt(duelId), player as `0x${string}`, BigInt(score)],
      chain: celo,
      account,
    });

    await publicClient.waitForTransactionReceipt({ hash });
    return Response.json({ success: true, hash });

  } catch (error) {
    console.error("submitDuelScore error:", error);
    return Response.json({ error: "Failed to submit duel score" }, { status: 500 });
  }
}