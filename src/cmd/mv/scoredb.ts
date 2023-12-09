import {
  ChatInputCommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { autocomplete } from "../lib/anilistAC";
import { getTitle } from "../lib/anilistFetch";
import { percentageToColor } from "../lib/colour";
import { getScore } from "../lib/dbMng";
import { sorry } from "../lib/gifFetch";

let data = new SlashCommandBuilder()
  .setName("scoredb")
  .setDescription("Get rating results of an anime from our database")
  .addStringOption((option) =>
    option
      .setName("title")
      .setDescription("The title of the anime to be rated")
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

  if (!animeInfo || animeInfo.title.english != animeTitle) {
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
    let data = getScore(animeInfo.id);
    let embed = new EmbedBuilder()
      .setTitle(animeInfo.title.english)
      .setThumbnail(animeInfo.coverImage.medium)
      .setFooter({
        text: "Made by Chiissu team, all rights reserved",
        iconURL: "https://avatars.githubusercontent.com/u/106880030",
      });
    if (data.size == 0) {
      embed.addFields({ name: "Ratings", value: "No ratings yet" });
      embed.setColor(0x696969);
    } else {
      let maxes = [8, 12, 6, 2, 2];
      let scores = [];
      for (let [i, max] of maxes.entries()) {
        scores.push(Math.round((max * data.average[i]) / 10) / 10);
      }
      function getSum(values: number[]) {
        return values.reduce((a, c) => a + c);
      }
      let scoreTotal = getSum(scores);
      let scoreMax = getSum(maxes);
      let percentage = Math.round((scoreTotal / scoreMax) * 100);
      let result = [
        `**Visual Quality**: ${scores[0]}/${maxes[0]}`,
        `**Plot**: ${scores[1]}/${maxes[1]}`,
        `**Music**: ${scores[2]}/${maxes[2]}`,
        `**SFW**: ${scores[3]}/${maxes[3]}`,
        `**Merch**: ${scores[4]}/${maxes[4]}`,
        `**Overall**: ${scoreTotal}/${scoreMax} (${percentage}%)`,
        `**Pool size**: ${data.size}`,
      ].join("\n");
      embed
        .addFields({ name: "Ratings", value: result })
        .setColor(percentageToColor(percentage));
    }

    let info = [];
    if (animeInfo.isAdult) info.push("⚠️ This Anime is NSFW");
    info.push(
      `**Native title**: ${animeInfo.title.native}`,
      `**Studio**: ${animeInfo.studios.nodes[0].name}`,
      `**Anilist rating**: ${animeInfo.meanScore}%`,
    );
    if (animeInfo.status == "RELEASING") {
      let daysLeft = Math.floor(
        animeInfo.nextAiringEpisode?.timeUntilAiring / 86400,
      );
      info.push(
        "**Next episode**: " + (daysLeft == 0 ? "Today" : daysLeft + " Days"),
      );
    } else info.push(`**Season**: ${animeInfo.season} ${animeInfo.seasonYear}`);
    info.push(`**Genres**: \`${animeInfo.genres.join("`, `")}\``);
    if (animeInfo.trailer && animeInfo.trailer.site == "youtube")
      info.push(
        `[[Watch Trailer](https://youtu.be/${animeInfo.trailer.id})] [[Open on Anilist](${animeInfo.siteUrl})]`,
      );
    embed.addFields({ name: "Anilist Info", value: info.join("\n") });
    interaction.reply({ embeds: [embed] });
  }
}

export { data, execute, autocomplete };
