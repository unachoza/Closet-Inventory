# E13 · Internationalization (i18n) & Multilanguage Support

> **Date:** 2026-07-05 · **Pillar:** Infrastructure / Foundation · **Detail:** medium
> **Goal:** Launch in English + Spanish (EN/ES). Build the infrastructure such that adding further languages
> later is a mechanical translation task, not a codebase change. All UI strings must be extractable, type-safe,
> and live outside the component tree.
>
> **Scope note:** this epic is **infrastructure planning only** — no UI changes, no logic, no translations yet.
> The actual string-extraction work and translation files are the implementation phase that comes after this doc
> is approved. That phase is estimated at 4–7 dev-days (see breakdown below).

---

## Why plan this now (before translation work starts)

Retrofitting i18n into a codebase where strings are already hardcoded in 106 TSX/TS files costs 2–3× more than
extracting strings *during* development. The window to do it cheaply is **before the Block A/B completion
sprint** — not after launch. The choices locked in this doc (library, key naming, namespace structure) are
essentially irreversible once translation files are produced at scale.

---

## The blind spots — push-back notes

Before committing to "English + Spanish at launch":

### 1. Which Spanish? — **DECIDED (2026-07-05)**

Priority/fallback order: **es-US → es-PE → es-MX → es-ES**

**Important:** `es-US` is not a separate translation file — there is no standardized "US Spanish" register.
In practice: write **one base translation file** in neutral Latin American Spanish (`es`). Configure i18next
with the fallback chain `['es-US', 'es-419', 'es', 'en']` — US Hispanic users resolve to the Latin American
baseline automatically. Your priority order becomes the *fallback chain*, not four separate files.

```ts
// i18n.ts
fallbackLng: { 'es-US': ['es-419', 'es', 'en'], 'es-PE': ['es-419', 'es', 'en'],
               'es-MX': ['es-419', 'es', 'en'], 'es-ES': ['es', 'en'], default: ['en'] }
supportedLngs: ['en', 'es', 'es-419']  // one Latin American base; sub-region tags resolve via fallback
```

**Translator brief note:** US Hispanic fashion vocabulary skews strongly Latin American, not Iberian. Loanwords
like "outfit," "jeans," "look" are widely used and accepted — do not over-Spanishize them. The vocabulary
risk is concentrated in ~80–100 keys (category names, status labels, care terms).

### 2. Who is translating? — **DECIDED (2026-07-05)**

**MT (GPT-4o or DeepL) as first draft + human reviewer confirmed.** Sourcing: Upwork/Toptal with "fashion +
Latin American Spanish" in the brief. Budget **$100–200** for a 3–4 hour engagement covering ~80–100
high-risk keys (category names, status labels, care terms). The remaining keys (button text, empty states,
error messages) can ship MT-reviewed; only the domain vocabulary needs the human pass.

### 3. Static strings are the easy half

The hard half is **dynamic content that flows through translated UI:**
- Item names and descriptions parsed from email/manual entry are user-generated (untranslatable).
- Category names (`intimates`, `swim`, `tops`) are app vocabulary and **must** be in the translation file — but
  they also appear as enum values in TypeScript. The key insight: **the enum key stays English; only the display
  label is translated**. This is already how `humanizeCondition()` works for `WearState` — the same pattern
  must be applied to every status, category, location kind, and sort option.
- Parser-produced strings (retailer names, fabric names, color names) are partly internationalized by the data
  source. Don't over-translate here — a `linen` fabric parsed from a Nordstrom email doesn't need to become
  `lino` in the UI automatically; the item name stays as-was. Apply i18n to **UI chrome**, not to parsed data.

### 4. The hardcoded-display-list gotcha applies here

`src/hooks/useClosetFilters.ts`, `src/utils/constants.ts`, `src/utils/locations.ts`, `src/utils/condition.ts`,
and `src/Features/Carousel/Carousel.tsx` all contain **hardcoded English display strings in TypeScript arrays**
that `tsc` won't catch as "untranslated." These are the highest-risk files in the extraction pass — a new sort
option or filter label added in English after the translation files are produced will silently stay in English
for all locales.

**Mitigation:** after extraction, any hardcoded display string that isn't going through a `t()` call is a lint
error (eslint-plugin-i18next can enforce this in CI).

---

## Library recommendation: i18next + react-i18next

**Chosen over react-intl (formatjs) because:** i18next has a simpler mental model for a solo/small team,
excellent TypeScript support for key-type inference (no missing-key bugs), and a smaller learning curve.
`react-intl` is better for enterprise ICU-heavy workflows; overkill here.

**Chosen over Lingui because:** larger ecosystem, better docs, more battle-tested in React + Vite setups.

| Package | Role |
|---|---|
| `i18next` | Core runtime |
| `react-i18next` | `useTranslation()` hook + `<Trans>` component for React |
| `i18next-browser-languagedetector` | Auto-detect locale from browser/navigator (with fallback to `en`) |
| `i18next-http-backend` | Lazy-load translation JSON files from `public/locales/` — don't bundle all translations upfront |

**Configuration sketch (do not implement yet — this is planning):**

```ts
// src/i18n.ts (new file, initialized once, imported at app root)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],  // grow this list — no code change needed per new language
    defaultNS: 'common',
    ns: ['common', 'inventory', 'care', 'onboarding'],
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
    interpolation: { escapeValue: false },  // React handles XSS
  });
```

Translation files live at:
```
public/
  locales/
    en/
      common.json
      inventory.json
      care.json
      onboarding.json
    es/
      common.json
      inventory.json
      care.json
      onboarding.json
```

Adding a new language later = add one directory + JSON files. Zero code change.

---

## Namespace structure

Splitting into namespaces keeps translation files small and allows lazy-loading by route:

| Namespace | Content | Owned by |
|---|---|---|
| `common` | Global chrome: nav labels, button text ("Save Changes", "Cancel", "Delete"), empty states, error messages, modal titles | All features |
| `inventory` | Item fields (condition, status, location, category, color), filter labels, sort options, card-level UI, the overview border-toggle legend | E2 / this branch |
| `care` | Fabric names, washing symbols, care instruction text, stain-guide content | E8 |
| `onboarding` | Welcome flow, "where do your clothes live" location-setup screen, account creation prompts, the progressive no-account warnings (30/50/75 items) | E12 / E10 |

> **Rule:** a translation key lives in the most-specific namespace that owns it. Don't put everything in
> `common` — that becomes an unmaintainable dumping ground.

---

## Key naming convention

```
namespace:section.label
```

Examples:
```json
// inventory.json
{
  "status": {
    "clean": "Clean",
    "dirty": "Dirty",
    "at_cleaner": "At the Cleaner",
    "in_repair": "Needs Repair",
    "traveling": "Traveling",
    "on_loan": "On Loan",
    "airing": "Airing Out",
    "stored": "Stored Away"
  },
  "location": {
    "home": "Home",
    "storage": "Storage",
    "suitcase": "Suitcase",
    "other": "Other"
  },
  "condition": {
    "new": "New",
    "like_new": "Like New",
    "good": "Good",
    "fair": "Fair",
    "poor": "Poor",
    "needs_repair": "Needs Repair"
  },
  "category": {
    "tops": "Tops",
    "bottoms": "Bottoms",
    "dresses": "Dresses",
    "outerwear": "Outerwear",
    "shoes": "Shoes",
    "bags": "Bags",
    "intimates": "Intimates",
    "swim": "Swimwear",
    "accessories": "Accessories"
  },
  "filter": {
    "status_label": "Status",
    "location_label": "Location",
    "category_label": "Category",
    "clear_all": "Clear all filters"
  }
}
```

**Key rules:**
- Keys are always `en` English — never translated.
- Enum values (e.g. `"clean"`, `"like_new"`) are used directly as sub-keys. This is safe because the enum
  values are internal identifiers, not display strings. The `t('inventory:status.clean')` call is the only
  place the English label originates.
- No dynamic key construction (`t('inventory:status.' + status)` is fine; `t('inventory:' + buildKey(status))` is not — defeats static analysis).

---

## TypeScript: type-safe translation keys

After extraction, use `i18next`'s type-inference to catch missing keys at build time:

```ts
// src/types/i18n.d.ts
import 'i18next';
import commonEn from '../../public/locales/en/common.json';
import inventoryEn from '../../public/locales/en/inventory.json';
// ...

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof commonEn;
      inventory: typeof inventoryEn;
      // ...
    };
  }
}
```

With this, `t('inventory:status.nonexistent_key')` is a TypeScript error — missing keys can't ship silently.

---

## Pluralization + formatting

i18next handles pluralization natively with `_one` / `_other` suffix:
```json
{ "item_count_one": "{{count}} item", "item_count_other": "{{count}} items" }
```
Usage: `t('inventory:item_count', { count: 3 })` → "3 items"

Date and number formatting should use the **browser-native `Intl` API** (not a library):
```ts
new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(date)
new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'USD' }).format(price)
```
This is zero-cost — `Intl` is built into every modern browser and handles locale-aware formatting correctly
without adding any library weight.

---

## What does NOT get translated (scope guard)

- User-entered content: item names, notes, custom location names — these are the user's own words.
- Parsed retailer/brand names from email: `"Zara"`, `"Nordstrom"`, `"VEJA"` — proper nouns, stay as-is.
- Fabric names from the parser when they appear in parsed item data (vs. in the care guide — those should be translated).
- Image alt text generated from parsed data: e.g. `"Blue linen dress from Zara"` — this is a generated description, not UI chrome. Tricky edge; revisit when E8 is implemented.
- Supabase error messages (server-side) — these need separate handling.

---

## User stories

### US-13.1 — i18n infrastructure
_As the dev team, we want a translation runtime wired into the app so that every UI string goes through a `t()` call and no language-specific text lives in component code._

- [ ] Install `i18next` + `react-i18next` + `i18next-browser-languagedetector` + `i18next-http-backend`
- [ ] Create `src/i18n.ts` initializer (EN + ES, namespace structure above)
- [ ] Create `public/locales/en/` + `public/locales/es/` directories and placeholder JSON files
- [ ] Wire initializer into `main.tsx` (import before `<App />` renders)
- [ ] TypeScript type declarations for key inference (`src/types/i18n.d.ts`)
- [ ] Add eslint-plugin-i18next to CI — any hardcoded string in JSX = lint error

**Estimate:** 1d
**Tickets:** `E13-1.1` infra + config · `E13-1.2` TS type inference · `E13-1.3` ESLint enforcement

### US-13.2 — String extraction (EN baseline)
_As the dev team, we want every hardcoded UI string moved into English translation files so that the translation surface is complete and auditable._

- [ ] Extract strings from all 106 TSX files + the option-array TS files
  - High-priority first: `common.*` (nav, buttons, empty states, errors), then `inventory.*` (status/condition/category/location labels), then `onboarding.*`, then `care.*`
- [ ] The **option arrays** (`statusOptions`, `conditionOptions`, `categoryOptions`, `LOCATIONS`, `SORT_OPTIONS`, `DIMENSIONS`) must have their labels go through `t()` — enum key stays in code, display label comes from translation file
- [ ] `humanizeCondition()` in `condition.ts` gets replaced by `t('inventory:condition.' + condition)` — keep `humanizeCondition` as a thin wrapper until the extraction is done, then delete it
- [ ] Replace every `placeholder="..."` and `aria-label="..."` with `t()` calls
- [ ] After extraction: all 39 hardcoded `placeholder` / `aria-label` occurrences → translation keys

**Estimate:** 2.5–3d (methodical; can be done file-by-file as a dedicated sprint)
**Tickets:** `E13-2.1` common namespace · `E13-2.2` inventory namespace · `E13-2.3` onboarding namespace · `E13-2.4` care namespace · `E13-2.5` option-array wrappers

### US-13.3 — Spanish (es-419) translation
_As a Spanish-speaking user, I want the app in my language so that I can use it without reading English._

- [ ] Produce `es-419` translation files — MT (DeepL or GPT-4o) as first draft
- [ ] Human review pass on `inventory.*` vocabulary (category names, status labels, care terminology) by a
  native speaker — at minimum, category names + status labels + the care namespace
- [ ] Locale switcher in settings (or auto-detect from browser — ship browser-detect first, add explicit
  switcher only if user confusion arises)
- [ ] QA: walk every screen in Spanish; check for truncation (Spanish labels run ~20–30% longer than English —
  verify the filter pills, the card status dot tooltip, the sticky-bar button label "Borders: Location + Status"
  is particularly at risk of overflow)

**Estimate:** 1.5–2d (translation + review + QA pass)
**Tickets:** `E13-3.1` es-419 translation files (MT draft) · `E13-3.2` human vocabulary review · `E13-3.3` locale-detect config · `E13-3.4` Spanish QA + truncation fixes

### US-13.4 — Locale-aware formatting
_As a user in any locale, I want dates, numbers, and currencies displayed in my locale's format (not hardcoded US format)._

- [ ] Replace all `date.toLocaleDateString()` (if any) with `Intl.DateTimeFormat(i18n.language, ...)` calls
- [ ] Currency display: price fields use `Intl.NumberFormat` — no USD symbol hardcoded
- [ ] No new library needed — pure `Intl` API

**Estimate:** 0.5d
**Tickets:** `E13-4.1` date formatting · `E13-4.2` currency/number formatting

---

## Adding a new language in the future (how easy is it?)

Once US-13.1 + US-13.2 are done, adding, say, French (`fr`) is:

1. Create `public/locales/fr/*.json` files
2. Add `'fr'` to `supportedLngs` in `i18n.ts` — **one-line change**
3. Translate the JSON files (MT + human review)
4. That's it — no component changes, no TypeScript changes, no rebuilding the extraction.

This is the guarantee the architecture buys. Record it here so future contributors know the pattern.

---

## Scope guard — what this epic does NOT own

- **Right-to-left (RTL) language support** — Arabic, Hebrew, etc. require CSS `dir="rtl"` mirroring. Not needed
  for EN/ES but worth noting: if `dir` is not on the `<html>` element now, add it as a noop `dir="ltr"` so
  flipping it later is a config change, not a CSS audit. Low-cost now, painful later.
- **SEO / server-side rendering** — all static strings are currently client-rendered; i18n doesn't change this.
  If SSR is ever added (Vite SSR / Next.js migration), translation file loading will need to move. Out of scope.
- **Legal/compliance text** — privacy policy and ToS are separate pages, not component strings. They may
  eventually need translated versions; that's a content/legal problem, not an i18n infrastructure problem.

---

## Total estimate

| Story | Estimate |
|---|---|
| US-13.1 — infrastructure | 1d |
| US-13.2 — string extraction (EN) | 2.5–3d |
| US-13.3 — Spanish translation + QA | 1.5–2d |
| US-13.4 — locale-aware formatting | 0.5d |
| **Total** | **5.5–6.5d** |

> This is meaningful work — not a quick copy-paste. The string extraction in US-13.2 touches every component
> file and is the riskiest part (easy to miss an aria-label or an error-message string). Budget a full-pass
> review after extraction. Do this in a dedicated branch, not mixed into feature work.

---

## Dependencies

- **E8 (Care Knowledge):** the care namespace translation surface is defined when care content is built out —
  do not produce care translation files until the stain guide and washing content are final (translating a draft
  wastes the review budget). US-13.2 for `care.*` is gated on E8 content freeze.
- **E12 (User Profile / Onboarding):** the `onboarding.*` namespace is gated on the onboarding flow being
  designed (US-12.x) — including the "where do your clothes live?" location-setup step and the progressive
  no-account warning modals (30/50/75 items). Extract onboarding strings only after those screens exist.
- **E2 location naming (P1-6/7):** if user-defined location names are stored and displayed back, those are
  user content (untranslatable) — but the **UI chrome around them** (the picker label, the "add a location"
  button, the onboarding prompt) is translatable and belongs in `inventory.*` or `onboarding.*`.
- **No other epic is blocked by E13** — i18n is additive and does not change data models or API contracts.

---

## Open questions (be-critical log)

- [ ] **Which Spanish regional variant?** This doc recommends `es-419` — confirm before producing any
  translation files, since the locale code in `i18n.ts` is hard to change cleanly after files are produced.
- [ ] **Who does the human review pass?** A native Spanish speaker with fashion vocabulary. If this person
  doesn't exist in the current network, plan for it explicitly — "we'll MT + review later" tends to mean "we
  ship MT-only and never review."
- [x] **Waitlist includes Spanish speakers — ES at launch confirmed (2026-07-05).** E13 runs in parallel
  with Block A/B, not after it. Budget: **5.5–6.5 dev-days + 3–4 hrs translator time + ~$100–200**. Calendar
  estimate: ~8–9 business days with MT-draft → translator overlap.
- [ ] **`eslint-plugin-i18next` in CI:** will add noise during the transition (every old component is a lint
  error). Recommend: enable the rule **after** US-13.2 extraction is complete, not during. Otherwise the whole
  codebase is red the moment the plugin is added.
