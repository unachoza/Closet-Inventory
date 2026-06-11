# Closet Inventory

A personal wardrobe management app that lets users upload, categorize, search, and organize clothing items — with Gmail import, Firestore sync, and a fabric care guide.

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

| Category          | Technology                                 | Purpose                         |
| ----------------- | ------------------------------------------ | ------------------------------- |
| **Framework**     | React 19 (TypeScript)                      | Component-based UI              |
| **Build Tool**    | Vite 6                                     | Fast dev server and bundling    |
| **Styling**       | CSS Modules + Custom Properties            | Scoped styles with theme system |
| **Animations**    | Framer Motion                              | Declarative animations          |
| **UI Primitives** | Radix UI                                   | Accessible, unstyled components |
| **State**         | React Hooks + Context                      | Local and global state          |
| **Database**      | Firebase Firestore                         | Cloud persistence per user      |
| **Auth**          | Firebase Auth + Google OAuth               | User sign-in and Gmail access   |
| **Search**        | Fuse.js                                    | Fuzzy client-side search        |
| **Testing**       | Vitest + React Testing Library             | Unit and integration tests      |
| **E2E**           | Playwright _(planned — not yet installed)_ | End-to-end critical flows       |
| **Type Safety**   | TypeScript 5+                              | Static type checking            |

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

> **Version numbers are scope groupings, not build order.** The actual near-term sequence is mobile-first (below). Some items already exist as code but live in open PRs, not yet on `main` — those note the PR number.

---

### 🎯 Near-Term Priority Order (mobile-first)

The closet is responsive today, but the mobile experience the product and
business model depend on is unbuilt. Actual build order:


1. **Mobile UI polish** (from v2.0) — touch-target audit (44×44px) and a bottom nav / "Add Item" FAB so the primary action isn't buried in the hamburger drawer.
2. ✅ **PWA scaffolding** (pulled forward from v2.0) — `manifest.webmanifest`, service worker, iOS meta tags, app icons. **Load-bearing** for v9.0 monetization ("no App Store / no 30% cut"), v4.0 offline-first, and add-to-home-screen. _Done — `vite-plugin-pwa` configured; verified against a production build._
3. **Camera capture / camera-roll import** (v2.1, pulled ahead of v1.2 analytics) — fastest item-logging path for the mobile persona; email import only covers online purchases.

**Cross-version dependencies:**

- `wornCount` (in v1.2) is required by **v7.0** lifespan tracker and **v8.0** sustainability. Add the field + "Log a Wear" button early, decoupled from the full analytics dashboard.
- **v4.0 backend** (Firestore) gates **v6.1** social and **v9.0** monetization (`isPremium` read). It's effectively done in [#44](https://github.com/unachoza/Closet-Inventory/pull/44), so v9.0 is closer than its number implies.
- **v9.0 monetization** also depends on the **PWA** install path (priority 3).

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
- 🔲 Visual cohesion polish (spacing, color, typography consistency)
- ✅  "View more" expand/collapse on item cards - PR #43

---

### v1.1 — Search, Filter & Sort

- ✅ Fuzzy search bar (Fuse.js, threshold 0.4, 300ms debounce)
- ✅ Filter side panel with collapsible accordion sections
- ✅ OR logic within a filter dimension, AND across dimensions
- ✅ Active filter pills with individual remove and "Clear all"
- ✅ Dynamic option counts update as filters apply
- ✅ Sort by: date added, price (asc/desc), age (newest/oldest), name (A–Z / Z–A)
- 🔲 "Dry clean only" quick-filter pill
- ✅ Item name visible on card hover (or global toggle)

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
- 🔲 Remaining retailer coverage — full Amazon support; Temu (data embedded in images, OCR required)
- 🔲 Don't import items that can't be mapped to a category (big for Amazon emails)
- 🔲 Retailer-specific parsers (Amazon, additional Shein variants, Temu — note: Temu embeds data in images, OCR required)
- 🚧 Firebase Auth integration _(in PR [#44](https://github.com/unachoza/Closet-Inventory/pull/44) — not yet on `main`)_

---

### v2.2 — Engaging the Web for missing details

- 🔲 "Find image" flow for items imported without photos
- 🔲 search for item material breakdown and item descriptions from retailer websites
- 🔲 Engaging Internet Archive for older details

---

### v2.3 - Expanding Email Provider Scope

- 🔲 Additional email providers — Hotmail / Outlook (Microsoft Graph), Yahoo Mail (IMAP/OAuth, requires a backend)

---

### v3.0 — Mobile & PWA

> **Active priority** (see Near-Term Priority Order). Responsive layout and PWA scaffolding are done; touch-target audit and bottom nav / "Add Item" FAB are the next mobile work.

- ✅ Responsive layout for iPhone and Android screen sizes (29 `@media` blocks; hamburger drawer nav < 768px)
- ✅ PWA setup (`vite-plugin-pwa`) — `manifest.webmanifest` + service worker for "Add to Home Screen" support **(unblocks v9.0 monetization + v4.0 offline)**
- ✅ Full-screen launch on iOS (`apple-mobile-web-app-capable` + `display: standalone`, no Safari browser chrome)
- ✅ Offline support via service worker cache (Workbox app-shell precache, `autoUpdate`)
- 🔲 Touch-friendly tap targets (min 44×44px) and swipe gestures
- 🔲 Bottom navigation bar on mobile
- 🔲 Camera input (`capture="environment"`) for direct photo capture on mobile

---

### v3.1 — Camera Roll Import

> Pulled **ahead of v1.2 analytics** — for the mobile persona, photographing an item is the fastest way to log one, and it's the only import path for in-store / second-hand purchases (email import covers online only).

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

- 🔲 Step-by-step feature walkthrough with anchored tooltips
- 🔲 Tour state machine with `tourCompleted` flag in localStorage

---

### v5 — Closet Analytics Dashboard

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

> ⚠️ The cloud layer below (Firestore + Firebase Auth + sync/seed) is implemented in **PR #44 `firebaseAuth`** and is **not yet merged to `main`**. On `main` today the closet is **localStorage-only** (`useLocalCloset`). Treat these ✅ as "built, pending merge."

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
- 🔲 `usePackingList` hook
- 🔲 Packing lists saved to Firestore

---

### v6.1 — Travel: Carry-On Weight Calculator

- 🔲 Weight progress bar (e.g. "4.2kg / 7kg")
- 🔲 Per-item weight chip (editable inline)
- 🔲 Default weight estimates per category

---

### v7.0 — Outfit Builder

- 🔲 Split-pane: closet grid (left) + outfit canvas (right)
- 🔲 Drag-and-drop via `@dnd-kit/core`
- 🔲 `Outfit` data model + `useOutfits` hook
- 🔲 Weather-based suggestions (Open-Meteo API + `navigator.geolocation`)

---

### v8.1 — Social & Sharing

- 🔲 "Share closet" read-only invite link
- 🔲 "Request to borrow" button
- 🔲 Privacy controls per item/category
- 🔲 Requires v4.0 backend

---

### v9.0 — Education & Care

- ✅ Interactive fabric care guide
- ✅ Material-to-care-instructions mapping
- ✅ Fiber Journey interactive visualization
- 🔲 Clothing lifespan tracker ("estimated wears remaining")
- 🔲 Repair and alteration log (date, description, cost)

---

### v10.0 — Sustainability

- 🔲 Sustainability score on item cards (🌱 at 20+ wears)
- 🔲 "Cost per wear" on card hover / detail view
- 🔲 "Worth It" leaderboard — top 5 most cost-effective items
- 🔲 "Guilt Items" filter — 0 wears + age > 6 months, with donate/sell CTA

---

### v1.0 — Monetization (Stripe)

> Distributed as a PWA — no App Store, no 30% Apple cut. Stripe takes ~2.9% + 30¢ per transaction. You keep ~97%.

**Free tier**

- Up to 30 closet items
- Manual item entry
- Local storage only

**Premium tier (Stripe subscription)**

- Unlimited items
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
