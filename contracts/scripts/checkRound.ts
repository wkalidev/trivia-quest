import { network } from "hardhat";

const { viem } = await network.connect();
const TRIVIAQUEST_ADDRESS = "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb" as `0x${string}`;
const contract = await viem.getContractAt("TriviaQuest", TRIVIAQUEST_ADDRESS);

const round = await contract.read.getCurrentRound();
const roundId  = round[0];
const endTime  = Number(round[3]);
const finished = round[5];
const now      = Math.floor(Date.now() / 1000);

console.log("Round ID:", roundId.toString());
console.log("Prize Pool:", round[1].toString());
console.log("Start time:", new Date(Number(round[2]) * 1000).toLocaleString());
console.log("End time:", new Date(endTime * 1000).toLocaleString());
console.log("Finished:", finished);
console.log("Now:", new Date().toLocaleString());

if (!finished && now > endTime) {
  console.log("⏰ Round expirée — récupération du leaderboard...");

  // Lire le leaderboard
  const leaderboard = await contract.read.getLeaderboard();

  if (leaderboard.length === 0) {
    console.error("❌ Leaderboard vide — impossible de finisher sans gagnants !");
    process.exit(1);
  }

  // Prendre top 3 (ou moins si pas assez de joueurs)
  const topWinners = leaderboard
    .slice(0, 3)
    .map((entry: any) => entry.player as `0x${string}`);

  console.log("🏆 Top winners:", topWinners);

  try {
    const tx = await contract.write.finishRound([topWinners]);
    console.log("✅ finishRound() envoyé ! TX:", tx);
  } catch (err: any) {
    console.error("❌ Erreur finishRound:", err.message ?? err);
    process.exit(1);
  }

} else if (finished) {
  console.log("✅ Round déjà terminée, rien à faire.");
} else {
  const remaining = endTime - now;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  console.log(`⏳ Round encore active — ${mins}m ${secs}s restantes.`);
}