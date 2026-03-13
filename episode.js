// api/episode.js
// GET /api/episode?title=Jujutsu+Kaisen&ep=10
// Returns the episode ID and full watch URL for a given anime + episode number.

import {
  searchAnime, fetchEpisodes, rankMatches,
  validateTitle, validateEp,
  json, err, handleOptions,
  BASE,
} from "../lib/aniwatch.js";

export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "GET") return err("METHOD_NOT_ALLOWED", "Use GET", 405);

  const { searchParams } = new URL(req.url);

  const title = validateTitle(searchParams.get("title"));
  if (!title) return err("MISSING_PARAM", "Required param: title", 400);

  const epNumber = validateEp(searchParams.get("ep"));
  if (epNumber === null) return err("INVALID_PARAM", "ep must be an integer between 1 and 9999", 400);

  try {
    // 1. Search
    const raw = await searchAnime(title);
    if (!raw.length) return err("NOT_FOUND", `No anime found for: "${title}"`, 404);

    // 2. Rank — pick best match
    const ranked = rankMatches(raw, title);
    if (!ranked.length) return err("NOT_FOUND", `No close match for: "${title}"`, 404);
    const anime = ranked[0];

    // 3. Episodes
    const episodes = await fetchEpisodes(anime.id);
    if (!episodes.length) return err("NO_EPISODES", "No episodes found for this anime", 404);

    const totalEpisodes = episodes.length;

    // 4. Find target episode
    const episode = episodes.find((e) => e.number === epNumber);
    if (!episode) {
      return err(
        "EPISODE_NOT_FOUND",
        `Episode ${epNumber} not found. Available: 1–${totalEpisodes}`,
        404
      );
    }

    const url = `${BASE}/watch/${anime.id}?ep=${episode.episodeId}`;

    return json({
      episodeId: episode.episodeId,
      episodeNumber: epNumber,
      totalEpisodes,
      url,
      anime: {
        id: anime.id,
        name: anime.name,
        score: anime.score,
      },
    });
  } catch (e) {
    if (e.code) {
      const retryHeader = e.status === 429 ? { "Retry-After": "60" } : {};
      return err(e.code, e.message ?? e.code, e.status, retryHeader);
    }
    console.error("[episode]", e);
    return err("INTERNAL_ERROR", "Unexpected error", 500);
  }
}
