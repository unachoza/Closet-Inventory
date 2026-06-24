# E8 · Care & Knowledge 🔅

> **Date:** 2026-06-20 · **Pillar:** Knowledge layer · **Detail:** light (expand when scheduled) · **README:** v9
> **Goal:** The fabric/fiber/care knowledge layer — uncompeted (no competitor does fabric education, verified
> 2026-06-20). Mostly shipped; remaining work is lifespan + repair logging.

---

## US-8.1 — Know how to care for it (shipped ✅)
_As Maya, I want care guidance per item so that I don't ruin my clothes._
- [x] Material→care mapping; washing/drying inferred on import
- [x] Interactive fabric guide + fiber-journey visualization
- [x] Name/category care rules: blazer → "Dry clean"; shoes → "Wipe with damp cloth" (leather shoes → "Use soft Horsehair Brush"); shoes skip laundry color rules (`inferCareFromAttributes`)
- [x] Reseller condition seeding: imports from Poshmark/Depop/eBay/Vinted/ThredUp/The RealReal default to "good" (not "new"), upgraded to "new" only on explicit NWT/"new with tags" (`parseEmailToFormData`)

## US-8.3 — Expand the stain removal guide
_As Maya, I want more stains covered in the removal guide so that I can rescue more garments._
- [ ] Add **nail polish** removal steps
- [ ] Add **turmeric** removal steps
- [ ] Brainstorm + add more common stains (e.g. red wine, oil/grease, ink, blood, sweat/deodorant, grass, makeup) — audit gaps against the existing guide

**Ticket:** `E8-3.1` Add nail polish + turmeric entries to the stain guide; expand stain coverage — _0.5d_

## US-8.4 — Overhaul the education UI/UX
_As Maya, I want the fabric/fiber/care/stain education to look and feel polished so that the knowledge layer reads as a premium, trustworthy differentiator — not a wall of text._
- [ ] UI/UX overhaul of the existing education pieces (Interactive fabric guide, fiber-journey viz, stain guide, full guide)
- [ ] Consistent design-token styling; mobile-friendly; navigable
- [ ] More robust, deeper garment-care content alongside the visual refresh

**Ticket stubs:** education-surface audit · redesign pass on guide + stain views · content depth pass. _(Priority 5 in the 2026-06-24 order — pairs with the US-8.3 stain expansion.)_

## US-8.2 — Track an item's life
_As Maya, I want to log repairs and see estimated lifespan so that I care for pieces long-term._
- [ ] Repair/alteration log (date, description, cost) — ties to E2 `needs_repair` status
- [ ] Clothing lifespan tracker ("estimated wears remaining", needs `wornCount` from [E11](./E11-laundry-wear.md))

**Ticket stubs:** repair-log model + UI · lifespan estimate from `wornCount` + category baseline.

---

## Dependencies
- Repair log pairs with **E2 `needs_repair`** (parked); lifespan needs **`wornCount`** (owned by [E11](./E11-laundry-wear.md)). **Expand when scheduled.**
