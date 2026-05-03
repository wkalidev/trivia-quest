import { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

// ✅ Commandes slash
const commands = [
  {
    name: "stats",
    description: "Affiche les stats live de Trivia Quest",
  },
  {
    name: "play",
    description: "Obtiens le lien pour jouer à Trivia Quest",
  },
  {
    name: "leaderboard",
    description: "Affiche le top joueurs",
  },
];

// ✅ Register commands
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

async function registerCommands() {
  try {
    console.log("📡 Enregistrement des commandes slash...");
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID!,
        process.env.GUILD_ID!
      ),
      { body: commands }
    );
    console.log("✅ Commandes enregistrées !");
  } catch (error) {
    console.error(error);
  }
}

// ✅ Bot ready
client.once("ready", async () => {
  console.log(`🤖 ${client.user?.tag} est en ligne !`);
  await registerCommands();
});

// ✅ Handle slash commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "stats") {
    await interaction.deferReply();
    try {
      const res = await fetch("https://trivia-quest-eight.vercel.app/api/stats");
      const data = await res.json();

      const embed = new EmbedBuilder()
        .setTitle("📊 Trivia Quest — Stats Live")
        .setColor(0xfbcd00)
        .addFields(
          { name: "🎮 Joueurs", value: `${data.totalPlayers ?? "—"}`, inline: true },
          { name: "🏆 Prize Pool", value: `${data.prizePool ?? "—"} CELO`, inline: true },
          { name: "⏰ Fin du round", value: `${data.roundEndTime ?? "—"}`, inline: true },
        )
        .setFooter({ text: "Trivia Quest · Celo Mainnet" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply("❌ Impossible de récupérer les stats.");
    }
  }

  if (interaction.commandName === "play") {
    const embed = new EmbedBuilder()
      .setTitle("🎮 Joue à Trivia Quest !")
      .setColor(0x35d07f)
      .setDescription("Réponds à des questions, gagne des TRIVQ et grimpe le leaderboard !")
      .addFields(
        { name: "🔗 Lien", value: "https://trivia-quest-eight.vercel.app" },
        { name: "📱 MiniPay", value: "Compatible MiniPay sur Celo" },
      )
      .setFooter({ text: "Trivia Quest · Celo Mainnet" });

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === "leaderboard") {
    await interaction.deferReply();
    try {
      const res = await fetch("https://trivia-quest-eight.vercel.app/api/stats");
      const data = await res.json();

      const embed = new EmbedBuilder()
        .setTitle("🏆 Trivia Quest — Leaderboard")
        .setColor(0x8b5cf6)
        .setDescription("Classement des meilleurs joueurs on-chain")
        .addFields(
          { name: "🔗 Voir le leaderboard complet", value: "https://trivia-quest-eight.vercel.app/leaderboard" }
        )
        .setFooter({ text: "Trivia Quest · Celo Mainnet" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply("❌ Impossible de récupérer le leaderboard.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);