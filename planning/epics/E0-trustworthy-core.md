# E0 · Trustworthy Core

> **Date:** 2026-06-20 · **Pillar:** Foundation · **Detail:** full · **README:** Near-Term Priority 1 · **Est:** ~5.5–6 dev-days
> **Goal:** Make the core loop trustworthy — strip debug noise, get the suite green, and kill the
> correctness bugs that erode confidence — each with a regression test. Precondition for everything after.

---

## US-0.1 — A clean, green starting line
_As the developer, I want a green test suite with no debug logging so that I can build on a known-good base and trust CI._
- [ ] `npm test` passes with zero failures
- [ ] No stray `console.log` in `src/` production paths
- [ ] `tsc --noEmit` clean

**Tickets**
- `E0-1.1` Strip debug `console.log`s from `src/` (keep intentional error logging) — _0.25d_
- `E0-1.2` Fix any currently-red tests; confirm full green — _0.25d_

## US-0.2 — Filters return the right items
_As Maya, I want the material filter to actually return matching items so that filtering by fabric works._
- [ ] Selecting a material returns items whose `MaterialBlend[]` contains it
- [ ] Regression test covers the blend-name extraction

**Tickets**
- `E0-2.1` Extract `MaterialBlend` names before compare in `useClosetFilters` — _0.5d_
- `E0-2.2` Regression test: filter by "cotton" returns the cotton-blend item — _bundled_

## US-0.3 — Removing an item updates the grid
_As Maya, I want a removed item to disappear immediately so that the closet reflects reality._
- [ ] Removing from a card re-renders the grid without refresh
- [ ] Removal routes through the shared closet instance (no second `useLocalCloset`)
- [ ] Regression test covers remove → grid update

**Tickets**
- `E0-3.1` Route `Card` removal through shared `ClosetContext` instead of a separate `useLocalCloset` — _1d_
- `E0-3.2` Regression test for remove-rerender — _bundled_

## US-0.4 — Dates don't lie
_As Maya, I want a manually added item to have no fabricated purchase date so that its age is honest._
- [ ] MonthYearPicker emits only after the user changes a value (mount-guard verified)
- [ ] Selecting month+year reliably commits to `purchaseDate` across create AND edit
- [ ] Regression test covers both flows

**Tickets**
- `E0-4.1` Verify/finish MonthYearPicker commit-to-`purchaseDate` across edit+create — _1d_
- `E0-4.2` Regression test: no selection → no date; selection → correct ISO — _bundled_

## US-0.5 — Don't import junk
_As Maya, I want non-clothing / uncategorizable items skipped on import so that my closet isn't polluted (esp. Amazon)._
- [ ] Items that can't map to a category are skipped, not imported as blanks
- [ ] Skip count surfaced to the user ("3 items skipped — no category")
- [ ] Test covers an Amazon-style mixed email

**Tickets**
- `E0-5.1` Skip-on-no-category guard in the import pipeline — _1d_
- `E0-5.2` Title-case CAPS cleanup for Zara/Aritzia/Shein names — _0.5d_

## US-0.6 — Types that catch mistakes
_As the developer, I want `ClothingItem` typed tightly so that flat-vs-nested mismatches fail at compile time, not runtime._
- [ ] Remove or narrow the `[key: string]: any` index signature
- [ ] `style`/nested-attribute access is type-checked
- [ ] Build stays green

**Tickets**
- `E0-6.1` Narrow `ClothingItem` typing; fix fallout (`formData[key]` sites) — _1–1.5d_

---

## Dependencies
None — this is the base. Do it first.

## Definition of done (epic)
Suite green · no debug logs · the four bugs fixed with regression tests · `ClothingItem` typing tightened.
