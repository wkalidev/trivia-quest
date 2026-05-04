import { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

const commands = [
  { name: "stats", description: "Affiche les stats live de Trivia Quest" },
  { name: "play", description: "Obtiens le lien pour jouer à Trivia Quest" },
  { name: "leaderboard", description: "Affiche le top joueurs" },
];

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

client.once("clientReady", async () => {
  console.log(`🤖 ${client.user?.tag} est en ligne !`);
  await registerCommands();
});

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
          { name: "🎮 Joueurs", value: `${data.live_stats?.players ?? "—"}`, inline: true },
          { name: "❓ Questions", value: `${data.game?.questions ?? "—"}`, inline: true },
          { name: "🌍 Langues", value: `${data.game?.languages?.join(", ") ?? "—"}`, inline: true },
          { name: "🏆 Récompense/point", value: `${data.rewards?.per_point ?? "—"}`, inline: true },
          { name: "📅 Check-in quotidien", value: `${data.rewards?.daily_checkin ?? "—"}`, inline: true },
          { name: "🔗 Referral", value: `${data.rewards?.referral ?? "—"}`, inline: true },
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
        { name: "🔗 App", value: "https://trivia-quest-eight.vercel.app" },
        { name: "📱 MiniPay", value: "Compatible MiniPay sur Celo" },
        { name: "💱 Swap TRIVQ", value: "https://app.ubeswap.org/#/swap?outputCurrency=0xe65fc5cacaf9a5aebbc0e151dee08a53f24a05c5" },
      )
      .setFooter({ text: "Trivia Quest · Celo Mainnet" });

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === "leaderboard") {
    await interaction.deferReply();
    try {
      const embed = new EmbedBuilder()
        .setTitle("🏆 Trivia Quest — Leaderboard")
        .setColor(0x8b5cf6)
        .setDescription("Grimpe le classement on-chain et remporte le prize pool !")
        .addFields(
          { name: "🥇 1er", value: "50% du prize pool", inline: true },
          { name: "🥈 2ème", value: "30% du prize pool", inline: true },
          { name: "🥉 3ème", value: "20% du prize pool", inline: true },
          { name: "🔗 Voir le classement", value: "https://trivia-quest-eight.vercel.app/leaderboard" },
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