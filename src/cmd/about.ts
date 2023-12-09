import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

let data = new SlashCommandBuilder()
  .setName("about")
  .setDescription("Show what this bot is about");

let aboutCmds: string = "";
export function setCommands(
  commands: {
    name: string;
    about: string;
    args: string[];
    subCommands: { name: string; desc: string }[];
  }[],
) {
  let commandsAbouts: string[] = [];
  for (let cmd of commands) {
    let cmdString: string = "**/" + cmd.name + "**";
    if (cmd.args.length > 0) cmdString += " `" + cmd.args.join("` `") + "`";
    cmdString += ": " + cmd.about;
    if (cmd.subCommands.length > 0) {
      for (let subcmd of cmd.subCommands) {
        cmdString += `\n- ${subcmd.name}: ${subcmd.desc}`;
      }
    }
    commandsAbouts.push(cmdString);
  }
  aboutCmds = commandsAbouts.join("\n");
}

const inviteBtn = new ButtonBuilder()
  .setLabel("Invite")
  .setStyle(ButtonStyle.Link)
  .setURL(
    "https://discord.com/api/oauth2/authorize?client_id=1178222681884196864&permissions=51200&scope=bot",
  );
const sourceBtn = new ButtonBuilder()
  .setLabel("Report Issue")
  .setStyle(ButtonStyle.Link)
  .setURL("https://github.com/chiissu/anime-rater-bot/issues");

async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle("About Anime Rater")
    .addFields({ name: "About", value: "A bot to help you rate an anime" })
    .addFields({
      name: "Commands",
      value: aboutCmds,
    })
    .setFooter({
      text: "Made by Chiissu team, all rights reserved",
      iconURL: "https://avatars.githubusercontent.com/u/106880030",
    });
  interaction.reply({
    embeds: [embed],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(inviteBtn, sourceBtn),
    ],
  });
}

export { data, execute };
