import { Database } from "bun:sqlite";

const db = new Database("db.sqlite", { create: true });

db.run(
  "CREATE TABLE IF NOT EXISTS ratings (timestamp INTEGER, userID TEXT, guildID TEXT, anilistID INTEGER, anilistName TEXT, season TEXT, results TEXT);",
);

interface Entry {
  userID: string;
  guildID: string;
  anilistID: number;
  anilistName: string;
  results: string;
  timestamp: number;
}

type FiveNums = [number, number, number, number, number];

let insertQuery = db.query(
  "INSERT INTO ratings (userID, guildID, anilistID, anilistName, results, timestamp) VALUES (?1, ?2, ?3, ?4, ?5, ?6);",
);
let checkQuery = db.query(
  "SELECT * FROM ratings WHERE userID = $1 AND anilistID = $2;",
);
let updateQuery = db.query(
  "UPDATE ratings SET results = $4, guildID = $2, timestamp = $5 WHERE userID = $1 AND anilistID = $3;",
);
export function saveData(data: {
  userID: string;
  guildID: string;
  anilistID: number;
  anilistName: string;
  results: number[];
}) {
  if (checkQuery.all(data.userID, data.anilistID).length != 0) {
    updateQuery.run(
      data.userID,
      data.guildID,
      data.anilistID,
      JSON.stringify(data.results),
      Date.now(),
    );
  } else {
    insertQuery.run(
      data.userID,
      data.guildID,
      data.anilistID,
      data.anilistName,
      JSON.stringify(data.results),
      Date.now(),
    );
  }
}

function quantitySort(idsArray: string[]) {
  const idCounts: Record<string, number> = {};
  idsArray.forEach((id) => {
    if (id == "0") return;
    idCounts[id] = (idCounts[id] || 0) + 1;
  });

  const objectList = Object.entries(idCounts).map(([id, quantity]) => ({
    id,
    quantity,
  }));

  objectList.sort((a, b) => b.quantity - a.quantity);
  return objectList;
}
let globalQuery = db.query("SELECT * FROM ratings;");
export function globalLeaderboard(by: "guild" | "user" | "popularity") {
  let results = globalQuery.all() as Entry[];
  let idList = (() => {
    switch (by) {
      case "guild":
        return results.map((n) => n.guildID);
      case "user":
        return results.map((n) => n.userID);
      case "popularity":
        return results.map((n) => n.anilistName);
    }
  })();
  return quantitySort(idList);
}
export function ratingLeaderboard(type?: "trending") {
  let results = globalQuery.all() as Entry[];
  let scoresStore = new Map<
    number,
    { scores: FiveNums; size: number; name: string }
  >();
  for (let result of results) {
    if (type == "trending" && result.timestamp < Date.now() - 2629743000)
      continue;
    let data = scoresStore.get(result.anilistID) ?? {
      scores: [0, 0, 0, 0, 0],
      size: 0,
      name: result.anilistName,
    };
    data.size++;

    const scoreList = JSON.parse(result.results) as FiveNums;

    for (let [i, score] of scoreList.entries()) {
      data.scores[i] += score;
    }
    scoresStore.set(result.anilistID, data);
  }

  let scores: { score: number; id: number; name: string }[] = [];
  for (let [id, scoreData] of scoresStore) {
    const score = toAverageScore(
      scoreData.scores.map((score) => score / scoreData.size) as FiveNums,
    );
    scores.push({ score, id, name: scoreData.name });
  }

  return scores.sort((a, b) => b.score - a.score);
}

let animeStateQuery = db.query(
  "SELECT * FROM ratings WHERE anilistID = $param;",
);
export function getScore(anilistId: number) {
  let results = animeStateQuery.all(anilistId) as { results: string }[];
  let finalScores = [0, 0, 0, 0, 0];
  for (let result of results) {
    let scores = JSON.parse(result.results) as FiveNums;
    for (let [i, score] of scores.entries()) {
      finalScores[i] += score;
    }
  }
  return {
    size: results.length,
    average: finalScores.map((n) => n / results.length),
  };
}

const serverQuery = db.query("SELECT * FROM ratings WHERE guildID = $param;");

export function serverLeaderboard(guildID: string) {
  let serverRatings = serverQuery.all(guildID) as Entry[];
  return quantitySort(serverRatings.map((n) => n.userID));
}
export function serverStat(guildID: string) {
  let serverRatings = serverQuery.all(guildID) as Entry[];
  let totalScore = 0;
  for (let rating of serverRatings) {
    totalScore += toAverageScore(JSON.parse(rating.results) as FiveNums);
  }
  return {
    quantity: serverRatings.length,
    averageScore: totalScore / serverRatings.length,
    globalRanking:
      globalLeaderboard("guild").findIndex((svr) => svr.id == guildID) + 1,
  };
}

export function globalStats() {
  let allResults = globalQuery.all() as Entry[];

  let titlesStore = new Set();
  let usersStore = new Set();
  let serversStore = new Set();
  let totalScore = 0;

  for (let res of allResults) {
    titlesStore.add(res.anilistID);
    usersStore.add(res.userID);
    serversStore.add(res.guildID);
    totalScore += toAverageScore(JSON.parse(res.results) as FiveNums);
  }

  return {
    quantity: allResults.length,
    averageRating: totalScore / allResults.length,
    titles: titlesStore.size,
    users: usersStore.size,
    servers: serversStore.size,
  };
}

export function userLeaderboard(userID: string) {
  let serverRatings = serverQuery.all(userID) as Entry[];
  let totalScore = 0;
  for (let rating of serverRatings) {
    totalScore += toAverageScore(JSON.parse(rating.results) as FiveNums);
  }
  return {
    quantity: serverRatings.length,
    averageScore: totalScore / serverRatings.length,
    topMembers: quantitySort(serverRatings.map((n) => n.userID)),
    globalRanking:
      globalLeaderboard("user").findIndex((user) => user.id == userID) + 1,
  };
}

const userQuery = db.query("SELECT * FROM ratings WHERE userID = $param;");
export function userStat(userID: string) {
  let userRatings = userQuery.all(userID) as Entry[];
  let totalScore = 0;
  for (let rating of userRatings) {
    totalScore += toAverageScore(JSON.parse(rating.results) as FiveNums);
  }
  return {
    quantity: userRatings.length,
    averageScore: totalScore / userRatings.length,
    globalRanking:
      globalLeaderboard("user").findIndex((user) => user.id == userID) + 1,
  };
}

function toAverageScore(scores: FiveNums) {
  let maxes = [8, 12, 6, 2, 2];
  let totalMax = 30;
  let total = 0;
  for (let [i, percentage] of scores.entries()) {
    total += percentage * maxes[i];
  }
  return total / totalMax;
}
