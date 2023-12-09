import {
  ChatInputCommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
  User,
  userMention,
} from "discord.js";
import { userStat } from "../../lib/dbMng";

function command(subcmd: SlashCommandSubcommandBuilder) {
  return subcmd
    .setName("user")
    .setDescription("Show statistics about a user")
    .addUserOption((option) =>
      option.setDescription("The user to search for").setName("user"),
    );
}

async function execute(interaction: ChatInputCommandInteraction) {
  let interactionOptions =
    interaction.options as CommandInteractionOptionResolver & {
      getUser: (name: string) => User;
    };
  let target = interactionOptions.getUser("user") ?? interaction.user;
  let stats = userStat(target.id);
  const embed = new EmbedBuilder()
    .setTitle("User Statistics")
    .setThumbnail(target.avatarURL())
    .addFields(
      { name: "User", value: userMention(target.id) },
      {
        name: "Global Ranking",
        value: `${stats.globalRanking} (${stats.quantity} rankings)`,
      },
      { name: "Average Rating", value: stats.averageScore.toString() },
    );
  interaction.reply({ embeds: [embed] });
}

export { command, execute };
