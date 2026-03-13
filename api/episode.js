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
  const sp = new URL(req.url).searchParams;
  const title = (sp.get("title") || "").trim();
  const epNum = parseInt(sp.get("ep"), 10);

  if (!title) return res({ error: "Missing param: title" }, 400);
  if (isNaN(epNum) || epNum < 1) return res({ error: "Missing param: ep" }, 400);

  try {
    // Use the suggest/autocomplete AJAX endpoint — returns JSON, no JS rendering needed
    const suggestRes = await fetch(
      `${BASE}/ajax/search/suggest?keyword=${encodeURIComponent(title)}`,
      { headers: H }
    );
    const suggestData = await suggestRes.json();

    let animeId = null;
    let animeName = null;

    if (suggestData.status && suggestData.html) {
      // Parse the suggestion HTML for the first anime link
      const match = suggestData.html.match(/href="\/([a-z0-9][a-z0-9-]+-\d{4,6})"/);
      if (match) {
        animeId = match[1];
        const nameMatch = suggestData.html.match(/class="[^"]*film-name[^"]*"[^>]*>([^<]+)</);
        animeName = nameMatch ? nameMatch[1].trim() : animeId;
      }
    }

    if (!animeId) return res({ error: `Anime not found: "${title}"` }, 404);

    // Fetch episode list
    const numId = animeId.match(/(\d+)$/)?.[1];
    const epRes = await fetch(`${BASE}/ajax/v2/episode/list/${numId}`, {
      headers: { ...H, Referer: `${BASE}/${animeId}` },
    });
    const epData = await epRes.json();
    if (!epData.status || !epData.html) return res({ error: "Failed to fetch episodes" }, 502);

    const episodes = parseEpisodes(epData.html);
    if (!episodes.length) return res({ error: "No episodes found" }, 404);

    const ep = episodes.find(e => e.number === epNum);
    if (!ep) return res({ error: `Episode ${epNum} not found. Total episodes: ${episodes.length}` }, 404);

    return res({
      episodeId: ep.episodeId,
      episodeNumber: epNum,
      totalEpisodes: episodes.length,
      url: `${BASE}/watch/${animeId}?ep=${ep.episodeId}`,
      animeName,
      animeId,
    });
  } catch (e) {
    return res({ error: "Internal error: " + e.message }, 500);
  }
}

function parseEpisodes(html) {
  const eps = [], seen = new Set();
  const re = /<a\b([^>]*)>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const num = m[1].match(/data-number="(\d+)"/);
    const id  = m[1].match(/data-id="(\d+)"/);
    if (!num || !id) continue;
    const number = +num[1], episodeId = +id[1];
    if (!seen.has(episodeId)) {
      seen.add(episodeId);
      eps.push({ number, episodeId });
    }
  }
  return eps.sort((a, b) => a.number - b.number);
}

function res(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": status === 200 ? "s-maxage=3600" : "no-store",
    },
  });
}
