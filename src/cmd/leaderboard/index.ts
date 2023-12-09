import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import * as Popular from "./popular";
import * as Users from "./users";
import * as Servers from "./servers";
import * as Server from "./server";

const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("Show some cool leaderboards")
  .addSubcommand(Popular.command)
  .addSubcommand(Users.command)
  .addSubcommand(Servers.command)
  .addSubcommand(Server.command);

async function execute(interaction: ChatInputCommandInteraction) {
  switch (interaction.options.getSubcommand()) {
    case "popular":
      Popular.execute(interaction);
      break;
    case "users":
      Users.execute(interaction);
      break;
    case "servers":
      Servers.execute(interaction);
      break;
    case "server":
      Server.execute(interaction);
      break;
  }
}

export { data, execute };
