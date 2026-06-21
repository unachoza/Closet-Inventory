# Feature Spec — Wardrobe Status, Location & Availability

> **Date:** 2026-06-20 &nbsp;·&nbsp; **Status:** SPEC (pre-build). &nbsp;·&nbsp; **Audience:** personal build notes.
> The flagship differentiator from [PRODUCT_VISION_2026-06-20.md](./PRODUCT_VISION_2026-06-20.md) +
> [COMPETITIVE_ANALYSIS_2026-06-20.md](./COMPETITIVE_ANALYSIS_2026-06-20.md), fleshed into buildable pieces:
> data model → business logic → UI. Maps to README milestone **v1.5**.

---

## Why this is one feature, not four

`status`, `location`, `availability`, and `laundry forecast` look like four things. They're one system
with a single derived concept at the center — **availability** — that every other feature reads:

```
   status ─┐
 location ─┼──►  AVAILABILITY (derived)  ──►  outfit suggestions (v7)
  on-loan ─┘                              ──►  borrowing eligibility (v8)
                                          ──►  laundry forecast (this milestone)
```

Build the data + availability derivation once; everything downstream consumes it.

---

## 1. Data model

Extends `ClothingItem` (`src/utils/types.ts`). New fields, all optional for back-compat:

```ts
/** Mutable lifecycle state — distinct from `condition` (which is wear-quality, not where-it-is-now). */
export type ItemStatus =
  | "clean"          // default; available
  | "dirty"          // worn, needs laundering
  | "at_cleaner"     // out at dry cleaner
  | "needs_repair"   // damaged, awaiting fix (overlaps condition='needs repair')
  | "traveling"      // packed / away with the owner
  | "on_loan"        // lent to someone (see loan)
  | "packed"         // staged for a trip but not yet gone
  | "stored";        // off-season / archived, intentionally out of rotation

export interface ItemLocation {
  label: string;            // "Home", "Aspen house", "Italy house", "Storage unit B", "Carry-on"
  kind: "home" | "storage" | "suitcase" | "other";
  isPrimary?: boolean;      // the user's default/home location
}

export interface ItemLoan {
  borrowerId?: string;      // app user id (v8) — null if a non-user (free-text name)
  borrowerName: string;     // "Cousin Jess"
  since: string;            // ISO
  dueBack?: string;         // ISO, optional
  note?: string;
}

// Added to ClothingItem:
interface ClothingItemStatusFields {
  status?: ItemStatus;       // default "clean"
  location?: ItemLocation;   // default the user's primary location
  loan?: ItemLoan;           // present iff status === "on_loan"
  wornCount?: number;        // default 0 — shared with v5/v9/v10
  lastWornAt?: string;       // ISO — drives "haven't worn in…" + laundry recency
}
```

**Design decisions & rationale:**
- **`status` is separate from `condition`.** `condition` = quality (new/like-new/good/fair/needs-repair, mostly static). `status` = current lifecycle state (changes daily). Conflating them was the temptation; keep them orthogonal. `needs_repair` appears in both intentionally — condition is the *fact*, status is the *active state* ("currently sidelined for repair").
- **`status` is a single enum, not a set.** An item is in one place/state at a time. If real overlap emerges ("dirty AND traveling"), revisit — but start simple. (`packed` vs `traveling` already covers the trip lifecycle.)
- **`location` is structured, not free-text-only.** `kind` enables grouping ("everything in `suitcase`") and the travel features; `label` stays human. Presets + free-text for the long tail.
- **`loan` is its own object** so v8 borrowing can attach a real `borrowerId`, due dates, and reminders — and so "what's lent out / overdue" is a clean query.
- **Everything optional + defaulted** → no migration pain on existing localStorage items; absent `status` reads as `clean`, absent `location` as primary/home.

---

## 2. Business logic (pure, testable — lives in `utils/`)

Keep this UI-free and unit-tested, consistent with the `hasRequiredItemInfo` pattern.

```ts
// utils/availability.ts
export function isAvailable(item: ClothingItem): boolean {
  const status = item.status ?? "clean";
  const atHome = (item.location?.kind ?? "home") === "home";
  return status === "clean" && atHome && status !== "on_loan";
}

export function availabilityReason(item: ClothingItem): string | null {
  // returns null if available, else a human reason: "at the dry cleaner", "lent to Cousin Jess", "in Italy"
}
```

```ts
// utils/laundryForecast.ts
export interface LaundrySignal {
  category: string;
  clean: number;
  total: number;
  ratio: number;          // clean / total
  needsLaundrySoon: boolean; // ratio <= threshold (default 0.2)
}
export function laundryForecast(items: ClothingItem[], threshold = 0.2): LaundrySignal[];
// "4 of 5 workout leggings are dirty → ratio 0.2 → needsLaundrySoon"
```

```ts
// utils/locationGroups.ts — group items by location for the "where is everything" view
export function groupByLocation(items: ClothingItem[]): Record<string, ClothingItem[]>;
```

**Status transitions** (a tiny state machine so quick-actions are consistent):

| From | Action | To | Side effect |
|---|---|---|---|
| clean | "Wear it" / Log a Wear | dirty | `wornCount++`, `lastWornAt = now` |
| dirty | "Sent to cleaner" | at_cleaner | — |
| dirty | "Did laundry" | clean | — |
| at_cleaner | "Picked up" | clean | — |
| any | "Lend…" | on_loan | set `loan{}` |
| on_loan | "Returned" | clean (or prior) | clear `loan` |
| any | "Pack for trip" | packed | optionally set `location.kind='suitcase'` |
| packed | "Trip started" | traveling | — |
| traveling | "Home" | clean/dirty (ask) | reset `location` to primary |

> All transitions are **immutable updates** (return new item), per coding-style rules.

---

## 3. UI rendering

### a) On the item card (the high-frequency surface)
- **Status chip** — small colored pill (clean=sage, dirty=ochre, at_cleaner=slate, on_loan=terracotta, etc., from `tokens.css`). Out-of-rotation items get a subtly dimmed card so "out of sight" becomes "visibly out."
- **Location tag** — only shown when *not* at primary location ("📍 Italy", "🧳 Carry-on", "🤝 Cousin Jess"). At-home items show nothing (avoid clutter).
- **Quick-action menu** (⋯ or long-press on mobile): Mark dirty · Did laundry · Send to cleaner · Lend… · Pack — context-aware per the transition table.

### b) Filters & quick views (extends the existing filter panel)
- New filter dimensions: **Status** and **Location** (slot into `useClosetFilters` + the hardcoded `DIMENSIONS` array — see the design memo about hardcoded UI lists).
- Quick views: **"Available now"** (clean + home), **"Out & about"** (traveling/on-loan/at-cleaner), **"Needs laundry,"** **"By location."**

### c) "Where is everything" view
- Grouped-by-location layout (accordion or columns): Home · Aspen · Italy · Storage · Lent out · Traveling. Counts per group. This is the literal answer to the founder story.

### d) Laundry forecast surface
- A dismissible strip / card on the closet overview: *"You're low on clean workout leggings (1 of 5). Time for laundry?"* Driven by `laundryForecast()`. Tap → filtered to that category's dirty items.

### e) Lend flow (bridges to v8)
- "Lend…" → pick borrower (free-text now; app friends in v8) + optional due-back date → status `on_loan`, location `→ borrower`. A **"Lent out"** view lists everything outstanding with due dates; overdue items flagged.

---

## 4. Build phases & estimates (dev-days, ideal)

| Phase | Scope | Est. |
|---|---|---|
| **1. Data + logic** | add fields to `ClothingItem`; `availability` / `laundryForecast` / `locationGroups` + status-transition helper; full unit tests | **2–2.5** |
| **2. Card status/location UI** | status chip, location tag, dimmed out-of-rotation card, quick-action menu (desktop + mobile long-press) | **2–3** |
| **3. Filters + quick views** | Status/Location filter dimensions, "Available now / By location / Needs laundry" views | **1.5–2** |
| **4. Where-is-everything + laundry strip** | grouped-by-location view; laundry-forecast nudge | **1.5–2** |
| **5. Lend flow** | lend modal, on-loan status, "Lent out" view with due dates (non-user borrowers; full social in v8) | **1.5–2** |
| **Total** | the v1.5 inventory spine | **~8.5–11.5 days** |

> `wornCount` + "Log a Wear" is embedded in Phase 1's transition logic (clean→dirty bumps it) — so this milestone *delivers* the decoupled `wornCount` win that v5/v9/v10 depend on.

---

## 5. Dependencies & sequencing notes

- **Needs the backend decision** only for cross-device sync of status/location — the model + UI can ship on localStorage first and sync later. Good candidate to build *before* the Supabase migration and let it ride along.
- **Feeds v7 outfit builder** (availability filter) and **v8 borrowing** (loan object + availability) — build this *first*, they consume it.
- **Pairs with v6 travel** — `packed`/`traveling` + `suitcase` location are the same primitives the packing/weight features need.
- **Hardcoded-list gotcha:** new Status/Location filter dimensions require edits to the hardcoded `DIMENSIONS` / sort-option arrays that `tsc` won't catch — verify in the UI.

---

## 6. Open questions

- [ ] Single `status` enum vs. allow combos (dirty + traveling)? Start single; revisit if users hit the wall.
- [ ] Should `stored`/off-season items be hidden from the default closet view (true "out of rotation")? Lean yes, with an easy "show stored" toggle.
- [ ] Location presets — ship a starter set (Home/Storage/Suitcase) or let users define all? Lean starter set + add-your-own.
- [ ] Laundry threshold — fixed 20%, or per-category/user-tunable? Start fixed, make it a constant.
