# v2.2 — Engaging the Web for Missing Product Details
## Written 2026-06-20.

> **Date:** 2026-06-20 &nbsp;·&nbsp; **Status:** PLANNED (design spike).
> **Audience:** personal strategy notes.
> Backend host depends on the unresolved [Backend & Database Decision](./BACKEND_DATABASE_DECISION.md) —
> this doc does not re-decide it; it assumes "whatever server runtime the DB lands on."
> Companion to the README v2.2 roadmap section.

---

## The idea

Order-confirmation emails reliably give us **image, name, price (± sale price), color, size, and brand**.
They rarely give the *rich* stuff: full description, exact material content, construction/style attributes.

That richer data **already exists on the retailer's product page**. So:

```
brand + item name  →  find the retailer PDP URL  →  fetch the page  →  extract the rich blocks  →  feed the EXISTING infer* pipeline
   (from email)          (search or direct)           (the hard part)      (data-testid targets)         (reuse, don't rebuild)
```

**Worked example (Aritzia "Sculpt Knit Racer Mini Dress"):**
- Search `aritzia Sculpt Knit Racer Mini Dress` → resolves to `aritzia.com/us/en/product/sculpt-knit-racer-mini-dress/99158.html`
- On that page:
  - `[data-testid="product-description"]` → *"…racerback mini dress with a crew neckline… Ottoman stitch…"* → infer style `racerback`, neckline `crew`, construction `ottoman stitch`
  - Details modal `[aria-label="… Product Details"]` → `[data-testid="features-copy"]` → bullet features
  - `[data-testid="materials-and-care-copy"]` → *"Content: 99% nylon, 1% elastane"* → exact `MaterialBlend[]`

---

## ⭐ The genuine win (lead with this)

The extraction layer's only job is to **fetch better text**. Everything downstream already exists:

- `inferProductAttributes` (neckline/sleeve/hem/fit/rise/pattern/accents maps)
- `inferMaterialFromName` / `normalizeMaterial` / `resolveMaterials` (→ `MaterialBlend[]`)
- `inferCareFromMaterial` / `inferCareFromAttributes`
- `cleanProductName` / `toTitleCase`

Today these run on the **email's thin product name**. Point them at a 3-sentence PDP description + an explicit "99% nylon, 1% elastane" string and accuracy jumps dramatically **with near-zero new inference code**. The scraper is a *text source upgrade* for a pipeline that's already good.

This reframes the whole feature from "build a scraper" to "add a richer text source to the existing enrichment pipeline."

---

## ⚠️ The load-bearing feasibility problem (verified, not theoretical)

I tested the real Aritzia URL on 2026-06-20:

```
curl -A "<real browser UA>" https://www.aritzia.com/.../99158.html
→ HTTP 403,  <title>Just a moment...</title>,  Cloudflare bot challenge,  ZERO product data
```

**A plain server-side `fetch()` does not work on Cloudflare/Akamai-protected retailers — which is most major ones.** This is not just JS-hydration; it's active anti-bot (Cloudflare Turnstile / JS challenge). The same is true of scraping Google's SERP directly — Google blocks scrapers and serves CAPTCHAs.

So the architecture's hard part is **not** parsing `data-testid`s — it's *getting an unblocked, fully-rendered DOM at all*. Three tiers, increasing cost/reliability:

| Tier | Mechanism | Beats Cloudflare? | Cost | Notes |
|---|---|---|---|---|
| **A. Plain fetch** | serverless `fetch(url)` | ❌ no (403) | free | works only on unprotected/SSR sites; useless on Aritzia/Zara |
| **B. Self-host headless** | Playwright/Puppeteer + stealth | ⚠️ sometimes | infra + maintenance | datacenter IPs still get flagged; needs residential proxies to be reliable; we already have Playwright as a dev dep |
| **C. Scraping API** | ScrapingBee / Browserless / Zyte / Bright Data | ✅ yes (residential proxies + CAPTCHA solving) | ~$0.001–0.01/request | least code, most reliable, ongoing $ |

**Recommendation: build against a Tier-C API behind an adapter interface**, so Tier-A (free) can short-circuit for sites that don't need the heavy path, and the provider stays swappable. Do **not** sink weeks into self-hosted stealth headless — it's a cat-and-mouse maintenance treadmill that scraping vendors exist precisely to absorb.

---

## Finding the PDP URL — layered fallback (the chosen strategy)

```
1. RETAILER-DIRECT  (try first — free, no search dependency)
   ├─ Known retailer? use a per-retailer URL template / search endpoint / sitemap
   │    e.g. aritzia → site search API or slugify(name) into the PDP path pattern
   └─ Many brands expose a JSON product-search endpoint we can hit directly

2. SEARCH-API FALLBACK  (when direct fails or retailer unknown)
   ├─ Google Programmable Search (Custom Search JSON API) — 100 queries/day free, then ~$5/1k
   ├─ or SerpAPI / Bing Web Search — paid, reliable, ToS-clean
   └─ take the first result whose host matches the known brand domain

3. GIVE UP GRACEFULLY
   └─ no confident match → leave item as-is, flag "details not found", never block the import
```

This is the structure chosen in clarifying questions: **retailer-direct first, search-API fallback, robust degradation.** Most-robust, most to build — but each tier is independently shippable.

---

## Extraction layer

Per-retailer selector packs, keyed by `data-testid` (the user's observation is correct: sites have largely moved from brittle class names to stable, semantic `data-testid` attributes — a gift for scraping):

```ts
// shape sketch — one pack per retailer, same treadmill as the email parsers
interface PdpSelectorPack {
  retailer: string;
  hostMatch: RegExp;
  description?: string;     // '[data-testid="product-description"]'
  features?: string;        // '[data-testid="features-copy"] li'
  materials?: string;       // '[data-testid="materials-and-care-copy"]'
  detailsTrigger?: string;  // selector to expand a lazy modal before reading
}
```

**Honest framing:** these per-retailer packs are the **same linear maintenance treadmill** as the existing multi-retailer *email* parsers — when a retailer reworks its PDP, the pack breaks and needs a fix. This is not a clean one-time win; it's an ongoing cost that scales with retailer coverage. Mitigations: (a) a generic fallback that scans for `Content:` / `Material:` / `% (nylon|cotton|…)` patterns anywhere on the page when no pack matches; (b) JSON-LD — many PDPs embed `<script type="application/ld+json">` `Product` schema with description/material, which is far more stable than DOM selectors. **Try JSON-LD before per-retailer DOM selectors.**

---

## Data flow & write path

```
EditItemView import-review screen
  → user taps "Find full details"  (explicit, not automatic — see UX below)
  → POST /enrich { brand, name, color, size }   [backend runtime per DB decision]
       → resolve URL (direct → search)
       → fetch rendered DOM (Tier A→C)
       → extract { description, features[], materialString, jsonLd? }
       → run through inferProductAttributes + resolveMaterials server-side OR return raw text
  → response merges into formData (user reviews, edits, saves — never silently overwrites)
  → cache result keyed by (retailer, itemNumber|slug) to avoid re-scraping
```

**Caching is mandatory**, not optional — scraping API calls cost money and retailers rate-limit. Cache the *extracted* result (not the raw HTML) in the DB keyed by retailer + item number/slug; TTL ~30–90 days. This is another reason the [DB decision](./BACKEND_DATABASE_DECISION.md) gates this work.

---

## UX principles

- **User-triggered, not automatic.** A "Find full details ✨" button on the import-review card. Automatic scraping on every import burns API budget and surprises the user.
- **Always reviewable.** Scraped data pre-fills fields the user then confirms/edits — consistent with the existing import-review flow. Never silently mutate.
- **Graceful empty state.** "Couldn't find details for this item" is a normal outcome, not an error. The item still imports fine.
- **Show provenance.** A subtle "from aritzia.com" tag on enriched fields builds trust and aids debugging.

---

## Legal / ToS / risk register

- **Retailer ToS** generally prohibit automated scraping. Personal-use, low-volume, user-triggered, cached enrichment is low-risk in practice but not zero — worth a line in a privacy note. Don't market "we scrape retailers."
- **Google SERP scraping violates Google ToS** — use the **Custom Search JSON API**, not HTML scraping, for the search tier.
- **Bot-blocking is adversarial and ongoing** — Cloudflare/Akamai will keep changing; budget for breakage. This is why Tier-C (a vendor who absorbs that fight) is the pragmatic core.
- **PII / cost controls** — rate-limit per user, cap monthly API spend, never log full scraped pages with user identifiers.

---

## Phased rollout & estimates (dev-days, ideal)

| Phase | Scope | Est. |
|---|---|---|
| **0. Feasibility spike** | Stand up a Tier-C scraping-API account; confirm it returns Aritzia + Zara + one SSR site PDP DOM; confirm `data-testid` blocks + JSON-LD are present in rendered output. **De-risks every estimate below.** | **1–1.5** |
| **1. Backend `/enrich` endpoint** | runtime per DB decision; URL-resolver (direct + Custom Search fallback); fetch adapter (Tier A→C); cache layer | **3–4** |
| **2. Extraction packs** | JSON-LD-first generic extractor + 2 retailer packs (Aritzia, Zara); wire into `inferProductAttributes` / `resolveMaterials` | **2–3** |
| **3. Client integration** | "Find full details" button in EditItemView, loading/empty/provenance states, merge-into-formData + review | **2–3** |
| **4. Hardening** | rate limits, spend cap, error telemetry, cache TTL, 3–4 more retailer packs | **2–3** |
| **Total** | end-to-end v2.2 (excluding the DB it caches into) | **~10–14.5 days** |

> The spread is dominated by **Phase 0's outcome.** If Tier-C cleanly returns rendered DOM, the rest is mostly the familiar parser-pack work. If even residential-proxy headless struggles on key retailers, scope shrinks to "SSR + JSON-LD sites only" and the feature's reach narrows. **Do Phase 0 before promising anything.**

---

## Why this is lower priority than it feels

It's the most *intellectually* interesting item on the board, but:
- It depends on the **backend/DB** existing (caching) — so it's gated behind that decision anyway.
- It's **adversarial and fragile** per-site — ongoing maintenance, not ship-and-forget.
- The email pipeline already produces *decent* attributes from names; this is a **quality upgrade**, not a missing capability.

Per the [Strategy Review](./STRATEGY_REVIEW_2026-06-20.md), this sits at **priority #4** — after known-bug cleanup, the DB decision, and mobile/PWA.
