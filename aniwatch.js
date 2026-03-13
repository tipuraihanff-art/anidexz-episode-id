// lib/aniwatch.js — shared helpers for all API routes

export const BASE = "https://aniwatchtv.to";

export const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: BASE + "/",
  "X-Requested-With": "XMLHttpRequest",
};

// ─── HTTP helpers ────────────────────────────────────────────────────────────

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": status === 200 ? "s-maxage=3600, stale-while-revalidate=86400" : "no-store",
      ...extra,
    },
  });
}

export function err(code, message, status, extra = {}) {
  return json({ error: { code, message } }, status, extra);
}

export function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// ─── Aniwatch API calls ──────────────────────────────────────────────────────

export async function searchAnime(query) {
  const url = `${BASE}/search?keyword=${encodeURIComponent(query.trim())}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    if (res.status === 429) throw { code: "UPSTREAM_RATE_LIMITED", status: 429 };
    throw { code: "UPSTREAM_ERROR", status: 502, message: `Search failed: ${res.status}` };
  }
  const html = await res.text();
  return parseSearchResults(html);
}

export async function fetchEpisodes(animeId) {
  const numericId = animeId.match(/(\d+)$/)?.[1];
  if (!numericId) throw { code: "INVALID_ANIME_ID", status: 400, message: `Cannot extract numeric ID from: ${animeId}` };

  const url = `${BASE}/ajax/v2/episode/list/${numericId}`;
  const res = await fetch(url, {
    headers: { ...HEADERS, Referer: `${BASE}/${animeId}` },
  });
  if (!res.ok) {
    if (res.status === 429) throw { code: "UPSTREAM_RATE_LIMITED", status: 429 };
    throw { code: "UPSTREAM_ERROR", status: 502, message: `Episode list failed: ${res.status}` };
  }

  const data = await res.json();
  if (!data.status || !data.html) throw { code: "UNEXPECTED_RESPONSE", status: 502, message: "Invalid episode list response from AniWatch" };

  return parseEpisodeList(data.html);
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

function parseSearchResults(html) {
  const results = [];
  const seen = new Set();

  // Primary: dynamic-name anchors carry the human-readable title
  const nameRe = /<a[^>]+href="\/([a-z0-9][a-z0-9\-]+-\d{4,6})"[^>]*class="[^"]*dynamic-name[^"]*"[^>]*>([^<]+)<\/a>/g;
  let m;
  while ((m = nameRe.exec(html)) !== null) {
    const id = m[1].trim();
    const name = m[2].trim();
    if (id && name && !seen.has(id)) {
      seen.add(id);
      results.push({ id, name });
    }
  }

  // Fallback: grab slugs from any href and infer name from slug
  if (results.length === 0) {
    const slugRe = /href="\/([a-z][a-z0-9\-]+-\d{4,6})"/g;
    while ((m = slugRe.exec(html)) !== null) {
      const id = m[1];
      if (!seen.has(id)) {
        seen.add(id);
        results.push({ id, name: slugToName(id) });
      }
    }
  }

  return results;
}

function parseEpisodeList(html) {
  const episodes = [];
  const seen = new Set();

  // Handle both attribute orderings: data-number first OR data-id first
  const re = /data-(?:number|id)="(\d+)"[^>]*data-(?:id|number)="(\d+)"/g;
  // We need to know which attr came first, so match them individually
  const fullRe = /<a\b([^>]*)>/g;
  let m;
  while ((m = fullRe.exec(html)) !== null) {
    const attrs = m[1];
    const numMatch = attrs.match(/data-number="(\d+)"/);
    const idMatch  = attrs.match(/data-id="(\d+)"/);
    if (!numMatch || !idMatch) continue;
    const number    = parseInt(numMatch[1], 10);
    const episodeId = parseInt(idMatch[1], 10);
    if (!isNaN(number) && !isNaN(episodeId) && !seen.has(episodeId)) {
      seen.add(episodeId);
      episodes.push({ number, episodeId });
    }
  }

  return episodes.sort((a, b) => a.number - b.number);
}

// ─── Matching ─────────────────────────────────────────────────────────────────

export function rankMatches(results, query) {
  const q = query.toLowerCase().trim();
  const qSlug = q.replace(/\s+/g, "-");
  const qWords = q.split(/\s+/).filter(Boolean);

  return results
    .map((r) => {
      const name = r.name.toLowerCase();
      const slug = r.id.toLowerCase();
      let score = 0;

      if (name === q) score += 100;                          // exact name match
      else if (slug === qSlug) score += 90;                  // exact slug match
      else if (name.startsWith(q)) score += 70;              // name starts with query
      else if (name.includes(q)) score += 50;                // name contains query
      else if (slug.includes(qSlug)) score += 40;            // slug contains slug-form

      // word-level scoring
      const matched = qWords.filter((w) => name.includes(w) || slug.includes(w));
      score += (matched.length / qWords.length) * 30;

      return { ...r, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function slugToName(slug) {
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function validateTitle(raw) {
  if (!raw || typeof raw !== "string") return null;
  return raw.trim().slice(0, 200); // clamp length
}

export function validateEp(raw) {
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 1 || n > 9999) return null;
  return n;
}
