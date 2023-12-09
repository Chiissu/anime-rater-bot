import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  CommandInteractionOptionResolver,
  ComponentType,
  EmbedBuilder,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  MessageComponentInteraction,
  MessageCreateOptions,
  MessagePayload,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { percentageToColor } from "../../lib/colour";
import { getTitle } from "../../lib/anilistFetch";
import { Prompt, prompts as PromptsSource } from "./prompts";
import { saveData } from "../../lib/dbMng";

export async function execute(interaction: ChatInputCommandInteraction) {
  let interactionOptions =
    interaction.options as CommandInteractionOptionResolver & {
      getString: (name: string) => string;
    };
  let animeTitle = interactionOptions.getString("title");

  let anilistInfo = await getTitle(animeTitle);

  let prompts = Array.from(PromptsSource);

  let results: any[] = [];
  let maxScore = 0;
  let totalScore = 0;

  let step1 = prompts.shift();
  if (!step1) return console.error("No prompt");
  let step1Comps = promptToComponent(step1);
  if (!step1Comps) return console.error("A prompt has unsupported type");
  let embed = genPromptEmbed({
    animeTitle,
    progress: { current: [], total: PromptsSource.length },
    score: { current: 1, total: 1 },
    section: step1.sectionTitle,
    prompt: step1.prompt,
  });
  if (anilistInfo) {
    embed.setThumbnail(anilistInfo.coverImage.medium);
    embed.setURL(anilistInfo.siteUrl);
  }
  const message = await interaction.reply({
    components: step1Comps,
    embeds: [embed],
    ephemeral: true,
  });
  let next = async (prompt: Prompt) => {
    let res: any = {
      type: prompt.type,
      title: prompt.prompt,
    };
    try {
      let i = await message.awaitMessageComponent({
        time: 60000,
      });
      switch (prompt.type) {
        case "number":
          res.max = prompt.max;
          if (prompt.optional) {
            if ((i.componentType = ComponentType.Button)) {
              if (i.customId == prompt.optional) {
                res.val = prompt.optional;
                break;
              }
            }
          }
          res.val = Number((i as any).values[0]);
          if (!prompt.notRated) {
            maxScore += prompt.max;

            totalScore += res.val;
          }
          break;

        case "boolean":
          res.val = i.customId == "yes";
      }
      results.push(res);

      let nextStep = prompts.shift();

      if (!nextStep) return handleResult(i, results);

      if (nextStep.id == "5-1" && !anilistInfo) {
        let res: any = {
          type: nextStep.type,
          title: nextStep.prompt,
          val: false,
        };
        results.push(res);
        nextStep = prompts.shift();
      }

      let nextStepComps = promptToComponent(nextStep);
      if (!nextStepComps) return console.error("A prompt has unsupported type");

      let embed = genPromptEmbed({
        animeTitle,
        progress: {
          current: results,
          total: PromptsSource.length,
        },
        score: { current: totalScore, total: maxScore },
        section: nextStep.sectionTitle,
        prompt: nextStep.prompt,
      });
      if (anilistInfo) embed.setThumbnail(anilistInfo.coverImage.medium);

      i.update({
        embeds: [embed],
        components: nextStepComps,
      });

      next(nextStep);
    } catch {
      await interaction.editReply({
        content: "Response not received within 1 minute, cancelling",
        components: [],
        embeds: [],
      });
    }
  };
  await next(step1);

  async function handleResult(
    i: MessageComponentInteraction,
    results: Array<any>,
  ) {
    let embed = new EmbedBuilder()
      .setTitle(`Anime Rating: \`${animeTitle}\``)
      .setAuthor({
        iconURL: i.user.avatarURL() ?? undefined,
        name: i.user.displayName,
      })
      .setFooter({
        text: "Made by Chiissu team, all rights reserved",
        iconURL: "https://avatars.githubusercontent.com/u/106880030",
      });

    let percentage = Math.round((totalScore / maxScore) * 100);
    embed.addFields({
      name: "Final Score",
      value: `${totalScore}/${maxScore} (${percentage}%)`,
    });
    let hue = percentageToColor(percentage);
    embed.setColor(hue);

    function getCategoryResult(items: { val: number | string; max: number }[]) {
      let total = 0,
        max = 0;
      for (let item of items) {
        if (typeof item.val != "number") continue;
        total += item.val;
        max += item.max;
      }
      return {
        total,
        max,
        percentage: (total / max) * 100,
        stringify: () => `${total}/${max}`,
      };
    }
    let categoryRatings = [
      getCategoryResult((results as any).slice(0, 4)),
      getCategoryResult((results as any).slice(4, 9)),
      getCategoryResult((results as any).slice(9, 12)),
      getCategoryResult([results[12]]),
      getCategoryResult([results[13]]),
    ];

    embed.addFields({
      name: "Categories",
      value: [
        "**Visual Quality**: " + categoryRatings[0].stringify(),
        "**Plot**: " + categoryRatings[1].stringify(),
        "**Music**: " + categoryRatings[2].stringify(),
        "**SFW**: " + categoryRatings[3].stringify(),
        "**Merch**: " + categoryRatings[4].stringify(),
      ].join("\n"),
    });

    if (anilistInfo) {
      embed.setThumbnail(anilistInfo.coverImage.medium);
      let info = [];
      if (anilistInfo.isAdult) info.push("‚ö†Ô∏è This Anime is NSFW");
      info.push(
        `**Native title**: ${anilistInfo.title.native}`,
        `**Studio**: ${anilistInfo.studios.nodes[0].name}`,
        `**Anilist rating**: ${anilistInfo.meanScore}%`,
      );
      if (anilistInfo.status == "RELEASING") {
        let daysLeft = Math.floor(
          anilistInfo.nextAiringEpisode?.timeUntilAiring / 86400,
        );
        info.push(
          "**Next episode**: " + (daysLeft == 0 ? "Today" : daysLeft + " Days"),
        );
      } else
        info.push(
          `**Season**: ${anilistInfo.season} ${anilistInfo.seasonYear}`,
        );
      info.push(`**Genres**: \`${anilistInfo.genres.join("`, `")}\``);
      if (anilistInfo.trailer && anilistInfo.trailer.site == "youtube")
        info.push(
          `[[Watch Trailer](https://youtu.be/${anilistInfo.trailer.id})] [[Open on Anilist](${anilistInfo.siteUrl})]`,
        );
      embed.addFields({ name: "Anilist Info", value: info.join("\n") });
    }
    let updatedMessage:
      | MessagePayload
      | (InteractionUpdateOptions &
          InteractionReplyOptions &
          MessageCreateOptions) = {
      components: [],
      content: "",
      embeds: [embed],
    };
    if (results[14].val) {
      saveData({
        userID: interaction.user.id,
        guildID: interaction.guildId || "0",
        anilistID: anilistInfo?.id as number,
        anilistName: anilistInfo?.title.english,
        results: categoryRatings.map((v) => v.percentage),
      });
    }
    if (results[15].val) {
      let followUp = await interaction.followUp(updatedMessage);

      const deleteButton = new ButtonBuilder()
          .setCustomId("delete")
          .setLabel("Delete (60 sec)")
          .setStyle(ButtonStyle.Danger)
          .setEmoji("🗑️"),
        deleteRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          deleteButton,
        ),
        resultText = "> Your result has been shared: " + followUp.url;
      i.update({
        components: [deleteRow],
        embeds: [],
        content: resultText,
      });

      try {
        let deleteInteraction = await message.awaitMessageComponent({
          time: 60000,
          filter: (i) => i.customId == "delete",
        });
        followUp.delete();
        deleteInteraction.update({
          components: [],
          embeds: [embed],
          content:
            "> Your rating has been retracted from the public and reattached below",
        });
      } catch {
        message.edit({ components: [] });
      }
    } else {
      i.update(updatedMessage);
    }
  }
}

function genPromptEmbed(data: {
  progress: { current: Array<any>; total: number };
  score: { current: number; total: number };
  animeTitle: string;
  section: string;
  prompt: string;
}) {
  let chars = data.progress.current.map((i) => {
    switch (i.val) {
      case 0:
        return ":zero:";
      case 1:
        return ":one:";
      case 2:
        return ":two:";
      case 3:
        return ":three:";
      case 4:
        return ":four:";
      case 5:
        return ":five:";
      case 6:
        return ":six:";
      case 7:
        return ":seven:";
      case 8:
        return ":eight:";
      case 9:
        return ":nine:";
      case "skip":
        return ":fast_forward:";
      case true:
        return ":ballot_box_with_check:";
      case false:
        return ":negative_squared_cross_mark:";
    }
  });
  let progressBar =
    chars.join("") +
    ":orange_square:" +
    ":black_square_button:".repeat(
      data.progress.total - data.progress.current.length - 1,
    );
  return new EmbedBuilder()
    .setTitle(`Rating in progress: \`${data.animeTitle}\``)
    .setColor(percentageToColor((data.score.current / data.score.total) * 100))
    .addFields(
      { name: "Topic", value: data.section },
      { name: "Question", value: data.prompt },
      { name: "Progress", value: progressBar },
    );
}

function promptToComponent(prompt: Prompt) {
  let actionRow = new ActionRowBuilder<
    StringSelectMenuBuilder | ButtonBuilder
  >();
  let additionalRows: ActionRowBuilder<
    StringSelectMenuBuilder | ButtonBuilder
  >[] = [];
  switch (prompt.type) {
    case "number":
      let options: StringSelectMenuOptionBuilder[] = [];
      for (let i = 0; i <= prompt.max; i++) {
        options.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(i.toString())
            .setValue(i.toString()),
        );
      }
      actionRow.addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(prompt.id)
          .addOptions(options),
      );
      switch (prompt.optional) {
        case "skip":
          const skip = new ButtonBuilder()
            .setCustomId("skip")
            .setLabel("Skip")
            .setStyle(ButtonStyle.Secondary);

          additionalRows.push(
            new ActionRowBuilder<
              StringSelectMenuBuilder | ButtonBuilder
            >().addComponents(skip),
          );
          break;
      }
      break;
    case "boolean":
      const yes = new ButtonBuilder()
        .setCustomId("yes")
        .setLabel("Yes")
        .setStyle(ButtonStyle.Primary);
      const no = new ButtonBuilder()
        .setCustomId("no")
        .setLabel("No")
        .setStyle(ButtonStyle.Secondary);
      actionRow.addComponents(yes, no);
      break;
  }
  return [actionRow, ...additionalRows];
}
