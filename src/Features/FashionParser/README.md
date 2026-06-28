# FashionParser

A domain-specific parsing engine that translates retail product descriptions into rich, structured garment metadata. It is the knowledge layer that every other feature in the app builds on — search, analytics, outfit recommendations, care guidance, and shopping gap detection.

---

## Motivation

Most closet apps store minimal metadata about clothing — typically just category, color, and brand. When a retailer writes:

> "Madewell Linen Square-Neck Puff Sleeve Midi Dress with Smocked Bodice and Side Slit"

most apps reduce it to `{ category: "Dress", color: "White" }`.

FashionParser preserves the **full vocabulary** of fashion. That same title yields:

```json
{
  "neckline": "square neck",
  "sleeveLength": "short sleeve",
  "sleeveStyle": "puff sleeve",
  "hemLength": "midi",
  "shaping": ["smocked"],
  "construction": ["side slit"],
  "material": ["linen"]
}
```

The key insight driving this design: **retailers are inconsistent, but the underlying concepts are not.** "A-line" might be called a style, silhouette, or fit depending on the brand. FashionParser normalizes these inconsistencies by classifying attributes by *what they describe*, not how any given retailer labels them. The result is a structured representation that is brand-agnostic, searchable, and composable.

---

## Why Preserving Fashion Terminology Matters

Terms like "princess seams," "bishop sleeves," and "godets" carry specific construction and design information that most apps discard. FashionParser keeps it. This means:

- Users can search the way they think — "show me all my structured dresses" finds garments with princess seams, boning, darts, or corset construction, not just ones explicitly labeled "structured"
- Analytics can surface real patterns — "most of your tops have square necklines" or "you own 12 dresses with puff sleeves"
- Outfit recommendations can reason about volume, structure, and drape — pairing a puff-sleeve blouse with slim trousers because the parser knows both the sleeve shape and the leg silhouette
- Style profiles emerge automatically — nobody had to tag anything "romantic"

There are thousands of closet apps that let people upload clothes. Very few can look at a product title and understand the garment. That understanding is what this module encodes.

---

## Attribute Taxonomy

The taxonomy separates attributes by what they describe, not how they're marketed:

| Category | Question answered | Single/Multi | Examples |
|---|---|---|---|
| **Silhouette** | What overall shape does this garment create? | Single | a-line, sheath, bodycon, fit & flare, mermaid |
| **Fit** | How closely does it follow the body? | Single | oversized, relaxed, slim, tailored, boyfriend |
| **Shaping** | How is the shape constructed? | Multi | princess seams, darts, boned, smocked, gathered |
| **Neckline** | What's the neckline / collar? | Single | square neck, v-neck, mandarin collar, sweetheart |
| **Sleeve Length** | How long are the sleeves? | Single | long sleeve, 3/4 sleeve, cap sleeve, sleeveless |
| **Sleeve Style** | What shape are the sleeves? | Single | puff, bishop, lantern, bell, batwing, kimono |
| **Hem Length** | How long is the garment? | Single | mini, midi, maxi, crop, tunic |
| **Leg Shape** | What's the leg silhouette? | Single | wide leg, bootcut, tapered, cigarette, barrel |
| **Rise** | Where does the waistband sit? | Single | high waist, mid rise, low rise |
| **Waist Style** | How is the waist finished? | Single | paperbag, elastic, empire waist, belted |
| **Closure** | How does it fasten? | Multi | button front, hidden zipper, lace-up, drawstring |
| **Construction** | Physical finish details? | Multi | side slit, raw hem, distressed, vented, scalloped |
| **Accents** | Decorative elements? | Multi | sequins, ruffles, embroidered, pearls, feathers |
| **Pattern** | Surface pattern? | Single | floral, plaid, polka dots, animal print, tie-dye |
| **Material** | Fiber content? | Multi | linen, silk, cotton, wool, cashmere, denim |
| **Color** | Canonical color? | Single | black, ivory, sage, burgundy, mustard |

---

## What Can Be Built on This Knowledge Layer

### Wardrobe Analytics
Rich metadata enables insights beyond simple counts:
- "80% of your dresses are midi length"
- "Most common neckline: square neck — consider branching out"
- "You own 14 floral pieces and 0 solid-color dresses"

### Intelligent Search & Filtering
- "Show me structured dresses" → matches princess seams, boning, darts, corset, contoured
- "Tops with dramatic sleeves" → matches balloon, bishop, lantern, puff, bell

### Style Profile (zero tagging required)
Attribute patterns signal style families automatically:
- Square neck + puff sleeve + smocked + floral → **romantic**
- Peak lapel + tailored + sheath → **classic**
- Leather + studded + moto → **edgy**
- Relaxed + solid + no accents → **minimal**
- Wrap + paisley + fringe + maxi → **bohemian**

### Outfit Balancing
Recommendations based on garment characteristics, not just categories:
- Oversized sweater → pair with slim or tapered trousers
- Puff sleeve blouse → avoid oversized blazer (volume conflict)
- Structured corset top → works with relaxed wide-leg trousers (contrast balance)

### Shopping Gap Detection
- "You own 18 floral dresses but no sheath dresses"
- "Your wardrobe lacks tailored trousers and crew-neck sweaters"
- "You have 6 puff-sleeve tops — you may not need another"

### Care Guidance (automatic)
- Silk → hand wash, delicate cycle
- Wool → dry clean or hand wash cold
- Sequined or beaded → mesh laundry bag
- White → wash with like colors
- Distressed / raw hem → laundry bag

---

## Architecture

```
src/Features/FashionParser/
│
├── types.ts                    # ProductAttributes, MaterialBlend, RegexMap
├── utils.ts                    # matchFirst(), matchAll()
├── inferProductAttributes.ts   # Main parser — assembles all maps into one call
├── index.ts                    # Public API barrel — re-exports everything
│
├── maps/                       # Regex → canonical-value lookup tables
│   ├── silhouette.ts           # SILHOUETTE_MAP
│   ├── fit.ts                  # FIT_MAP
│   ├── shaping.ts              # SHAPING_MAP
│   ├── neckline.ts             # NECKLINE_MAP
│   ├── sleeve.ts               # SLEEVE_LENGTH_MAP + SLEEVE_STYLE_MAP
│   ├── hem.ts                  # HEM_LENGTH_MAP
│   ├── leg.ts                  # LEG_SHAPE_MAP
│   ├── rise.ts                 # RISE_MAP
│   ├── waist.ts                # WAIST_STYLE_MAP
│   ├── closure.ts              # CLOSURE_MAP
│   ├── construction.ts         # CONSTRUCTION_MAP
│   ├── accents.ts              # ACCENTS_MAP
│   ├── pattern.ts              # PATTERN_MAP
│   ├── season.ts               # SEASON_MAP
│   ├── stretch.ts              # STRETCH_MAP + POCKET_MAP
│   ├── color.ts                # COLOR_MAP
│   └── material.ts             # MATERIAL_MAP
│
├── normalizers/                # Canonical-value normalizers
│   ├── normalizeColor.ts       # "dusty rose" → "Pink"; normalizeColorGroups
│   ├── normalizeCategory.ts    # "dress" / "dresses" → "dresses"; jeans → "bottoms"
│   ├── normalizeMaterial.ts    # "95% Cotton, 5% Spandex" → MaterialBlend[]
│   └── normalizeBrand.ts       # (planned)
│
├── inference/                  # Higher-order attribute inference
│   ├── inferCare.ts            # Care instructions from material + name + color
│   ├── inferOccasion.ts        # Occasion tags from name keywords + category
│   ├── inferCategory.ts        # Garment category from product name keywords
│   ├── inferSeason.ts          # Season from explicit keywords + material signals
│   ├── inferStyle.ts           # Style family scoring (romantic/classic/edgy/…)
│   └── inferMaterial.ts        # MaterialBlend from product name keywords + % blends
│
└── __tests__/
    ├── parser.test.ts
    ├── neckline.test.ts
    └── silhouette.test.ts
```

### Backward compatibility

All pre-existing `src/utils/` imports continue to work unchanged. The following utils files are now thin re-export stubs pointing at FashionParser:

| utils stub | → FashionParser source |
|---|---|
| `inferProductAttributes.ts` | `inferProductAttributes` + all maps |
| `inferCare.ts` | `inference/inferCare.ts` |
| `inferCareFromAttributes.ts` | `inference/inferCare.ts` |
| `inferCareFromMaterial.ts` | `inference/inferCare.ts` |
| `inferStyleTagsFromName.ts` | `inference/inferOccasion.ts` |
| `inferMaterialFromName.ts` | `inference/inferMaterial.ts` |
| `inferSemanticAttributes.ts` | `inference/inferOccasion.ts` |
| `normalizeColors.ts` | `normalizers/normalizeColor.ts` |
| `normalizeCategories.ts` | `normalizers/normalizeCategory.ts` |

`materialUtils.ts` intentionally stays in `utils/` — it contains UI display helpers (`getMaterialColor`, `blendToDisplayString`, `MATERIAL_COLORS`) that belong to the presentation layer, not the parsing domain. `normalizeMaterial` is now canonical in FashionParser and re-exported from `materialUtils` for backward compat.

---

## Roadmap

### Phase 1 — Core Parser ✅
- [x] 16 attribute categories with regex maps
- [x] `matchFirst` (single-value) and `matchAll` (multi-value) utilities
- [x] Silhouette / fit / leg shape properly separated
- [x] Color and material maps
- [x] Backward-compatible stubs in `src/utils/`

### Phase 2 — Normalizers ✅
- [x] `normalizeColor` — maps retailer color names to canonical palette
- [x] `normalizeCategory` — handles singular/plural/legacy variants → canonical bucket
- [x] `normalizeMaterial` — parses "95% Cotton, 5% Spandex" → `MaterialBlend[]`
- [ ] `normalizeBrand` — handle brand name variations and abbreviations

### Phase 3 — Inference Engine ✅
- [x] `inferCare` — care instructions from material blend + name + color
- [x] `inferOccasion` — up to 2 occasion tags from name keywords and category
- [x] `inferCategory` — garment category from product name keyword rules
- [x] `inferSeason` — season from explicit keywords + material signals (wool → fall, linen → summer)
- [x] `inferStyle` — weighted scoring across 6 style families (romantic, classic, edgy, minimal, bohemian, casual)
- [x] `inferMaterial` — `MaterialBlend[]` from product name, handles % blends and keyword inference

### Phase 4 — Extended Vocabulary
- [ ] Shoe attributes: toe shape (pointed, round, square), heel height, sole type
- [ ] Bag attributes: closure type, handle style (tote, crossbody, clutch), compartments
- [ ] Jewelry attributes: metal, stone, setting style
- [ ] Collar subtypes: spread, point, band, wing
- [ ] Cuff styles: french cuff, barrel, rolled, split

### Phase 5 — Multi-Signal Parsing
- [ ] Accept product description in addition to title for richer extraction
- [ ] Brand-aware parsing (Aritzia "Contour" = bodycon, Free People sizing conventions)
- [ ] Image-assisted attribute detection (ML integration point — color, pattern, silhouette from photo)
- [ ] Occasion inference from `ProductAttributes` directly (not just name keywords)

### Phase 6 — Analytics & Recommendations
- [ ] Wardrobe composition dashboard (silhouette distribution, color wheel, style profile pie)
- [ ] Shopping gap analysis ("you don't own any structured blazers in navy")
- [ ] Outfit compatibility scoring using volume + structure + formality balance
- [ ] Style profile generation with percentages (42% romantic, 28% classic, …)
- [ ] Trend tracking — how wardrobe composition changes over time
