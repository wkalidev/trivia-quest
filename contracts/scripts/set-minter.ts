import { network } from "hardhat";

const { viem } = await network.connect();

const TRIVQ_ADDRESS = "0x30964be5c7c9607099a03b38edf66893f63e9859";
const QUEST_ADDRESS = "0xc53a6c1ab95636c86ff7216409272744edfd184c";

const triviaQToken = await viem.getContractAt("TriviaQToken", TRIVQ_ADDRESS);

console.log("Setting minter...");
await triviaQToken.write.setMinter([QUEST_ADDRESS]);
console.log("✅ Minter set to TriviaQuest !");