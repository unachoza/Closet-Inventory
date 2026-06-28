# FashionParser

A domain-specific parsing engine that translates retail product descriptions into rich, structured garment metadata.

## Motivation

Most closet apps store minimal metadata about clothing — typically just category, color, and brand. When a retailer writes "Madewell Linen Square-Neck Puff Sleeve Midi Dress with Smocked Bodice and Side Slit," most apps reduce it to `{ category: "Dress", color: "White" }`.

FashionParser preserves the **full vocabulary** of fashion. That same product title yields:

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

This structured metadata becomes the **knowledge layer** that every other feature builds on — search, analytics, outfit recommendations, and shopping gap detection.

## Preserving Fashion Terminology

Retailers are inconsistent with how they label garments. "A-line" might be called a style, silhouette, or fit depending on the brand. FashionParser normalizes these inconsistencies by classifying attributes by **what they describe**, not how retailers label them:

| Category | Answers | Single/Multi | Examples |
|---|---|---|---|
| **Silhouette** | What shape does this garment create? | Single | a-line, sheath, bodycon, fit & flare |
| **Fit** | How closely does it follow the body? | Single | oversized, relaxed, slim, tailored |
| **Shaping** | How is the shape achieved? | Multi | princess seams, darts, boned, smocked |
| **Neckline** | What's the neckline? | Single | square neck, v-neck, mandarin collar |
| **Sleeve Length** | How long are the sleeves? | Single | long sleeve, cap sleeve, sleeveless |
| **Sleeve Style** | What's the sleeve shape? | Single | puff, bishop, lantern, bell |
| **Hem Length** | How long is the garment? | Single | mini, midi, maxi, crop |
| **Leg Shape** | What's the leg silhouette? | Single | wide leg, bootcut, tapered, cigarette |
| **Rise** | Where does the waistband sit? | Single | high waist, mid rise, low rise |
| **Waist Style** | How is the waist constructed? | Single | paperbag, elastic, belted |
| **Closure** | How does it fasten? | Multi | button front, hidden zipper, lace-up |
| **Construction** | Structural details? | Multi | side slit, raw hem, distressed, vented |
| **Accents** | Decorative elements? | Multi | sequins, ruffles, embroidered, pearls |
| **Pattern** | What's the surface pattern? | Single | floral, plaid, polka dots, chevron |

Terms like "princess seams," "bishop sleeves," and "godet skirt" carry specific construction and design information. By preserving this vocabulary rather than flattening it into generic labels, FashionParser enables fashion-literate search — users can find garments using the same terms they'd use at a boutique.

## What Can Be Built on This Knowledge Layer

### Wardrobe Analytics
Rich metadata enables insights beyond simple counts:
- "80% of your dresses are midi length"
- "Most common neckline: square neck"
- "You only own two tailored pieces"

### Intelligent Search & Filtering
- "Show me all dresses with structured bodices" (matches princess seams, boning, darts, corset)
- "Tops with dramatic sleeves" (matches balloon, bishop, lantern, puff, bell)

### Style Profile Inference
Without any user tagging, infer style families from attribute patterns:
- Square neck + puff sleeve + smocked + floral → **romantic**
- Peak lapel + tailored + sheath → **classic**
- Leather + studded + moto → **edgy**

### Outfit Balancing
Recommendations based on garment characteristics, not just categories:
- Oversized sweater → pair with slim trousers
- Puff sleeve blouse → avoid oversized blazer (volume conflict)

### Shopping Gap Detection
- "You own 18 floral dresses but 0 sheath dresses"
- "Your wardrobe lacks tailored trousers and crew-neck sweaters"

### Care & Season Inference
Material and construction details enable automatic inference:
- Silk → delicate wash
- Wool → fall/winter
- Linen → wrinkle-prone

## Architecture

```
FashionParser/
├── types.ts                  # ProductAttributes interface, RegexMap type
├── utils.ts                  # matchFirst(), matchAll()
├── inferProductAttributes.ts # Main parser entry point
├── index.ts                  # Public API barrel export
│
├── maps/                     # Regex-to-canonical-value lookup tables
│   ├── silhouette.ts
│   ├── fit.ts
│   ├── shaping.ts
│   ├── neckline.ts
│   ├── sleeve.ts            # SLEEVE_LENGTH_MAP + SLEEVE_STYLE_MAP
│   ├── hem.ts
│   ├── leg.ts
│   ├── rise.ts
│   ├── waist.ts
│   ├── closure.ts
│   ├── construction.ts
│   ├── accents.ts
│   ├── pattern.ts
│   ├── season.ts
│   ├── stretch.ts           # STRETCH_MAP + POCKET_MAP
│   ├── color.ts
│   └── material.ts
│
├── normalizers/              # (planned) Brand/color/material normalization
│   ├── normalizeColor.ts
│   ├── normalizeBrand.ts
│   └── normalizeMaterial.ts
│
├── inference/                # (planned) Higher-order attribute inference
│   ├── inferOccasion.ts
│   ├── inferCare.ts
│   ├── inferSeason.ts
│   ├── inferCategory.ts
│   └── inferStyle.ts
│
└── __tests__/
    ├── parser.test.ts
    ├── neckline.test.ts
    └── silhouette.test.ts
```

## Roadmap

### Phase 1: Core Parser (current)
- [x] 14 attribute categories with regex maps
- [x] `matchFirst` for single-value attributes, `matchAll` for multi-value
- [x] Proper separation: silhouette vs fit vs shaping vs leg shape
- [x] Color and material maps
- [x] Backward-compatible re-export from `utils/inferProductAttributes`

### Phase 2: Normalizers
- [ ] `normalizeColor` — map retailer color names to canonical palette (e.g., "dusty rose" → "pink")
- [ ] `normalizeBrand` — handle brand name variations and abbreviations
- [ ] `normalizeMaterial` — group fabric variants (e.g., "organic cotton" → cotton family)

### Phase 3: Inference Engine
- [ ] `inferCare` — derive care instructions from materials and construction (silk → delicate, denim → machine wash)
- [ ] `inferOccasion` — derive occasions from attribute combinations (bodycon + sequins → going out)
- [ ] `inferSeason` — derive seasonality from materials and weight (wool → fall/winter, linen → spring/summer)
- [ ] `inferCategory` — auto-categorize from product title when not explicit
- [ ] `inferStyle` — derive style family (romantic, classic, edgy, minimal, casual) from attribute patterns

### Phase 4: Extended Vocabulary
- [ ] Shoe attributes: toe shape, heel height, sole type
- [ ] Bag attributes: closure, handle style, compartments
- [ ] Jewelry attributes: metal, stone, setting
- [ ] Cuff styles: french cuff, barrel cuff, rolled
- [ ] Collar subtypes: spread, point, band, wing

### Phase 5: Multi-Signal Parsing
- [ ] Accept product description + title for richer extraction
- [ ] Brand-aware parsing (Aritzia "Contour" = bodycon, Reformation sizing)
- [ ] Image-assisted attribute detection (future ML integration point)

### Phase 6: Analytics & Recommendations
- [ ] Wardrobe composition dashboard (silhouette distribution, color wheel, style profile)
- [ ] Shopping gap analysis ("you don't own any structured blazers in navy")
- [ ] Outfit compatibility scoring based on volume, structure, and formality balance
- [ ] Style profile generation (% romantic, % classic, % casual)
