import { network } from "hardhat";

const { viem } = await network.connect();
const BASE_GAME = "0x1e2c209412ec30915ccf922654f0593faf61fcfb" as `0x${string}`;
// Used when prize pool is 0 — avoids contract-wallet fallback OOG on transfer()
const PLACEHOLDER_WINNER = "0x000000000000000000000000000000000000dEaD" as `0x${string}`;
// Recovery address for prizes when winner is a smart contract (EIP-7702 etc.)
const TREASURY = "0x995aC10d5B6778B90eF060b7ab585D854C1Ed914" as `0x${string}`;

const publicClient = await viem.getPublicClient();
const contract = await viem.getContractAt("TriviaQuest", BASE_GAME);

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
  console.log("⏰ Round expired — fetching leaderboard...");

  const leaderboard = await contract.read.getLeaderboard();

  let topWinners: `0x${string}`[];

  if (leaderboard.length === 0 || round[1] === 0n) {
    console.log("⚠️  Empty leaderboard or zero prize pool — using placeholder winner.");
    topWinners = [PLACEHOLDER_WINNER];
  } else {
    const candidates = leaderboard
      .slice(0, 3)
      .map((entry: any) => entry.player as `0x${string}`);

    // Replace any smart-contract wallet (EIP-7702, multi-sig, etc.) with the
    // treasury EOA so transfer() doesn't hit the 2300-gas limit and revert.
    topWinners = await Promise.all(
      candidates.map(async (addr) => {
        const code = await publicClient.getBytecode({ address: addr });
        const isContract = code !== undefined && code !== "0x";
        if (isContract) {
          console.log(`  ⚠️  ${addr} is a smart contract — routing prize to treasury.`);
          return TREASURY;
        }
        return addr;
      })
    );
  }

  console.log("🏆 Top winners:", topWinners);

  try {
    const tx = await contract.write.finishRound([topWinners]);
    console.log("✅ finishRound() sent! TX:", tx);
  } catch (err: any) {
    console.error("❌ Error finishRound:", err.message ?? err);
    process.exit(1);
  }

} else if (finished) {
  console.log("✅ Round already finished, nothing to do.");
} else {
  const remaining = endTime - now;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  console.log(`⏳ Round still active — ${mins}m ${secs}s remaining.`);
}
