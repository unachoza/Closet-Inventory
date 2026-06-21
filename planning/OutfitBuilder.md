# Feature Spec — Outfit Builder ("the Clueless closet")

> **Date:** 2026-06-20 &nbsp;·&nbsp; **Status:** SPEC (prototype exists in branch `V7-Outfit-Builder`).
> **Audience:** personal build notes. Maps to README **v7.0**.
> Guiding constraint: **everyone wants this, but keep the build cheap — spend the differentiation budget
> on smart *suggestions*, not heavy engineering.**

---

## The strategic framing

The outfit builder is **table-stakes** — every competitor (Whering, Acloset, Alta, Stylebook) has one
([competitive analysis](./COMPETITIVE_ANALYSIS_2026-06-20.md)). So:

- **Don't** out-engineer them on avatars/AR/ML. That's a money pit on their home turf.
- **Do** add a thin, opinionated **"why this works" intelligence layer** they lack: color theory + Kibbe
  body types + style archetypes. These are *rules over attributes you already infer*, not ML — cheap to
  build, genuinely differentiated, and they reinforce the brand's "we actually know clothes" knowledge layer.

> The win isn't a prettier dress-up doll. It's an outfit builder that can *explain itself*:
> "this pairs because it's a complementary color match and both read Dramatic Classic."

---

## What already exists (branch `V7-Outfit-Builder`)

A 3-panel avatar-overlay visualizer (~2,160 LOC): closet panel, avatar panel, saved-outfits, weather strip.
Items superimpose onto an avatar **by zone** (`getZone`: tops on top, bottoms on bottom, feet). Has its own
local `ClothingItem` type + `inferStyleTagsFromName`. Treat this as the **canvas**; this spec adds the
**brain** on top — and reconciles its local types with the app's real `ClothingItem`.

---

## The differentiation layer (lightweight rules, not ML)

### 1. Color harmony
Operate on the color we already store (+ derive a hue from the image / `colorHex` when present).
- Map each item to a hue bucket → apply classic schemes: **complementary, analogous, triadic, neutral-anchored.**
- Score a candidate pairing for harmony; surface "complementary match" / "tonal" / "clashes" as a chip.
- Cheap: a hue wheel + a few set-distance rules. No external service.

### 2. Kibbe-aware silhouette matching
- Let the user optionally pick a **Kibbe type** (Dramatic, Romantic, Natural, Classic, Gamine + blends) in profile.
- Tag garments with silhouette traits we *already* infer (`fit`, `hemLength`, `neckline`, structure) → map to which Kibbe lines they flatter (sharp/structured vs. soft/draped vs. balanced).
- Suggestion nudge: "this structured blazer suits a Dramatic line." Purely additive; never blocks a choice.

### 3. Style archetypes
- A small set of archetypes (Classic, Romantic, Edgy, Minimal, Boho, Sporty, Preppy…) mapped from existing
  style/occasion attributes.
- Lets the user filter "build me a **Minimal** outfit" or tag saved outfits by archetype.
- Reuses `inferStyleTagsFromName` / `inferProductAttributes` — the data is largely there already.

> All three are **profile-driven and optional.** A user who ignores them gets a normal builder; a user who
> sets Kibbe + archetype gets suggestions no competitor offers. Progressive enhancement.

---

## Availability-aware (ties to v1.5)

Only suggest items that are **available** (`isAvailable()` from
[WardrobeStatusAndLocation.md](./WardrobeStatusAndLocation.md)) — clean, home, not on loan. An outfit
builder that suggests the dress your cousin took to Italy is exactly the frustration the whole app exists
to kill. This single integration is a quiet, real differentiator: *suggestions grounded in physical reality.*

---

## Data model (additive)

```ts
export interface Outfit {
  id: string;
  name?: string;
  itemIds: string[];
  archetype?: string;        // "Minimal", "Romantic", …
  harmonyScore?: number;     // 0–1, computed
  occasion?: string;
  createdAt: string;
  plannedFor?: string;       // ISO date (outfit calendar)
}

// Profile (new, optional):
interface StyleProfile {
  kibbeType?: string;
  preferredArchetypes?: string[];
}
```

`useOutfits` hook (CRUD + persistence) mirrors `useLocalCloset`. Pairing/harmony/archetype logic lives in
pure `utils/` (`colorHarmony.ts`, `kibbe.ts`, `archetypes.ts`) — testable, UI-free.

---

## Scope discipline (keep it cheap)

**In scope (lightweight, high-leverage):**
- Reconcile V7 types with real `ClothingItem`; wire to the actual closet.
- Save/name/recall outfits; availability-filtered suggestions.
- The three rule-based layers as *optional chips/nudges*.
- Weather strip → today's suggestion (Open-Meteo, already planned).

**Explicitly OUT (don't sink time):**
- Realistic AR/3D avatars or virtual try-on fidelity (Alta/Acloset's money pit).
- ML outfit generation / training.
- Pose-accurate garment warping. Zone-overlay (existing) is good enough.

---

## Build phases & estimates (dev-days, ideal)

| Phase | Scope | Est. |
|---|---|---|
| **1. Reconcile + wire to real closet** | merge V7 types → `ClothingItem`; closet panel reads the real closet; save/recall outfits via `useOutfits` | **2–3** |
| **2. Availability + weather suggestion** | filter suggestions by `isAvailable`; today's weather-based pick | **1–1.5** |
| **3. Color harmony layer** | `colorHarmony.ts` + pairing chips | **1.5–2** |
| **4. Kibbe + archetype layer** | profile fields; `kibbe.ts` / `archetypes.ts`; optional nudges + archetype filter | **2–3** |
| **Total** | smart-but-lightweight builder | **~6.5–9.5 days** |

> Phases 3–4 are the differentiation and are **independently shippable** — ship the plain builder (1–2)
> first to satisfy the demand, then layer intelligence when there's time. That keeps the time investment
> bounded, per the "don't spend a lot on this" goal.

---

## Open questions

- [ ] Kibbe is polarizing/complex — ship a simplified 3-axis version (structured ↔ soft, yin ↔ yang) instead of full 13 types? Lean simplified.
- [ ] Color from stored `color` string vs. sampling the image? Start with the string; sample later for accuracy.
- [ ] Does the avatar overlay survive as the primary canvas, or does a flat "outfit board" (drag items onto a canvas, no avatar) convert better and cost less? Worth a quick user gut-check before investing in avatar polish.
