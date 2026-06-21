# Nothing To Wear

> _Working title: "Nothing To Wear" (formerly "My Closet Inventory" formerly formerly "Our Closet")._

A wardrobe **inventory & logistics** app — not just an outfit planner. It tracks what you own, **what state it's in** (clean / dirty / at the dry cleaner / traveling / on loan), **where it is** (home, storage, a friend's suitcase), and lets you share and borrow with people you trust. Auto-imports purchases from your inbox, infers material/care/style, and answers the question the name asks: _do I actually have nothing to wear, or is it just out of sight, dirty, or lent out?_

Built around low-friction ingestion (email + camera), a fabric-care knowledge layer, and the social/borrow loop that started it all (see [planning/PRODUCT_VISION_2026-06-20.md](./planning/PRODUCT_VISION_2026-06-20.md)).

---

## ✨ Key Highlights

- 🪜 **9-Step Guided Form** — Streamlined item creation with visual progress tracking
- 📸 **Image Management** — Upload, preview, and persist clothing photos
- 🧠 **Smart Date Handling** — Intelligent age calculation (months vs. years)
- 🔍 **Search, Filter & Sort** — Fuzzy search, multi-dimension filters, sort by price/age/name
- 📧 **Gmail Import** — OAuth-authenticated email parsing to auto-populate closet items
- ☁️ **Firestore Sync** — Cloud persistence per user with localStorage as offline cache
- 🧵 **Fabric Care Guide** — Interactive textile guide with material-to-care mapping
- 🎨 **Responsive Design** — Grid layout that works on any device

---

## 🚀 Quick Start

```bash
git clone https://github.com/your-username/closet-inventory.git
cd closet-inventory
npm install
npm run dev
```

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run test`    | Run test suite           |
| `npm run lint`    | Lint codebase            |

---

## 🏗️ Project Structure

```
src/
├── Components/
│   ├── ClothesCard/              # Item card UI
│   ├── GuideComponents/          # Fabric & fiber guide components
│   ├── MaterialBlendInput/       # Multi-material percentage input
│   ├── MaterialCompositionBar/   # Visual material breakdown bar
│   ├── NavBar/                   # App navigation
│   ├── PaginationControls/       # Page controls
│   ├── ProgressionTracker/       # Multi-step form progress UI
│   ├── Toast/                    # Notification system
│   └── ErrorBoundary/            # Error boundary wrapper
├── Features/
│   ├── Carousel/                 # Category carousel navigation
│   ├── Closet/                   # Grid view of closet items
│   ├── FabricCare/               # Interactive fabric care guide
│   ├── Form/                     # 9-step item creation/edit form
│   │   ├── EditItemView/         # Full item detail/edit view
│   │   ├── DatePicker/
│   │   ├── ImageUploader/
│   │   └── ...form field components
│   ├── GmailImport/              # Gmail OAuth + email parsing
│   └── SearchCloset/             # Full closet search, filter, sort
├── context/
│   ├── AuthContext.tsx           # Firebase auth state
│   ├── ClosetContext.tsx         # Shared closet instance (cloud + local)
│   ├── SearchContext.tsx         # Shared search state
│   └── ViewContext.tsx           # App view/navigation state
├── hooks/
│   ├── useCloudCloset.ts         # Firestore sync + localStorage fallback
│   ├── useLocalCloset.tsx        # localStorage-only closet operations
│   ├── useClosetFilters.ts       # Multi-dimension filter logic
│   ├── useClosetSort.ts          # Sort by price, age, name
│   ├── useFuzzySearch.ts         # Fuse.js fuzzy search
│   ├── useGmailAuth.tsx          # Gmail OAuth flow
│   ├── useGmailSearch.tsx        # Gmail API search
│   ├── usePagination.tsx         # Pagination logic
│   └── useStockPhoto.tsx         # Fallback stock image by category
├── utils/
│   ├── types.ts                  # TypeScript interfaces
│   ├── constants.ts              # App-wide constants
│   ├── materialUtils.ts          # Material normalization
│   ├── parseProductsFromEmail.ts # Email → ClothingItem parser
│   └── parseEmailToFormData.ts
├── firebase.ts                   # Firebase app init (auth + Firestore)
├── App.tsx                       # Root component + view routing
└── main.tsx                      # Entry point
```

---

## 🛠️ Tech Stack

| Category          | Technology                                                      | Purpose                                        |
| ----------------- | --------------------------------------------------------------- | ---------------------------------------------- |
| **Framework**     | React 19 (TypeScript)                                           | Component-based UI                             |
| **Build Tool**    | Vite 6                                                          | Fast dev server and bundling                   |
| **Styling**       | CSS Modules + Custom Properties                                 | Scoped styles with theme system                |
| **Animations**    | Framer Motion                                                   | Declarative animations                         |
| **UI Primitives** | Radix UI                                                        | Accessible, unstyled components                |
| **State**         | React Hooks + Context                                           | Local and global state                         |
| **Database**      | Firebase Firestore                                              | Cloud persistence per user                     |
| **Auth**          | Firebase Auth + Google OAuth                                    | User sign-in and Gmail access                  |
| **Search**        | Fuse.js                                                         | Fuzzy client-side search                       |
| **Testing**       | Vitest + React Testing Library                                  | Unit and integration tests                     |
| **E2E**           | Playwright (installed — 2 mobile projects: iPhone 13 + Pixel 7) | End-to-end critical flows (`npm run test:e2e`) |
| **Type Safety**   | TypeScript 5+                                                   | Static type checking                           |

---

## 🏛️ Architecture

**Data flow:**

```
User Input → Form State → Validation → useCloudCloset → Firestore + localStorage → UI
```

**Key patterns:**

- `useCloudCloset` — writes to Firestore when signed in, falls back to localStorage when offline/signed out. On first sign-in with no cloud data, seeds Firestore from localStorage.
- `ClosetContext` — single shared instance of `useCloudCloset` across the app; prevents duplicate Firestore connections.
- `ToastProvider` — global, decoupled notification system.
- `ErrorBoundary` — keyed by view; a crash in one screen resets on navigation.

---

## 👤 User Persona

### Maya — "The Overwhelmed Fashionista"

> _"I keep buying things I already own, and I still feel like I have nothing to wear."_

|                  |                            |
| ---------------- | -------------------------- |
| **Age**          | 26                         |
| **Occupation**   | Marketing Coordinator      |
| **Location**     | Urban — NYC, LA, Chicago   |
| **Devices**      | iPhone, MacBook            |
| **Tech Comfort** | High — uses 10+ apps daily |

**Pain Points**

- Opens her closet and feels overwhelmed — takes 20+ minutes to decide
- Has bought the same white sneaker three times
- Can't remember what she paid for things
- Over-packs when travelling because there's no system
- Has "guilt items" she bought and never wore

**Goals**

- Know exactly what she owns without digging through physical piles
- Get dressed faster with less decision fatigue
- Shop smarter — fill gaps, not duplicates
- Feel good about her wardrobe, not guilty

---

## 🗺️ Roadmap

> ✅ = Shipped (on `main`) &nbsp;|&nbsp; 🚧 = In open PR / review &nbsp;|&nbsp; 🔲 = Planned

> **Version numbers are scope groupings, not build order.** The actual near-term sequence is below. Some items already exist as code but live in open PRs, not yet on `main` — those note the PR number.

---

### 🎯 Near-Term Priority Order

> Re-sequenced 2026-06-20. Full reasoning + dev-day estimates in
> [planning/STRATEGY_REVIEW_2026-06-20.md](./planning/STRATEGY_REVIEW_2026-06-20.md).

1. **Known-bug cleanup + green suite** — strip debug logs, then land the trust-eroding core-loop bugs _with regression tests_: material filter returns nothing, remove doesn't re-render the grid, MonthYearPicker fabricated age, import-non-clothing skip, title-case CAPS. Cheap, high-confidence, makes everything after trustworthy. (~5.5–6 dev-days)
2. **Stand up the cloud layer** — ⚠️ **gated by an open decision:** [Firestore (merge PR #44) vs. Supabase](./planning/BACKEND_DATABASE_DECISION.md). Resolve that first; "merge #44" is only the answer if Firestore wins. Pair with the **base64 → object-storage** image fix. (~2.5–10.5 dev-days, path-dependent)
3. **Mobile UI polish + PWA** — touch-target audit (44×44px), bottom nav / "Add Item" FAB (primary action out of the hamburger), and PWA scaffolding (`vite-plugin-pwa`, `manifest.json`, service worker, iOS meta, icons). **Load-bearing** for monetization ("no App Store / no 30% cut"), offline-first, and add-to-home-screen. (~7.5–9.5 dev-days)
4. **v2.2 web-engagement** — scrape richer product details from retailer PDPs to feed the existing inference pipeline. ⚠️ Do the [feasibility spike first](./planning/EngagingWebForProductDetails.md) — verified 2026-06-20 that Cloudflare bot-blocking returns `403` to plain fetches of major retailers. (~10–14.5 dev-days)

**Cross-version dependencies:**

- `wornCount` (in v5) is required by the **v9.0** lifespan tracker and **v10.0** sustainability. Add the field + "Log a Wear" button early, decoupled from the full analytics dashboard.
- The **cloud backend** (v5.1) gates **v8.1** social and **v1.0 monetization** (`isPremium` read). Resolve the [DB decision](./planning/BACKEND_DATABASE_DECISION.md) before building on it — if Supabase wins, migrate _before_ #44 ships, never after.
- **Monetization** also depends on the **PWA** install path (priority 3).
- **Camera-roll import** (v3.1) is the fastest logging path for the mobile persona and the only path for in-store / second-hand items — slot it after the image-storage fix (it multiplies the base64 ceiling).

---

### v1.0 — Foundation Polish _(current)_

- ✅ 9-step guided item creation form
- ✅ Edit item with full detail view
- ✅ Material percentage breakdown (e.g. 80% cotton, 20% polyester)
- ✅ Image upload with base64 persistence and live preview
- ✅ Factual age display computed from purchase date ("20 days", "1.5 years", "3 years")
- ✅ Separate condition field (new / like new / good / fair / needs repair)
- ✅ Toast notification system
- ✅ localStorage persistence
- ✅ Export Closet / Download CSV Button
- ✅ "View more" expand/collapse on item cards - PR #43
- 🔲 Visual cohesion polish (spacing, color, typography consistency)

---

### v1.1 — Search, Filter & Sort

- ✅ Fuzzy search bar (Fuse.js, threshold 0.4, 300ms debounce)
- ✅ Filter side panel with collapsible accordion sections
- ✅ OR logic within a filter dimension, AND across dimensions
- ✅ Active filter pills with individual remove and "Clear all"
- ✅ Dynamic option counts update as filters apply
- ✅ Sort by: date added, price (asc/desc), age (newest/oldest), name (A–Z / Z–A)
- ✅ "Dry clean only" quick-filter pill
- ✅ Item name visible on card hover (or global toggle)

---

### ⭐ v1.5 — Wardrobe Status, Location & Availability _(the "Nothing To Wear" core — uncompeted)_

> The flagship differentiator and the founding idea: knowing not just _what_ you own but _what state
> it's in_ and _where it is_. No competitor tracks this (verified 2026-06-20). It's the spine that
> connects inventory → laundry → travel → social/borrow. Full spec + data model + UI:
> [planning/WardrobeStatusAndLocation.md](./planning/WardrobeStatusAndLocation.md).

- 🔲 Item `status` enum — clean / dirty / at dry cleaner / needs repair / traveling / on loan / packed
- 🔲 Item `location` field — home label / storage unit / suitcase (presets + free-text); multi-home support
- 🔲 Status & location filters + "where is it / what state is it in" quick views
- 🔲 Quick status actions on the card (mark dirty / mark clean / send to cleaner / pack)
- 🔲 **Laundry forecast** — per-category clean-vs-dirty ratio + "time to do laundry" nudge (needs `wornCount`)
- 🔲 **Availability** = clean + home + not on loan → the gate that feeds v7 outfit suggestions and v8 borrowing
- 🔲 `wornCount` + "Log a Wear" (decoupled early win; also unblocks v5 analytics, v9 lifespan, v10 sustainability)

---

### v2 — Auto Email Import

- ✅ Gmail OAuth import screen
- ✅ Gmail API email thread parsing
- ✅ Structured item extraction (name, price, brand, category) from email HTML
- ✅ Multi-retailer HTML parsers — Anthropologie, Aritzia, Banana Republic, Express, Old Navy, Shein, Skims, Target, Victoria's Secret, Zara (+ partial Amazon); tested against real-email fixtures
- ✅ Advanced Gmail search — subject/body keyword + date-range query builder with confirmation modal and 24h email cache
- ✅ Batch import queue ("Import All Items" from a single email)
- ✅ Deduplication check — skip if item UUID already exists
- ✅ Multi-retailer email parsing (Express, Banana Republic Factory, Anthropologie, SKIMS, Poshmark, SHEIN)

---

### v2.1 — Intense Email Parsing

- ✅ Attribute inference from product name — material blend, fabric care, condition (from order age), and style/occasion tags
- ✅ Multi-material inference with blend percentages and polyamide keyword support
- ✅ Title-case display transform for product names (display-only, non-mutating)
- ✅ Material-based care instruction inference (Washing/Drying auto-population during import)
- ✅ Purchase date gleaned from confirmation email for age calculation (condition editable during import review; date shown read-only, with manual entry fallback when the email has no date)
- 🔲 Parsing strategies for additional retailers (Gap, Victoria's Secret, Old Navy, Target, Walmart, Levi's)
- ✅ Fast fashion retailer support - Temu (data embedded in images, OCR required)
- 🔲 Full Amazon support - import-non-clothing skip
- 🚧 Don't import items that can't be mapped to a category (big for Amazon emails)
- 🔲 Retailer-specific parsers (Amazon, additional Shein variants, Temu — note: Temu embeds data in images, OCR required)

---

### v2.2 — Engaging the Web for missing details

> Full design + risks + estimates: [planning/EngagingWebForProductDetails.md](./planning/EngagingWebForProductDetails.md).
> Core idea: `brand + name` (from email) → resolve retailer PDP URL → scrape the rich blocks
> (`[data-testid="product-description"]`, `[data-testid="materials-and-care-copy"]`, etc.) → feed the
> **existing** `inferProductAttributes` / `resolveMaterials` pipeline. The scraper is a _text-source
> upgrade_, not new inference code.

- 🔲 Server-side fetch layer (browser CORS + Cloudflare/Akamai bot-blocking make client-side scraping impossible — **verified `403` against Aritzia 2026-06-20**); host depends on the [backend/DB decision](./planning/BACKEND_DATABASE_DECISION.md)
- 🔲 Layered URL resolution — retailer-direct first, Google Custom Search API fallback
- 🔲 JSON-LD-first extraction + per-retailer `data-testid` selector packs (same maintenance treadmill as the email parsers)
- 🔲 "Find full details ✨" button on the import-review card (user-triggered, reviewable, cached)
- 🔲 Search for item material breakdown + descriptions from retailer PDPs
- 🔲 "Find image" flow for items imported without photos
- 🔲 Engaging Internet Archive for older / discontinued items

---

### v2.3 - Expanding Email Provider Scope

- 🔲 Additional email providers
- 🔲 Hotmail / Outlook (Microsoft Graph)
- 🔲 Yahoo Mail - server-side IMAP client — a backend required,
- 🔲 iCloud Mail -IMAP, which browsers cannot speak (it's raw TCP, not HTTP)
- 🔲 AOL Mail - IMAP, which browsers cannot speak (it's raw TCP, not HTTP)
- 🔲 Proton Mail - end-to-end encrypted with no usable IMAP

---

### v3.0 — Mobile & PWA

> **Active priority** (see Near-Term Priority Order). Responsive layout is done; PWA, touch-target audit, and bottom nav / "Add Item" FAB are the next mobile work.

- ✅ Responsive layout for iPhone and Android screen sizes (29 `@media` blocks; hamburger drawer nav < 768px)
- 🔲 PWA setup (`vite-plugin-pwa`) — `manifest.json` + service worker for "Add to Home Screen" support **(unblocks v9.0 monetization + v4.0 offline)**
- 🔲 Full-screen launch on iOS (no Safari browser chrome)
- 🔲 Offline support via service worker cache
- 🔲 Touch-friendly tap targets (min 44×44px) and swipe gestures
- 🔲 Bottom navigation bar on mobile
- 🔲 Camera input (`capture="environment"`) for direct photo capture on mobile

---

### v3.1 — Camera Roll Import

> Pulled **ahead of v1.2 analytics** — for the mobile persona, photographing an item is the fastest way to log one, and it's the only import path for in-store / second-hand purchases (email import covers online only).

- consider phone permissions of access to camera roll

- 🔲 "Import from Camera Roll" button — native `<input type="file" accept="image/*">` opens iOS/Android photo library (no native app required)
- 🔲 "Take Photo" button — `capture="environment"` opens camera directly
- 🔲 AI clothing detection via Vision API (GPT-4o) — send image, receive structured metadata (category, color, approximate brand)
- 🔲 Pre-fill item form from detected metadata; user reviews before saving

> **No Swift or Xcode required.** The browser's native file input triggers the same photo picker as native apps on iOS and Android. Works as a PWA installed to the home screen.

---

### v4.0 — Onboarding & Personalization

- 🔲 First-launch onboarding (choose closet background, accent color)
- 🔲 CSS custom property injection at runtime
- 🔲 Onboarding completion flag in localStorage

---

### v4.1 — Onboarding Tour

- ✅ Step-by-step feature walkthrough with anchored tooltips
- ✅ Tour state machine with `tourCompleted` flag in localStorage

---

### v5 — Closet Insighs Analytics Dashboard

> Deprioritized behind mobile (see Near-Term Priority Order). **Pull the `wornCount` field + "Log a Wear" button out of this milestone and ship it early** — v7.0 and v8.0 both depend on it.

- 🔲 Summary stats cards (total items, total spend, avg cost-per-wear)
- 🔲 Category breakdown chart (`recharts`)
- 🔲 Brand frequency chart
- 🔲 Price range distribution histogram
- 🔲 Occasion coverage gap indicator
- 🔲 Wear count tracking (`wornCount` field + "Log a Wear" button)
- 🔲 Sustainability score badge (🌱 at 20+ wears)
- 🔲 `useClosetStats` hoo

### v5.1 — Backend & Database

> ⚠️ **OPEN DECISION before this ships: [Firestore vs. Supabase](./planning/BACKEND_DATABASE_DECISION.md).**
> The cloud layer below (Firestore + Firebase Auth + sync/seed) is implemented in **PR #44 `firebaseAuth`** and is **not yet merged to `main`**. On `main` today the closet is **localStorage-only** (`useLocalCloset`). Treat these 🚧 as "built on the Firestore path, pending the DB decision + merge." If Supabase wins (better fit for v5 SQL analytics + v8 relational social/RLS + image storage + the v2.2 scraper backend), #44 is replaced rather than merged — decide _before_ it ships.

- 🚧 Firestore NoSQL database with per-user closet collection
- 🚧 Offline-first: localStorage as cache, Firestore sync on sign-in
- 🚧 First-sign-in seed: uploads local closet to Firestore on first login
- 🔲 Conflict resolution (last-write-wins with `updatedAt` timestamps)
- 🔲 Multi-device real-time sync (WebSocket or polling)
- 🔲 "Sync" status indicator in nav

---

### v6.0 — Travel: Pack a Bag

- 🔲 Trip setup form (destination type, duration, luggage size)
- 🔲 Suggested packing checklist pulled from closet by occasion tag
- 🔲 see closet and select items
- 🔲 calculate suggestions based on how many days
- 🔲 `usePackingList` hook
- 🔲 Packing lists saved to Firestore

---

### v6.1 — Travel: Carry-On Weight Calculator

- 🔲 Weight progress bar (e.g. "4.2kg / 7kg")
- 🔲 Per-item weight chip (editable inline)
- 🔲 Default weight estimates per category

---

### v7.0 — Outfit Builder ("the Clueless closet")

> Everyone who's seen the prototype wants this. Strategy: **keep the build lightweight, make the
> _suggestions_ smart** by folding in color theory + Kibbe body types + style archetypes — a layer
> competitors don't have. Avatar-overlay visualizer already prototyped in branch `V7-Outfit-Builder`.
> Full spec: [planning/OutfitBuilder.md](./planning/OutfitBuilder.md).

- 🚧 Avatar-overlay visualizer — superimpose closet items onto a user avatar by zone (tops/bottoms/feet) — _prototyped in `V7-Outfit-Builder`_
- 🔲 Split-pane: closet grid + outfit canvas; drag-and-drop via `@dnd-kit/core`
- 🔲 `Outfit` data model + `useOutfits` hook
- 🔲 Weather-based suggestions (Open-Meteo API + `navigator.geolocation`)
- 🔲 **Smart-suggestion layer (the differentiator):** color-harmony pairing, Kibbe-aware silhouette matching, style-archetype filters — lightweight rules on existing attributes, not heavy ML
- 🔲 **Availability-aware:** only suggest items that are clean + home + not on loan (depends on the Status & Location milestone)

---

### v8 — Social & Sharing

- 🔲 "Share closet" read-only invite link
- 🔲 "Request to borrow" button
- 🔲 Privacy controls per item/category
- 🔲 Requires v4.0 backend

---

### v9.0 — Education & Care

- ✅ Interactive fabric care guide
- ✅ Material-to-care-instructions mapping
- ✅ Fiber Journey interactive visualization
- ✅ Stain removal guide by fabric and common weaves
- 🔲 Clothing lifespan tracker ("estimated wears remaining")
- 🔲 Repair and alteration log (date, description, cost)

---

### v10.0 — Sustainability

- 🔲 Sustainability score on item cards (🌱 at 20+ wears)
- 🔲 "Cost per wear" on card hover / detail view
- 🔲 "Worth It" leaderboard — top 5 most cost-effective items
- 🔲 "Guilt Items" filter — 0 wears + age > 6 months, with donate/sell CTA

---

### v11 — Monetization (Stripe)

> Distributed as a PWA — no App Store, no 30% Apple cut. Stripe takes ~2.9% + 30¢ per transaction. You keep ~97%.

**Free tier**

- Up to 30 closet items
- Manual item entry
- Local storage only

**Premium tier (Stripe subscription)**

- Unlimited items
- Enriched Product Details surfaced from deep internet research
- Gmail import
- Firestore cloud sync + multi-device access
- AI camera roll import (v2.1)
- Future: outfit builder, packing lists, analytics

**Implementation**

- 🔲 Stripe Checkout — hosted payment page, no custom payment UI needed
- 🔲 Stripe Customer Portal — handles upgrades, cancellations, billing history automatically
- 🔲 Stripe webhook → Firestore `users/{uid}` document `{ isPremium: true }`
- 🔲 Feature gates in app read `isPremium` from Firestore before unlocking Gmail import / sync
- 🔲 Free item limit enforced in `useCloudCloset` / `useLocalCloset`

---

## 🐛 Known Bugs

- **DatePicker (`MonthYearPicker`) needs a thorough pass.** Root issue: the picker's `useEffect` fired on mount, emitting its _default_ (current month/year) before the user chose anything — so manually added items received an unintended purchase date and showed a fabricated age (e.g. "Purchased: 5 months ago"). A mount guard now prevents the picker from emitting until the user actually changes a dropdown, which stops the fabricated-age behavior. Still pending: full verification that selecting a month + year reliably commits to `purchaseDate` across edit/create flows. The EditItemView import flow sidesteps this entirely with a native `<input type="date">` (reliable) for the no-email-date manual-entry fallback.

- \*\*Email Horizontal Scroll - some email previews don't format nicely, creating difficult to view horizontal scroll. Tried fixing with .gmail-container:has(.display-email-preview-panel){max-width: 1175px;} but didnt' work accross the board

- \*\*ZaraAndAritziaNormalizedNameCAPSLOCK - title to string removing caps lock has improved but for Zara and Aritizia titles still no, and shein has be defaulting to CAPS but just store name, not rest of name in item title

- \*\*ImportingNonClothesORAccessories - if it can't be mapped to a category, don't import it, this will be huge with amazon emails

- \*\*Safari Gmail Auth - get's stuck

- \*\*CardDetailsFeaturesPill - if item as mutliple accents, they are rendered/ displayed in one pill. ie 'buttonszipper' shoud be two pills

- \*\*RemoveButtonWhileOverview - if user is on overview and views an item, clicks remove, the card just flips back, closet does not get updated

- \*\*NoFeaturesGetsEmptyPill - if an item doesn't have any style features, that section of card detais still renders with a ghoast pill

- \*\*ErrorBoundaries, error messages, user feedback, try again messages don't have adequate contrast
