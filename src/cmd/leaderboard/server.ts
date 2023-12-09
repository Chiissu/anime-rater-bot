import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { serverLeaderboard } from "../../lib/dbMng";
import { noResult } from "./noResult";

function command(subcmd: SlashCommandSubcommandBuilder) {
  return subcmd
    .setName("server")
    .setDescription("Show this server's leaderboard");
}

async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder().setTitle("Server Leaderboard");
  const userList = interaction.client.users.cache;
  let leaderboard = serverLeaderboard(interaction.guildId ?? "").slice(0, 10);
  if (leaderboard.length == 0) return noResult(interaction);
  for (let [i, userInfo] of leaderboard.entries()) {
    let user = userList.get(userInfo.id);
    i++;
    if (!user) {
      embed.addFields({ name: "#" + i, value: "Unknown" });
    } else {
      embed.addFields({
        name: "#" + i,
        value: `${user.displayName}\n\`${userInfo.quantity} ratings\``,
      });
    }
  }
  interaction.reply({ embeds: [embed] });
}

export { command, execute };
