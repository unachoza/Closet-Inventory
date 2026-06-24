# E9 · Travel 🔅

> **Date:** 2026-06-20 · **Pillar:** Supporting · **Detail:** light (expand when scheduled) · **README:** v6
> **Goal:** Pack from your closet, and **calculate bag weight against airline limits** — the weight piece is
> uncompeted (verified: rivals do packing lists, none do weight). Reuses E2 `packed`/`traveling` + `suitcase`.

---

## US-9.1 — Pack for a trip
_As Maya, I want a packing checklist from my closet so that I stop over-packing._
- [ ] Trip form (destination, duration, luggage)
- [ ] Checklist pulled by occasion tag; items marked `packed` (E2)
- [ ] Packing lists saved (Supabase)

**Ticket stubs:** trip form · `usePackingList` · pull-by-occasion · mark-packed integration.

## US-9.2 — Don't go over the weight limit (the differentiator)
_As a frequent traveler, I want a running bag weight so that I avoid overweight fees._
- [ ] Per-item weight + volume — **reuse the [E11](./E11-laundry-wear.md) US-11.3 weight/volume model** (`utils/itemPhysical.ts`), editable override
- [ ] Running total vs. carry-on / checked limits ("4.2kg / 7kg", "0.8kg over")
- [ ] Volume → suitcase fullness (same model that drives laundry-load fullness)
- [ ] Suggest what to remove to get under

**Ticket stubs:** consume `E11-3.1` weight/volume estimate (don't reimplement) · weight progress bar · per-bag limits · over-limit suggestions.

---

## Dependencies
- **Weight/volume model owned by [E11](./E11-laundry-wear.md) (US-11.3)** — Travel consumes it for suitcase fullness; don't redefine.
- Reuses **E2** `packed`/`traveling` status + `suitcase` location. **Expand when scheduled.**
