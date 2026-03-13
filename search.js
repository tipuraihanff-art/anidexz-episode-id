// api/search.js — GET /api/search?title=...&limit=5
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
  const limit = Math.min(Math.max(parseInt(sp.get("limit") || "5", 10) || 5, 1), 10);

  try {
    const res = await fetch(`${BASE}/search?keyword=${encodeURIComponent(title)}`, { headers: H });
    if (!res.ok) { if (res.status === 429) return err("UPSTREAM_RATE_LIMITED", "Rate limited", 429, { "Retry-After": "60" }); return err("UPSTREAM_ERROR", `Search failed: ${res.status}`, 502); }
    const raw = parseSearchResults(await res.text());
    if (!raw.length) return err("NOT_FOUND", `No results for: "${title}"`, 404);
    const ranked = rankMatches(raw, title).slice(0, limit);
    return ok({ query: title, results: ranked.map(({ id, name, score }) => ({ id, name, score: Math.round(score), url: `${BASE}/${id}` })) });
  } catch (e) {
    return err("INTERNAL_ERROR", "Unexpected error", 500);
  }
}

function parseSearchResults(html) {
  const results = [], seen = new Set(); let m;
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
