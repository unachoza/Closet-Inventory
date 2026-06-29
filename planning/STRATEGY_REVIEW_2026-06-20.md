# Strategy Review — Repo Health, Strengths/Weaknesses & What's Next - Written 2026-06-20

> **Date:** 2026-06-20 &nbsp;·&nbsp; **Audience:** personal strategy notes (polished, but for me).
> Companion to [README.md](../README.md) roadmap, [archive/FORWARD_PLAN.md](./archive/FORWARD_PLAN.md),
> [BACKEND_DATABASE_DECISION.md](./BACKEND_DATABASE_DECISION.md),
> [EngagingWebForProductDetails.md](./EngagingWebForProductDetails.md), [archive/TESTING_ROADMAP.md](./archive/TESTING_ROADMAP.md).
> Re-read the date above before trusting this — it goes stale as the code moves.

---

## Snapshot (as of 2026-06-20)

- `main` is **localStorage-only** via `closetRepository`; Supabase chosen as cloud backend (PR #44 closed, Firebase removed).
- 74 test files (1165 passing as of 2026-06-28); design-token system (`tokens.css`) layered over legacy `index.css`.
- Recently merged: unified search/filter (#69), filter-drawer fixes (#70), design-principles pass (#64), Nordstrom multi-size + inference improvements (#84).
- **FashionParser refactor (2026-06-28):** the ~8 scattered `infer*` / `normalize*` utils are now a proper domain module at `src/Features/FashionParser/`. 17 attribute maps, 6 normalizers, 6 inference functions, all consumers importing directly, legacy stubs deleted.

---

## Strengths (what's genuinely good)

1. **The inference pipeline is the crown jewel — and now properly organized.** `FashionParser` (`src/Features/FashionParser/`) consolidates 17 attribute maps, 3 normalizers, and 6 inference functions (`inferCare`, `inferOccasion`, `inferCategory`, `inferSeason`, `inferStyle`, `inferMaterial`) into a single domain module. Turning a thin product name into structured garment attributes + material blends is real, differentiated product value. It's also the leverage point for v2.2 (feed it richer text → better output, no new inference code).
2. **Clean separation of concerns.** `utils/` (pure, testable predicates) vs `hooks/` (stateful React) vs `Features/` (composition) is disciplined. Pure functions like `hasRequiredItemInfo` make the write path defensible and unit-testable.
3. **Design-token foundation exists.** `tokens.css` (primitive→semantic, light/dark) is the right architecture, even mid-migration off `index.css`.
4. **Planning hygiene is unusually strong.** Dated, cross-linked planning docs that *reconcile roadmap vs. reality* (FORWARD_PLAN explicitly calls out "done in docs ≠ done on main"). This is rare and worth keeping.
5. **Multi-retailer email parsing actually works against real fixtures** — not a toy.

---

## Weaknesses (what's holding it back)

1. **The "done" gap.** The README marks cloud sync, monetization scaffolding, etc. as shipped-ish, but `main` is localStorage-only. Anyone (including future-me) building on a ✅ that's actually in a branch will get burned. *Mitigated* by FORWARD_PLAN's reconciliation, but the source roadmap still over-claims.
2. **`ClothingItem` has a `[key: string]: any` index signature.** It silently hides flat-vs-nested mismatches (e.g. `style` attributes) from `tsc`. It's a deliberate footgun that has already caused real bugs (the `formData[key]` indexing error this session was a symptom of the same loose typing). Tightening this is high-leverage.
3. **Base64-in-localStorage image ceiling** (~5MB Safari, fails silently) — a *live* limitation today, and it gets worse the instant camera import (v3.1) lands. Flagged 🔴 in MOBILE_PLAN.
4. **Known correctness bugs with no regression tests** — material filter returns nothing, remove doesn't re-render the grid (two `useLocalCloset` instances), MonthYearPicker fabricated age. These erode trust in the core loop.
5. **Branch sprawl.** ~30 branches, several overlapping (multiple email/* and mobile/* lines). Risk of lost work and merge conflicts (already hit one this session). Worth a prune.
6. **CSS direction kept regressing** (filter drawer left/right flip-flopped across merges) — a symptom of the dual `index.css`/`tokens.css` layers and merge churn. The token cutover needs to finish.
7. **Mobile is responsive but not *mobile-first*** — the product/business model depends on mobile (PWA, no App Store cut), yet bottom nav / FAB / PWA are unbuilt.

---

## Recommended sequence (your ranking, with the DB contradiction resolved)

You ranked: **(1) known bugs → (2) merge cloud DB → (3) mobile + PWA → (4) v2.2 web-engagement.**
That order is sound. One fix: **#2 is gated by the [DB decision](./BACKEND_DATABASE_DECISION.md)** — "merge cloud DB" only means "merge #44" *if Firestore wins*. Decide first, then execute.

Estimates are **ideal dev-days** (focused, uninterrupted). Real calendar time runs longer.

### Priority 1 — Known bugs + green suite *(trust the core loop)*
> Small, high-confidence, each shippable alone. Do these first; they make everything after trustworthy.

| Task | Est. |
|---|---|
| Strip debug `console.log`s, get suite fully green (precondition) | 0.5 |
| **Material filter returns nothing** — extract `MaterialBlend` names before compare; + regression test | 0.5 |
| **Remove doesn't re-render grid** — route removal through shared `ClosetContext` instead of a 2nd `useLocalCloset`; + test | 1 |
| **MonthYearPicker fabricated age** — verify commit-to-`purchaseDate` across edit/create; + test | 1 |
| **Import-non-clothing** — skip items that can't map to a category (big for Amazon); + test | 1 |
| **Title-case CAPS** (Zara/Aritzia/Shein) cleanup | 0.5 |
| **Tighten `ClothingItem` typing** — remove/narrow the `[key: string]: any` footgun | 1–1.5 |
| **Subtotal** | **~5.5–6 days** |

### Priority 2 — Stand up the cloud layer *(gated by DB decision)*
> **Resolve [BACKEND_DATABASE_DECISION.md](./BACKEND_DATABASE_DECISION.md) first.**

| Task | Est. |
|---|---|
| Make the call: merge Firestore #44, or pivot to Supabase | decision, not days |
| *If Firestore:* rebase #44, resolve conflicts, QA seed/sync, ship | 1–2 |
| *If Supabase:* schema + RLS + auth/Gmail-token re-wire + port `useCloudCloset` | 5–8 |
| **Image storage: base64 → object storage** (do alongside, before camera import) | 1.5–2.5 |
| **Subtotal** | **~2.5–10.5 days** (path-dependent) |

### Priority 3 — Mobile + PWA *(the business model's load-bearing layer)*
| Task | Est. |
|---|---|
| Touch-target audit (44×44px) | 1 |
| Bottom nav + "Add Item" FAB (primary action out of the hamburger) | 2–3 |
| PWA scaffolding — `vite-plugin-pwa`, `manifest.json`, service worker, iOS meta, icons | 2–3 |
| Offline support via SW cache (pairs with offline-first DB) | 1.5 |
| **Decoupled early win:** `wornCount` field + "Log a Wear" button (unblocks v5/v7/v8) | 1 |
| **Subtotal** | **~7.5–9.5 days** |

### Priority 4 — v2.2 Web-engagement *(quality upgrade, gated on DB)*
> Full plan + risks in [EngagingWebForProductDetails.md](./EngagingWebForProductDetails.md). Do the **Phase-0 feasibility spike** before committing — Cloudflare bot-blocking (verified against Aritzia today) is the swing variable.

| Phase | Est. |
|---|---|
| Feasibility spike (Tier-C scraping API returns rendered DOM) | 1–1.5 |
| Backend `/enrich` + URL resolver + cache | 3–4 |
| Extraction (JSON-LD-first + 2 retailer packs) | 2–3 |
| Client integration + review UX | 2–3 |
| Hardening + more retailer packs | 2–3 |
| **Subtotal** | **~10–14.5 days** |

---

## Quick wins to slot between the big rocks *(palate cleansers)*

From [archive/QUICK_WINS.md](./archive/QUICK_WINS.md) / [archive/FORWARD_PLAN.md](./archive/FORWARD_PLAN.md) — small, close to existing architecture:

- 🟢 Sort by real `purchaseDate` (~0.25d) — `useClosetSort` still fakes age via condition labels.
- 🟢 "Dry clean only" quick-filter pill (~0.25d) — `care` already indexed.
- 🟡 Stats strip (`useClosetStats`, in-memory) — total items / spend / avg (~1d, no chart lib).
- 🟠 Finish the `index.css` → `tokens.css` cutover (stops CSS-direction regressions) (~2–3d, ongoing).
- 🧹 Prune dead branches (~0.5d) — reduce the ~30-branch sprawl.

---

## One-paragraph "what should I actually do Monday"

~~Decide the DB question~~ — **done: Supabase.** FashionParser is also done and cleaned up. The priority stack has shifted: stand up the Supabase cloud layer (schema + RLS + `useCloudCloset` port + image storage) while it's top of mind. Then spend a focused block on **Priority 1** bugs — material filter, grid remove re-render, `ClothingItem` typing. Keep v2.2 parked until after a 1-day feasibility spike; don't let the most interesting feature jump its priority. The 4 deferred email-parser tests (taxonomy: `fit` → `silhouette`/`legShape`) are small and a good warm-up before the bigger cloud work.
