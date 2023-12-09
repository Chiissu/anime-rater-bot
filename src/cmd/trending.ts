import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { ratingLeaderboard } from "../lib/dbMng";
import { noResult } from "./leaderboard/noResult";

let data = new SlashCommandBuilder()
  .setName("trending")
  .setDescription("Show currently hot anime");

async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder().setTitle("Top anime");
  const leaderboard = ratingLeaderboard("trending").slice(0, 10);
  if (leaderboard.length == 0) return noResult(interaction);
  for (let [i, animeInfo] of leaderboard.entries()) {
    i++;
    embed.addFields({
      name: "#" + i,
      value: `${animeInfo.name}\n\`${animeInfo.score}%\``,
    });
  }
  interaction.reply({ embeds: [embed] });
}

export { data, execute };
