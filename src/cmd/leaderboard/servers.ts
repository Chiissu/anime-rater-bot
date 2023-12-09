import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { globalLeaderboard } from "../../lib/dbMng";
import { noResult } from "./noResult";

function command(subcmd: SlashCommandSubcommandBuilder) {
  return subcmd
    .setName("servers")
    .setDescription("Show the global server leaderboard");
}

async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder().setTitle("Global Leaderboard (Servers)");
  const serverList = await interaction.client.guilds.fetch();
  let leaderboard = globalLeaderboard("guild").slice(0, 10);
  if (leaderboard.length == 0) return noResult(interaction);
  for (let [i, serverInfo] of leaderboard.entries()) {
    let server = serverList.get(serverInfo.id);
    i++;
    if (!server) {
      embed.addFields({ name: "#" + i, value: "Unknown" });
    } else {
      embed.addFields({
        name: "#" + i,
        value: `${server.name}\n\`${serverInfo.quantity} ratings\``,
      });
    }
  }
  interaction.reply({ embeds: [embed] });
}

export { command, execute };
