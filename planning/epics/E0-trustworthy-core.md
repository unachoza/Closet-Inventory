# E0 · Trustworthy Core

> **Date:** 2026-06-20 · **Pillar:** Foundation · **Detail:** full · **README:** Near-Term Priority 1 · **Est:** ~5.5–6 dev-days
> **Goal:** Make the core loop trustworthy — strip debug noise, get the suite green, and kill the
> correctness bugs that erode confidence — each with a regression test. Precondition for everything after.

---

## US-0.1 — A clean, green starting line
_As the developer, I want a green test suite with no debug logging so that I can build on a known-good base and trust CI._
- [x] `npm test` passes with zero failures
- [x] No stray `console.log` in `src/` production paths
- [x] `tsc --noEmit` clean

**Tickets**
- `E0-1.1` Strip debug `console.log`s from `src/` (keep intentional error logging) — _0.25d_ ✅
- `E0-1.2` Fix any currently-red tests; confirm full green — _0.25d_ ✅
- `E0-1.3` Fix empty `img src=""` React warning in `Card.tsx` (guard render when `imageURL` is blank) — _bundled_ ✅

## US-0.2 — Filters return the right items
_As Maya, I want the material filter to actually return matching items so that filtering by fabric works._
- [x] Selecting a material returns items whose `MaterialBlend[]` contains it
- [x] Regression test covers the blend-name extraction

**Tickets**
- `E0-2.1` Extract `MaterialBlend` names before compare in `useClosetFilters` — _0.5d_ ✅
- `E0-2.2` Regression test: filter by "cotton" returns the cotton-blend item — _bundled_ ✅

## US-0.3 — Removing an item updates the grid ✅
_As Maya, I want a removed item to disappear immediately so that the closet reflects reality._
- [x] Removing from a card re-renders the grid without refresh
- [x] Regression test covers remove → grid update

**Tickets**
- `E0-3.1` Route `Card` removal through shared `ClosetContext` instead of a separate `useLocalCloset` — _1d_ ✅
- `E0-3.2` Regression test for remove-rerender — _bundled_ ✅
- `E0-3.4` Fix collateral regression: the removal animation (inner `AnimatePresence popLayout`) severed Framer variant propagation and silently killed the grid's entrance stagger (load/filter/sort/search). Decoupled — each card owns its own `initial`/`animate`/`exit` with a per-index `custom` delay; container stays keyed by `gridKey` (excludes count) so removals animate in place. Verified in-browser (66 stagger frames vs 0). — _0.5d_ ✅ (+ 5 animation regression tests in `FilteredItemGrid.animation.test.tsx`)

**UX — deferred to separate PR**
- `E0-3.3` Replace the current button-swap confirm with a warp overlay: card content blurs + subtle red tint (10% opacity) fades in over the card; confirmation floats centered with spring-scale entrance. Use Framer Motion `AnimatePresence` + `motion.div` for the overlay; existing `confirming` state drives it. No layout shift, no second modal. — _0.5d_

## US-0.4 — Dates don't lie ✅
_As Maya, I want a manually added item to have no fabricated purchase date so that its age is honest._
- [x] Selecting month+year reliably commits to `purchaseDate` across create AND edit
- [x] Runtime bug fixed (`setFormData(monthValue: any)` → proper `onSelectDate` callback)

**Tickets**
- `E0-4.1` Fix MonthYearPicker commit-to-`purchaseDate` — switched broken `setFormData` cast to `onSelectDate(value)` pattern; wired in both Form and EditItemView — _1d_ ✅
- `E0-4.2` Regression test: no selection → no date; selection → correct ISO — _bundled_ ✅

## US-0.5 — Don't import junk ✅
_As Maya, I want non-clothing / uncategorizable items skipped on import so that my closet isn't polluted (esp. Amazon)._
- [x] Items that can't map to a category are skipped, not imported as blanks
- [x] Skip count surfaced to the user ("3 items skipped — not clothing")
- [x] User can review the skipped list and "Include" individual items back into the import (false-positive recovery)
- [x] Noise senders (Spotify, Eventbrite, DoorDash, United, FedEx, CVS, etc.) excluded from the default Gmail query
- [x] Test covers an Amazon-style mixed email and the unskip flow

**Tickets**
- `E0-5.1` Skip-on-no-category guard in the import pipeline (`partitionByCategory` in `EmailPreview`) — _1d_ ✅
- `E0-5.2` Title-case CAPS cleanup for Zara/Aritzia/Shein names — _0.5d_ ✅ (+ `condenseName` utility for long marketplace names)
- `E0-5.3` "Include" / unskip UI in `EmailPreview` for false positives + `GMAIL_EXCLUDE_SENDERS` list + category-keyword cleanup (pajamas, skort) — _bundled_ ✅ (PR #72)

## US-0.6 — Types that catch mistakes
_As the developer, I want `ClothingItem` typed tightly so that flat-vs-nested mismatches fail at compile time, not runtime._
- [x] Remove or narrow the `[key: string]: any` index signature
- [x] `style`/nested-attribute access is type-checked
- [x] Build stays green

**Tickets**
- `E0-6.1` Narrow `ClothingItem` typing; fix fallout (`formData[key]` sites) — _1–1.5d_ ✅ (removed `any` from 5 files, fixed MonthYearPicker runtime bug)

---

## Dependencies
None — this is the base. Do it first.

## Progress

**Completed:** US-0.1, US-0.2, US-0.3, US-0.4, US-0.5, US-0.6 (6 of 6 user stories) ✅
**Remaining:** none — epic complete. (Optional UX polish `E0-3.3` warp-overlay confirm deferred to a separate PR.)

## Definition of done (epic) ✅
Suite green · no debug logs / console warnings · the confidence-eroding bugs fixed with regression tests · `ClothingItem` typing tightened.

_(US-0.5 "Don't import junk" shipped in PR #72: skip-on-no-category guard + "Include" recovery UI + excluded senders + category-keyword cleanup.)_
