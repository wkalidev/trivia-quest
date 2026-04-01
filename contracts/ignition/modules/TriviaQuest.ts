import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TriviaQuestModule = buildModule("TriviaQuestModule", (m) => {
  const triviaQuest = m.contract("TriviaQuest");
  return { triviaQuest };
});

export default TriviaQuestModule;