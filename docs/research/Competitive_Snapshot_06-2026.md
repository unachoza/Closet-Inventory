# Competitive Snapshot — Nothing To Wear

_Fashion Tech · Digital Wardrobe Apps · Updated 2026-06-20_

---

## The Finding

Every competitor is an **outfit-styling app**. NTW's uncompeted ground is **wardrobe inventory & logistics** — item status, location, availability, and borrow/lend. No one tracks whether a piece is dirty, where it is, or lets you borrow from a friend.

**⚠️ Alert:** Fits (Germany) shipped email receipt import in Oct 2025. Your inbox-import moat is no longer uncompeted. Their version is basic (forward a receipt). Yours is deep (Gmail OAuth + 10+ retailer parsers + material/care inference). Ship v1.5 status/location before the gap closes further.

---

## Audience & Pricing at a Glance

| App               | Users                            | Free Tier                          | Paid                            | Model                        |
| ----------------- | -------------------------------- | ---------------------------------- | ------------------------------- | ---------------------------- |
| **Whering**       | 7M+                              | Everything — fully free            | None                            | Free (no monetization found) |
| **Acloset**       | 7M+                              | Up to 100 items                    | $3.99–$24.99/mo · ~$130/yr      | Freemium sub                 |
| **OpenWardrobe**  | 200K+                            | Up to 500 items, unlimited outfits | "Circle" — price not listed     | Freemium                     |
| **Stylebook**     | Unknown (15yr tenure)            | None                               | **$4.99 one-time**              | One-time purchase            |
| **Alta**          | Unknown (millions of outfits/wk) | Everything — fully free            | None                            | Free ($11M VC-funded)        |
| **Fits**          | Growing (4.6★, 993 ratings)      | Unlimited items + outfits          | ~€9.99/mo · ~€59.99/yr          | Freemium sub                 |
| **Smart Closet**  | Small / declining                | Limited                            | $2.99 one-time + $0.99/mo Pro   | Hybrid                       |
| **Closet+**       | Negligible                       | Limited                            | $2.99–$5.99 one-time IAP        | Dead / abandoned             |
| **Indyx**         | Unknown (US, growing)            | Unlimited items, packing           | $12.99/mo · $74.99/yr           | Freemium sub                 |
| **NTW (planned)** | —                                | 35 items, manual, local only       | Unlimited + Gmail import + sync | Freemium sub (Stripe)        |

---

## Feature Comparison Matrix

✅ Shipped · 🟡 Partial · ❌ None · ⭐ NTW differentiator · 🔲 NTW planned

| Feature                                  | Whering | Acloset |  OpenWardrobe  | Stylebook | Alta |   Fits   |     **NTW**      |
| ---------------------------------------- | :-----: | :-----: | :------------: | :-------: | :--: | :------: | :--------------: |
| Closet cataloguing                       |   ✅    |   ✅    |       ✅       |    ✅     |  ✅  |    ✅    |        ✅        |
| AI background removal                    |   ✅    |   ✅    |       ✅       |    ❌     |  ✅  |    ✅    |        🔲        |
| **Post-purchase email import**           |   ❌    |   ❌    |       ❌       |    ❌     |  ❌  | 🟡 basic |  ⭐ Gmail OAuth  |
| **Multi-retailer email parsing**         |   ❌    |   ❌    |       ❌       |    ❌     |  ❌  |    ❌    | ⭐ 10+ retailers |
| **Material / care inference**            |   ❌    |   ❌    |       ❌       |    ❌     |  ❌  |    ❌    |    ⭐ shipped    |
| **Fabric / fiber education**             |   ❌    |   ❌    |       ❌       |    ❌     |  ❌  |    ❌    |    ⭐ shipped    |
| **CSV export**                           |   ❌    |   ❌    |       ❌       |    ❌     |  ❌  |    ❌    |    ⭐ shipped    |
| Fuzzy search + multi-filter              |   ❌    |   🟡    |       🟡       |    ✅     |  ❌  |    🟡    |    ✅ shipped    |
| Shop-time Chrome extension               |   ✅    |   ✅    |       ✅       |    ❌     |  ❌  |    ❌    |        ❌        |
| AI photo detection / auto-tag            |   ✅    |   ✅    |       ✅       |    🟡     |  ✅  |    ✅    |        🔲        |
| Outfit builder                           |   ✅    |   ✅    |       ✅       |    ✅     |  ✅  |    ✅    |      🔲 v7       |
| Virtual try-on (avatar of you)           |   ❌    |   ❌    |       ❌       |    ❌     |  ✅  |    ❌    |      🔲 v7       |
| AI outfit suggestions                    |   ✅    |   ✅    |       ✅       |    ❌     |  ✅  |    ✅    |      🔲 v7       |
| Weather-aware outfits                    |   ✅    |   ✅    |       ❌       |    ❌     |  ✅  |    ❌    |      🔲 v7       |
| Style calendar / outfit log              |   ✅    |   ✅    |       ❌       |    ✅     |  ✅  |    ✅    |        ❌        |
| Wear count / cost-per-wear               |   ✅    |   ✅    |       ✅       |    ✅     |  ❌  |    🟡    |      🔲 v5       |
| Packing lists / travel                   |   🟡    |   🟡    |       🟡       |    ✅     |  ✅  |    ✅    |      🔲 v6       |
| **Travel weight calculator**             |   ❌    |   ❌    |       ❌       |    ❌     |  ❌  |    ❌    | ⭐ planned v6.1  |
| Social — view friends' wardrobes         |   ✅    |   ❌    |       ✅       |    ❌     |  🟡  |    🟡    |      🔲 v8       |
| **Borrow / lend between users**          |   ❌    |   ❌    |       ❌       |    ❌     |  ❌  |    ❌    |  ⭐ planned v8   |
| **Item status (dirty / clean / away)**   |   ❌    |   ❌    | 🟡 repair only |    ❌     |  ❌  |    ❌    | ⭐ planned v1.5  |
| **Item location (multi-home / storage)** |   ❌    |   ❌    |       ❌       |    ❌     |  ❌  |    ❌    | ⭐ planned v1.5  |
| **Laundry forecasting**                  |   ❌    |   ❌    |       ❌       |    ❌     |  ❌  |    ❌    | ⭐ planned v1.5  |
| Resale listing                           |   ❌    |   ❌    |       ✅       |    ❌     |  ❌  |    ❌    |        ❌        |
| Color analysis                           |   ❌    |   ✅    |       ✅       |    ❌     |  ❌  |    ❌    |        ❌        |
| Cloud sync / multi-device                |   ✅    |   ✅    |       ✅       |    ❌     |  ✅  |    ✅    |    🔲 PR #44     |
| PWA / no App Store gate                  |   ❌    |   ❌    |       ❌       |    ❌     |  ❌  |    ❌    |    ⭐ planned    |
| Android                                  |   ✅    |   ✅    |       ✅       |    ❌     |  ✅  |    ✅    |    🔲 via PWA    |

---

## Who They're Built For

| App                         | Primary Users | Countries                                            | Age / Demo                         |
| --------------------------- | ------------- | ---------------------------------------------------- | ---------------------------------- |
| Whering                     | 7M+           | UK, USA, Ireland, Australia                          | Women 22–38, sustainability-aware  |
| Acloset                     | 7M+           | USA 15%, Spain 14%, France 6%, Korea 7%, 140+ others | Women **13–29**, Gen Z             |
| OpenWardrobe                | 200K+         | USA                                                  | Women 30–55                        |
| Stylebook                   | Unknown       | USA (iOS only)                                       | Women 30–55, power users           |
| Alta                        | Unknown       | USA, 40+ countries                                   | Women 22–40, NYC/LA, Vogue-reader  |
| Fits                        | Growing       | Germany, EU-wide                                     | Women 20–35, European              |
| **NTW — Maya**              | —             | USA (urban)                                          | Women 26±, overwhelmed fashionista |
| **NTW — "Our Closet" pair** | —             | USA (urban + multi-home)                             | **Unserved by any competitor**     |

---

## NTW's Uncompeted Wedges

| Feature                                            | Status  | Why it matters                                                                                      |
| -------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| Item status (dirty / clean / at cleaner / on loan) | 🔲 v1.5 | No competitor tracks this. The only feature that explains "nothing to wear" at the logistics level. |
| Item location (home / storage / suitcase)          | 🔲 v1.5 | No competitor tracks this. Foundation for travel + borrow features.                                 |
| Laundry forecasting                                | 🔲 v1.5 | No competitor has this. Derived from status + wear count.                                           |
| Borrow / lend between users                        | 🔲 v8   | Only feature in the category with a built-in viral loop.                                            |
| Post-purchase email import + inference             | ✅ / 🔲 | Fits has a basic version now. NTW's is deeper — protect and market the difference.                  |
| Fabric / fiber education                           | ✅      | Shipped. No competitor has it.                                                                      |
| Travel weight calculator                           | 🔲 v6.1 | Everyone has packing lists. Nobody calculates carry-on weight vs. airline limits.                   |

---

## SWOT (Quick View)

|              | Strengths                                                                                                  | Weaknesses                                                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Internal** | Deep email import pipeline · fabric care layer · CSV export · fuzzy search · clean architecture · PWA path | `main` is localStorage-only · no AI background removal · no style calendar · mobile not PWA yet · 30-item free limit is tight vs. competitors |

|              | Opportunities                                                                                                                                                                          | Threats                                                                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **External** | Status/location/borrow is empty territory · borrow loop = viral mechanic · Acloset pricing backlash creating switchers · sustainability narrative growing · PWA = no 30% App Store cut | Fits is fast and shipping (inbox import Oct 2025) · Whering has 7M users + Google AI · Alta has $11M + Vogue · two fully-free incumbents make conversion harder |

---

_Full profiles, reviews, and sources: [COMPETITIVE_ANALYSIS_2026-06-20.md](./COMPETITIVE_ANALYSIS_2026-06-20.md)_
