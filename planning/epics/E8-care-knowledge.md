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

## US-8.2 — Track an item's life
_As Maya, I want to log repairs and see estimated lifespan so that I care for pieces long-term._
- [ ] Repair/alteration log (date, description, cost) — ties to E2 `needs_repair` status
- [ ] Clothing lifespan tracker ("estimated wears remaining", needs `wornCount`)

**Ticket stubs:** repair-log model + UI · lifespan estimate from `wornCount` + category baseline.

---

## Dependencies
- Repair log pairs with **E2 `needs_repair`**; lifespan needs **`wornCount` (E2)**. **Expand when scheduled.**
