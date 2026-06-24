# E7 · Insights & Data Viz 🔅

> **Date:** 2026-06-20 · **Pillar:** Supporting · **Detail:** light (expand when scheduled) · **README:** v5 / v10
> **Goal:** Closet analytics + sustainability signals. Table-stakes (competitors do it), but the founder
> enjoys it and it reinforces the "see your closet" promise. Compute in-memory (closet = hundreds of items).

---

## US-7.1 — See my closet in numbers
_As Maya, I want stats so that I understand my spending and usage._
- [ ] Stats strip: total items / total spend / avg price
- [ ] Category breakdown, brand frequency, price distribution
- [ ] Cost-per-wear (needs `wornCount` from [E11](./E11-laundry-forecasting.md))

**Ticket stubs:** `useClosetStats` (in-memory) · stats strip · charts (recharts) · cost-per-wear chip.

## US-7.2 — Wear what I own
_As Maya, I want guilt/sustainability signals so that I wear more and shop smarter._
- [ ] "Guilt items" view (0 wears + age > 6mo) with donate/sell CTA
- [ ] 🌱 sustainability badge at 20+ wears

**Ticket stubs:** guilt filter · sustainability badge.

## US-7.3 — Find the gaps in my wardrobe ⭐
_As Maya, I want the dashboard to point out what's missing so that I shop intentionally instead of duplicating what I have._
- [ ] Gap detection across **season × occasion × vibe × category** (e.g. "1 pair of elevated, non-denim shorts" → real gap)
- [ ] Context-aware: factor in **profession + age** (e.g. low business-casual count for someone who works in an office)
- [ ] Actionable: "you're thin on `elevated` `summer` `shorts`" with examples of what would fill it
- [ ] Built on the E2 US-2.10 taxonomy tags + E12 profile (career/age)

**Ticket stubs:** gap matrix over `item_tags` × category · profession/age weighting from profile · gap cards.

## US-7.4 — Where my clothes come from
_As Maya, I want a map of my clothes' countries of origin so that I see the footprint of my closet._
- [ ] Origin map / viz from `country_of_origin` (web-enriched, E3 US-3.2)
- [ ] Breakdown by count / spend / material

**Ticket stubs:** origin choropleth · origin breakdown chart.

## US-7.5 — Provenance & buddy insights
_As Maya, I want insights from how I acquire and lend so that I understand my habits and my lending circle._
- [ ] Acquisition mix (bought / gifted / thrifted / inherited …) over time
- [ ] **Lending-buddy detection:** "you + X are the same size and lend often" → feeds E4 US-4.6 trust tier
- [ ] "Fits me now" coverage (how much of the closet is currently wearable — E12 US-12.4)

**Ticket stubs:** acquisition mix chart · buddy detector (size match × loan frequency) · fits-me coverage stat.

---

## Dependencies
- **`wornCount` + `wear_events` (owned by [E11](./E11-laundry-forecasting.md), formerly E2)** are the prerequisite for cost-per-wear, guilt, sustainability, and repeat-outfit avoidance.
- **Gap detection needs the E2 US-2.10 taxonomy** (season/occasion/vibe tags) + **E12 profile** (career/age, body measurements).
- **Origin viz needs E3 US-3.2 web enrichment** (`country_of_origin`). **Expand when scheduled.**
