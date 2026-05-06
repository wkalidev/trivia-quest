"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract, useChainId } from "wagmi";
import { useRouter } from "next/navigation";
import { parseEther, formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { getContractAddress, DUEL_ABI } from "@/lib/contract";

// ── Types ──────────────────────────────────────────────
const DUEL_STATUS = ["Open", "Active", "Finished", "Cancelled"] as const;

interface Duel {
  id: bigint;
  playerA: `0x${string}`;
  playerB: `0x${string}`;
  wager: bigint;
  scoreA: bigint;
  scoreB: bigint;
  scoreASubmitted: boolean;
  scoreBSubmitted: boolean;
  winner: `0x${string}`;
  status: number;
  createdAt: bigint;
  expiresAt: bigint;
}

const WAGER_OPTIONS = [
  { label: "0.01 CELO", value: "0.01" },
  { label: "0.05 CELO", value: "0.05" },
  { label: "0.1 CELO", value: "0.1" },
  { label: "0.5 CELO", value: "0.5" },
];

function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function statusColor(status: number): string {
  if (status === 0) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (status === 1) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  if (status === 2) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
}

export default function DuelPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const router = useRouter();
  const DUEL_ADDRESS = getContractAddress(chainId, "duel");

  const [tab, setTab] = useState<"create" | "join" | "mine">("create");
  const [wager, setWager] = useState("0.01");
  const [joinDuelId, setJoinDuelId] = useState("");
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  const { writeContract, isPending } = useWriteContract();

  // ── Read open duels ────────────────────────────────────
  const { data: openDuels, refetch: refetchOpen } = useReadContract({
    address: DUEL_ADDRESS,
    abi: DUEL_ABI,
    functionName: "getOpenDuels",
    args: [BigInt(10)],
    query: { enabled: !!DUEL_ADDRESS },
  });

  // ── Read my duels ──────────────────────────────────────
  const { data: myDuelIds, refetch: refetchMine } = useReadContract({
    address: DUEL_ADDRESS,
    abi: DUEL_ABI,
    functionName: "getPlayerDuels",
    args: address ? [address] : undefined,
    query: { enabled: !!DUEL_ADDRESS && !!address },
  });

  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

  // ── Create duel ────────────────────────────────────────
  const handleCreate = () => {
    if (!DUEL_ADDRESS) return;
    setTxError(null);
    setTxSuccess(null);
    writeContract(
      {
        address: DUEL_ADDRESS,
        abi: DUEL_ABI,
        functionName: "createDuel",
        value: parseEther(wager),
      },
      {
        onSuccess: () => {
          setTxSuccess(`✅ Duel créé avec une mise de ${wager} CELO ! Partage l'ID à ton adversaire.`);
          refetchOpen();
          refetchMine();
        },
        onError: (err) => {
          setTxError(err.message?.includes("insufficient")
            ? `Solde insuffisant. Il te faut ${wager} CELO + gas.`
            : "Transaction échouée.");
        },
      }
    );
  };

  // ── Join duel ──────────────────────────────────────────
  const handleJoin = (duel: Duel) => {
    if (!DUEL_ADDRESS) return;
    setTxError(null);
    setTxSuccess(null);
    writeContract(
      {
        address: DUEL_ADDRESS,
        abi: DUEL_ABI,
        functionName: "joinDuel",
        args: [duel.id],
        value: duel.wager,
      },
      {
        onSuccess: () => {
          setTxSuccess(`✅ Tu as rejoint le duel #${duel.id} ! Joue maintenant pour soumettre ton score.`);
          refetchOpen();
          refetchMine();
        },
        onError: (err) => {
          setTxError(err.message?.includes("insufficient")
            ? `Solde insuffisant. Il te faut ${formatEther(duel.wager)} CELO + gas.`
            : "Transaction échouée.");
        },
      }
    );
  };

  // ── Join by ID ─────────────────────────────────────────
  const handleJoinById = () => {
    if (!joinDuelId || !DUEL_ADDRESS) return;
    setTxError(null);
    setTxSuccess(null);
    // On lit le duel d'abord pour avoir la mise exacte
    // Simple : on utilise le montant entré par l'utilisateur
    writeContract(
      {
        address: DUEL_ADDRESS,
        abi: DUEL_ABI,
        functionName: "joinDuel",
        args: [BigInt(joinDuelId)],
        value: parseEther(wager),
      },
      {
        onSuccess: () => {
          setTxSuccess(`✅ Duel #${joinDuelId} rejoint !`);
          refetchOpen();
        },
        onError: (err) => {
          setTxError("Transaction échouée. Vérifie l'ID du duel et la mise.");
        },
      }
    );
  };

  // ── No contract on this chain ──────────────────────────
  if (!DUEL_ADDRESS) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#1A1A2E] px-6">
        <div className="bg-white/10 rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-white font-black text-xl mb-2">Réseau non supporté</h2>
          <p className="text-white/60 text-sm">
            Les duels sont disponibles sur Celo Alfajores (testnet) pour l'instant.
            Le mainnet arrive bientôt !
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#1A1A2E] px-4 pt-8 pb-20">

      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">⚔️</div>
        <h1 className="text-white font-black text-2xl">Trivia Duel</h1>
        <p className="text-white/50 text-sm mt-1">Défie un joueur — le meilleur score remporte la mise</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white/5 rounded-2xl p-1">
        {(["create", "join", "mine"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === t ? "bg-[#FBCD00] text-[#1A1A2E]" : "text-white/50 hover:text-white"
            }`}
          >
            {t === "create" ? "🆕 Créer" : t === "join" ? "⚔️ Rejoindre" : "📋 Mes duels"}
          </button>
        ))}
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {txSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm"
          >
            {txSuccess}
          </motion.div>
        )}
        {txError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            {txError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tab: Créer ── */}
      {tab === "create" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-white/10 rounded-3xl p-6">
            <h2 className="text-white font-black text-lg mb-4">💰 Choisir ta mise</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {WAGER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setWager(opt.value)}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${
                    wager === opt.value
                      ? "bg-[#FBCD00] text-[#1A1A2E]"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between text-white/60">
                <span>Ta mise</span>
                <span className="text-white font-bold">{wager} CELO</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Cagnotte totale</span>
                <span className="text-[#FBCD00] font-bold">{(parseFloat(wager) * 2).toFixed(3)} CELO</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Frais (10%)</span>
                <span>{(parseFloat(wager) * 2 * 0.1).toFixed(3)} CELO</span>
              </div>
              <div className="flex justify-between text-white/60 border-t border-white/10 pt-2">
                <span>Tu gagnes</span>
                <span className="text-[#35D07F] font-black">{(parseFloat(wager) * 2 * 0.9).toFixed(3)} CELO</span>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={isPending}
              className="w-full bg-[#FBCD00] text-[#1A1A2E] font-black text-lg py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-50"
            >
              {isPending ? "⏳ Transaction..." : "⚔️ Créer le duel"}
            </button>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 text-white/50 text-xs space-y-1">
            <p>• Le duel expire en 24h si personne ne le rejoint</p>
            <p>• Tu seras remboursé si le duel expire</p>
            <p>• Partage l'ID du duel à ton adversaire pour qu'il rejoigne</p>
          </div>
        </motion.div>
      )}

      {/* ── Tab: Rejoindre ── */}
      {tab === "join" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

          {/* Rejoindre par ID */}
          <div className="bg-white/10 rounded-3xl p-6">
            <h2 className="text-white font-black text-lg mb-4">🔢 Rejoindre par ID</h2>
            <input
              type="number"
              placeholder="ID du duel (ex: 42)"
              value={joinDuelId}
              onChange={(e) => setJoinDuelId(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 mb-3 outline-none border border-white/10 focus:border-[#FBCD00]"
            />
            <p className="text-white/40 text-xs mb-4">Assure-toi de connaître la mise avant de rejoindre</p>
            <button
              onClick={handleJoinById}
              disabled={isPending || !joinDuelId}
              className="w-full bg-purple-500 text-white font-black py-3 rounded-2xl active:scale-95 transition-all disabled:opacity-50"
            >
              {isPending ? "⏳ Transaction..." : "⚔️ Rejoindre"}
            </button>
          </div>

          {/* Duels ouverts */}
          <div className="bg-white/10 rounded-3xl p-6">
            <h2 className="text-white font-black text-lg mb-4">
              🟢 Duels ouverts ({(openDuels as Duel[] | undefined)?.filter(d => d.playerA !== address).length ?? 0})
            </h2>
            {!openDuels || (openDuels as Duel[]).length === 0 ? (
              <p className="text-white/40 text-sm text-center py-4">Aucun duel ouvert pour l'instant</p>
            ) : (
              <div className="space-y-3">
                {(openDuels as Duel[])
                  .filter((d) => d.playerA !== address)
                  .map((duel) => (
                    <div key={duel.id.toString()} className="bg-white/5 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-white/60 text-xs">Duel #{duel.id.toString()}</span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${statusColor(duel.status)}`}>
                          {DUEL_STATUS[duel.status]}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white/50 text-xs">Créé par</p>
                          <p className="text-white font-bold text-sm">{shortAddress(duel.playerA)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#FBCD00] font-black text-lg">{formatEther(duel.wager)} CELO</p>
                          <p className="text-white/40 text-xs">par joueur</p>
                        </div>
                        <button
                          onClick={() => handleJoin(duel)}
                          disabled={isPending}
                          className="bg-[#FBCD00] text-[#1A1A2E] font-black text-sm px-4 py-2 rounded-xl active:scale-95 disabled:opacity-50"
                        >
                          Rejoindre
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Tab: Mes duels ── */}
      {tab === "mine" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white/10 rounded-3xl p-6">
            <h2 className="text-white font-black text-lg mb-4">📋 Mes duels</h2>
            {!myDuelIds || (myDuelIds as bigint[]).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/40 text-sm">Tu n'as pas encore de duels</p>
                <button
                  onClick={() => setTab("create")}
                  className="mt-4 bg-[#FBCD00] text-[#1A1A2E] font-black px-6 py-2 rounded-xl"
                >
                  Créer mon premier duel
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {(myDuelIds as bigint[]).map((id) => (
                  <div key={id.toString()} className="bg-white/5 rounded-xl px-4 py-3 flex justify-between items-center">
                    <span className="text-white font-bold">Duel #{id.toString()}</span>
                    <span className="text-white/40 text-xs">Voir détails →</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </main>
  );
}