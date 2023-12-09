import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import {noResult} from "../leaderboard/noResult";
import { getLeaderboard, serverLeaderboard } from "../lib/dbMng";

let data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("Show the leaderboard")
  .addSubcommand((subcommand) =>
    subcommand.setName("servers").setDescription("Show top servers"),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("this-server")
      .setDescription("Show this server's statistics"),
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("users").setDescription("Show top users"),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("user")
      .setDescription("Show statistic for a specific user")
      .addMentionableOption((option) =>
        option.setName("user").setDescription("The user to search"),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("rating").setDescription("Get top anime"),
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("popular").setDescription("Get most popular anime"),
  );

async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder();
  const userList = interaction.client.users.cache;
  switch (interaction.options.getSubcommand()) {
    case "servers":
      {
        let serverLeaderboard = getLeaderboard("guild").slice(0, 10);
        if (serverLeaderboard.length == 0) return noResult(interaction);
        embed.setTitle("Global Leaderboard (Servers)");
        const serverList = await interaction.client.guilds.fetch();
        for (let [i, serverInfo] of serverLeaderboard.entries()) {
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
      }
      break;
    case "this-server":
      {
        const svrLdbd = serverLeaderboard(interaction.guildId as string);
        if (svrLdbd.quantity == 0) return sendNoResult();
        embed.addFields({
          name: "Global leaderboard",
          value: `#${svrLdbd.globalRanking} (with \`${svrLdbd.quantity}\` total ratings)`,
        });
        embed.setTitle("Server Leaderboard");
        embed.addFields({name: "Average score"})
        for (let [i, memberInfo] of svrLdbd.topMembers.entries()) {
          let user = userList.get(memberInfo.id);
          i++;
          if (!user) {
            embed.addFields({ name: "#" + i, value: "Unknown" });
          } else {
            embed.addFields({
              name: "#" + i,
              value: `${user.displayName}\n\`${memberInfo.quantity} ratings\``,
            });
          }
        }
      }
      break;
    case "users":
      {
        let userLeaderboard = getLeaderboard("user").slice(0, 10);
        if (userLeaderboard.length == 0) return sendNoResult();
        embed.setTitle("Global Leaderboard (Users)");
        for (let [i, userInfo] of userLeaderboard.entries()) {
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
      }
      break;
    case "user":
      
    case "title":
      break;
    case "popular": {
      let popLeaderboard = getLeaderboard("title").slice(0, 10);
      if (popLeaderboard.length == 0) return 
      embed.setTitle("Most Popular Anime");
      for (let [i, entry] of popLeaderboard.entries()) {
        i++;
        embed.addFields({
          name: "#" + i,
          value: `${entry.id}\n\`${entry.quantity} ratings\``,
        });
      }
    }
  }
  interaction.reply({ embeds: [embed] });
}

export { data, execute };
