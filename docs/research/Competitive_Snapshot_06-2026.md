# Competitive Snapshot — Nothing To Wear
_Fashion Tech · Digital Wardrobe Apps · Updated 2026-06-20_

---

## The Finding

Every competitor is an **outfit-styling app**. NTW's uncompeted ground is **wardrobe inventory & logistics** — item status, location, availability, and borrow/lend. No one tracks whether a piece is dirty, where it is, or lets you borrow from a friend.

**⚠️ Alert:** Fits (Germany) shipped email receipt import in Oct 2025. Your inbox-import moat is no longer uncompeted. Their version is basic (forward a receipt). Yours is deep (Gmail OAuth + 10+ retailer parsers + material/care inference). Ship v1.5 status/location before the gap closes further.

---

## Audience & Pricing at a Glance

| App | Users | Free Tier | Paid | Model |
|---|---|---|---|---|
| **Whering** | 7M+ | Everything — fully free | None | Free (no monetization found) |
| **Acloset** | 7M+ | Up to 100 items | $3.99–$24.99/mo · ~$130/yr | Freemium sub |
| **OpenWardrobe** | 200K+ | Up to 500 items, unlimited outfits | "Circle" — price not listed | Freemium |
| **Stylebook** | Unknown (15yr tenure) | None | **$4.99 one-time** | One-time purchase |
| **Alta** | Unknown (millions of outfits/wk) | Everything — fully free | None | Free ($11M VC-funded) |
| **Fits** | Growing (4.6★, 993 ratings) | Unlimited items + outfits | ~€9.99/mo · ~€59.99/yr | Freemium sub |
| **Smart Closet** | Small / declining | Limited | $2.99 one-time + $0.99/mo Pro | Hybrid |
| **Closet+** | Negligible | Limited | $2.99–$5.99 one-time IAP | Dead / abandoned |
| **Indyx** | Unknown (US, growing) | Unlimited items, packing | $12.99/mo · $74.99/yr | Freemium sub |
| **NTW (planned)** | — | 80 items, manual, local only | Unlimited + Gmail import + sync | Freemium sub (Stripe) |

---

## Feature Comparison Matrix

✅ Shipped · 🟡 Partial · ❌ None · ⭐ NTW differentiator · 🔲 NTW planned

| Feature | Whering | Acloset | OpenWardrobe | Stylebook | Alta | Fits | **NTW** |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Closet cataloguing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI background removal | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | 🔲 |
| **Post-purchase email import** | ❌ | ❌ | ❌ | ❌ | ❌ | 🟡 basic | ⭐ Gmail OAuth |
| **Multi-retailer email parsing** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⭐ 10+ retailers |
| **Material / care inference** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⭐ shipped |
| **Fabric / fiber education** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⭐ shipped |
| **CSV export** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⭐ shipped |
| Fuzzy search + multi-filter | ❌ | 🟡 | 🟡 | ✅ | ❌ | 🟡 | ✅ shipped |
| Shop-time Chrome extension | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI photo detection / auto-tag | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | 🔲 |
| Outfit builder | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔲 v7 |
| Virtual try-on (avatar of you) | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | 🔲 v7 |
| AI outfit suggestions | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | 🔲 v7 |
| Weather-aware outfits | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | 🔲 v7 |
| Style calendar / outfit log | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Wear count / cost-per-wear | ✅ | ✅ | ✅ | ✅ | ❌ | 🟡 | 🔲 v5 |
| Packing lists / travel | 🟡 | 🟡 | 🟡 | ✅ | ✅ | ✅ | 🔲 v6 |
| **Travel weight calculator** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⭐ planned v6.1 |
| Social — view friends' wardrobes | ✅ | ❌ | ✅ | ❌ | 🟡 | 🟡 | 🔲 v8 |
| **Borrow / lend between users** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⭐ planned v8 |
| **Item status (dirty / clean / away)** | ❌ | ❌ | 🟡 repair only | ❌ | ❌ | ❌ | ⭐ in progress |
| **Item location (multi-home / storage)** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⭐ in progress |
| **Laundry forecasting** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⭐ planned v5 |
| Resale listing | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Color analysis | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cloud sync / multi-device | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅  |
| PWA / no App Store gate | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⭐ planned |
| Android | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | 🔲 via PWA |

---

## Who They're Built For

| App | Primary Users | Countries | Age / Demo |
|---|---|---|---|
| Whering | 7M+ | UK, USA, Ireland, Australia | Women 22–38, sustainability-aware |
| Acloset | 7M+ | USA 15%, Spain 14%, France 6%, Korea 7%, 140+ others | Women **13–29**, Gen Z |
| OpenWardrobe | 200K+ | USA | Women 30–55 |
| Stylebook | Unknown | USA (iOS only) | Women 30–55, power users |
| Alta | Unknown | USA, 40+ countries | Women 22–40, NYC/LA, Vogue-reader |
| Fits | Growing | Germany, EU-wide | Women 20–35, European |
| **NTW — Maya** | — | USA (urban) | Women 26±, overwhelmed fashionista |
| **NTW — "Our Closet" pair** | — | USA (urban + multi-home) | **Unserved by any competitor** |

---

## NTW's Uncompeted Wedges

| Feature | Status | Why it matters |
|---|---|---|
| Item status (dirty / clean / at cleaner / on loan) | 🔲 v1.5 | No competitor tracks this. The only feature that explains "nothing to wear" at the logistics level. |
| Item location (home / storage / suitcase) | 🔲 v1.5 | No competitor tracks this. Foundation for travel + borrow features. |
| Laundry forecasting | 🔲 v1.5 | No competitor has this. Derived from status + wear count. |
| Borrow / lend between users | 🔲 v8 | Only feature in the category with a built-in viral loop. |
| Post-purchase email import + inference | ✅ / 🔲 | Fits has a basic version now. NTW's is deeper — protect and market the difference. |
| Fabric / fiber education | ✅ | Shipped. No competitor has it. |
| Travel weight calculator | 🔲 v6.1 | Everyone has packing lists. Nobody calculates carry-on weight vs. airline limits. |

---

## SWOT (Quick View)

| | Strengths | Weaknesses |
|---|---|---|
| **Internal** | Deep email import pipeline · fabric care layer · CSV export · fuzzy search · clean architecture · PWA path | `main` is localStorage-only · no AI background removal · no style calendar · mobile not PWA yet · 30-item free limit is tight vs. competitors |

| | Opportunities | Threats |
|---|---|---|
| **External** | Status/location/borrow is empty territory · borrow loop = viral mechanic · Acloset pricing backlash creating switchers · sustainability narrative growing · PWA = no 30% App Store cut | Fits is fast and shipping (inbox import Oct 2025) · Whering has 7M users + Google AI · Alta has $11M + Vogue · two fully-free incumbents make conversion harder |

---

---

## Competitor Visual Aesthetics

| App | Palette | Typography | Vibe | Design Era |
|---|---|---|---|---|
| **Whering** | Black / cream / warm neutrals | Lowercase wordmark, editorial serif headlines | London sustainable fashion magazine — raw linen textures, friends sharing wardrobes, Ecologi badges | 2022–present, fresh |
| **Acloset** | White + dark navy hero + purple accents | Bold stats-forward sans-serif (7M users front and center) | Korean tech-clinical — product screenshots dominate, data metrics as trust signals, very conversion-optimized | 2020–present, modern |
| **OpenWardrobe** | Warm off-white / ivory + dark navy CTA | Editorial display type, generous whitespace | Apartment Therapy meets fashion — lifestyle photography, aspirational community feel, "Wear Better" as the single headline | 2021–present, premium |
| **Stylebook** | Neutral cream / tan / light gray | Plain system sans-serif, small screenshots | Functional utility app never refreshed — all power, no polish. iOS 2012 energy | 2009–present, dated |
| **Alta** | Near-black hero + crisp white type | Tight luxury sans-serif, video-forward | Vogue / Harper's Bazaar digital — the most premium-feeling in the category. Feels like a luxury brand app, not a tool | 2023–present, luxury |
| **Fits** | Light warm white + soft photography | Clean modern sans, restrained spacing | Quiet luxury meets German productivity app — no noise, no flash. European minimalism | 2020–present, refined |
| **Smart Closet** | Pure white + generic iconography | System defaults, simple flat icons | Generic utility app — serviceable, no aesthetic identity. Could be a grocery list app | 2016–present, generic |
| **Indyx** | White / black / editorial photography | Clean editorial sans, premium spacing | Fashion-insider positioning — closer to a brand lookbook than an app landing page | 2021–present, editorial |

**Where NTW sits:** Clean functional + warm — closer to Fits than Alta. NTW should not try to out-luxury Alta or out-editorial Whering. The aesthetic opportunity is "the organized friend" — warm, capable, trustworthy, not cold-tech and not fashion-magazine.

---

## Founders & Backers

| App | Founder(s) | ~20-Word Profile | Key Backers | Est. Raised |
|---|---|---|---|---|
| **Whering** | Bianca Rangecroft | Goldman Sachs / Barclays banker turned founder 2020. SOAS History + Imperial MBA. Drapers 30 Under 30 2023. | Innovate UK · Google AI Accelerator · Circular Economy Incubator · Startupbootcamp · AI Futures Fund | ~£2M (~$2.5M) |
| **Acloset** | Heasin Ko (CEO) · Kijun Yoon (Director) | KAIST/ETRI research alumni turned fashion tech founders 2020. Largest active user base in the category. | Google for Startups · KT Investment · Laguna Investment (Series A lead) · Spring Camp | ~$63M (Series C) |
| **OpenWardrobe** | Julia Dietmar (CEO) | Founded 2021, Redwood City CA. Community-first vision — built for sharing and second-hand, not just cataloguing. | Loyal VC | Undisclosed |
| **Stylebook** | Jess Atkins + Bill Atkins | Jess: NYU photography BFA, Vogue/Lucky Magazine intern. Bill: Wall Street programmer. Built together since 2009. | **Bootstrapped** — profitable on $4.99 for 15 years | $0 raised |
| **Alta** | Jenny Wang | Age 28, Harvard CS grad. Ex-engineer who loved math, programming, and fashion. Founded 2023. Moved fastest in the category. | Menlo Ventures (lead) · Aglaé/LVMH family · Anthropic Anthology Fund · Tony Xu (DoorDash) · Karlie Kloss · Jenny Fleiss (Rent the Runway) · Manish Chandra (Poshmark) | $11M seed |
| **Fits** | L. & J. Henne UG | German indie duo — minimal public profile, no funding found. Built to 1M+ users entirely on product word-of-mouth. | **Bootstrapped** | $0 found |
| **Smart Closet** | Rabbit Tech Inc. | No founder names found publicly. Small team, declining traction, last meaningful update unknown. | Unknown | Unknown |
| **Indyx** | Yidi Campbell (CEO) + Devon Rule (Growth) | Fashion-industry insiders. Yidi frustrated by brand overproduction; Devon tired of selling unnecessary clothes. Founded 2021, SF. | Alante Capital (pre-seed) | Undisclosed |

**Funding landscape takeaway:** The category is bifurcated — bootstrapped/tiny (Stylebook, Fits) vs. VC-fueled (Acloset $63M, Alta $11M). There is no mid-tier seed company. NTW entering at seed puts it in a defensible position: too big to be ignored, small enough to be nimble on logistics features incumbents won't build.

---

_Full profiles, reviews, and sources: [COMPETITIVE_ANALYSIS_2026-06-20.md](./COMPETITIVE_ANALYSIS_2026-06-20.md)_