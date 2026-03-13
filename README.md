<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=AniDexz%20Episode%20API&fontSize=50&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Anime%20Episode%20IDs%20%E2%80%94%20Instant%2C%20Free%2C%20Open%20Source&descAlignY=55&descSize=18" width="100%"/>

<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdmNnRibnVxbnVodXp6NHY5NzBtNXozemF5MDhuaWx5eTFuMGcyNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/hv5AEBpH3ZyNoRnABG/giphy.gif" width="150"/>

<br/>

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

<br/>

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Platform](https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-ff69b4?style=for-the-badge)
![Anime](https://img.shields.io/badge/Powered%20By-Anime-FF6B9D?style=for-the-badge&logo=crunchyroll&logoColor=white)
![Status](https://img.shields.io/badge/Status-Online-00D26A?style=for-the-badge&logo=statuspage&logoColor=white)
![PRs](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge&logo=github&logoColor=white)

<br/>

> 🔍 Search any anime → 📺 Get episode ID → 🎬 Stream instantly

</div>

---

<div align="center">

## ⚠️ IMPORTANT — DO NOT FORK

<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2lqd2ZwMGw3NG13NmR0eTVnNHRiemx2czYwNXJ3aWxsMTkxb2MzMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LRVnPYqM8DLag/giphy.gif" width="100"/>

</div>

```
❌ Don't fork   →   you'll miss all future updates
✅ Do this      →   connect this repo directly to Render
```

> When you connect the **original repo** to Render, every update we push automatically redeploys your service. Free upgrades, forever. 🚀

---

## 🌸 What is this?

<img align="right" src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzk5aGN5ejZlMWtlYzQ0NXQ5NXlxMzhzbWs2dXoxbjZrNmE3dXBsMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l3q2zbskZp2j8wniE/giphy.gif" width="120"/>

A blazing fast **Node.js REST API** that:

- 🔎 Searches **aniwatchtv.to** for any anime title
- 🧠 Smart-picks **Season 1** automatically if no season specified
- 🎯 Returns the exact **episode ID** and **watch URL**
- ⚡ Zero dependencies — pure Node.js built-ins only
- 🆓 100% free to host on Render

<br clear="right"/>

---

## ⚡ Quick Demo

```bash
curl "https://your-app.onrender.com/api/episode?title=Solo+Leveling&ep=1"
```

```json
{
  "episodeId": 134524,
  "episodeNumber": 1,
  "totalEpisodes": 13,
  "url": "https://aniwatchtv.to/watch/solo-leveling-19413?ep=134524"
}
```

> That's it. One request. Done. 💅

---

## 🚀 Deploy in 60 seconds

<details>
<summary><b>🟢 Render (Recommended — Free)</b></summary>

<br/>

1. Click the button below 👇
2. Connect your GitHub account
3. Set **build command** → `npm install`
4. Set **start command** → `node index.js`
5. Hit **Deploy** and grab your URL

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

</details>

<details>
<summary><b>💻 Run Locally</b></summary>

<br/>

```bash
git clone https://github.com/tipuraihanff-art/anidexz-episode-id
cd anidexz-episode-id
node index.js
# → Running on port 3000
```

Then hit `http://localhost:3000/api/episode?title=Naruto&ep=1`

</details>

---

## 📡 API Reference

### `GET /api/episode`

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Anime title — fuzzy match supported |
| `ep` | number | ✅ | Episode number |

### 🎯 Example Requests

```bash
# Basic
/api/episode?title=Naruto&ep=1

# With spaces
/api/episode?title=Demon+Slayer&ep=5

# Specific season
/api/episode?title=Attack+on+Titan+Season+4&ep=1

# Auto picks Season 1
/api/episode?title=Solo+Leveling&ep=10

# Long titles work too
/api/episode?title=Jujutsu+Kaisen+Culling+Game&ep=10
```

### 📬 Responses

<details>
<summary><b>✅ 200 — Success</b></summary>

```json
{
  "episodeId": 134524,
  "episodeNumber": 1,
  "totalEpisodes": 13,
  "url": "https://aniwatchtv.to/watch/solo-leveling-19413?ep=134524"
}
```
</details>

<details>
<summary><b>❌ 404 — Not Found</b></summary>

```json
{ "error": "Anime not found: \"xyz\"" }
```
</details>

<details>
<summary><b>⚠️ 400 — Bad Request</b></summary>

```json
{ "error": "Missing param: title" }
```
</details>

---

## 🧩 Use the Episode ID

### 🎬 MegaPlay Embed

Plug the `episodeId` straight into [megaplay.buzz](https://megaplay.buzz):

```
https://megaplay.buzz/stream/s-2/{episodeId}/sub
https://megaplay.buzz/stream/s-2/{episodeId}/dub
```

```html
<!-- Drop this in your site -->
<iframe
  src="https://megaplay.buzz/stream/s-2/134524/sub"
  width="100%"
  height="500"
  frameborder="0"
  allowfullscreen>
</iframe>
```

### 🔗 Direct Watch Link

The `url` field in the response opens the episode directly on aniwatchtv.to — no extra steps needed.

---

## 🧠 How it Works

```
┌─────────────────────────────────────────────────┐
│                  Your Request                    │
│         ?title=Solo Leveling&ep=1               │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│           Step 1: Search AniWatch               │
│   /ajax/search/suggest?keyword=Solo+Leveling    │
│         (falls back to search page)             │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│           Step 2: Smart Ranking                 │
│   • Exact match scores highest                  │
│   • Sequels penalized -80pts if no season asked │
│   • Picks best match automatically              │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│          Step 3: Fetch Episode List             │
│      /ajax/v2/episode/list/{animeId}            │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│              Step 4: Return                     │
│    episodeId + episodeNumber + url ✅           │
└─────────────────────────────────────────────────┘
```

---

## 🗂️ Project Structure

```
📦 anidexz-episode-id
 ┣ 📄 index.js      ← entire API in one file
 ┣ 📄 package.json  ← node config
 ┗ 📄 README.md     ← you are here
```

---

## 🤝 Contributing

```bash
# 1. Clone
git clone https://github.com/tipuraihanff-art/anidexz-episode-id

# 2. Make changes to index.js

# 3. Test locally
node index.js

# 4. Open a PR ❤️
```

![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge&logo=github)

---

<div align="center">

## 🌟 Support

If this helped you, drop a ⭐ on the repo — it means a lot!

<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXIweHB0MGN6NHVocWZ3bWR3eWwxOGRsNzN6NHV6MW9iNzd6ZmZpNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/26BRuo6sLetdllPAQ/giphy.gif" width="200"/>

<br/>

made with 🍜 and too much anime

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

</div>
