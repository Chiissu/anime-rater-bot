import {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} from "discord.js";
import { commands, commandsData } from "./cmd";

const client = new Client({ intents: [GatewayIntentBits.Guilds], shards: 0 });

const token = process.env.TOKEN as string;

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(
      `Started refreshing ${commandsData.size} application (/) commands.`,
    );

    const data = (await rest.put(
      Routes.applicationCommands(process.env.ID || ""),
      { body: commandsData },
    )) as any;

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    console.error(error);
  }
})();

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  } else if (interaction.isAutocomplete()) {
    const autocomplete = commands.get(interaction.commandName)?.autocomplete;
    if (!autocomplete)
      return console.error(
        `Command ${interaction.commandName} does not have autocmplete`,
      );
    try {
      await autocomplete(interaction);
    } catch (error) {
      console.error(error);
    }
  }
});

client.login(token);
