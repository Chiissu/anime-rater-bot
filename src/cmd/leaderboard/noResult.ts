import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export function noResult(interaction: ChatInputCommandInteraction) {
  let embed = new EmbedBuilder()
    .setTitle("Error: No Result")
    .setColor(0xd88516);
  interaction.reply({ embeds: [embed] });
}
