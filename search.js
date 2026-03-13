// api/search.js
// GET /api/search?title=Jujutsu+Kaisen
// Returns ranked list of matching anime (up to 10) without fetching episodes.
// Use this to discover the exact anime ID before calling /api/episode.

import {
  searchAnime, rankMatches,
  validateTitle,
  json, err, handleOptions,
} from "../lib/aniwatch.js";

export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "GET") return err("METHOD_NOT_ALLOWED", "Use GET", 405);

  const { searchParams } = new URL(req.url);

  const title = validateTitle(searchParams.get("title"));
  if (!title) return err("MISSING_PARAM", "Required param: title", 400);

  const limitRaw = parseInt(searchParams.get("limit") ?? "5", 10);
  const limit = isNaN(limitRaw) || limitRaw < 1 ? 5 : Math.min(limitRaw, 10);

  try {
    const raw = await searchAnime(title);
    if (!raw.length) return err("NOT_FOUND", `No results for: "${title}"`, 404);

    const ranked = rankMatches(raw, title).slice(0, limit);

    return json({
      query: title,
      results: ranked.map(({ id, name, score }) => ({
        id,
        name,
        score: Math.round(score),
        url: `https://aniwatchtv.to/${id}`,
      })),
    });
  } catch (e) {
    if (e.code) {
      const retryHeader = e.status === 429 ? { "Retry-After": "60" } : {};
      return err(e.code, e.message ?? e.code, e.status, retryHeader);
    }
    console.error("[search]", e);
    return err("INTERNAL_ERROR", "Unexpected error", 500);
  }
}
