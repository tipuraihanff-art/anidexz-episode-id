# AniWatch Episode API v2

Vercel Edge Functions to look up episode IDs on [aniwatchtv.to](https://aniwatchtv.to).

## Endpoints

### `GET /api/episode` — main endpoint
Returns the episode ID and watch URL for a given title + episode number.

| Param | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Anime title — partial/fuzzy match supported |
| `ep` | ✅ | Episode number (1–9999) |

```
GET /api/episode?title=Jujutsu+Kaisen+Culling+Game&ep=10
```

```json
{
  "episodeId": 168082,
  "episodeNumber": 10,
  "totalEpisodes": 21,
  "url": "https://aniwatchtv.to/watch/jujutsu-kaisen-the-culling-game-part-1-20401?ep=168082",
  "anime": {
    "id": "jujutsu-kaisen-the-culling-game-part-1-20401",
    "name": "Jujutsu Kaisen: The Culling Game Part 1",
    "score": 90
  }
}
```

---

### `GET /api/search` — discover anime IDs
Returns ranked list of matching anime. Use when you need to confirm the exact match before fetching episodes.

| Param | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Anime title |
| `limit` | ❌ | Max results (1–10, default 5) |

```
GET /api/search?title=Jujutsu+Kaisen&limit=3
```

```json
{
  "query": "Jujutsu Kaisen",
  "results": [
    { "id": "jujutsu-kaisen-3rd-season-19551", "name": "Jujutsu Kaisen 3rd Season", "score": 83, "url": "https://aniwatchtv.to/jujutsu-kaisen-3rd-season-19551" },
    { "id": "jujutsu-kaisen-the-culling-game-part-1-20401", "name": "Jujutsu Kaisen: The Culling Game Part 1", "score": 78, "url": "https://aniwatchtv.to/jujutsu-kaisen-the-culling-game-part-1-20401" },
    { "id": "jujutsu-kaisen-18518", "name": "Jujutsu Kaisen", "score": 71, "url": "https://aniwatchtv.to/jujutsu-kaisen-18518" }
  ]
}
```

---

### `GET /api/episodes` — full episode list
Returns all episodes for a known anime slug.

| Param | Required | Description |
|-------|----------|-------------|
| `id` | ✅ | Anime slug from `/api/search` results |

```
GET /api/episodes?id=jujutsu-kaisen-the-culling-game-part-1-20401
```

```json
{
  "animeId": "jujutsu-kaisen-the-culling-game-part-1-20401",
  "totalEpisodes": 21,
  "episodes": [
    { "number": 1, "episodeId": 167980, "url": "https://aniwatchtv.to/watch/jujutsu-kaisen-...?ep=167980" },
    { "number": 2, "episodeId": 167981, "url": "..." }
  ]
}
```

---

### `GET /api/health`
```json
{ "status": "ok", "ts": "2024-01-01T00:00:00.000Z" }
```

---

## Error format

All errors return a consistent shape:

```json
{
  "error": {
    "code": "EPISODE_NOT_FOUND",
    "message": "Episode 99 not found. Available: 1–21"
  }
}
```

| Code | HTTP | Meaning |
|------|------|---------|
| `MISSING_PARAM` | 400 | Required query param not provided |
| `INVALID_PARAM` | 400 | Param has invalid format or value |
| `NOT_FOUND` | 404 | No anime matched the search |
| `EPISODE_NOT_FOUND` | 404 | That episode number doesn't exist |
| `NO_EPISODES` | 404 | Anime found but has no episodes listed |
| `UPSTREAM_ERROR` | 502 | AniWatch returned an error |
| `UPSTREAM_RATE_LIMITED` | 429 | AniWatch is throttling — check `Retry-After` header |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Deploy

```bash
npm i -g vercel
vercel
```

Or push to GitHub and import at [vercel.com/new](https://vercel.com/new). No build step, no config needed.

---

## How matching works

The `score` field on search results tells you how confident the match is:

| Score | Meaning |
|-------|---------|
| 100 | Exact name match |
| 90 | Exact slug match |
| 70 | Name starts with query |
| 50 | Name contains query |
| 40 | Slug contains query |
| +0–30 | Bonus for each matched word |

`/api/episode` always picks the highest-scoring result automatically.

---

## Typical workflow

```
1.  Search to confirm the right anime:
    GET /api/search?title=Jujutsu+Kaisen&limit=5

2a. Get a specific episode directly:
    GET /api/episode?title=Jujutsu+Kaisen+Culling+Game&ep=10

2b. Or get all episodes for a known slug:
    GET /api/episodes?id=jujutsu-kaisen-the-culling-game-part-1-20401
```
