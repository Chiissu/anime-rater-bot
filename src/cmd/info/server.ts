import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { serverStat } from "../../lib/dbMng";

function command(subcmd: SlashCommandSubcommandBuilder) {
  return subcmd
    .setName("server")
    .setDescription("Show statistics about this server");
}

async function execute(interaction: ChatInputCommandInteraction) {
  const stats = serverStat(interaction.guildId || "");
  const embed = new EmbedBuilder().setTitle("Server Statistics");
  if (stats.quantity == 0) {
    embed.addFields({
      name: "No Result",
      value: "Sorry, this server does not have any rating yet.",
    });
    return;
  }
  embed.addFields(
    {
      name: "Average Score",
      value: stats.averageScore + "%",
    },
    {
      name: "Global Ranking",
      value: `#${stats.globalRanking} (with ${stats.quantity} ratings)`,
    },
  );
  interaction.reply({ embeds: [embed] });
  //embed.addFields({name: "Average Score", value: stats.quantity})
}

export { command, execute };
