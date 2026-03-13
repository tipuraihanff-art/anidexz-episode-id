<div align="center">

# 🎌 AniDexz Episode API

<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdmNnRibnVxbnVodXp6NHY5NzBtNXozemF5MDhuaWx5eTFuMGcyNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/hv5AEBpH3ZyNoRnABG/giphy.gif" width="120"/>

**Search any anime by title → get the episode ID + watch link instantly**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

</div>

---

## ✨ What it does

Give it an anime title + episode number → get back the episode ID and direct watch URL from [aniwatchtv.to](https://aniwatchtv.to).

```
GET /api/episode?title=Solo+Leveling&ep=1
```

```json
{
  "episodeId": 134524,
  "episodeNumber": 1,
  "totalEpisodes": 13,
  "url": "https://aniwatchtv.to/watch/solo-leveling-19413?ep=134524"
}
```

---

## 🚀 Deploy

### One-click on Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Or manually:

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your repo and set:
   - **Build command:** `npm install`
   - **Start command:** `node index.js`
   - **Instance type:** Free
4. Hit **Deploy** 🎉

---

## 📡 API Reference

### `GET /api/episode`

| Param | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Anime title — partial/fuzzy match works |
| `ep` | ✅ | Episode number |

### Examples

```bash
# Season 1 (auto-picks S1 when no season specified)
curl "https://your-app.onrender.com/api/episode?title=Solo+Leveling&ep=5"

# Explicitly pick a season
curl "https://your-app.onrender.com/api/episode?title=Solo+Leveling+Season+2&ep=1"

# Other anime
curl "https://your-app.onrender.com/api/episode?title=Jujutsu+Kaisen&ep=10"
curl "https://your-app.onrender.com/api/episode?title=Demon+Slayer&ep=1"
```

### Responses

**200 OK**
```json
{
  "episodeId": 134524,
  "episodeNumber": 5,
  "totalEpisodes": 13,
  "url": "https://aniwatchtv.to/watch/solo-leveling-19413?ep=134524"
}
```

**404 Not Found**
```json
{ "error": "Anime not found: \"xyz\"" }
```

**400 Bad Request**
```json
{ "error": "Missing param: title" }
```

---

## 🗂️ Project Structure

```
📁 your-repo/
├── 📄 index.js       ← the whole API (single file)
├── 📄 package.json   ← node config
└── 📄 README.md
```

---

## ⚙️ How it works

```
1. Search aniwatchtv.to for the anime title (AJAX suggest → page scrape fallback)
2. Score + rank results, penalize sequels if no season specified
3. Fetch episode list via aniwatchtv.to/ajax/v2/episode/list/{id}
4. Return the episode ID and watch URL
```

---

## 🧩 Use with MegaPlay Embed

Got the `episodeId`? Plug it straight into [megaplay.buzz](https://megaplay.buzz):

```
https://megaplay.buzz/stream/s-2/{episodeId}/sub
https://megaplay.buzz/stream/s-2/{episodeId}/dub
```

```html
<iframe
  src="https://megaplay.buzz/stream/s-2/134524/sub"
  width="100%" height="500"
  frameborder="0" allowfullscreen>
</iframe>
```

---

<div align="center">

made with 🍜 and too much anime

<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3NqMHhpaHc0NWR6NThxNHM5a3dmMmx6NjBtejV6eTFsdHhsNGh6aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l3q2zbskZp2j8wniE/giphy.gif" width="80"/>

</div>
