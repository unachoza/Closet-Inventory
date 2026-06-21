# E6 · Outfit Builder 🔅

> **Date:** 2026-06-20 · **Pillar:** Supporting · **Detail:** light (expand when scheduled) · **README:** v7.0 · **Est:** ~6.5–9.5 dev-days
> **Goal:** The "Clueless closet" everyone wants — kept cheap, with a smart-suggestion layer (color theory
> + Kibbe + archetypes) competitors lack. Prototype exists in branch `V7-Outfit-Builder`.
> Full spec: [OutfitBuilder.md](../OutfitBuilder.md).

---

## US-6.1 — Build & save an outfit
_As Maya, I want to assemble and save outfits from my closet so that I can plan without trying things on._
- [ ] Reconcile V7 types with real `ClothingItem`; closet panel reads the real closet
- [ ] Save / name / recall outfits (`useOutfits`)
- [ ] Suggestions filtered by `isAvailable` (E2) — never suggest dirty/away/lent items

**Ticket stubs:** type reconcile · `useOutfits` · availability filter · weather-based pick.

## US-6.2 — Smart suggestions (the differentiator)
_As Maya, I want outfit suggestions that explain why they work so that I trust them and learn._
- [ ] Color-harmony pairing chips (complementary/analogous/tonal)
- [ ] Optional Kibbe-aware silhouette nudges (simplified axes)
- [ ] Style-archetype filter ("build me a Minimal outfit")

**Ticket stubs:** `colorHarmony.ts` · `kibbe.ts` · `archetypes.ts` · profile fields. All pure utils, independently shippable.

---

## Dependencies
- **E2 `isAvailable`** for grounded suggestions.
- Keep scope tight — ship plain builder first, layer intelligence later. **Expand when scheduled.**
