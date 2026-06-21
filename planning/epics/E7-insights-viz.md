# E7 · Insights & Data Viz 🔅

> **Date:** 2026-06-20 · **Pillar:** Supporting · **Detail:** light (expand when scheduled) · **README:** v5 / v10
> **Goal:** Closet analytics + sustainability signals. Table-stakes (competitors do it), but the founder
> enjoys it and it reinforces the "see your closet" promise. Compute in-memory (closet = hundreds of items).

---

## US-7.1 — See my closet in numbers
_As Maya, I want stats so that I understand my spending and usage._
- [ ] Stats strip: total items / total spend / avg price
- [ ] Category breakdown, brand frequency, price distribution
- [ ] Cost-per-wear (needs `wornCount` from E2)

**Ticket stubs:** `useClosetStats` (in-memory) · stats strip · charts (recharts) · cost-per-wear chip.

## US-7.2 — Wear what I own
_As Maya, I want guilt/sustainability signals so that I wear more and shop smarter._
- [ ] "Guilt items" view (0 wears + age > 6mo) with donate/sell CTA
- [ ] 🌱 sustainability badge at 20+ wears

**Ticket stubs:** guilt filter · sustainability badge.

---

## Dependencies
- **`wornCount` (E2)** is the prerequisite for cost-per-wear, guilt, and sustainability. **Expand when scheduled.**
