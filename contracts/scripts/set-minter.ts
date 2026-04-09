import { network } from "hardhat";

const { viem } = await network.connect();

const TRIVQ_ADDRESS   = "0xf50afd22d5285f0398bf1be433252ce6a9fd9579";
const CHECKIN_ADDRESS = "0x12a76267fd15f013daaf4f20824295afa4ebcd91";

const triviaQToken = await viem.getContractAt("TriviaQToken", TRIVQ_ADDRESS);

console.log("Setting minter to DailyCheckIn...");
await triviaQToken.write.setMinter([CHECKIN_ADDRESS]);
console.log("✅ Minter set to DailyCheckIn!");