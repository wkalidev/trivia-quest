import hre from "hardhat";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const TRIVQ_ADDRESS    = "0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5" as `0x${string}`;
const QUEST_ADDRESS    = "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb" as `0x${string}`;
const CHECKIN_ADDRESS  = "0x8650e6c477f8ae3933dc6d61d85e65c90cf71828" as `0x${string}`;
const REFERRAL_ADDRESS = "0xa0fcd85a25ecb71ca1ea9d63da058c832c27c62e" as `0x${string}`;

async function main() {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const trivqToken = await viem.getContractAt("TriviaQToken", TRIVQ_ADDRESS);
  const triviaQuest = await viem.getContractAt("TriviaQuest", QUEST_ADDRESS);

  // Link TRIVQ token dans TriviaQuest
  console.log("0/4 Linking TRIVQ token...");
  try {
    const tx = await triviaQuest.write.setTrivqToken([TRIVQ_ADDRESS]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log("  ✅ Token linked");
  } catch (e) { console.error("  ❌", e); }
  await sleep(3000);

  // TriviaQuest
  console.log("1/3 Adding TriviaQuest as minter...");
  try {
    const tx = await trivqToken.write.addMinter([QUEST_ADDRESS]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log("  ✅ TriviaQuest can mint");
  } catch (e) { console.error("  ❌", e); }
  await sleep(3000);

  // DailyCheckIn
  console.log("2/3 Adding DailyCheckIn as minter...");
  try {
    const tx = await trivqToken.write.addMinter([CHECKIN_ADDRESS]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log("  ✅ DailyCheckIn can mint");
  } catch (e) { console.error("  ❌", e); }
  await sleep(3000);

  // Referral
  console.log("3/3 Adding Referral as minter...");
  try {
    const tx = await trivqToken.write.addMinter([REFERRAL_ADDRESS]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log("  ✅ Referral can mint");
  } catch (e) { console.error("  ❌", e); }

  console.log("\n✅ All minters set!");
}

main().catch(err => {
  console.error("❌", err);
  process.exit(1);
});