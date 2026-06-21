# E2 · Inventory Truth ⭐

> **Date:** 2026-06-20 · **Pillar:** Inventory (the differentiator) · **Detail:** full · **README:** v1.5 · **Est:** ~8.5–11.5 dev-days
> **Goal:** Know not just *what* you own but *what state it's in*, *where it is*, and whether it's *available*.
> The flagship, uncompeted feature. Full spec: [WardrobeStatusAndLocation.md](../WardrobeStatusAndLocation.md).
> Buildable localStorage-first; sync rides along when E1 lands.

---

## US-2.1 — Mark what state a piece is in
_As Maya, I want to mark an item clean/dirty/at-the-cleaner/needs-repair/traveling/on-loan so that I know its real status._
- [ ] `status` enum on items, default `clean`
- [ ] Status chip on the card (token-colored)
- [ ] Quick-action menu sets status (context-aware per transition table)
- [ ] Logging a wear flips clean→dirty and bumps `wornCount`

**Tickets**
- `E2-1.1` Add `status`, `wornCount`, `lastWornAt` to `ClothingItem` (optional, defaulted) — _0.5d_
- `E2-1.2` `utils/statusTransitions.ts` (immutable transitions) + unit tests — _1d_
- `E2-1.3` Status chip on card (tokens.css colors) — _0.5d_
- `E2-1.4` Quick-action menu (desktop ⋯ + mobile long-press) — _1–1.5d_
- `E2-1.5` "Log a Wear" → clean→dirty + `wornCount++` — _0.5d_

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

## US-2.4 — Tell me when to do laundry
_As Maya, I want a nudge when I'm low on clean items in a category so that I do laundry before I run out._
- [ ] `laundryForecast()` computes clean/dirty ratio per category
- [ ] Dismissible nudge on the overview when a category is low
- [ ] Tap → filtered to that category's dirty items

**Tickets**
- `E2-4.1` `utils/laundryForecast.ts` + tests — _0.5d_
- `E2-4.2` Laundry-forecast nudge strip — _1d_

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

## Dependencies
- Independent of E1 (localStorage-first). **E1 must include status/location columns** in its schema so sync needs no later migration.
- **Feeds E4** (loan/availability) and **E6** (availability filter) — build before them.
- Hardcoded-list gotcha: new filter dimensions need manual `DIMENSIONS`/sort-array edits `tsc` won't catch.

## Definition of done (epic)
Items carry status + location; cards show/set them; filters + "where is everything" + laundry nudge work; lending is tracked; `isAvailable` is the shared gate. `wornCount` shipped as the decoupled early win.
