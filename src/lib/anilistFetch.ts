type AnimeSearchResponse = {
  data: {
    Media: {
      id: number;
      title: {
        english: string;
        native: string;
      };
      description: string;
      format:
        | "TV"
        | "TV_SHORT"
        | "MOVIE"
        | "SPECIAL"
        | "OVA"
        | "ONA"
        | "MUSIC"
        | "MANGA"
        | "NOVEL"
        | "ONE_SHOT";
      season: "WINTER" | "SPRING" | "SUMMER" | "FALL";
      seasonYear: number;
      episodes: number;
      trailer: {
        site: string;
        id: string;
      } | null;
      coverImage: {
        medium: string;
        color: `#${string}`;
      };
      genres: string[];
      meanScore: number;
      studios: {
        nodes: {
          name: string;
        }[];
      };
      isAdult: boolean;
      siteUrl: string;
    } & (
      | {
          status: "RELEASING" | "NOT_YET_RELEASED";
          nextAiringEpisode: { timeUntilAiring: number };
        }
      | {
          status: "FINISHED" | "CANCELLED" | "HIATUS";
          nextAiringEpisode: null;
        }
    );
  };
};

export async function getTitle(query: string) {
  const apiUrl = "https://graphql.anilist.co";

  const requestBody = {
    query: `
query ($search: String) {
  Media(search: $search, type: ANIME) {
    id
    title {
      english
      native
    }
    description
    status
    format
    season
    seasonYear
    episodes
    trailer {
      site
	  id
    }
    coverImage {
      medium
      color
    }
    genres
    meanScore
    studios(isMain: true) {
      nodes {
        name
      }
    }
    isAdult
    nextAiringEpisode {
      timeUntilAiring
    }
    siteUrl
  }
}
        `,
    variables: {
      search: query,
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = (await response.json()) as AnimeSearchResponse;

    if (responseData.data.Media.title.english != query) return null;

    return responseData.data.Media;
  } catch (error) {
    console.error("Error querying AniList API:", error);
  }
}

export async function getAutocomplete(query: string) {
  const apiUrl = "https://graphql.anilist.co";

  const requestBody = {
    query: `
query ($search: String) {
  Page {
    media(search: $search, type: ANIME) {
      title {
        english
      }
    }
  }
}
        `,
    variables: {
      search: query,
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = (await response.json()) as {
      data: { Page: { media: { title: { english: string } }[] } };
    };

    return responseData.data.Page.media
      .map((val) => val.title.english)
      .filter((val) => !!val);
  } catch (error) {
    console.error("Error querying AniList API:", error);
  }
}

type AnimeSearchResponse = {
  data: {
    Media: {
      id: number;
      title: {
        english: string;
        native: string;
      };
      description: string;
      format:
        | "TV"
        | "TV_SHORT"
        | "MOVIE"
        | "SPECIAL"
        | "OVA"
        | "ONA"
        | "MUSIC"
        | "MANGA"
        | "NOVEL"
        | "ONE_SHOT";
      season: "WINTER" | "SPRING" | "SUMMER" | "FALL";
      seasonYear: number;
      episodes: number;
      trailer: {
        site: string;
        id: string;
      } | null;
      coverImage: {
        medium: string;
        color: `#${string}`;
      };
      genres: string[];
      meanScore: number;
      studios: {
        nodes: {
          name: string;
        }[];
      };
      isAdult: boolean;
      siteUrl: string;
    } & (
      | {
          status: "RELEASING" | "NOT_YET_RELEASED";
          nextAiringEpisode: { timeUntilAiring: number };
        }
      | {
          status: "FINISHED" | "CANCELLED" | "HIATUS";
          nextAiringEpisode: null;
        }
    );
  };
};

export async function getName(id: string) {
  const apiUrl = "https://graphql.anilist.co";

  const requestBody = {
    query: `
query ($search: String) {
  Media(search: $search, type: ANIME) {
    title {
      english
    }
    siteUrl
  }
}
        `,
    variables: {
      search: id,
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = (await response.json()) as AnimeSearchResponse;

    if (responseData.data.Media.title.english != id) return null;

    return responseData.data.Media;
  } catch (error) {
    console.error("Error querying AniList API:", error);
  }
}
