# Phase 2: Next.js Application Migration Setup Report

**Project:** MovieStream (KVFilmZone) Modernization  
**Phase:** 2 — Migration Foundation

---

## 1. Summary of Migration Architecture

To satisfy the requirement of keeping the legacy Create React App (`react-scripts`) application intact and operational until the replacement passes all regression tests, a standalone Next.js application was initialized in [`next-app/`](file:///Users/kingrowellvidal/Desktop/MovieStream/next-app/package.json).

### 1.1 Technology Stack Configured
| Requirement | Implementation in `next-app/` |
| :--- | :--- |
| **Next.js App Router** | Next.js 15 App Router (`next-app/src/app/layout.tsx`, `next-app/src/app/page.tsx`) |
| **TypeScript (Strict Mode)** | `tsconfig.json` with `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`, `"noUncheckedIndexedAccess": true` |
| **Tailwind CSS** | `tailwind.config.ts`, `postcss.config.mjs`, and `src/app/globals.css` with dark theme tokens (`#000000` background, `#e50914` brand accent, `#46d369` match badge, `Bebas Neue` & `DM Sans` typography) |
| **shadcn/ui** | `components.json` + reusable primitives in `src/components/ui/` (`Button`, `Badge`, `Input`, `Card`, `Skeleton`) built with `class-variance-authority`, `clsx`, `tailwind-merge`, and `@radix-ui/react-slot` |
| **Lucide React** | `lucide-react` (`^0.562.0`) installed for consistent iconography |
| **Zod** | `zod` (`^3.24.1`) schemas in [`src/lib/schemas.ts`](file:///Users/kingrowellvidal/Desktop/MovieStream/next-app/src/lib/schemas.ts) validating TMDB media items, seasons, episodes, details, localStorage payloads, and external HTTPS/provider URLs |
| **Playwright Test** | `@playwright/test` configured in [`playwright.config.ts`](file:///Users/kingrowellvidal/Desktop/MovieStream/next-app/playwright.config.ts) with Desktop Chrome and Mobile Pixel 7 projects |
| **Vitest** | `vitest` + `@testing-library/react` + `jsdom` configured in [`vitest.config.ts`](file:///Users/kingrowellvidal/Desktop/MovieStream/next-app/vitest.config.ts) and [`src/test/setup.ts`](file:///Users/kingrowellvidal/Desktop/MovieStream/next-app/src/test/setup.ts) |

---

## 2. Coexistence with Legacy Application

- The existing CRA application in the repository root (`src/`, `public/`, `package.json`) remains completely untouched and runnable via `npm start` / `npm run build` in `/Users/kingrowellvidal/Desktop/MovieStream`.
- Original branding (`KVFilmZone`, `#e50914` theme, `Bebas Neue` & `DM Sans` fonts) and public assets (`favicon.ico`, `logo192.png`, `logo512.png`, `manifest.json`, `robots.txt`) have been preserved and copied into `next-app/public/`.
- Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`) and `image.tmdb.org` remote patterns are configured in [`next-app/next.config.mjs`](file:///Users/kingrowellvidal/Desktop/MovieStream/next-app/next.config.mjs).
