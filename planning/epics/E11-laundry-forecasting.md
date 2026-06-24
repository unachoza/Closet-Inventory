# E11 · Laundry Forecasting & Wear Tracking ⭐

> **Date:** 2026-06-24 · **Pillar:** Inventory (differentiator) · **Detail:** full · **README:** v1.5/v5 (split out) · **Est:** ~7–10 dev-days
> **Goal:** Turn "did I wear it / is it clean / when do I do laundry" into a first-class, mobile-first loop.
> Tap **"I wore this"** → item flips clean → dirty + `wornCount++`; the app forecasts when a category runs
> out of clean items and nudges you to do laundry — informed by your machine size and lifestyle.
> Split out of E2 (was US-2.1 log-a-wear + US-2.4 laundry forecast) because, with `wornCount`, it is a
> standalone loop big enough to own its model (wear state, machine config, item weight/volume).

> **Owns these canonical fields** (single source of truth — other epics reference, don't redefine):
> `status` (clean/dirty, extensible), `wornCount`, `lastWornAt`, item `weight`/`volume` model.

---

## US-11.1 — "I wore this" (mobile-first)
_As Maya on her phone, I want to tap "I wore this" so that logging a wear is a one-tap habit, not a form._
- [ ] One-tap "I wore this" flips `status` clean → dirty, bumps `wornCount`, sets `lastWornAt`
- [ ] Reachable on mobile from the card (and detail) without opening the editor
- [ ] Undo affordance (mis-taps happen)

**Tickets**
- `E11-1.1` Add canonical `status` (`"clean" | "dirty"`, default `clean`, extensible), `wornCount`, `lastWornAt` to `ClothingItem` + `@ntw/types` `Item` — _0.5d_
- `E11-1.2` "I wore this" one-tap action (card + detail, mobile-reachable) + undo — _1d_
- `E11-1.3` Wear/clean state regression tests — _bundled_

## US-11.2 — Laundry status & forecast
_As Maya, I want a per-category clean-vs-dirty view and a nudge when I'm about to run out so that I do laundry before I'm stuck._
- [ ] `laundryForecast()` computes clean/dirty ratio per category
- [ ] Dismissible nudge when a category runs low on clean items; tap → that category's dirty items
- [ ] A "laundry status" surface (how full a load is building up, what's dirty)

**Tickets**
- `E11-2.1` `utils/laundryForecast.ts` + tests — _0.5d_
- `E11-2.2` Laundry-forecast nudge strip — _1d_
- `E11-2.3` "Laundry status" view (dirty by category, load-fullness) — _1.5d_

## US-11.3 — Item weight & volume model
_As the system, I want to estimate each item's weight and volume from its size + material so that I can compute how full a laundry load is — and later, how full a suitcase is._
- [ ] Estimate `weight` + `volume` from category + size + material breakdown
  - e.g. cotton jeans, 32" waist ≠ viscose trousers, 32" waist — different weight & volume because material density differs
- [ ] Backed by a category/material density + base-size table (best-effort estimate, override-able)
- [ ] **Feeds laundry load fullness (here) and suitcase fullness (E9 Travel)** — define once here, reference from E9

**Tickets**
- `E11-3.1` `utils/itemPhysical.ts` — weight/volume estimate from category + size + `MaterialBlend[]` + density table — _1.5d_
- `E11-3.2` Unit tests across material/size permutations — _0.5d_
- `E11-3.3` Wire load-fullness into the laundry forecast — _0.5d_

## US-11.4 — Forecast tuned to machine + lifestyle
_As Maya, I want the forecast to reflect my actual washer/dryer and how I live so that the nudge is realistic, not generic._
- [ ] Machine size (e.g. small / standard / double load) shifts the "load is full / time to wash" threshold
- [ ] Lifestyle signal: e.g. "6 workout days/week + 6 pairs of leggings → nudge by day 5"
- [ ] Machine + lifestyle config lives in the **user profile (E12)** — this epic consumes it, doesn't own it

**Tickets**
- `E11-4.1` Consume machine size from profile in the load-full threshold — _0.5d_
- `E11-4.2` Lifestyle-driven nudge (activity cadence × category stock) — _1.5d_

## US-11.5 — Calendar-aware planning 🔭 (way down the line — light)
_As the mom-executive, I want the app to see my upcoming week (board meeting, date night) so that it can prompt outfit/laundry planning ahead of events._
- [ ] Connect Google Calendar (read-only); surface upcoming events worth dressing for
- [ ] Nudge laundry/outfit prep ahead of events
- [ ] (Outfit planning itself overlaps E6 Outfit Builder)

**Ticket stubs:** Calendar OAuth (read-only) · event → planning nudge. _Keep light; far horizon._

---

## Dependencies
- **E2 status:** `status` clean/dirty is owned here; if/when E2 (parked) ships its broader statuses (`at_cleaner`, `on_loan`, `in_repair`, `traveling`), they **extend this same enum** — do not define a second status field.
- **E1 (persistence):** wear state + forecast want to survive sessions/sync (localStorage-first works now).
- **E12 (user profile):** machine size + lifestyle config come from the profile.
- **E9 (travel):** reuses the US-11.3 weight/volume model for suitcase fullness.
- **`wornCount` is the shared early win** previously tracked in E2 — now owned here; consumed by E7 (cost-per-wear), E8 (lifespan), E10 (sustainability).

## Definition of done (epic)
One-tap "I wore this" on mobile flips clean→dirty + bumps `wornCount`; per-category laundry forecast + nudge work; items carry estimated weight/volume; the forecast respects machine size + lifestyle from the profile.
