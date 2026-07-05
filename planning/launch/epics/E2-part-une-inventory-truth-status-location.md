# E2 Part Une — Inventory Truth · Status & Location ⭐

> **Date:** 2026-07-04 · **Branch:** `EPIC-status-location` · **Parent:** [E2 · Inventory Truth](./E2-inventory-truth.md)
> **Personas:** [USER_PERSONAS.md](../../USER_PERSONAS.md) (consolidated)
>
> **Scope — this branch, this doc: `status` + `location` only. Period.**
> Lending, availability derivation, laundry forecast, taxonomy, provenance, multi-photo, and fit/measurements
> stay in the parent [E2](./E2-inventory-truth.md) and are **out of scope here**. This doc carves out the two
> spine primitives — *what state is it in* and *where is it* — turns the personas into concrete status/location
> stories, and documents exactly how a user **updates** them (edit form + Gmail import).

---

## Why status + location first

From [USER_PERSONAS.md](../../USER_PERSONAS.md): every persona has a **logistics** problem, and the derived
concept every downstream feature reads is **availability = clean AND home AND not-on-loan**. You cannot build
Morning Mode (Becca), the Lending Circle (Closet Pair, Sloane), or "filter by where I am right now" (Sloane
SL1) without the two primitives underneath:

- **`status`** — mutable lifecycle state: `clean · dirty · at_cleaner · in_repair · traveling · on_loan`
- **`location`** — where the item physically is: `home` (primary/neutral) · `storage` · `suitcase` · `other`

> Persona pull: the **Closet Pair** and **Sloane** drive *location*; **Becca** drives *status*; **Diana** and
> **Arianna** need both. Sloane is the strongest argument for **multi-home / custom-labeled locations** — the
> single starter registry can't express her four homes yet (see tickets P1-6/P1-7).

---

## What's built on this branch ✅

The card-border toggle + edit-form capture + data model are **done** (branch `EPIC-status-location`):

- [x] **Location registry** — [`src/utils/locations.ts`](../../../src/utils/locations.ts): `LocationKind`,
      `Location`, `LOCATIONS` starter set (Home/Storage/Suitcase/Other), `getLocation()`/`isPrimaryLocation()`
      (absent → home). Unit-tested.
- [x] **Status vocab** — `statusOptions` in [`constants.ts`](../../../src/utils/constants.ts); `ItemStatus` +
      `locationId` already on `ClothingItem`.
- [x] **Overview border toggle** — sticky-bar control cycles **Off → Location → Location + Status**
      ([`SearchSortBar.tsx`](../../../src/Features/SearchCloset/SearchSortBar.tsx),
      [`borderMode.ts`](../../../src/utils/borderMode.ts)); state persists to `localStorage`.
- [x] **Card rendering** — [`FilteredCard.tsx`](../../../src/Features/SearchCloset/FilteredCard.tsx): border
      color = location (home = neutral, per spec); status dot in the combined mode. Brand-token colors in
      [`EntireCloset.css`](../../../src/Features/SearchCloset/EntireCloset.css); reserved border avoids reflow.
- [x] **Edit-form capture** — Status + Location `<select>`s in
      [`EditItemView.tsx`](../../../src/Features/Form/EditItemView/EditItemView.tsx) (see flow below).
- [x] **Seed demo data** — several `MY_CLOSET_DATA` items carry status/location so borders are visible now.

**Not yet (still status/location scope, next increments):** the "where is everything" grouped view, custom /
multi-home locations, status quick-action menu, status/location **filter dimensions**.

---

## Persona-derived user stories — status & location only

Filtered from the persona docs to the two primitives (lending/availability logic itself is parent-E2).

| # | As… | I want to… | So that… | Status |
|---|---|---|---|---|
| SL-1 | Founder / Curator / Pair | tag an item's **location** (home · storage · suitcase · other) | my closet knows where each piece physically is | ✅ edit form + model |
| SL-2 | Everyone | see a **location indicator** on the card when an item is *away* (home shows nothing) | I spot what's not here at a glance | ✅ border toggle |
| SL-3 | Executive Mom | set an item's **status** (clean/dirty/at cleaner/in repair/traveling/on loan) | the closet reflects what's actually wearable | ✅ edit form |
| SL-4 | Everyone | see a **status indicator** on the card | I read state without opening the item | ✅ status dot (combined mode) |
| SL-5 | Sloane | define **my own named locations** (Nolita, Hamptons, Paris, Aspen safe) | the model matches my real geography | ⏳ P1-6 |
| SL-6 | Sloane / Pair | **filter** the closet by location ("what's in NYC right now") | I only see what's accessible | ⏳ P1-8 |
| SL-7 | Executive Mom | **filter** by status ("everything clean") | I plan around what's ready | ⏳ P1-8 |
| SL-8 | Curator / Sloane | a **"where is everything"** grouped-by-location view | I see the whole wardrobe across places at once | ⏳ P1-5 |
| SL-9 | Pair / Founder | set status/location **quickly from the card** (not only the full edit form) | updating state is one gesture, not a form | ⏳ P1-4 |
| SL-10 | Everyone | have **new imports default** to `clean` + primary `home` | I don't have to set state on every imported item | ✅ defaults (see Gmail flow) |
| SL-11 | Everyone | a **legend** telling me what each border color / status dot means | the borders are readable without guessing | ⏳ P1-10 |
| SL-12 | Sloane / Pair | **filter** the closet by location from the filter side panel | I can see "everything in NYC" / "everything in storage" | ⏳ P1-8 |
| SL-13 | Founder / Curator | record **why** an item is dirty / in-repair (airing · stain · musty // hardware · fabric · fit) | I know what actually needs doing before it's wearable | ⏳ P1-11 |
| SL-14 | Curator / Founder | mark an item **stored** (off-season) or **airing** (worn, resting — not dirty yet) | out-of-rotation and worn-resting pieces stop reading as clean *or* dirty | ⏳ P1-11 |
| SL-15 | Sloane / Pair / Curator | **name my own locations** during profile setup (multi-home) | the model matches my real geography, not 4 generic kinds | ⏳ P1-6 / P1-7 |

---

## Tickets

**Done on this branch (check evidence in parent E2):**
- [x] `P1-1` Location registry + primary-home default (`locations.ts` + tests) — _was `E2-2.1`_
- [x] `P1-2` Location indicator on card, hidden at home (border) — _was `E2-2.3`_
- [x] `P1-3` Status indicator on card, token-colored (status dot) — _was part of `E2-1.3`_
- [x] `P1-3b` Status + Location capture in the edit form (selects) — _new_
- [x] `P1-3c` Overview border-mode toggle (Off / Location / Location+Status) + seed data — _new_

**Next (still status/location scope):**
- [ ] `P1-4` Card quick-action menu to set status/location without the full form (desktop ⋯ + mobile long-press) — _~1–1.5d_
- [ ] `P1-5` "Where is everything" grouped-by-location view (counts per group) — _~1.5d_
- [ ] `P1-6` Custom / multi-home locations: user-defined labels beyond the 4 starter kinds (Sloane's 4 homes) — _~1.5d_
- [ ] `P1-7` Per-persona / per-user location presets (seed a starter set from onboarding) — _~0.5d_
- [ ] `P1-8` Status + Location **filter dimensions** in `useClosetFilters` + hardcoded `DIMENSIONS` array — _~1d_ ⚠️ hardcoded-list gotcha
- [ ] `P1-9` Status transition helper (`utils/statusTransitions.ts`) so quick-actions are consistent — _~1d_
- [ ] `P1-10` **Border/status legend** on the overview when the toggle is active, with a non-color cue (a11y) — _~0.5d_
- [ ] `P1-11` **Status model v2** — re-add `stored` + `airing` states and an optional structured `statusReason` (dirty: airing/stain/musty/seasonal · in_repair: hardware/fabric/fit) — _~1d_ (model + edit-form + filter)

> Deliberately **excluded** (parent E2, not this branch): lend modal + loan object, `isAvailable()` derivation,
> laundry forecast, taxonomy, provenance, multi-photo, fit/measurements.

---

## Deepening (2026-07-05) — legend · location filter · status-reason model · profile locations

### D1 · Border/status legend + accessibility (`P1-10`)

_As any user, I want a legend for the border colors and status dots so that the encoding is readable, and I want a cue that isn't color-only so it works if I'm color-blind._

- **Legend surface:** when the border toggle is **not** `off`, show a compact legend (dismissible strip or an info popover on the toggle). In `Location` mode it lists the location→color mapping (Storage · Suitcase · Other + "Home = no border"); in `Location + Status` mode it adds the status→dot-color mapping.
- **Accessibility (bake in now, per the a11y blind spot):** color alone fails WCAG. Mitigations to spec:
  - the **status dot already carries a `title`/`aria-label`** — keep it and make it the accessible source of truth;
  - give each location kind a **distinct non-color cue** (a small icon or border *style* — e.g. solid vs dashed — not just hue), so the map survives grayscale;
  - the legend text labels are the fallback for anyone who can't read the color.
- **Copy is internal-only for now** (no user-facing polish needed yet, per scope).

**Tickets:** `P1-10.1` legend component (mode-aware) · `P1-10.2` non-color cue on card (icon or border-style per kind) · `P1-10.3` legend text + `aria` labels.

### D2 · Location filter in the filter side panel (`P1-8`, location half)

_As Sloane / the Closet Pair, I want to filter my closet by location from the existing filter side panel so that I can answer "what's in NYC right now" / "what's in storage."_

- Adds **Location** (and **Status**) as filter **dimensions** in `useClosetFilters` — options come from the location registry (and later the user's custom locations, `P1-6`), plus the status vocab.
- ⚠️ **Hardcoded-list gotcha** ([[closet-hardcoded-ui-lists]]): a new filter dimension needs manual edits to the hardcoded `DIMENSIONS` / options arrays that `tsc` won't catch — verify in the UI, not just the type-checker.
- Interaction with the border toggle: filtering by location and *coloring* by location are complementary — a user can filter to "Suitcase" and still see the status dots.

**Tickets:** `P1-8.1` add `location` + `status` to `FilterDimension` + `DIMENSIONS` · `P1-8.2` feed registry/custom locations + status vocab as options · `P1-8.3` filter-pill labels humanize `on_loan` → "on loan", etc.

### D3 · Status model v2 — reasons + resting/stored states (`P1-11`)

_The dirty/in_repair scenarios you described are **reasons**, not new statuses — but two genuinely-missing states surfaced._

**Two states to re-add** (they were in the original [WardrobeStatusAndLocation](../../WardrobeStatusAndLocation.md) spec and got dropped):

| State | Meaning | Example |
|---|---|---|
| `airing` | Worn briefly, hung to air out — **wearable again without a full wash** (not dirty yet) | "Wore it an hour, hung it back up" |
| `stored` | Intentionally out of rotation — off-season / archived | "Winter sweaters boxed until October" |

> `airing` sits **between clean and dirty** and is the state the "post-wear storage" scenario needs. `stored`
> pairs naturally with `location.kind = storage`. **Ownership note:** E11 owns `clean`/`dirty`; these two are
> "sidelined / where-it-is" states, which are E2's half of the enum — same split as `at_cleaner`/`on_loan`.

**Structured `statusReason` (optional) — capture the *why* without exploding the enum:**

| Status | `statusReason` vocab | From your scenarios |
|---|---|---|
| `dirty` | `airing_then_wash` · `stain` · `musty_seasonal` · `spill` | brief-wear-then-wash · accidental stains · seasonal-transition musty |
| `in_repair` | `hardware` · `fabric` · `fit` | broken zipper/button/belt-loop · ripped seam/hem/hole/snag · needs tailoring |
| `stored` | `off_season` · `sentimental` · `overflow` | seasonal storage · keepsake · no room |

- Model: `status: ItemStatus` stays a **single enum**; add `statusReason?: string` (+ optional free-text `statusNote?`). Reasons are **filterable** and drive smarter nudges later (e.g. "3 items airing — wash soon", "2 items need tailoring").
- **Cross-links (don't duplicate):** `in_repair` + `fit` reason ↔ **US-2.8 fit/measurements** (parent E2); `in_repair` "at tailor" ↔ `location.kind = other`; repair reason vs `condition: needs_repair` (wear-quality) stay distinct — *status* is the active state, *condition* is the standing fact.
- Edit form: `in_repair`/`dirty`/`stored` reveal a second **reason** select; the card can show the reason on the status-dot tooltip.

**Tickets:** `P1-11.1` add `airing` + `stored` to `ItemStatus` + colors/legend · `P1-11.2` `statusReason` vocab + optional `statusNote` on `ClothingItem` · `P1-11.3` reason select in `EditItemView` (conditional on status) · `P1-11.4` reason as a filter facet under Status.

### D4 · Profile setup — naming locations (multi-home) (`P1-6` / `P1-7`)

_As Sloane / the Closet Pair / Diana, I want to name my own locations during profile setup so that "Lake Como house" and "Aspen safe" replace the 4 generic kinds._

- The 4 `kind`s (`home`/`storage`/`suitcase`/`other`) become the **taxonomy**; users add **named locations** that each map to a kind — e.g. Sloane's *Nolita apartment → home*, *Hamptons house → other*, *Aspen safe → other*, *Carry-on → suitcase*. Per-persona starter sets live in [USER_PERSONAS.md](../../USER_PERSONAS.md).
- **Onboarding step:** a "Where do your clothes live?" screen seeds a starter set (Home + optionally Storage / Suitcase). Multi-home users add more; single-home users (Maya, Becca) skip it.
- **Primary location** = the neutral/home one; everything defaults there. Diana's case shows even a single address may want **multiple in-home zones** (bedroom closet / guest room / basement) mapping to `home`/`storage`.
- Data: needs a per-user `locations` collection (not just the static `LOCATIONS` starter registry) — this is the model change behind `P1-6`; `P1-7` seeds presets at onboarding.

**Tickets:** `P1-6.1` per-user `locations` store (CRUD, each maps to a `kind`) · `P1-6.2` custom-location picker in the edit form + filter · `P1-7.1` "Where do your clothes live?" onboarding step w/ persona-style presets · `P1-7.2` migrate the static starter `LOCATIONS` into the per-user store on first run.

> **Cross-epic:** naming locations is part of **profile/onboarding** — coordinate with [E12 · User Profile](../../epics/E12-user-profile.md) so location-naming lives in one onboarding flow, and with [E10 · Monetization](../../epics/E10-monetization.md) (multi-home custom locations may be a premium affordance).

---

## Update flows — how a user changes status / location

### A) From the edit form (`EditItemView`)

The primary, explicit path. Both fields are bespoke `<select>`s (not free-text), pulled out of the generic
field renderer so they never appear as raw text inputs.

```
Closet overview  →  tap a card  →  card flips / opens  →  Edit
  → EditItemView renders:
      • Condition  (WearState: new · like new · good · fair · poor · needs repair)   [humanized labels]
      • Status     (clean · dirty · at cleaner · in repair · traveling · on loan)    ← select
      • Location   (Home · Storage · Suitcase · Other)                               ← select, defaults "Home"
  → user picks Status = "traveling", Location = "Suitcase"
  → Save Changes
      → updateItem(id, formData) persists via closetRepository (localStorage now, Supabase on sync)
  → back to carousel; overview border/dot reflect the new state immediately
```

Code: `handleStatusChange` / `handleLocationChange` write `formData.status` / `formData.locationId`; persistence
rides the existing `updateItem` (edit) / `addFullItem` (create) path — no new write plumbing.

**Gap → P1-4:** today status/location change *only* through the full edit form. Personas (Closet Pair "mark on
loan", Becca "mark dirty") want a **one-gesture** update from the card — the quick-action menu.

### B) From the Gmail import (`EditItemView` in create/batch mode)

Import can't know an item's physical location or wash state, so both **default** and are **confirmable per item**
during the same review screen — no separate step.

```
Gmail import  →  parse receipts  →  batch review queue (EditItemView, mode="create")
  For each parsed item:
      • Status   → defaults "clean"   (a fresh purchase is clean)
      • Location → defaults "home"    (getLocation(undefined) → primary; select shows "Home")
      • same Status / Location selects are present → user can override before "Add to Closet"
  → addFullItem(...) persists status + locationId with the rest of the parsed fields
  → Skip / next advances the queue
```

Notes:
- The email parser sets **category, color, price, material, purchaseDate, condition-by-age**, etc. — it does
  **not** infer status/location (correctly; the inbox can't know them). Defaults + per-item override is the model.
- **Enhancement (P1-7):** default a batch's location to the user's chosen **primary/home preset** (e.g. Sloane
  → "Nolita apartment") instead of the generic "Home", and optionally set status `traveling` when the item is
  literally still shipping. Both are post-branch.

---

## Persona location mapping

Named starter locations per persona live in [USER_PERSONAS.md](../../USER_PERSONAS.md) under each persona's
**Named Locations** block. Summary of the modelling pressure they create:

| Persona | Dominant axis | Location need |
|---|---|---|
| Maya | status (light) | 1 home + gym/travel — starter registry is enough |
| Closet Pair | **location** | 2 homes + "with [person]" + suitcase → needs multi-`other` / custom labels (P1-6) |
| Founder | both | home + storage + cleaner + on-loan |
| Executive Mom | **status** | mostly `home`; dry cleaner + laundry states |
| Curator | location (in-home) | 3 in-home zones → multiple `home`/`storage` labels in one address (P1-6) |
| Stylist (Pro) | status (rich) | studio + on-set + tailor + showrooms — Pro tier, post-branch |
| Collector | **location** | 4 homes + safe + with-friend + carry-on → the flagship multi-home case (P1-6) |

**Takeaway:** the current one-of-each-kind registry ships the happy path (Maya, Becca). **P1-6 (custom /
multi-home locations)** is the next unlock and is driven hardest by **Sloane** and the **Closet Pair**.
