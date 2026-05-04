import { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } from "discord.js";
import dotenv from "dotenv";
import { createPublicClient, http, formatUnits } from "viem";
import { celo } from "viem/chains";

dotenv.config();

// ✅ Celo client
const celoClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

const CONTRACT_ADDRESS = "0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb" as `0x${string}`;

const CONTRACT_ABI = [
  {
    name: "getCurrentRound",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "prizePool", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "topWinners", type: "address[]" },
      { name: "finished", type: "bool" },
    ],
  },
  {
    name: "getTotalPlayers",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getLeaderboard",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "player", type: "address" },
          { name: "totalPoints", type: "uint256" },
          { name: "bestScore", type: "uint256" },
          { name: "gamesPlayed", type: "uint256" },
        ],
      },
    ],
  },
] as const;

// ✅ Helpers
function formatCelo(wei: bigint): string {
  const n = Number(formatUnits(wei, 18));
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

client.once("clientReady", async () => {
  console.log(`🤖 ${client.user?.tag} is online!`);
  await registerCommands();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // ✅ /stats
  if (interaction.commandName === "stats") {
    await interaction.deferReply();
    try {
      const [round, totalPlayers] = await Promise.all([
        celoClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "getCurrentRound",
        }),
        celoClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "getTotalPlayers",
        }),
      ]);

      const prizePool = formatCelo(round[1]);
      const endTime = formatCountdown(round[3]);
      const finished = round[5];

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
      const leaderboard = await celoClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "getLeaderboard",
      });

      const top5 = leaderboard.slice(0, 5);

      const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

      const fields = top5.map((entry, i) => ({
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