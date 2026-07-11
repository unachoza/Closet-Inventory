# E5 — Mobile & PWA: full installable PWA + one-handed mobile UX

> **⚠️ Point-in-time implementation plan (plan mode, 2026-07-09).** Archived here for the record.
> Phases A, A2, B, C shipped as PRs #130, #131, #133, #132. The living source of truth for
> status/evidence is [epics/E5-mobile-pwa.md](epics/E5-mobile-pwa.md) — do not update this file.

## Context

NTW ("Nothing To Wear" / Never The Wiser) is a React 19 + Vite 8 closet app promoted to **Launch Block C** as a *full installable PWA* (manifest + service worker + offline + iOS full-screen), not just responsive fixes. Two parallel audits found:

- **Layout is fairly mature** — dedicated mobile card bottom-sheet/grow-modal, `dvh` + `env(safe-area-inset-*)` in the FilterSidePanel / nav drawer / card modal, touch-aware `useLongPress`, dark mode via tokens.
- **PWA infra is zero** — no `manifest`, no service worker, no icons, no `vite-plugin-pwa`, no `theme-color`/apple meta tags.
- **Navigation is hamburger-only** — no bottom nav, and **Add Item is gated behind the hamburger drawer** on mobile (the epic's biggest one-handed-UX gap).
- **A cluster of small CSS bugs** cause cross-device breakage.

Two facts de-risk the hard half of the epic and were verified during planning:
1. `vite-plugin-pwa@1.3.0` **officially supports Vite `^8.0.0`** (peer dep confirmed).
2. **E1-1.6 is already done**: `useCloudCloset` seeds from `localStorage` and reconciles local↔remote via `SyncedClosetRepository` (last-write-wins on `updatedAt`). So "closet viewable offline" and "writes queue + flush on reconnect" (US-5.3) are **largely already satisfied by E1** — this pass wires the SW app-shell so the cached data is *reachable* offline and adds a test, rather than building a new outbox.

**Decisions locked with the user:** Full PWA this pass (US-5.1 + 5.2 + 5.3) · Bottom nav bar **+** Add-Item FAB · **Import-from-Gmail is the 5th bottom-nav tab** (Home / Closet / [Add] / Search / Import) · **375px floor** (iPhone 12 mini / SE2; do not repair 320px-only rules — delete them) · fold the CSS breakage/dead-code bugs into this work · **consolidate the 9 ad-hoc breakpoints into shared tokens** (its own phase — see Phase A2).

**Workflow:** execute **one phase at a time**, stopping between phases for a commit message, test run, and PR merge before starting the next. Each phase below is a self-contained PR.

---

## Strategy / sequencing

Build in the order that ships user-visible value earliest and puts the one genuinely risky bit last. **Each phase = one PR**, with commit message + tests + merge before the next.

1. **Phase A — Bug fixes + touch targets (E5-1.1, easy wins).** Cheap, no new deps, immediately improves every device. Do first so screenshots/baselines are taken against corrected layout.
2. **Phase A2 — Breakpoint token consolidation.** Collapse the 9 ad-hoc breakpoints into a canonical scale via `postcss-custom-media`. Its own PR — touches nearly every CSS file, pure refactor, easiest to review in isolation and to bisect if a layout regresses.
3. **Phase B — Bottom nav + Add FAB + Import tab (E5-1.2, E5-1.3).** The core one-handed UX. New component; reuses existing `ViewContext` + `handleAddItem`.
4. **Phase C — PWA install shell (E5-2.1, 2.2, 2.3).** `vite-plugin-pwa` + manifest + icons + iOS meta. App-shell precache only — **the SW must not cache Supabase REST/auth responses.**
5. **Phase D — Offline verification (E5-3.1).** Prove cached closet is viewable offline (data already in localStorage via E1); add a persistence test. Write-queue = E1's existing reconcile; document, don't rebuild.
6. **Phase E — Snapshot baseline refresh + Lighthouse.** Nav/layout changes will break Playwright `toHaveScreenshot`; refresh at the end (per snapshot-cadence memory).

---

## Phase A — CSS bug fixes + touch targets (E5-1.1)

**Bug fixes (delete-or-repair, all confirmed in audit):**
- `src/App.css` — `.main` uses `height: 100vh` → change to `100dvh` (fixes mobile-chrome jump). App shell is the load-bearing one.
- `src/Components/NavBar/NavBar.css` — `--header-height` is **consumed** (`height: var(--header-height)`) but **never defined**. Define it in `:root` (`src/index.css` or `tokens.css`), e.g. `--header-height: 56px`, or give the consumer a fallback.
- `src/Components/ClothesCard/CardDetails/CardDetails.css:358` — typo `var(--card-width)` → `var(--Card-width)` (silently-dropped name clamp).
- `src/Components/ClothesCard/Card/Card.css:270-277` — dead `≤389px` `--Card-width` override that never wins (the `≤480px` `47vw` literal beats it). **Delete** it (375px floor — no repair needed).
- `src/Features/SearchCloset/EntireCloset.css:568-599` — dead `.filtered-item-grid` responsive CSS-grid block (the real grid is flexbox `.items-grid`). **Delete** the unused rules (keep `.filtered-item-grid__empty`).

**Touch targets → ≥44×44px** (add `min-height`/`min-width: 44px` + adjust padding; keep visual size via transparent hit-area where needed):
- `.action-btn` (drawer nav buttons) — `NavBar.css:80-93`
- `.hamburger-btn` — `NavBar.css:28-38` / `227-229`
- `.nav-drawer__close` — `NavBar.css:187-196`
- `.card-quick-actions__item` — `CardQuickActions.css:42-52` (currently ~36px)
- `.density-toggle` — `Closet.css:25-38`
- `.import-error-banner__close` — `NavBar.css:271-280`
- Filter-accordion checkbox rows — `EntireCloset.css:457` (`5px 6px`)

---

## Phase A2 — Breakpoint token consolidation

**Constraint:** CSS custom properties **cannot** be used inside `@media` (`@media (max-width: var(--x))` is invalid). The correct "shared token" mechanism is **`@custom-media`** via `postcss-custom-media` (Vite already runs PostCSS; add the plugin to `postcss.config`/`vite.config`).

- Add `postcss-custom-media` (dev dep) and define a canonical scale once, e.g. in `src/tokens.css` (or a new `src/styles/breakpoints.css` imported first):
  `@custom-media --bp-sm (max-width: 480px);` `--bp-md (max-width: 768px);` `--bp-lg (max-width: 1024px);` `--bp-xl (max-width: 1200px);` plus the min-width pair used by the mobile-first grid (`--bp-grid-2 (min-width: 600px)`, `--bp-grid-3 (min-width: 900px)`, `--bp-grid-4 (min-width: 1200px)`).
- **Collapse the 9 ad-hoc values** onto the canonical scale: `389→delete` (below 375 floor), `450→480`, `520→480`, `780→768`, `1045→1024`. Keep the mobile-first grid's `600/900/1200` as the named min-width tokens. Rewrite each `@media (max-width: …)` to `@media (--bp-*)`.
- Go **file-by-file** (`Card.css`, `App.css`, `NavBar.css`, `Closet.css`, `EntireCloset.css`, `Form.css`, `EditItemView.css`, `Modal.css`, `PaginationControls.css`, …), verifying the layout visually at each canonical width after swapping — this is a mechanical but wide change, so bisectability (its own PR) matters.

**Tests/verify:** no unit test surface; rely on `npm run build` + `npm run lint:css` + the responsive matrix + refreshed screenshots. Confirm no query silently dropped (grep for leftover raw `max-width:` / `min-width:` px values after the pass).

## Phase B — Bottom nav + Add FAB + Import tab (E5-1.2, E5-1.3)

**New component:** `src/Components/BottomNav/BottomNav.tsx` (+ `BottomNav.css`), rendered in `AppShell` (`src/App.tsx:157-210`) as a sibling of `.app-content`, **mobile breakpoint only** (`@media (--bp-md)`; hidden on desktop where the drawer already works).

- **Layout:** `Home | Closet | [Add FAB] | Search | Import` — 4 tabs flanking a center-docked **Add** FAB (5 targets, within the 3–5 guideline). Map via `useView()`: **Home**→`carousel`, **Closet**→`overview`, **Search**→`entireCloset`, **Import**→`gmail` (mail icon, e.g. `lucide-react` `Mail`). Highlight active tab from `view`.
- **Add-Item:** center FAB calls the existing `handleAddItem` (`App.tsx:135`) — pass down as a prop like `NavBar` already receives `onAddItem`. **No new navigation logic** — reuse `setView(...)`/`setView("form")`.
- **Keep the hamburger drawer** for secondary items (Export / Clear / Account / Fabric-care / Journey). Bottom nav is primary nav only.
- **Prevent the bar covering content:** add `padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom))` to `.app-content` (`App.css`) on mobile; bar itself gets `padding-bottom: env(safe-area-inset-bottom)`.
- Each tab/FAB ≥44px; `aria-current="page"` on active tab; the bar is `<nav aria-label="Primary">`.

**Tests:** `BottomNav.test.tsx` — renders 4 tabs + Add; clicking a tab calls `setView` with the right key (incl. Import→`gmail`); Add calls the `onAddItem` handler; active tab reflects `view`.

---

## Phase C — PWA install shell (E5-2.1 / 2.2 / 2.3)

**Dependency:** add `vite-plugin-pwa@^1.3.0` (Vite 8 supported — verified). Use Workbox `generateSW` in `injectManifest`-free (auto) mode for the app shell.

**`vite.config.ts`** — add `VitePWA({ registerType: 'autoUpdate', manifest: {...}, workbox: {...} })`:
- `workbox.globPatterns` = precache built HTML/JS/CSS/icons only.
- **Do NOT add runtimeCaching for Supabase** (`*.supabase.co` REST/auth/storage). Auth tokens + stale rows + POSTs are a trap; offline data comes from E1's localStorage, not SW response cache. If any runtime cache is added later it's for fonts/static only.
- `devOptions.enabled: false` (default) — SW only runs in `build` + `preview`.

**Manifest** (`name`, `short_name: "NTW"`, `theme_color`, `background_color`, `display: "standalone"`, `start_url: "/"`, `icons[]`).

**Icons (prerequisite, not a step):** `public/` has only `favicon.ico`. Need `pwa-192x192.png`, `pwa-512x512.png`, `maskable-512x512.png`, `apple-touch-icon.png` (180×180). **Requires a source logo asset** — generate provisional icons from the existing mark and label as placeholder if no brand asset is provided (flag this to the user at implementation start).

**`index.html`** (`E5-2.3` iOS full-screen) — add: `<meta name="theme-color">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-status-bar-style" content="default">`, `<meta name="apple-mobile-web-app-title" content="NTW">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`, a real `<meta name="description">`, and set a real `<title>` (currently "Closet"). `viewport-fit=cover` is already present (good — keep it; that's why safe-area insets work).

**Update prompt:** with `registerType: 'autoUpdate'` the SW self-updates; optionally add a small "new version — reload" toast via the existing `ToastProvider` (nice-to-have, not required).

---

## Phase D — Offline closet (E5-3.1)

E1-1.6 already: `useCloudCloset` seeds from `localStorage` (`STORAGE_KEY`) and reconciles via `SyncedClosetRepository` (last-write-wins on `updatedAt`). Once the SW precaches the app shell, the app boots offline and reads the closet from localStorage — **US-5.3 is satisfied by Phase C + existing E1**.

- **Do:** add/confirm a unit test that the closet renders from localStorage with the network stubbed offline (the persistence path is unit-testable — TDD this one).
- **Document** in the E5 epic that "writes queue + flush on reconnect" is delivered by E1's reconcile, not a separate outbox. Only build a dedicated write-queue if a gap surfaces during offline Playwright testing.

---

## Phase E — Baselines + audit

- Refresh Playwright `toHaveScreenshot` baselines (nav + layout changed) — verify diffs are intended (snapshot-cadence memory).
- Run Lighthouse PWA audit against `preview` (see verification).

---

## Critical files

- `vite.config.ts` — add `VitePWA`
- `index.html` — PWA/iOS meta + icons + title/description
- `src/App.tsx` (`AppShell`, 157-210) — mount `BottomNav`; pass `onAddItem`
- `src/App.css` — `100vh→100dvh`; `.app-content` bottom padding for nav
- **new** `src/Components/BottomNav/BottomNav.tsx` + `.css` + test
- `src/index.css` / `src/tokens.css` — define `--header-height`, `--bottom-nav-height`, and `@custom-media` breakpoint tokens (Phase A2)
- `vite.config.ts` / `postcss.config` — add `postcss-custom-media` (Phase A2)
- **all component CSS** — rewrite `@media (max-width: …)` to `@media (--bp-*)` (Phase A2)
- `src/Components/NavBar/NavBar.css` — touch targets
- `src/Components/ClothesCard/Card/Card.css`, `CardDetails/CardDetails.css`, `CardQuickActions/CardQuickActions.css` — bug fixes + touch targets
- `src/Features/Closet/Closet.css`, `src/Features/SearchCloset/EntireCloset.css` — dead-code removal + touch targets
- `public/` — new icon PNGs
- `planning/launch/epics/E5-mobile-pwa.md` — check off tickets with evidence on completion (per update-tickets memory)

**Reuse (don't rebuild):** `useView()`/`ViewContext` for tab switching · `handleAddItem` (`App.tsx:135`) for Add · `useLongPress` (already touch-aware) · `ToastProvider` for update prompt · `useCloudCloset` localStorage seed for offline read.

---

## Verification (end-to-end)

1. **Unit/component:** `npm test` — new `BottomNav.test.tsx` green; offline-render test green; touch-target and existing suites pass.
2. **Responsive matrix** (preview_* MCP tools at each width, light+dark): **375** (12 mini/SE2 floor), **390** (iPhone 15/14), **393** (Pixel), **412** (Pixel Pro / Galaxy), **430** (15 Pro Max). Confirm: bottom nav reachable + not covering cards, FAB taps open form, cards lay out (2-up) without clipping, card grow-modal fits, no horizontal scroll.
3. **PWA (must use build, not dev):** `npm run build && npm run preview` → Chrome DevTools → **Lighthouse PWA audit** (installable, manifest valid, SW registered, icons). Verify "Add to Home Screen" appears; installed launch is standalone/full-screen.
4. **iOS full-screen:** confirm apple meta present; add-to-home-screen launches without Safari chrome (manual on device / simulator if available).
5. **Offline:** in `preview`, load once, go offline (DevTools → Offline), reload → app shell serves from SW cache and closet renders from localStorage. Make an edit offline, go online → E1 reconcile flushes it.
6. **Regression:** `npm run build` (tsc + vite) clean; `npm run lint` + `npm run lint:css` clean; Playwright e2e + refreshed screenshot baselines green.

---

## Priority order (if time-boxed)

Phases run in order (A → A2 → B → C → D → E), one PR each. If time-boxed:
**P0 (ship-defining):** Phase A (bugs + touch) → Phase B (bottom nav + FAB + Import) → Phase C manifest/icons/meta (installable).
**P1:** Phase A2 (breakpoint tokens) → Phase C service worker (offline shell) → Phase D offline verification.
**P2:** update toast, Lighthouse polish, Phase E baseline refresh.
