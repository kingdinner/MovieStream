# 🎬 MovieStream (KVFilmZone)

A modern, Netflix-inspired movie and TV series streaming platform powered by the **TMDB API** and **VidMario**. Built with a dark cinematic UI, real-time catalog discovery, multi-source playback resilience, and persistent watchlist management.

---

## ✨ Key Features

- **Cinematic Hero Carousel:** Auto-rotating featured spotlight with HD backdrops, TMDB ratings, genre tags, and instant **Play** / **More Info** actions.
- **Netflix-Inspired Discovery Rows:**
  - **🏅 Top 10 This Week** with custom SVG rank numerals (`1`–`10`).
  - Curated horizontal carousels for Trending, Popular, Top Rated, Action, Sci-Fi, Horror, Comedy, Crime, Anime, and K-Dramas.
- **Browse & Genre Filtering:** Dedicated **Movies** and **TV Shows** catalog views with genre filter pills, sort selectors (*Most Popular*, *Top Rated*, *Newest*), and infinite pagination.
- **Real-Time Multi-Search:** Debounced search across movies and TV series with instant poster grid results.
- **Series & Episode Guide:** Interactive season selector and episode list with episode stills, runtimes, air dates, and 1-click episode playback.
- **Resilient Video Player:**
  - Primary **VidMario** (`player.vidmario.net`) direct high-speed streaming with **Embed.su** (`embed.su`) multi-source fallback.
  - Bypasses middleman ad-wrappers (`vidcore.org`) by embedding the upstream `player.vidmario.net` player directly with native multi-server selection, Skip Intro, Up Next, subtitle styling, and fullscreen playback.
  - Built-in **Prev Episode / Next Episode** navigation bar for TV series.
- **My List & Watched Tracking:** Persistent watchlist (`localStorage`) and automatic `WATCHED` badges on played titles.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) & React 19 |
| **Language** | TypeScript (Strict Mode) |
| **Styling & UI** | Tailwind CSS, `shadcn/ui`, Lucide Icons, Bebas Neue & DM Sans typography |
| **Validation & Security** | Zod runtime schema validation, Server-side TMDB API route handlers (`TMDB_API_KEY` kept server-only) |
| **Streaming Providers** | Isolated Video Adapter layer (`player.vidmario.net` primary, `embed.su` fallback) |
| **Testing** | Vitest + React Testing Library (Unit/Component) & Playwright (Desktop + Mobile E2E) |

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/kingdinner/MovieStream.git
cd MovieStream/next-app
```

### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Configure environment variables
Create `next-app/.env.local` from `.env.example`:
```bash
cp .env.example .env.local
```
Set your TMDB API key inside `next-app/.env.local`:
```env
TMDB_API_KEY=your_tmdb_v3_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
```

### 4. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
