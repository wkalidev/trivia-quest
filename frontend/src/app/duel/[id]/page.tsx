"use client";

import { useAccount, useReadContract, useWriteContract, useChainId } from "wagmi";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { formatEther } from "viem";
import { motion } from "framer-motion";
import { getContractAddress, DUEL_ABI } from "@/lib/contract";
import { useTranslations } from "next-intl";

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

function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function statusColor(status: number): string {
  if (status === 0) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (status === 1) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  if (status === 2) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
}

function statusEmoji(status: number): string {
  if (status === 0) return "🟢";
  if (status === 1) return "⚔️";
  if (status === 2) return "🏆";
  return "❌";
}

export default function DuelDetailPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const router = useRouter();
  const params = useParams();
  const duelId = params?.id as string;
  const t = useTranslations("duel");

  const DUEL_ADDRESS = getContractAddress(chainId, "duel");
  const { writeContract, isPending } = useWriteContract();

  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

  const { data: duelRaw, refetch } = useReadContract({
    address: DUEL_ADDRESS,
    abi: DUEL_ABI,
    functionName: "getDuel",
    args: duelId ? [BigInt(duelId)] : undefined,
    query: {
      enabled: !!DUEL_ADDRESS && !!duelId,
      refetchInterval: 5000,
    },
  });

  const duel = duelRaw as Duel | undefined;

  if (!duel) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#1A1A2E]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-[#FBCD00] border-t-transparent rounded-full"
        />
      </main>
    );
  }

  const isPlayerA = address?.toLowerCase() === duel.playerA.toLowerCase();
  const isPlayerB = address?.toLowerCase() === duel.playerB.toLowerCase();
  const isParticipant = isPlayerA || isPlayerB;
  const myScore = isPlayerA ? duel.scoreA : duel.scoreB;
  const myScoreSubmitted = isPlayerA ? duel.scoreASubmitted : duel.scoreBSubmitted;
  const opponentScore = isPlayerA ? duel.scoreB : duel.scoreA;
  const opponentScoreSubmitted = isPlayerA ? duel.scoreBSubmitted : duel.scoreASubmitted;
  const opponent = isPlayerA ? duel.playerB : duel.playerA;
  const isWinner = address?.toLowerCase() === duel.winner.toLowerCase();
  const canPlay = isParticipant && duel.status === 1 && !myScoreSubmitted;
  const netPrize = Number(formatEther(duel.wager)) * 2 * 0.9;

  // ── Cancel expired ─────────────────────────────────────
  const handleCancel = () => {
    if (!DUEL_ADDRESS) return;
    writeContract(
      {
        address: DUEL_ADDRESS,
        abi: DUEL_ABI,
        functionName: "cancelExpiredDuel",
        args: [BigInt(duelId)],
        chain: undefined,
        account: address,
      },
      {
        onSuccess: () => refetch(),
        onError: () => {},
      }
    );
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#1A1A2E] px-4 pt-8 pb-20">

      {/* Back */}
      <button
        onClick={() => router.push("/duel")}
        className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-all"
      >
        {t("backToDuels")}
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">⚔️</div>
        <h1 className="text-white font-black text-2xl">Duel #{duelId}</h1>
        <div className="flex justify-center mt-2">
          <span className={`text-sm px-3 py-1 rounded-full border ${statusColor(duel.status)}`}>
            {statusEmoji(duel.status)} {DUEL_STATUS[duel.status]}
          </span>
        </div>
      </div>

      {/* Pot */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-3xl p-5 mb-4 text-center"
        style={{ border: "1px solid rgba(251,205,0,0.2)" }}
      >
        <p className="text-white/40 text-xs mb-1">{t("totalPot")}</p>
        <p className="text-[#FBCD00] font-black text-3xl">
          {(Number(formatEther(duel.wager)) * 2).toFixed(3)} CELO
        </p>
        <p className="text-white/30 text-xs mt-1">
          {t("wagerPerPlayer", { wager: formatEther(duel.wager), prize: netPrize.toFixed(3) })}
        </p>
      </motion.div>

      {/* Players */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 rounded-3xl p-5 mb-4"
      >
        <h2 className="text-white font-black text-lg mb-4">{t("playersSection")}</h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Player A */}
          <div className={`rounded-2xl p-4 text-center ${
            duel.status === 2 && duel.winner.toLowerCase() === duel.playerA.toLowerCase()
              ? "bg-[#FBCD00]/10 border border-[#FBCD00]/40"
              : "bg-white/5"
          }`}>
            <p className="text-white/40 text-xs mb-1">
              {address?.toLowerCase() === duel.playerA.toLowerCase() ? t("youLabel") : t("playerALabel")}
            </p>
            <p className="text-white font-bold text-sm mb-2">{shortAddress(duel.playerA)}</p>
            {duel.scoreASubmitted ? (
              <div>
                <p className="text-[#35D07F] font-black text-2xl">{duel.scoreA.toString()}</p>
                <p className="text-white/30 text-xs">/ 10</p>
              </div>
            ) : (
              <p className="text-white/30 text-sm">
                {duel.status === 0 ? "—" : t("awaitingScore")}
              </p>
            )}
            {duel.status === 2 && duel.winner.toLowerCase() === duel.playerA.toLowerCase() && (
              <p className="text-[#FBCD00] font-black text-xs mt-2">{t("winnerLabel")}</p>
            )}
          </div>

          {/* VS */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden" />

          {/* Player B */}
          <div className={`rounded-2xl p-4 text-center ${
            duel.status === 2 && duel.winner.toLowerCase() === duel.playerB.toLowerCase()
              ? "bg-[#FBCD00]/10 border border-[#FBCD00]/40"
              : "bg-white/5"
          }`}>
            <p className="text-white/40 text-xs mb-1">
              {duel.playerB === "0x0000000000000000000000000000000000000000"
                ? t("waitingForPlayer")
                : address?.toLowerCase() === duel.playerB.toLowerCase()
                ? t("youLabel")
                : t("playerBLabel")}
            </p>
            <p className="text-white font-bold text-sm mb-2">
              {duel.playerB === "0x0000000000000000000000000000000000000000"
                ? t("notJoined")
                : shortAddress(duel.playerB)}
            </p>
            {duel.scoreBSubmitted ? (
              <div>
                <p className="text-[#35D07F] font-black text-2xl">{duel.scoreB.toString()}</p>
                <p className="text-white/30 text-xs">/ 10</p>
              </div>
            ) : (
              <p className="text-white/30 text-sm">
                {duel.status === 0 ? "—" : t("awaitingScore")}
              </p>
            )}
            {duel.status === 2 && duel.winner.toLowerCase() === duel.playerB.toLowerCase() && (
              <p className="text-[#FBCD00] font-black text-xs mt-2">{t("winnerLabel")}</p>
            )}
          </div>
        </div>

        {/* Tie */}
        {duel.status === 2 &&
          duel.winner === "0x0000000000000000000000000000000000000000" && (
          <div className="mt-4 text-center p-3 rounded-xl bg-white/5">
            <p className="text-white/60 font-bold">{t("tie")}</p>
          </div>
        )}
      </motion.div>

      {/* Final result */}
      {duel.status === 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`rounded-3xl p-5 mb-4 text-center ${
            isWinner
              ? "bg-[#FBCD00]/10 border border-[#FBCD00]/30"
              : "bg-white/5 border border-white/10"
          }`}
        >
          {isWinner ? (
            <>
              <p className="text-4xl mb-2">🏆</p>
              <p className="text-[#FBCD00] font-black text-xl">{t("youWon")}</p>
              <p className="text-white/60 text-sm mt-1">
                {t("prizePaid", { prize: netPrize.toFixed(3) })}
              </p>
            </>
          ) : isParticipant ? (
            <>
              <p className="text-4xl mb-2">😔</p>
              <p className="text-white font-black text-xl">{t("duelLost")}</p>
              <p className="text-white/40 text-sm mt-1">{t("betterLuck")}</p>
            </>
          ) : (
            <>
              <p className="text-4xl mb-2">🏆</p>
              <p className="text-white font-black text-xl">
                {t("winnerIs", { addr: shortAddress(duel.winner) })}
              </p>
              <p className="text-white/40 text-sm mt-1">
                {t("prizePaid", { prize: netPrize.toFixed(3) })}
              </p>
            </>
          )}
        </motion.div>
      )}

      {/* My status if active participant */}
      {isParticipant && duel.status === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-2xl p-4 mb-4"
        >
          <p className="text-white/60 text-sm mb-1">{t("myStatus")}</p>
          {myScoreSubmitted ? (
            <div className="flex items-center gap-2">
              <span className="text-[#35D07F] font-bold">{t("scoreSubmitted", { score: myScore.toString() })}</span>
              {!opponentScoreSubmitted && (
                <span className="text-white/40 text-xs">{t("waitingOpponent")}</span>
              )}
            </div>
          ) : (
            <p className="text-yellow-400 font-bold">{t("notPlayedYet")}</p>
          )}
        </motion.div>
      )}

      {/* Play button */}
      {canPlay && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <button
            onClick={() => router.push(`/quiz?duelId=${duelId}`)}
            className="w-full bg-[#FBCD00] text-[#1A1A2E] font-black text-lg py-4 rounded-2xl active:scale-95 transition-all"
          >
            {t("playDuelNow")}
          </button>
          <p className="text-white/30 text-xs text-center mt-2">
            {t("scoreAutoSubmit")}
          </p>
        </motion.div>
      )}

      {/* Share */}
      {duel.status === 0 && isPlayerA && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-2xl p-4 mb-4"
        >
          <p className="text-white/60 text-sm mb-2">{t("shareDuel")}</p>
          <div className="bg-white/10 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-white/60 text-sm">{t("duelIdLabel")} <span className="text-white font-bold">#{duelId}</span></span>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/duel/${duelId}`)}
              className="text-[#FBCD00] text-xs font-bold"
            >
              {t("copyLink")}
            </button>
          </div>
        </motion.div>
      )}

      {/* Cancel if expired */}
      {duel.status === 0 && isPlayerA && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="w-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold py-3 rounded-2xl text-sm disabled:opacity-50"
          >
            {isPending ? t("cancellingBtn") : t("cancelBtn")}
          </button>
          <p className="text-white/20 text-xs text-center mt-1">
            {t("cancelNote")}
          </p>
        </motion.div>
      )}
    </main>
  );
}
