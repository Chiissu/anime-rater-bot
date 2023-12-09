import {
  AutocompleteInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { getAutocomplete } from "./anilistFetch";

export async function autocomplete(interaction: AutocompleteInteraction) {
  const options = interaction.options as CommandInteractionOptionResolver & {
    getFocused: () => string;
  };
  const focusedValue = options.getFocused();
  const results = await getAutocomplete(focusedValue);
  if (!results) return interaction.respond([]);
  results.splice(25);
  await interaction.respond(
    results.map((result) => ({ name: result, value: result })),
  );
}
