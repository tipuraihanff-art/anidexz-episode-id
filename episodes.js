// api/episodes.js
// GET /api/episodes?id=jujutsu-kaisen-the-culling-game-part-1-20401
// Returns the full episode list for an anime by its slug ID.
// Use the id value from /api/search results.

import {
  fetchEpisodes,
  json, err, handleOptions,
  BASE,
} from "../lib/aniwatch.js";

export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "GET") return err("METHOD_NOT_ALLOWED", "Use GET", 405);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim().toLowerCase();

  if (!id) return err("MISSING_PARAM", "Required param: id (anime slug)", 400);
  if (!/^[a-z0-9][a-z0-9\-]+-\d{4,6}$/.test(id)) {
    return err("INVALID_PARAM", "id must be a valid anime slug (e.g. jujutsu-kaisen-20401)", 400);
  }

  try {
    const episodes = await fetchEpisodes(id);
    if (!episodes.length) return err("NO_EPISODES", "No episodes found for this anime", 404);

    return json({
      animeId: id,
      totalEpisodes: episodes.length,
      episodes: episodes.map((e) => ({
        number: e.number,
        episodeId: e.episodeId,
        url: `${BASE}/watch/${id}?ep=${e.episodeId}`,
      })),
    });
  } catch (e) {
    if (e.code) {
      const retryHeader = e.status === 429 ? { "Retry-After": "60" } : {};
      return err(e.code, e.message ?? e.code, e.status, retryHeader);
    }
    console.error("[episodes]", e);
    return err("INTERNAL_ERROR", "Unexpected error", 500);
  }
}
