# MovieStream (KVFilmZone) — Installation & Deployment Instructions

**Project:** MovieStream Modernization  
**Application Directory:** `next-app/`

---

## 1. Prerequisites

- **Node.js:** `v20.x` or `v22.x` / `v24.x` (verified on `v24.21.0`)
- **npm:** `v10+` (verified on `v12.0.2`)
- **TMDB API Key:** A v3 API key from [The Movie Database (TMDB)](https://www.themoviedb.org/settings/api)

---

## 2. Local Installation & Development

1. **Clone the repository and navigate to `next-app/`:**
   ```bash
   git clone https://github.com/kingdinner/MovieStream.git
   cd MovieStream/next-app
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env.local` and set your `TMDB_API_KEY`:
   ```bash
   cp .env.example .env.local
   ```
   ```env
   TMDB_API_KEY=your_tmdb_v3_api_key_here
   TMDB_BASE_URL=https://api.themoviedb.org/3
   NEXT_PUBLIC_APP_NAME=KVFilmZone
   ```
   > **Note:** `TMDB_API_KEY` is a server-only variable (no `NEXT_PUBLIC_` prefix) so it is never exposed to client browsers.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 3. Running Verification & Regression Tests

All commands below are run from `next-app/` (or from the repository root with `--prefix next-app`):

- **TypeScript Strict Typecheck:**
  ```bash
  npm run typecheck
  ```
- **Vitest Unit & Component Tests:**
  ```bash
  npm test
  ```
- **Production Build:**
  ```bash
  npm run build
  ```
- **Playwright End-to-End Regression Tests (Desktop & Mobile):**
  ```bash
  npm run test:e2e
  ```

---

## 4. Production Deployment Instructions

### Option A: Vercel (Recommended for Next.js App Router)
1. Import the GitHub repository `kingdinner/MovieStream` into Vercel.
2. Set the **Root Directory** to `next-app`.
3. Add the environment variable `TMDB_API_KEY` in the Vercel Project Settings.
4. Deploy. Vercel automatically builds and serves Server Components, API Route Handlers (`/api/tmdb/*`), and static assets.

### Option B: Netlify (Next.js Runtime)
1. In Netlify Site Settings $\rightarrow$ **Build & deploy**:
   - **Base directory:** `next-app`
   - **Build command:** `npm run build`
   - **Publish directory:** `.next` (managed automatically by `@netlify/plugin-nextjs`)
2. Set `TMDB_API_KEY` in Netlify **Environment variables**.
3. Trigger a production deploy.

### Option C: Self-Hosted Node.js / Docker
```bash
cd next-app
npm ci --legacy-peer-deps
npm run build
PORT=3000 npm run start
```
