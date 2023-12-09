import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { globalLeaderboard } from "../../lib/dbMng";
import { noResult } from "./noResult";

function command(subcmd: SlashCommandSubcommandBuilder) {
  return subcmd
    .setName("popular")
    .setDescription("Show Anime with the most ratings");
}

async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder().setTitle("Most Popular Anime");
  let leaderboard = globalLeaderboard("popularity").slice(0, 10);
  if (leaderboard.length == 0) return noResult(interaction);
  for (let [i, entry] of leaderboard.entries()) {
    i++;
    embed.addFields({
      name: "#" + i,
      value: `${entry.id}\n\`${entry.quantity} ratings\``,
    });
  }
  interaction.reply({ embeds: [embed] });
}

export { command, execute };
