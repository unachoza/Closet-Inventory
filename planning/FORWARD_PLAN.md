# Forward Plan — Reconciliation & Next Steps
## Written 2026-06-14.

> Written 2026-06-14. Companion to [README.md](../README.md) roadmap,
> [QUICK_WINS.md](./QUICK_WINS.md), [MOBILE_PLAN.md](./MOBILE_PLAN.md).
> This doc **reconciles** the roadmap against what's actually on `main` and on
> this branch — it does not re-prioritize. For testing see
> [TESTING_ROADMAP.md](./TESTING_ROADMAP.md).

---

## Status deltas — "done" in the docs ≠ done on `main`

The README marks several things ✅ that aren't on `main`. Confirm before building on them.

- **Cloud layer is NOT on `main`.** Firestore + Firebase Auth + sync/seed live in PR [#44](https://github.com/unachoza/Closet-Inventory/pull/44). On `main` the closet is **localStorage-only** (`useLocalCloset`). Everything gated on the backend (v6.1 social, v9.0 monetization `isPremium`, multi-device) is gated on that merge.
- **Base64 images in localStorage is a live ceiling**, not a future risk — `ImageUploader` → base64 → one `localStorage` key, ~5 MB mobile Safari cap, fails silently ([MOBILE_PLAN](./MOBILE_PLAN.md) 🔴). This worsens the moment camera import (v3.1) lands.
- **This branch (`CARD-attr`) reverted two in-progress fixes** — style-attribute preservation through the import→save pipeline (`buildClothingItem` / `buildFormDataFromItem` / `addFullItem` no longer carry `style`) and the care-trait rules in `inferCareFromMaterial`. If surfacing style on the card is still wanted, that plumbing needs re-landing (see "Card style attributes" below).

---

## Near-term (mobile-first — order per README, unchanged)

1. **Mobile UI polish** — 44×44px touch-target audit; bottom nav / "Add Item" FAB so the primary action isn't buried in the hamburger drawer.
2. **PWA scaffolding** — `vite-plugin-pwa`: `manifest.json`, service worker, iOS meta, app icons. Load-bearing for monetization (no App Store cut), offline, add-to-home-screen.
3. **Camera capture / camera-roll import** — native `<input type="file" accept="image/*" capture="environment">`; fastest logging path for the mobile persona, and the only path for in-store / second-hand items.

**Decoupled early wins (pull out of their milestones):**
- **`wornCount` + "Log a Wear" button** — required by v7 lifespan + v8 sustainability + cost-per-wear. Ship the field early, independent of the analytics dashboard.
- **Base64 → blob/URL image storage** — unblocks the mobile quota wall before camera import multiplies it.

---

## Quick wins still open (from QUICK_WINS.md)

Effort-ranked, close to existing architecture:

- 🟢 **Sort by `purchaseDate`** — `useClosetSort` still fakes age via condition labels; add `purchasedNewest`/`purchasedOldest` on real ISO dates (~5 lines).
- 🟢 **"Dry clean only" quick-filter pill** — `care` is already indexed by `useClosetFilters`; one toggle pill.
- 🟡 **Stats strip** (`useClosetStats`) — total items / total spend / avg price as text chips; no chart lib.
- 🟡 **Cost-per-wear chip** — needs `wornCount` (above); `$price / wornCount` on the card back.
- 🟠 **Dark mode** — tokens already in `index.css`; add `[data-theme="dark"]` block + NavBar toggle → localStorage.

---

## Card style attributes (this branch's theme)

The inference pipeline already produces rich `ProductAttributes` (neckline, fit, sleeve, hem, pattern, accents) via `inferProductAttributes`, but on `main` they don't reach the card. To finish:

1. Carry `style` through the three hand-listed object literals that currently drop it: `buildClothingItem` (App), `buildFormDataFromItem` + `addFullItem` (EditItemView).
2. Read `item.style?.*` in CardDetails (the `[key: string]: any` index signature on `ClothingItem` hides the flat-vs-nested mismatch from `tsc` — a deliberate footgun worth removing later).
3. Settle the Style section's render format (joined `neckline · sleeve` vs labeled `Neckline:` lines) and align the test.

---

## Known bugs (from README + TESTING_PLAN)

Carry these as regression-test targets (see TESTING_ROADMAP):

- **MonthYearPicker fabricated age** — mount-guard added; full commit-to-`purchaseDate` verification across edit/create still pending.
- **Material filter returns nothing** in EntireClosetView — `material` is `MaterialBlend[]`, filter compares against raw objects; extract names first.
- **Remove doesn't re-render the grid** — `Card` uses a separate `useLocalStorageCloset` instance from `Closet`; route removal through the shared instance / `ClosetContext`.
- **Import-non-clothing** — if a product can't map to a category, skip it (big for Amazon emails).
- **Title-case CAPS** — Zara/Aritzia/Shein names still not fully de-capsed.
- **Email preview horizontal scroll** — some previews overflow.

---

## Sequencing recommendation

1. **Get the suite green + strip debug logs** (precondition for everything — see TESTING_ROADMAP).
2. **Land the known-bug fixes with regression tests** (material filter, remove-rerender, MonthYearPicker) — small, high-confidence, and they unblock trustworthy behavior.
3. **Image storage refactor** (base64 → blob) before camera import.
4. **Mobile polish → PWA → camera**, per README order.
5. Quick wins (`purchaseDate` sort, dry-clean pill, stats strip) slotted as palate-cleansers between the above.
