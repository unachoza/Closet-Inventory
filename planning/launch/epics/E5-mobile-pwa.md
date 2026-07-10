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
- [ ] All interactive targets ≥ 44×44px
- [ ] Bottom nav bar on mobile
- [ ] "Add Item" FAB / bottom-nav action (out of the hamburger)

**Tickets**
- `E5-1.1` ✅ **Done** (2026-07-09, branch `feat/e5-a-css-bugfixes-touch-targets`, PR #130) — Touch-target audit + fixes (≥44px) on `.hamburger-btn`, `.action-btn`, `.nav-drawer__close`, `.import-error-banner__close` (NavBar.css), `.card-quick-actions__item` (CardQuickActions.css), `.density-toggle` (Closet.css), `.filter-accordion__option` (EntireCloset.css). Bundled CSS breakage fixes: `.main`/`#root`/`body` `100vh→100dvh`, defined `--header-height`/`--bottom-nav-height` in `:root`, `--card-width`→`--Card-width` typo (CardDetails.css), deleted dead `≤389px` card rule (Card.css) + dead `.filtered-item-grid` grid (EntireCloset.css). Build + 1262 tests green.
  - **Mobile debug follow-up** (same PR, 2026-07-09) — user-reported issues fixed with regression coverage (unit + Playwright e2e): close button overlapping the item name in `CardDetails` (reserved a gutter, removed a buggy mobile-width override); Edit/Remove buttons cut off in the full detail modal (restructured into a pinned footer outside the scrollable area, mirroring the compact "See all details" footer); Composition section rendering cut off on the compact card-back (wired up `MaterialCompositionBar`'s unused `compact` prop + bumped mobile card height); fabric/fiber detail cards (Fabric Guide) rendering hidden under the sticky nav — root cause was `.app-content`'s `z-index:1` trapping any fixed-position modal nested inside it below the NavBar's `z-index:100` regardless of the modal's own z-index; fixed via a React portal to `document.body` (`Modal.tsx`) + top clearance tied to `--header-height`. New tests: `Modal.test.tsx`, `e2e/fabric-detail-modal.mobile.spec.ts`, extended `e2e/card-detail-modal.mobile.spec.ts`.
  - **Breakpoint token consolidation** (branch `feat/e5-a2-breakpoint-tokens`) — collapsed 9 ad-hoc `max-width` values (389/450/480/520/600/640/768/780/1045px) across 17 CSS files down to a 4-value canonical scale (`--bp-xs` 480 / `--bp-sm` 600 / `--bp-md` 768 / `--bp-lg` 1024) via `postcss-custom-media`, deleted the dead 389px rule (below the 375px floor). Also fixed a latent CSS syntax error (`EntireCloset.css`, missing semicolon) that a stricter PostCSS pipeline now exposed as a hard build failure — pre-existing, unmasked by adding `postcss.config.js`. Verified: build clean, 1295 unit tests green, full mobile e2e suite (Safari + Chrome) shows zero new failures vs. `main` baseline (pre-existing failures are identical on both). — _1d_
- `E5-1.2` Bottom navigation bar (mobile breakpoint) — _2d_
- `E5-1.3` "Add Item" FAB / primary action in bottom nav — _1d_

## US-5.2 — Use it like an installed app
_As Maya, I want to add it to my home screen and launch full-screen so that it feels native without an App Store._
- [ ] `vite-plugin-pwa`: `manifest.json` + icons
- [ ] Service worker for install + offline shell
- [ ] iOS meta tags; full-screen launch (no Safari chrome)

**Tickets**
- `E5-2.1` `vite-plugin-pwa` + manifest + app icons — _1–1.5d_
- `E5-2.2` Service worker (app shell + cached closet) — _1.5d_
- `E5-2.3` iOS full-screen meta + add-to-home-screen polish — _1d_

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
