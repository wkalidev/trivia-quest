import hre from "hardhat";

// Read-only: reports TriviaQuestSoneium's current round state on Minato. Does NOT
// call finishRound() — unlike the Celo checkRound.ts, this is purely for checking
// whether round #1's endTime has passed yet before attempting the E2E payout test.
// (roundDuration's 1-day default initializer runs before the constructor body calls
// _startNewRound(), so finishRound() will revert with "Round not ended" until then.)
const GAME_ADDRESS = "0x617dc22fec22d5681de90f025fe5b6f2b5ec70bd" as `0x${string}`;

async function main() {
  const { viem } = await hre.network.connect();
  const game = await viem.getContractAt("TriviaQuestSoneium", GAME_ADDRESS);

  const round = await game.read.getCurrentRound();
  const [id, prizePool, startTime, endTime, topWinners, finished] = round;

  const nowSec = Math.floor(Date.now() / 1000);
  const secondsLeft = Number(endTime) - nowSec;

  console.log("Game contract:  ", GAME_ADDRESS);
  console.log("Round ID:       ", id.toString());
  console.log("Prize pool:     ", prizePool.toString(), "wei");
  console.log("Start time:     ", new Date(Number(startTime) * 1000).toISOString());
  console.log("End time:       ", new Date(Number(endTime) * 1000).toISOString());
  console.log("Finished:       ", finished);
  console.log("Top winners:    ", topWinners);
  console.log("Now:            ", new Date().toISOString());

  if (secondsLeft > 0) {
    const h = Math.floor(secondsLeft / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    console.log(`\n⏳ Round still active — ${h}h ${m}m left. finishRound() will revert until endTime passes.`);
  } else {
    const m = Math.floor(Math.abs(secondsLeft) / 60);
    console.log(`\n✅ Round ended ${m}m ago — finishRound() should succeed now.`);
  }
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
