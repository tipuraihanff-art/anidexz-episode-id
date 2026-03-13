// api/episode.js — GET /api/episode?title=...&ep=N
export const config = { runtime: "edge" };

const BASE = "https://aniwatchtv.to";
const H = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: BASE + "/",
  "X-Requested-With": "XMLHttpRequest",
};

export default async function handler(req) {
  if (req.method === "OPTIONS") return cors204();
  if (req.method !== "GET") return err("METHOD_NOT_ALLOWED", "Use GET", 405);

  const sp = new URL(req.url).searchParams;
  const title = (sp.get("title") || "").trim().slice(0, 200);
  if (!title) return err("MISSING_PARAM", "Required param: title", 400);
  const epNum = parseInt(sp.get("ep"), 10);
  if (isNaN(epNum) || epNum < 1 || epNum > 9999)
    return err("INVALID_PARAM", "ep must be integer 1–9999", 400);

  try {
    const raw = await searchAnime(title);
    if (!raw.length) return err("NOT_FOUND", `No anime found for: "${title}"`, 404);
    const ranked = rankMatches(raw, title);
    if (!ranked.length) return err("NOT_FOUND", `No close match for: "${title}"`, 404);
    const anime = ranked[0];

    const eps = await fetchEpisodes(anime.id);
    if (!eps.length) return err("NO_EPISODES", "No episodes found", 404);

    const ep = eps.find(e => e.number === epNum);
    if (!ep) return err("EPISODE_NOT_FOUND", `Episode ${epNum} not found. Available: 1–${eps.length}`, 404);

    return ok({
      episodeId: ep.episodeId,
      episodeNumber: epNum,
      totalEpisodes: eps.length,
      url: `${BASE}/watch/${anime.id}?ep=${ep.episodeId}`,
      anime: { id: anime.id, name: anime.name, score: Math.round(anime.score) },
    });
  } catch (e) {
    if (e && e.code) return err(e.code, e.message || e.code, e.status || 500, e.status === 429 ? { "Retry-After": "60" } : {});
    return err("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

async function searchAnime(query) {
  const res = await fetch(`${BASE}/search?keyword=${encodeURIComponent(query)}`, { headers: H });
  if (!res.ok) { if (res.status === 429) throw { code: "UPSTREAM_RATE_LIMITED", status: 429 }; throw { code: "UPSTREAM_ERROR", status: 502, message: `Search failed: ${res.status}` }; }
  return parseSearchResults(await res.text());
}

async function fetchEpisodes(animeId) {
  const numId = animeId.match(/(\d+)$/)?.[1];
  if (!numId) throw { code: "INVALID_ANIME_ID", status: 400, message: `Cannot extract ID from: ${animeId}` };
  const res = await fetch(`${BASE}/ajax/v2/episode/list/${numId}`, { headers: { ...H, Referer: `${BASE}/${animeId}` } });
  if (!res.ok) { if (res.status === 429) throw { code: "UPSTREAM_RATE_LIMITED", status: 429 }; throw { code: "UPSTREAM_ERROR", status: 502, message: `Episodes failed: ${res.status}` }; }
  const data = await res.json();
  if (!data.status || !data.html) throw { code: "UNEXPECTED_RESPONSE", status: 502, message: "Invalid AniWatch response" };
  return parseEpisodeList(data.html);
}

function parseSearchResults(html) {
  const results = [], seen = new Set();
  let m;
  const re = /<a[^>]+href="\/([a-z0-9][a-z0-9-]+-\d{4,6})"[^>]*class="[^"]*dynamic-name[^"]*"[^>]*>([^<]+)<\/a>/g;
  while ((m = re.exec(html)) !== null) {
    const id = m[1].trim(), name = m[2].trim();
    if (id && name && !seen.has(id)) { seen.add(id); results.push({ id, name }); }
  }
  if (!results.length) {
    const fb = /href="\/([a-z][a-z0-9-]+-\d{4,6})"/g;
    while ((m = fb.exec(html)) !== null) {
      if (!seen.has(m[1])) { seen.add(m[1]); results.push({ id: m[1], name: m[1].replace(/-\d+$/, "").split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") }); }
    }
  }
  return results;
}

function parseEpisodeList(html) {
  const eps = [], seen = new Set();
  const re = /<a\b([^>]*)>/g; let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    const num = attrs.match(/data-number="(\d+)"/);
    const id  = attrs.match(/data-id="(\d+)"/);
    if (!num || !id) continue;
    const number = +num[1], episodeId = +id[1];
    if (!isNaN(number) && !isNaN(episodeId) && !seen.has(episodeId)) { seen.add(episodeId); eps.push({ number, episodeId }); }
  }
  return eps.sort((a, b) => a.number - b.number);
}

function rankMatches(results, query) {
  const q = query.toLowerCase().trim(), words = q.split(/\s+/).filter(Boolean);
  return results.map(r => {
    const name = r.name.toLowerCase(), slug = r.id.toLowerCase();
    let score = 0;
    if (name === q) score += 100;
    else if (name.startsWith(q)) score += 70;
    else if (name.includes(q)) score += 50;
    else if (slug.includes(q.replace(/\s+/g, "-"))) score += 40;
    score += (words.filter(w => name.includes(w) || slug.includes(w)).length / words.length) * 30;
    return { ...r, score };
  }).filter(r => r.score > 0).sort((a, b) => b.score - a.score);
}

function ok(data) {
  return new Response(JSON.stringify(data, null, 2), { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } });
}
function err(code, message, status, extra = {}) {
  return new Response(JSON.stringify({ error: { code, message } }, null, 2), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store", ...extra } });
}
function cors204() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
