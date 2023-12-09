import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { globalLeaderboard } from "../../lib/dbMng";
import { noResult } from "./noResult";

function command(subcmd: SlashCommandSubcommandBuilder) {
  return subcmd
    .setName("users")
    .setDescription("Show the global users leaderboard");
}

async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder().setTitle("Global Leaderboard (Users)");
  const userList = interaction.client.users.cache;
  let leaderboard = globalLeaderboard("user").slice(0, 10);
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
