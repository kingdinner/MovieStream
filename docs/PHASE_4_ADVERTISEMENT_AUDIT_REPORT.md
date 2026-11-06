# Phase 4: Advertisement & External Script Audit Report

**Project:** MovieStream (KVFilmZone) Modernization  
**Phase:** 4 — Advertisement Classification, First-Party Removal & Provider Preservation

---

## 1. Classification Taxonomy

Every advertising component, external script, and embedded resource in the MovieStream repository was inspected and classified into one of four categories:

- **`FIRST_PARTY`**: Advertising UI components and ad-slot wrappers authored directly in the MovieStream codebase (`src/components/ads/*`).
- **`PROVIDER_REQUIRED`**: Scripts, player bundles, and token resolvers served by authorized video streaming providers (`vidsrc.cc`, `vidsrc.fyi`, `embed.su`) that are essential for video playback and subtitle delivery.
- **`THIRD_PARTY`**: External advertising networks (`window.adsbygoogle` / Google AdSense or ad scripts hosted inside third-party video provider iframes).
- **`UNKNOWN`**: Dynamically injected or obfuscated sub-frame scripts loaded at runtime inside cross-origin video provider iframes whose internal call graphs cannot be statically decoupled from video playback.

---

## 2. Complete Classification Matrix

| ID | Component / Script | Location / Origin | Classification | Dependencies | Action Taken |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fp-ad-unit` | `AdUnit.jsx` | `src/components/ads/AdUnit.jsx` | **`FIRST_PARTY`** | `window.adsbygoogle`; broken imports `SHOW_ADS`, `ADSENSE_CLIENT` from `src/constants/api.js` | **Removed** (unwanted first-party ad component with zero playback dependency) |
| `fp-floating-ad` | `FloatingAd.jsx` | `src/components/ads/FloatingAd.jsx` | **`FIRST_PARTY`** | `AdUnit.jsx`; broken imports `SHOW_ADS`, `AD_SLOTS` from `src/constants/api.js` | **Removed** (unwanted first-party 300×250 sticky corner ad) |
| `fp-interstitial-ad` | `InterstitialAd.jsx` | `src/components/ads/InterstitialAd.jsx` | **`FIRST_PARTY`** | `AdUnit.jsx`; broken imports `SHOW_ADS`, `AD_SLOTS`, `INTERSTITIAL_SKIP_AFTER` | **Removed** (unwanted first-party pre-play countdown blocker) |
| `pr-vidsrc-cc` | VidSrc CC Embed Runtime | `https://vidsrc.cc/v2/embed/*` | **`PROVIDER_REQUIRED`** | Cross-origin `<iframe>`, HLS/DASH player, subtitle track loader (`?sub=en`), token handshake | **Preserved** inside isolated `<iframe>` (`allow="autoplay; fullscreen; picture-in-picture"`) |
| `pr-vidsrc-fyi` | VidSrc FYI Embed Runtime | `https://vidsrc.fyi/embed/*` | **`PROVIDER_REQUIRED`** | Cross-origin `<iframe>`, HLS stream resolver | **Preserved** inside isolated `<iframe>` as Fallback 1 |
| `pr-embed-su` | Embed.su Player Runtime | `https://embed.su/embed/*` | **`PROVIDER_REQUIRED`** | Cross-origin `<iframe>`, HLS stream resolver | **Preserved** inside isolated `<iframe>` as Fallback 2 |
| `tp-provider-monetization` | Provider-Hosted Ad Networks | Sub-resources inside `vidsrc.cc`, `vidsrc.fyi`, `embed.su` iframes | **`THIRD_PARTY`** | Provider iframe context, monetization/access verification | **Preserved** (never bypassed or globally blocked) |
| `unk-provider-dynamic-bundles` | Obfuscated Dynamic Sub-Frame Chunks | Runtime chunks inside cross-origin provider iframes | **`UNKNOWN`** | Coupled to provider stream token decryption, anti-tamper checks, and telemetry | **Documented & Preserved** (not removed or blocked) |

---

## 3. Dependency Analysis of Third-Party & Unknown Scripts

### 3.1 First-Party Ad Investigation (`src/components/ads/*`)
- **History:** Added in commit `fb1342a601d72aa447dcddeda9081c8a84a269cf` (`2026-04-30`).
- **Static & Runtime Dependency Check:**
  - `AdUnit.jsx`, `FloatingAd.jsx`, and `InterstitialAd.jsx` were never imported by `App.js`, `Home.jsx`, `PlayerModal.jsx`, or any other file in `src/`.
  - Furthermore, all three files attempted to import `SHOW_ADS`, `ADSENSE_CLIENT`, `AD_SLOTS`, and `INTERSTITIAL_SKIP_AFTER` from `src/constants/api.js`, where those exports were already deleted in commit `fa8eb273`.
  - Neither `public/index.html` nor `next-app/src/app/layout.tsx` loads `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js`.
- **Conclusion:** Removing `src/components/ads/` eliminates 100% of unwanted `FIRST_PARTY` advertising components with zero impact on application rendering or video playback.

### 3.2 Provider-Required, Third-Party & Unknown Scripts Investigation
- **Cross-Origin Isolation:** Video playback is delivered by embedding `https://vidsrc.cc`, `https://vidsrc.fyi`, and `https://embed.su` inside an `<iframe>`.
- **Why Global Request Blocking / Sandbox Restrictions Must Not Be Used:**
  - Embedded streaming providers bundle stream manifest decryption (`m3u8` token signing) alongside their own analytics and monetization checks.
  - Applying restrictive `sandbox` attributes or network-level request blockers causes provider scripts to abort stream initialization or display "Sandbox / Adblock detected — media unavailable" errors.
- **Compliance with Engineering Rules:**
  - No third-party advertising, DRM, subscription, access controls, or provider monetization requirements are bypassed.
  - No external requests are globally blocked.
  - All `UNKNOWN` cross-origin scripts have been documented with their dependencies in [`next-app/src/lib/ads/ad-audit.ts`](file:///Users/kingrowellvidal/Desktop/MovieStream/next-app/src/lib/ads/ad-audit.ts) and preserved untouched.
