import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Collection,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import * as rate from "./rate";
import * as about from "./about";
import * as info from "./info";
import * as leaderboard from "./leaderboard";
import * as top from "./top";
import * as trending from "./trending";

type SlashCommandData = Omit<
  SlashCommandBuilder,
  "addSubcommandGroup" | "addSubcommand"
>;

let commands = new Collection<
  string,
  {
    data: SlashCommandData | SlashCommandSubcommandsOnlyBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
  }
>();

commands.set(about.data.name, about);
commands.set(rate.data.name, rate);
commands.set(leaderboard.data.name, leaderboard);
commands.set(info.data.name, info);
commands.set(top.data.name, top);
commands.set(trending.data.name, trending);

const commandsData = new Collection(
  commands.map((val) => val.data.toJSON()).entries(),
);

let cmdInfo = [];
for (let [_, cmd] of commands) {
  let isSubcommand =
    cmd.data.toJSON().options[0]?.type ==
    ApplicationCommandOptionType.Subcommand;
  cmdInfo.push({
    name: cmd.data.name,
    args: isSubcommand
      ? []
      : cmd.data.options.map((option) => {
          let optionInfo = option.toJSON();
          return optionInfo.name + (optionInfo.required ? "*" : "");
        }),
    about: cmd.data.description,
    subCommands: isSubcommand
      ? cmd.data.options.map((option) => {
          let optionInfo = option.toJSON();
          return {name: optionInfo.name, desc: optionInfo.description };
        })
      : [],
  });
}
about.setCommands(cmdInfo);

export { commands, commandsData };
