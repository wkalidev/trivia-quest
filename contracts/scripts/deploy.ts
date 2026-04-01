import { network } from "hardhat";

const { viem, networkName } = await network.connect();
const client = await viem.getPublicClient();

console.log(`Deploying TriviaQuest to ${networkName}...`);

const triviaQuest = await viem.deployContract("TriviaQuest");

console.log("TriviaQuest deployed at:", triviaQuest.address);
console.log("Deployment successful!");