import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { globalStats } from "../../lib/dbMng";

function command(subcmd: SlashCommandSubcommandBuilder) {
  return subcmd
    .setName("stats")
    .setDescription("Show interesting statistics this bot found");
}

async function execute(interaction: ChatInputCommandInteraction) {
  const stats = globalStats();
  let embed = new EmbedBuilder()
    .setTitle("Global Statistics")
    .addFields(
      { name: "Total Ratings", value: stats.quantity.toString() },
      { name: "Average Rating", value: stats.averageRating + "%" },
      { name: "Total Titles Rated", value: stats.titles.toString() },
      { name: "Total Users", value: stats.users.toString() },
      { name: "Total Servers", value: stats.servers.toString() },
    );
  interaction.reply({ embeds: [embed] });
}

export { command, execute };
