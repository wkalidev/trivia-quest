import { network } from "hardhat";

const { viem } = await network.connect();
const QUEST = "0xedf1505c476a5a7de9e60f79844edb7774c03f0a";
const contract = await viem.getContractAt("TriviaQuest", QUEST);

const round = await contract.read.getCurrentRound();
console.log("Round ID:", round[0].toString());
console.log("Prize Pool:", round[1].toString());
console.log("Start time:", new Date(Number(round[2]) * 1000).toLocaleString());
console.log("End time:", new Date(Number(round[3]) * 1000).toLocaleString());
console.log("Finished:", round[5]);
console.log("Now:", new Date().toLocaleString());