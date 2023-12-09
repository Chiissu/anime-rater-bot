import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import * as Anilist from "./anilist";
import * as Title from "./title";
import * as Server from "./server";
import * as Stats from "./stats";
import * as User from "./user";

const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Show some cool information and statistics")
  .addSubcommand(Anilist.command)
  .addSubcommand(Title.command)
  .addSubcommand(Server.command)
  .addSubcommand(Stats.command)
  .addSubcommand(User.command);

async function autocomplete(interaction: AutocompleteInteraction) {
  switch (interaction.options.getSubcommand()) {
    case "anilist":
      Anilist.autocomplete(interaction);
      break;
    case "title":
      Title.autocomplete(interaction);
      break;
  }
}

async function execute(interaction: ChatInputCommandInteraction) {
  console.log(interaction.options.getSubcommand());
  switch (interaction.options.getSubcommand()) {
    case "anilist":
      Anilist.execute(interaction);
      break;
    case "title":
      Title.execute(interaction);
      break;
    case "server":
      Server.execute(interaction);
      break;
    case "stats":
      Stats.execute(interaction);
      break;
    case "user":
      User.execute(interaction);
      break;
  }
}

export { data, autocomplete, execute };
