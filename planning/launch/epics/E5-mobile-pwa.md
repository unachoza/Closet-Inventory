# E5 · Mobile & PWA

> **Date:** 2026-06-20 · **Pillar:** Supporting (load-bearing for the business model) · **Detail:** full · **README:** v3.0 · **Est:** ~7.5–9.5 dev-days
> **Goal:** Make the mobile experience first-class and installable — touch targets, thumb-reachable
> primary action, and a PWA so it lives on the home screen with no App Store / no 30% cut.
>
> ### 🚀 PROMOTED TO LAUNCH BLOCK C (2026-06-29) — see [LAUNCH_ROADMAP](../LAUNCH_ROADMAP_2026-06-29.md)
> User wants the **full installable PWA** at launch (manifest + service worker + offline + iOS full-screen), not just responsive fixes. **Reality check:** this is **0% built** — no `manifest.json`, no service worker, no `vite-plugin-pwa`, no bottom nav. Greenfield block.
> **Lever:** if the 1-month target is hard, cut to the *touch/responsive half* (US-5.1) for launch and ship the PWA shell (US-5.2/5.3) as a fast-follow — waitlisters can use the responsive web app on day one.

---

## US-5.1 — Comfortable to use one-handed
_As Maya on her phone, I want tap targets and primary actions within thumb reach so that logging items is comfortable._
- [x] All interactive targets ≥ 44×44px
- [x] Bottom nav bar on mobile
- [x] "Add Item" FAB / bottom-nav action (out of the hamburger)

**Tickets**
- `E5-1.1` ✅ **Done** (2026-07-09, branch `feat/e5-a-css-bugfixes-touch-targets`, PR #130) — Touch-target audit + fixes (≥44px) on `.hamburger-btn`, `.action-btn`, `.nav-drawer__close`, `.import-error-banner__close` (NavBar.css), `.card-quick-actions__item` (CardQuickActions.css), `.density-toggle` (Closet.css), `.filter-accordion__option` (EntireCloset.css). Bundled CSS breakage fixes: `.main`/`#root`/`body` `100vh→100dvh`, defined `--header-height`/`--bottom-nav-height` in `:root`, `--card-width`→`--Card-width` typo (CardDetails.css), deleted dead `≤389px` card rule (Card.css) + dead `.filtered-item-grid` grid (EntireCloset.css). Build + 1262 tests green.
  - **Mobile debug follow-up** (same PR, 2026-07-09) — user-reported issues fixed with regression coverage (unit + Playwright e2e): close button overlapping the item name in `CardDetails` (reserved a gutter, removed a buggy mobile-width override); Edit/Remove buttons cut off in the full detail modal (restructured into a pinned footer outside the scrollable area, mirroring the compact "See all details" footer); Composition section rendering cut off on the compact card-back (wired up `MaterialCompositionBar`'s unused `compact` prop + bumped mobile card height); fabric/fiber detail cards (Fabric Guide) rendering hidden under the sticky nav — root cause was `.app-content`'s `z-index:1` trapping any fixed-position modal nested inside it below the NavBar's `z-index:100` regardless of the modal's own z-index; fixed via a React portal to `document.body` (`Modal.tsx`) + top clearance tied to `--header-height`. New tests: `Modal.test.tsx`, `e2e/fabric-detail-modal.mobile.spec.ts`, extended `e2e/card-detail-modal.mobile.spec.ts`.
  - **Breakpoint token consolidation** (branch `feat/e5-a2-breakpoint-tokens`) — collapsed 9 ad-hoc `max-width` values (389/450/480/520/600/640/768/780/1045px) across 17 CSS files down to a 4-value canonical scale (`--bp-xs` 480 / `--bp-sm` 600 / `--bp-md` 768 / `--bp-lg` 1024) via `postcss-custom-media`, deleted the dead 389px rule (below the 375px floor). Also fixed a latent CSS syntax error (`EntireCloset.css`, missing semicolon) that a stricter PostCSS pipeline now exposed as a hard build failure — pre-existing, unmasked by adding `postcss.config.js`. Verified: build clean, 1295 unit tests green, full mobile e2e suite (Safari + Chrome) shows zero new failures vs. `main` baseline (pre-existing failures are identical on both). — _1d_
- `E5-1.2` ✅ **Done** (2026-07-10, branch `feat/e5-b-bottom-nav`) — `BottomNav` component (`src/Components/BottomNav/`): mobile-only (≤--bp-md) fixed bar `Home | Closet | [Add FAB] | Search | Import`, mapped to existing views via `useView()`; Import-from-Gmail promoted to a first-class tab. All targets ≥44px, `aria-current` on the active tab, safe-area padding; `.app-content` reserves matching bottom clearance. z-index 90 (below `.top-nav`'s stacking context so the drawer covers the bar). Unit tests (`BottomNav.test.tsx`, 5) + e2e (`bottom-nav.mobile.spec.ts`, 4×2 browsers). — _2d_
- `E5-1.3` ✅ **Done** (same PR) — center-docked Add-Item FAB in the bottom bar, reusing the App-level `handleAddItem` (same handler as the drawer). **Bundled fixes uncovered by e2e:** (1) card grow-modal portaled to `document.body` (`Card.tsx`) — `.app-content`'s z-index:1 stacking context let the BottomNav paint over the modal's pinned Edit/Remove footer, intercepting taps (same trap/fix as the fabric DetailModal); (2) pre-existing mobile e2e failures all fixed: ~98px page-wide horizontal overflow (root cause: `CloudSyncControl`'s nowrap labels couldn't fit the header next to the title — moved into the drawer on mobile, icon-only `SyncStatusIndicator` stays in the header; plus a carousel-arrow bleed clipped in `Carousel.css`), consent-banner spec hardcoding port :5199 → shared baseURL, and stale screenshot baselines refreshed. **Full e2e suite 144/144 green across all 4 Playwright projects** (was 8 Safari / 14 Chrome failures on main); 1300 unit tests green. — _1d_

## US-5.2 — Use it like an installed app
_As Maya, I want to add it to my home screen and launch full-screen so that it feels native without an App Store._
- [x] `vite-plugin-pwa`: `manifest.json` + icons
- [x] Service worker for install + offline shell
- [x] iOS meta tags; full-screen launch (no Safari chrome) — _metas verified in build; physical-device add-to-home-screen still to be eyeballed once deployed_

**Tickets**
- `E5-2.1` ✅ **Done** (2026-07-10, branch `feat/e5-c-pwa-shell`) — `vite-plugin-pwa@1.3.0` (`generateSW`, `registerType: autoUpdate`); manifest: name "Nothing To Wear" / short_name "NTW", `display: standalone`, 192+512+maskable-512 icons derived from `src/assets/hangerLogo.png` via `sips` (square-padded on the logo's own `#071128` navy; maskable padded to the 80% safe zone) + 180px `apple-touch-icon.png`, all in `public/`. — _1–1.5d_
- `E5-2.2` ✅ **Done** (same PR) — Workbox precache of the built app shell (24 entries ≈2.2MB; HTML/JS/CSS/icons). **Closet data offline comes from localStorage (`useCloudCloset` seed, E1-1.6), NOT SW response caching — deliberately zero `runtimeCaching` for `*.supabase.co`** (stale rows / auth-response caching trap; verified 0 supabase refs in `dist/sw.js`). Verified end-to-end via a scripted preview-build check: SW registers + activates → network cut → reload → **app shell serves from SW cache AND closet cards render from localStorage while fully offline** (this also satisfies US-5.3's "cached closet viewable offline"). `devOptions.enabled: false` keeps dev + Playwright SW-free. — _1.5d_
- `E5-2.3` ✅ **Done** (same PR) — `index.html`: `theme-color`, `mobile-web-app-capable` + `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title: NTW`, `apple-touch-icon` link, real `<title>` ("Nothing To Wear", was "Closet") + meta description; `viewport-fit=cover` retained. — _1d_

## US-5.3 — Works offline
_As Maya on the subway, I want to view my closet offline so that the app is reliable._
- [ ] Cached closet viewable offline
- [ ] Writes queue and flush on reconnect (pairs with E1 offline-first)

**Tickets**
- `E5-3.1` Offline closet view via SW cache — _1.5d_

---

## Known bugs
- `E5-bug.1` **Mobile card "See all details" clipped + card top hidden** — `overflow: scroll` on `.card-details` + `margin-top: 3vh` in mobile caused the footer button to be clipped by `.card-back`'s `overflow: hidden`, and pushed card content below the visible card bounds. Fixed by removing both rules and adjusting grow-modal geometry — _✅ PR #80 (commit c7922e2)_

---

## Dependencies
- Independent of E1 for layout/PWA shell; **offline writes** integrate with E1's offline-first sync.
- PWA install path is **load-bearing for E10 monetization** ("no App Store cut").

## Definition of done (epic)
Installable PWA, full-screen on iOS, 44×44px targets, bottom nav + reachable Add-Item, closet viewable offline.
