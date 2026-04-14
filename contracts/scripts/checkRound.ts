import { network } from "hardhat";

const { viem } = await network.connect();
const TRIVIAQUEST_ADDRESS = "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb" as `0x${string}`;
const contract = await viem.getContractAt("TriviaQuest", TRIVIAQUEST_ADDRESS);

const round = await contract.read.getCurrentRound();
console.log("Round ID:", round[0].toString());
console.log("Prize Pool:", round[1].toString());
console.log("Start time:", new Date(Number(round[2]) * 1000).toLocaleString());
console.log("End time:", new Date(Number(round[3]) * 1000).toLocaleString());
console.log("Finished:", round[5]);
console.log("Now:", new Date().toLocaleString());