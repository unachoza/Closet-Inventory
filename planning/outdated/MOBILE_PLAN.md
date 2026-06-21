# Mobile Plan & Audit - Written 2026-06-7

> Scope: evaluate the **mobile** experience of Closet Inventory, surface the real
> gaps, and lay out a sequenced plan of wins, refactors, and bigger bets.
> This is a planning doc — no code changes here.
> Companion to the mobile-first **Near-Term Priority Order** in [README.md](./README.md).

---

## TL;DR

The closet is **already responsive** — the thing people usually worry about is
done. The mobile problems that actually matter are elsewhere:

1. **🔴 Images are base64 in `localStorage`** — a hard ceiling (~5 MB on mobile
   Safari) that fails silently. Highest-severity mobile risk, and it isn't on the
   roadmap.
2. **🟠 PWA is unbuilt** — zero scaffolding, yet it underpins the whole
   monetization story (no App Store / no 30 % cut), offline, and add-to-home-screen.
3. **🟠 Primary action is buried** — "Add Item" lives behind the hamburger; touch
   targets are sub-44 px.
4. **🟡 No camera capture** — the fastest way for a mobile user to log an item
   doesn't exist; email import only covers online purchases.

Do these **after** the four in-flight PRs merge (#42/#41/#43/#44) so we don't add a
fifth branch fighting over the same files.

---

## What's already solid (don't re-litigate)

| Area | State | Evidence |
|------|-------|----------|
| Responsive layout | ✅ Real | 29 `@media` blocks on `main`, 15 files |
| Mobile nav | ✅ Works (hamburger drawer < 768px) | [NavBar.css:209](src/Components/NavBar/NavBar.css#L209) |
| Viewport meta | ✅ Correct | `index.html` |
| iOS Safari button rendering | 🚧 Fixed in [#42](https://github.com/unachoza/Closet-Inventory/pull/42) | `-webkit-appearance: none`, drops Chrome-only `calc-size()` |

---

## Audit findings

### 🔴 Critical

**1. Base64 images in `localStorage` will break on mobile.**
`ImageUploader` reads the file → base64 → stores it on the item → the whole closet
is `JSON.stringify`'d into one `localStorage` key.
- [ImageUploader.tsx:20](src/Features/Form/ImageUploader/ImageUploader.tsx#L20) → base64
- [Form.tsx:204](src/Features/Form/Form.tsx#L204) → `imageURL: base64` on the item
- [useLocalCloset.tsx:30](src/hooks/useLocalCloset.tsx#L30) → `localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))`

Why it bites on mobile specifically: phone-camera photos are multi-MB; base64
inflates them ~33 %; mobile Safari caps `localStorage` near **5 MB total**. A
handful of photographed items overflows the quota and `setItem` **throws / drops
data with no user-visible error** (also violates the "never silently swallow"
rule). This compounds once camera import (v2.1) lands, which encourages exactly
this behavior.

### 🟠 High

**2. No PWA.** No `vite-plugin-pwa`, `manifest.json`, service worker, app icons,
or `apple-mobile-web-app-*` meta tags. Blocks add-to-home-screen, full-screen
launch, offline, and is load-bearing for v9.0 monetization.

**3. Primary action buried + sub-44 px touch targets.** "Add Item" requires a
hamburger tap first; the persona's core goal is "log an item in under a minute."
Confirmed sub-44 px (guideline minimum) controls:
- `.action-btn` — `font-size: 12px`, no `min-height` — [NavBar.css:87](src/Components/NavBar/NavBar.css#L87)
- `.hamburger-btn` — `0.6em .75rem` padding on a 24px icon ≈ 36px — [NavBar.css:228](src/Components/NavBar/NavBar.css#L228)
- Also `TextileGuide.css`, `FiberJourney/JourneyC.css`

**4. Gmail email-preview horizontal scroll on mobile.** The two-panel
`display-email-preview-panel` (list + preview side-by-side, `max-width: 1175px`)
overflows on phones. Known bug; the `:has()` hack didn't fix it.
- [GmailImport.css:15](src/Features/GmailImport/GmailImport.css#L15), [:175](src/Features/GmailImport/GmailImport.css#L175), mobile rules at [:456](src/Features/GmailImport/GmailImport.css#L456)

### 🟡 Medium

**5. Breakpoint sprawl — no shared tokens.** 22 distinct breakpoint values. Two
are standard and dominant (`480px` ×15, `768px` ×15); the rest is a one-off tail:
`389, 400, 450, 600, 640, 700, 900, 960, 1160, 1175, 1200, 1280`. Makes mobile QA
and consistency fragile.

**6. No camera capture / camera-roll import.** `capture="environment"` and a
photo-library picker appear nowhere. (v2.1)

**7. No swipe gestures, no bottom nav.** Roadmap v2.0 items, currently unstarted.

### 🧹 Branch hygiene

Stale mobile branches, all behind `main` with 0 commits ahead — work is either
merged or abandoned: `MobileImprovements` (65 behind), `mediaQueries` (108),
`media` (110), `nav` (109). Prune them so "mobile work" isn't scattered.

---

## Prioritized plan

Impact × Effort, sequenced. **Phase 0 is a prerequisite** — everything else lands
on top of merged `main`.

### Phase 0 — Merge in-flight PRs (your git actions)
Order matters: **#41 and #43 rewrite the same email-parsing utils** — merge one,
rebase the other.
- [#42](https://github.com/unachoza/Closet-Inventory/pull/42) iOS button fix — safe, merge first
- [#41](https://github.com/unachoza/Closet-Inventory/pull/41) Export
- [#43](https://github.com/unachoza/Closet-Inventory/pull/43) Card overhaul — resolve util conflicts vs #41
- [#44](https://github.com/unachoza/Closet-Inventory/pull/44) Firebase — large; merge last

### Phase 1 — Quick wins (high impact, low effort)
| # | Win | Impact | Effort | Notes |
|---|-----|--------|--------|-------|
| 1.1 | `min-height/width: 44px` on interactive base styles + hamburger padding | High | XS | Mechanical; touches NavBar.css + index.css (wait for #42) |
| 1.2 | Floating "+" FAB for "Add Item" | High | S | Keeps hamburger for secondary actions; un-buries the #1 action |
| 1.3 | Stack Gmail email-preview panels vertically < 768px | Med | S | Fixes known horizontal-scroll bug |

### Phase 2 — Refactors (pay down before building more)
| # | Refactor | Why | Effort |
|---|----------|-----|--------|
| 2.1 | **Compress/resize images before storing** (canvas resize → JPEG ~0.7, cap ~1024px) | Removes the 🔴 quota bomb; prerequisite for camera import | M |
| 2.2 | Shared breakpoint tokens (a small standard set: 480 / 768 / 1024) + collapse one-offs | Consistency, mobile QA | M |
| 2.3 | Shared interactive base class for min-size (don't repeat per-component) | DRY touch targets | S |

> Note: if Firebase (#44) lands, the longer-term home for images is **Firebase
> Storage** (URL on the item) rather than base64 anywhere. 2.1 is still worth doing
> for the local-only / free tier.

### Phase 3 — PWA scaffolding (the strategic mobile bet)
- `vite-plugin-pwa` + `manifest.json` (name, icons, `display: standalone`, theme color)
- `apple-mobile-web-app-capable` / status-bar meta tags + iOS icons
- Service worker: cache app shell (offline-first dovetails with v4.0)
- **Unblocks** add-to-home-screen, full-screen launch, and v9.0 monetization

### Phase 4 — Camera capture / import (v2.1, pulled ahead of analytics)
- "Take Photo" (`capture="environment"`) + "Import from Camera Roll"
  (`<input type="file" accept="image/*">`) — no native code
- Must ship **after** Phase 2.1 (compression) or it accelerates the quota bomb
- AI clothing detection (GPT-4o) is a later sub-step, not required for v1

---

## Refactors worth calling out (summary)
1. **Image pipeline** — compress before store; migrate to Firebase Storage when #44 lands. (Critical)
2. **Breakpoint tokens** — kill the 22-value sprawl. (Medium)
3. **Touch-target base style** — one shared rule, not per-component. (Low)
4. **Branch cleanup** — delete the 4 stale mobile branches. (Trivial)

---

## Dependencies & sequencing
- **Everything ← Phase 0** (merge PRs) to avoid a 5th conflicting branch.
- **Camera import (Phase 4) ← image compression (Phase 2.1)** or it worsens the quota bomb.
- **v9.0 monetization ← PWA (Phase 3)** + Firebase backend (#44).
- **`wornCount` (v1.2)** → split out early; v7.0 + v8.0 depend on it (tracked in README).

---

## Open decisions (yours)
1. **Nav pattern:** floating "+" FAB (smallest fix) vs. full bottom tab bar (roadmap
   v2.0) vs. FAB now / bottom nav later.
2. **Image storage target:** compress-and-keep-base64 for free tier, or go straight
   to Firebase Storage once #44 merges (premium-gated).
3. **PWA vs. camera first** after Phase 1/2 — PWA is higher strategic leverage;
   camera is higher day-one persona delight.

---

## Out of scope (deferred)
- Native app / Swift / Xcode — explicitly avoided; PWA covers the install path.
- Push notifications (depends on backend + PWA).
- Swipe-to-delete / advanced gestures — nice-to-have after nav + targets.
