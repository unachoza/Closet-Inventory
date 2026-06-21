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
- [ ] Per-item weight (editable; default estimates per category)
- [ ] Running total vs. carry-on / checked limits ("4.2kg / 7kg", "0.8kg over")
- [ ] Suggest what to remove to get under

**Ticket stubs:** `weight` field + category defaults · weight progress bar · per-bag limits · over-limit suggestions.

---

## Dependencies
- Reuses **E2** `packed`/`traveling` status + `suitcase` location. **Expand when scheduled.**
