import { Client, GatewayIntentBits, REST, Routes, EmbedBuilder, TextChannel } from "discord.js";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

// ✅ Celo client
const provider = new ethers.JsonRpcProvider("https://forno.celo.org");

const CONTRACT_ADDRESS = "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb";

const CONTRACT_ABI = [
  "function getCurrentRound() view returns (uint256 id, uint256 prizePool, uint256 startTime, uint256 endTime, address[] topWinners, bool finished)",
  "function getTotalPlayers() view returns (uint256)",
  "function getLeaderboard() view returns (tuple(address player, uint256 totalPoints, uint256 bestScore, uint256 gamesPlayed)[])",
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// ✅ Helpers
function formatCelo(wei: bigint): string {
  const n = Number(ethers.formatUnits(wei, 18));
  if (n === 0) return "0";
  if (n < 0.001) return "<0.001";
  return n.toFixed(3);
}

function addressToAlias(address: string): string {
  const num = parseInt(address.slice(-4), 16) % 9999 + 1;
  return `Player #${num.toString().padStart(4, "0")}`;
}

function formatCountdown(endTime: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = Number(endTime) - now;
  if (diff <= 0) return "⌛ Expired";
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ✅ State pour détecter les changements de round
let lastRoundId: bigint | null = null;
let lastRoundFinished: boolean | null = null;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

const commands = [
  { name: "stats", description: "Live on-chain stats for Trivia Quest" },
  { name: "play", description: "Get the link to play Trivia Quest" },
  { name: "leaderboard", description: "View the on-chain leaderboard" },
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

async function registerCommands() {
  try {
    console.log("📡 Registering slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID!,
        process.env.GUILD_ID!
      ),
      { body: commands }
    );
    console.log("✅ Commands registered!");
  } catch (error) {
    console.error(error);
  }
}

// ✅ Récupère un channel par nom
function getChannel(name: string): TextChannel | null {
  const guild = client.guilds.cache.get(process.env.GUILD_ID!);
  if (!guild) return null;
  return guild.channels.cache.find(
    (c) => c.name.includes(name) && c.isTextBased()
  ) as TextChannel | null;
}

// ✅ Post leaderboard quotidien
async function postDailyLeaderboard() {
  try {
    const channel = getChannel("leaderboard");
    if (!channel) return;

    const leaderboard = await contract.getLeaderboard();
    const top5 = leaderboard.slice(0, 5);
    const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

    const fields = top5.map((entry: any, i: number) => ({
      name: `${medals[i]} ${addressToAlias(entry.player)}`,
      value: `Points: **${entry.totalPoints.toString()}** · Best: **${entry.bestScore.toString()}** · Games: **${entry.gamesPlayed.toString()}**`,
      inline: false,
    }));

    const embed = new EmbedBuilder()
      .setTitle("🏆 Daily Leaderboard — Trivia Quest")
      .setColor(0x8b5cf6)
      .setDescription("Top 5 players on Celo Mainnet")
      .addFields(
        ...fields,
        { name: "🔗 Full Leaderboard", value: "https://trivia-quest-eight.vercel.app/leaderboard" }
      )
      .setFooter({ text: "Trivia Quest · Celo Mainnet · Daily Update" })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    console.log("📊 Daily leaderboard posted!");
  } catch (e) {
    console.error("Daily leaderboard error:", e);
  }
}

// ✅ Annonce gagnant quand round terminé
async function announceWinner(round: any) {
  try {
    const channel = getChannel("announcements");
    if (!channel) return;

    const winners = round.topWinners as string[];
    const prizePool = formatCelo(round.prizePool);

    const prizes = ["50%", "30%", "20%"];
    const medals = ["🥇", "🥈", "🥉"];

    const fields = winners.slice(0, 3).map((w: string, i: number) => ({
      name: `${medals[i]} ${addressToAlias(w)}`,
      value: `Prize: **${prizes[i]}** of ${prizePool} CELO`,
      inline: false,
    }));

    const embed = new EmbedBuilder()
      .setTitle("🎉 Round Finished — Winners Announced!")
      .setColor(0xfbcd00)
      .setDescription(`Round #${round.id.toString()} is over! Here are the winners:`)
      .addFields(
        ...fields,
        { name: "🏆 Total Prize Pool", value: `${prizePool} CELO`, inline: true },
        { name: "▶️ Play Next Round", value: "https://trivia-quest-eight.vercel.app", inline: true },
      )
      .setFooter({ text: "Trivia Quest · Celo Mainnet" })
      .setTimestamp();

    await channel.send({ content: "@everyone 🎉 Round finished!", embeds: [embed] });
    console.log("🎉 Winner announced!");
  } catch (e) {
    console.error("Announce winner error:", e);
  }
}

// ✅ Annonce nouveau round
async function announceNewRound(round: any) {
  try {
    const channel = getChannel("announcements");
    if (!channel) return;

    const prizePool = formatCelo(round.prizePool);
    const endTime = formatCountdown(round.endTime);

    const embed = new EmbedBuilder()
      .setTitle("🚀 New Round Started!")
      .setColor(0x35d07f)
      .setDescription(`Round #${round.id.toString()} is now live on Celo Mainnet!`)
      .addFields(
        { name: "🏆 Prize Pool", value: `${prizePool} CELO`, inline: true },
        { name: "⏰ Ends In", value: endTime, inline: true },
        { name: "▶️ Play Now", value: "https://trivia-quest-eight.vercel.app", inline: false },
      )
      .setFooter({ text: "Trivia Quest · Celo Mainnet" })
      .setTimestamp();

    await channel.send({ content: "@everyone 🚀 New round started!", embeds: [embed] });
    console.log("🚀 New round announced!");
  } catch (e) {
    console.error("Announce new round error:", e);
  }
}

// ✅ Polling on-chain toutes les 60 secondes
async function startPolling() {
  console.log("🔄 Starting on-chain polling...");

  setInterval(async () => {
    try {
      const round = await contract.getCurrentRound();
      const currentId: bigint = round.id;
      const currentFinished: boolean = round.finished;

      // 🔔 Nouveau round détecté
      if (lastRoundId !== null && currentId > lastRoundId) {
        await announceNewRound(round);
      }

      // 🎉 Round terminé détecté
      if (lastRoundFinished === false && currentFinished === true) {
        await announceWinner(round);
      }

      lastRoundId = currentId;
      lastRoundFinished = currentFinished;

    } catch (e) {
      console.error("Polling error:", e);
    }
  }, 60_000); // toutes les 60 secondes
}

// ✅ Post leaderboard toutes les 24h
function startDailyLeaderboard() {
  console.log("📅 Starting daily leaderboard scheduler...");
  setInterval(async () => {
    await postDailyLeaderboard();
  }, 24 * 60 * 60 * 1000); // toutes les 24h
}

client.once("clientReady", async () => {
  console.log(`🤖 ${client.user?.tag} is online!`);
  await registerCommands();

  // ✅ Init state
  try {
    const round = await contract.getCurrentRound();
    lastRoundId = round.id;
    lastRoundFinished = round.finished;
    console.log(`📌 Current round: #${round.id.toString()} — finished: ${round.finished}`);
  } catch (e) {
    console.error("Init state error:", e);
  }

  startPolling();
  startDailyLeaderboard();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // ✅ /stats
  if (interaction.commandName === "stats") {
    await interaction.deferReply();
    try {
      const [round, totalPlayers] = await Promise.all([
        contract.getCurrentRound(),
        contract.getTotalPlayers(),
      ]);

      const prizePool = formatCelo(round.prizePool);
      const endTime = formatCountdown(round.endTime);
      const finished = round.finished;

      const embed = new EmbedBuilder()
        .setTitle("📊 Trivia Quest — Live On-Chain Stats")
        .setColor(0xfbcd00)
        .addFields(
          { name: "🎮 Total Players", value: `${totalPlayers.toString()}`, inline: true },
          { name: "🏆 Prize Pool", value: `${prizePool} CELO`, inline: true },
          { name: "⏰ Round Ends", value: endTime, inline: true },
          { name: "🔄 Round Status", value: finished ? "✅ Finished" : "🟢 Active", inline: true },
          { name: "❓ Questions", value: "446", inline: true },
          { name: "💰 Reward/point", value: "100 TRIVQ", inline: true },
        )
        .setFooter({ text: "Trivia Quest · Celo Mainnet" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      console.error(e);
      await interaction.editReply("❌ Could not fetch on-chain stats.");
    }
  }

  // ✅ /play
  if (interaction.commandName === "play") {
    const embed = new EmbedBuilder()
      .setTitle("🎮 Play Trivia Quest!")
      .setColor(0x35d07f)
      .setDescription("Answer questions, earn TRIVQ tokens and climb the leaderboard!")
      .addFields(
        { name: "▶️ App", value: "https://trivia-quest-eight.vercel.app" },
        { name: "📱 MiniPay", value: "MiniPay compatible on Celo" },
        { name: "💱 Swap TRIVQ", value: "https://app.ubeswap.org/#/swap?outputCurrency=0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5" },
      )
      .setFooter({ text: "Trivia Quest · Celo Mainnet" });

    await interaction.reply({ embeds: [embed] });
  }

  // ✅ /leaderboard
  if (interaction.commandName === "leaderboard") {
    await interaction.deferReply();
    try {
      const leaderboard = await contract.getLeaderboard();
      const top5 = leaderboard.slice(0, 5);
      const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

      const fields = top5.map((entry: any, i: number) => ({
        name: `${medals[i]} ${addressToAlias(entry.player)}`,
        value: `Points: **${entry.totalPoints.toString()}** · Best: **${entry.bestScore.toString()}** · Games: **${entry.gamesPlayed.toString()}**`,
        inline: false,
      }));

      const embed = new EmbedBuilder()
        .setTitle("🏆 Trivia Quest — On-Chain Leaderboard")
        .setColor(0x8b5cf6)
        .setDescription("Top 5 players on Celo Mainnet")
        .addFields(
          ...fields,
          { name: "🔗 Full Leaderboard", value: "https://trivia-quest-eight.vercel.app/leaderboard" }
        )
        .setFooter({ text: "Trivia Quest · Celo Mainnet" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      console.error(e);
      await interaction.editReply("❌ Could not fetch leaderboard.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);