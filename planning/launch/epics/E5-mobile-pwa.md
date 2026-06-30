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
- `E5-1.1` Touch-target audit + fixes (44×44px) across nav, cards, filters — _1d_
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
