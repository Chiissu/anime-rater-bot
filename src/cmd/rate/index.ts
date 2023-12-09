import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";
import { autocomplete } from "../../lib/anilistAC";
import { execute } from "./execute";

let data = new SlashCommandBuilder()
  .setName("rate")
  .setDescription("Rate an anime")
  .addStringOption((option) =>
    option
      .setName("title")
      .setDescription("The title of the anime")
      .setAutocomplete(true)
      .setRequired(true),
  )

export { data, execute, autocomplete };
