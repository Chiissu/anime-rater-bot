type Criteria = { title: string; optional?: false | "idk" | "skip" } & (
  | {
      type: "number";
      max: number;
      notRated?: true;
    }
  | {
      type: "boolean" | "string" | "confirm";
    }
);

interface Section {
  criterion: Criteria[];
  title: string;
}

const promptData: Section[] = [
  {
    title: "Visual Quality",
    criterion: [
      { title: "How is the animation?", type: "number", max: 2 },
      { title: "How is the artistic style?", type: "number", max: 2 },
      {
        title: "How is the character design and characterisation?",
        type: "number",
        max: 2,
      },
      {
        title: "How welling are you to use GIFs from this anime?",
        type: "number",
        max: 2,
        optional: "skip",
      },
    ],
  },
  {
    title: "Plot",
    criterion: [
      { title: "How funny is this anime?", type: "number", max: 3 },
      { title: "How good are the twists?", type: "number", max: 3 },
      { title: "How immersive is the world?", type: "number", max: 2 },
      { title: "How touchy is the story?", type: "number", max: 2 },
      { title: "How is the ending?", type: "number", max: 2 },
    ],
  },
  {
    title: "Music",
    criterion: [
      { title: "How catchy is the OP/ED", type: "number", max: 2 },
      { title: "How good is the background music?", type: "number", max: 2 },
      {
        title: "How good are the maps on rhythm games?",
        type: "number",
        max: 2,
        optional: "skip",
      },
    ],
  },
  {
    title: "Misc",
    criterion: [
      {
        title: "How SFW is this anime?",
        type: "number",
        max: 2,
      },
      {
        title: "How easy is it to buy merch for this Anime?",
        type: "number",
        max: 2,
        optional: "skip",
      },
    ],
  },
  {
    title: "Response Privacy",
    criterion: [
      {
        title: "Do you want to add this response to our own database?",
        type: "boolean",
      },
      {
        title: "Do you want to send this rating publicly in this chat?",
        type: "boolean",
      },
    ],
  },
];

export type Prompt = Omit<
  Criteria & {
    id: string;
    sectionTitle: string;
    prompt: string;
  },
  "title"
>;

let prompts: Prompt[] = [];

for (let [sectionIndex, section] of promptData.entries()) {
  for (let [criteriaIndex, criteria] of section.criterion.entries()) {
    let id = `${sectionIndex + 1}-${criteriaIndex + 1}`,
      optional = criteria.optional,
      sectionTitle = section.title,
      prompt = criteria.title;
    switch (criteria.type) {
      case "string":
      case "boolean":
      case "confirm":
        prompts.push({
          id,
          optional,
          sectionTitle,
          prompt,
          type: criteria.type,
        });
        break;
      case "number":
        prompts.push({
          id,
          optional,
          sectionTitle,
          prompt,
          type: "number",
          notRated: criteria.notRated,
          max: criteria.max,
        });
        break;
    }
  }
}
export { prompts };
