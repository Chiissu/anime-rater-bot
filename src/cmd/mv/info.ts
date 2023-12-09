import {
  ChatInputCommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { autocomplete } from "../lib/anilistAC";
import { getTitle } from "../lib/anilistFetch";
import { sorry } from "../lib/gifFetch";

let data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Show info of an anime")
  .addStringOption((option) =>
    option
      .setName("title")
      .setDescription("The title of the anime")
      .setAutocomplete(true)
      .setRequired(true),
  );

async function execute(interaction: ChatInputCommandInteraction) {
  let interactionOptions =
    interaction.options as CommandInteractionOptionResolver & {
      getString: (name: string) => string;
    };
  let animeTitle = interactionOptions.getString("title");

  let animeInfo = await getTitle(animeTitle);

  if (!animeInfo) {
    let embed = new EmbedBuilder()
      .setTitle("Error: Not found")
      .setColor(0xd88516)
      .addFields({
        name: `\`${animeTitle}\` cannot be found`,
        value:
          "Sorry, we can't find an anime with this name. Please try searching again.",
      })
      .setThumbnail(
        "https://agentestudio.com/uploads/post/image/69/main_how_to_design_404_page.png",
      )
      .setImage(
        (await sorry()) ||
          "https://media.tenor.com/PqAXJZCs0J8AAAAC/sorry-k-on.gif",
      );
    interaction.reply({ embeds: [embed], ephemeral: true });
  } else {
    let embed = new EmbedBuilder()
      .setTitle(`About: \`${animeTitle}\``)
      .setColor(parseInt(animeInfo.coverImage.color.replace("#", ""), 16))
      .setThumbnail(animeInfo.coverImage.medium)
      .addFields(
        {
          name: "Native title",
          value: animeInfo.title.native,
          inline: true,
        },
        {
          name: "Genres",
          value: `\`${animeInfo.genres.join("`, `")}\``,
          inline: true,
        },
        {
          name: "Description",
          value: animeInfo.description.replaceAll("<br>", ""),
        },
      );

    if (animeInfo.isAdult)
      embed.addFields({
        name: "NSFW 🔞",
        value: "This anime is not\nsafe for work",
        inline: true,
      });

    if (animeInfo.status == "RELEASING") {
      let daysLeft = Math.floor(
        animeInfo.nextAiringEpisode?.timeUntilAiring / 86400,
      );
      embed.addFields({
        name: "Next episode",
        value: daysLeft == 0 ? "Today" : daysLeft + " Days",
        inline: true,
      });
    } else
      embed.addFields({
        name: "Season",
        value: animeInfo.season + " " + animeInfo.seasonYear,
        inline: true,
      });

    embed.addFields(
      { name: "Format", value: animeInfo.format, inline: true },
      {
        name: "Episodes",
        value: animeInfo.episodes.toString(),
        inline: true,
      },
      {
        name: "Studio",
        value: animeInfo.studios.nodes[0]?.name || "Unknown",
        inline: true,
      },
      {
        name: "Anilist Rating",
        value: animeInfo.meanScore + "%",
        inline: true,
      },
      {
        name: "More info",
        value: `[[Open on Anilist](${animeInfo.siteUrl})]${
          animeInfo.trailer && animeInfo.trailer.site == "youtube"
            ? ` [[Watch Trailer](https://youtu.be/${animeInfo.trailer.id})]`
            : ""
        }`,
      },
    );

    interaction.reply({ embeds: [embed] });
  }
}

export { data, execute, autocomplete };
