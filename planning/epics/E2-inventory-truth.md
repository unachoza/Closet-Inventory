# E2 · Inventory Truth ⭐

> **Date:** 2026-06-20 · **Updated:** 2026-06-24 · **Pillar:** Inventory (the differentiator) · **Detail:** full · **README:** v1.5
> **Goal:** Know not just *what* you own but *what state it's in*, *where it is*, and whether it's *available*.
> The flagship, uncompeted feature. Full spec: [WardrobeStatusAndLocation.md](../WardrobeStatusAndLocation.md).
> Buildable localStorage-first; sync rides along when E1 lands.
>
> ### 🟡 PARKED under the 2026-06-24 reprioritization
> The new priority order (hotfixes → E1 → E5 → **E11 laundry** → E8 → E4) **does not schedule E2**.
> The clean/dirty bits this flagship needed for laundry — `status` clean/dirty, `wornCount`, `lastWornAt`,
> "Log a Wear" — **moved to [E11 · Laundry & Wear](./E11-laundry-wear.md)** (now owns those canonical fields).
> What remains here (location, `at_cleaner`/`on_loan`/`in_repair` statuses, availability, lending) is **parked /
> unscheduled** — confirm before pulling it back in. When E2 status ships, it **extends E11's `status` enum**,
> not a second field. See SPRINTS "⚠️ E2 now unscheduled" marker.

---

## US-2.1 — Mark what state a piece is in → **partly moved to E11**
_As Maya, I want to mark an item clean/dirty/at-the-cleaner/needs-repair/traveling/on-loan so that I know its real status._
- → **clean/dirty + wornCount + Log a Wear moved to [E11](./E11-laundry-wear.md) (US-11.1).** `status`/`wornCount`/`lastWornAt` are **owned by E11**.
- [ ] (parked) Extended statuses: `at_cleaner`, `in_repair`, `traveling`, `on_loan` — extend E11's enum
- [ ] (parked) Status chip on the card (token-colored)
- [ ] (parked) Quick-action menu sets status (context-aware per transition table)

**Tickets** _(parked unless E2 is rescheduled)_
- `E2-1.1` → see `E11-1.1` (fields moved)
- `E2-1.2` `utils/statusTransitions.ts` (immutable transitions) + unit tests — _1d_ (parked)
- `E2-1.3` Status chip on card (tokens.css colors) — _0.5d_ (parked)
- `E2-1.4` Quick-action menu (desktop ⋯ + mobile long-press) — _1–1.5d_ (parked)
- `E2-1.5` "Log a Wear" → **moved to `E11-1.2`**

## US-2.2 — Know where everything is
_As the "Our Closet" user, I want to tag an item's location so that I know if it's home, in storage, in a suitcase, or at another house._
- [ ] `location` field (label + kind: home/storage/suitcase/other)
- [ ] Location tag on card only when not at primary location
- [ ] "Where is everything" grouped-by-location view
- [ ] Multi-home presets + free-text

**Tickets**
- `E2-2.1` Add `location` to `ClothingItem`; primary-location default — _0.5d_
- `E2-2.2` `utils/locationGroups.ts` + tests — _0.5d_
- `E2-2.3` Location tag on card (hidden at home) — _0.5d_
- `E2-2.4` "Where is everything" grouped view — _1.5d_

## US-2.3 — Filter by status & location
_As Maya, I want to filter by status and location so that I can see "everything clean," "everything dirty," or "everything in Italy."_
- [ ] Status + Location filter dimensions in the filter panel
- [ ] Quick views: Available now · Out & about · Needs laundry · By location

**Tickets**
- `E2-3.1` Add Status + Location dimensions to `useClosetFilters` + hardcoded `DIMENSIONS` array — _1d_
- `E2-3.2` Quick-view presets — _1d_

## US-2.4 — Tell me when to do laundry → **moved to E11**
_As Maya, I want a nudge when I'm low on clean items in a category so that I do laundry before I run out._
- → **Entire story moved to [E11 · Laundry & Wear](./E11-laundry-wear.md) (US-11.2).** `E2-4.1`/`E2-4.2` are now `E11-2.1`/`E11-2.2`. E11 expands it with machine size, lifestyle, and item weight/volume.

## US-2.5 — Lend something and track it
_As the "Our Closet" user, I want to mark an item lent out (to whom, due when) so that I know who has my stuff._
- [ ] "Lend…" action → `on_loan` + `loan{ borrowerName, since, dueBack? }`
- [ ] "Lent out" view lists outstanding loans; overdue flagged
- [ ] (Borrower as app-user = E4; here borrower is free-text)

**Tickets**
- `E2-5.1` `loan` object + lend modal (free-text borrower + optional due date) — _1d_
- `E2-5.2` "Lent out" view with due dates + overdue flag — _1d_

## US-2.6 — Only consider what I can actually wear
_As Maya, I want availability derived so that outfit suggestions and borrowing never offer something dirty, away, or lent out._
- [ ] `isAvailable(item)` = clean + home + not on loan
- [ ] `availabilityReason()` returns a human reason when unavailable
- [ ] Consumed by E6 (outfit) and E4 (borrow)

**Tickets**
- `E2-6.1` `utils/availability.ts` + tests — _0.5d_

---

## US-2.8 — Does it actually fit?
_As Maya, I want to mark whether an item currently fits and record its measurements so that I stop holding onto things that don't fit and can compare sizing across brands._
- [ ] `fit` field on item — e.g. `"fits" | "too_big" | "too_small" | "unknown"` (optional, default `unknown`)
- [ ] `measurements` object on item, **all properties optional**:
  - `waist`, `chest`, `hips`, `length` — each a **number** (not string)
  - Each measurement stored with a unit so inches ↔ cm convert cleanly (e.g. `{ value: number; unit: "in" | "cm" }`, or store canonical cm + display-convert)
- [ ] Edit form inputs for fit + measurements; numeric validation; unit toggle
- [ ] Card/detail shows a "doesn't fit" affordance when `fit !== "fits"`

**Tickets**
- `E2-8.1` Add `fit` + `measurements` to `ClothingItem` (`@ntw/types` `Item` too); optional/defaulted — _0.5d_
- `E2-8.2` `utils/measurements.ts` — in↔cm conversion + tests — _0.5d_
- `E2-8.3` Fit + measurements inputs in `EditItemView` (numeric, unit toggle) — _1d_

## US-2.9 — Swim category
_As Maya, I want a Swim category so that swimsuits classify correctly instead of falling into tops/bottoms._
- [ ] Add `swim` to `CategoryType` (`src/utils/types.ts`) + the Form category list (`src/Features/Form/constants.ts`) + Carousel
- [ ] Category-map keywords: bikini, one-piece, swimsuit, tankini, two-piece → `swim`
- [ ] ⚠️ Hardcoded-list gotcha: also update any `DIMENSIONS` / category arrays `tsc` won't catch (see [[closet-hardcoded-ui-lists]])

**Ticket:** `E2-9.1` Add Swim category + keyword mappings across the hardcoded lists — _0.5d_

## US-2.7 — Notes field supports bulleted lists
_As Maya, I want to write structured notes on an item so that care tips and style reminders stay readable instead of a wall of text._
- [ ] Notes textarea: auto-prefix `•` on new line in edit mode, or accept `- ` markdown prefix
- [ ] Read mode renders as a `<ul>` when content looks bullet-like
- [ ] Existing plain-text notes remain intact (no migration)

**Ticket:** `E2-7.1` Update `EditItemView` notes textarea to encourage / render bullets — _0.5d_

---

## Companion enhancement — Material filter sort by blend %

> Lives here as a footnote; the ticket slots into **Sprint 3.5** as `E0-2.3`.

When a user filters by a material (e.g. Cotton), results should sort by that material's blend percentage descending (100% cotton → 55% → 7%). Sort key: `MaterialBlend.percentage` of the matched blend entry within `item.material[]`.

---

## Dependencies
- Independent of E1 (localStorage-first). **E1 must include status/location columns** in its schema so sync needs no later migration.
- **Feeds E4** (loan/availability) and **E6** (availability filter) — build before them.
- Hardcoded-list gotcha: new filter dimensions need manual `DIMENSIONS`/sort-array edits `tsc` won't catch.

## Definition of done (epic) — _scoped down; laundry + wornCount now in E11_
Items carry status (extending E11's enum) + location; cards show/set them; filters + "where is everything" work; lending is tracked; `isAvailable` is the shared gate. _(Laundry nudge + `wornCount` + "Log a Wear" shipped under [E11](./E11-laundry-wear.md).)_
