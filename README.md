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

| Command           | Description               |
|-------------------|---------------------------|
| `npm run dev`     | Start development server  |
| `npm run build`   | Build for production      |
| `npm run preview` | Preview production build  |
| `npm run test`    | Run test suite            |
| `npm run lint`    | Lint codebase             |

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

| Category          | Technology                     | Purpose                              |
|-------------------|--------------------------------|--------------------------------------|
| **Framework**     | React 18+ (TypeScript)         | Component-based UI                   |
| **Build Tool**    | Vite 5+                        | Fast dev server and bundling         |
| **Styling**       | CSS Modules + Custom Properties| Scoped styles with theme system      |
| **Animations**    | Framer Motion                  | Declarative animations               |
| **UI Primitives** | Radix UI                       | Accessible, unstyled components      |
| **State**         | React Hooks + Context          | Local and global state               |
| **Database**      | Firebase Firestore             | Cloud persistence per user           |
| **Auth**          | Firebase Auth + Google OAuth   | User sign-in and Gmail access        |
| **Search**        | Fuse.js                        | Fuzzy client-side search             |
| **Testing**       | Vitest + React Testing Library | Unit and integration tests           |
| **E2E**           | Playwright                     | End-to-end critical flows            |
| **Type Safety**   | TypeScript 5+                  | Static type checking                 |

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

| | |
|--|--|
| **Age** | 26 |
| **Occupation** | Marketing Coordinator |
| **Location** | Urban — NYC, LA, Chicago |
| **Devices** | iPhone, MacBook |
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

> ✅ = Shipped &nbsp;|&nbsp; 🔲 = Planned

---

### v1.0 — Foundation Polish _(current)_

- ✅ 9-step guided item creation form
- ✅ Edit item with full detail view
- ✅ Material percentage breakdown (e.g. 80% cotton, 20% polyester)
- ✅ Image upload with base64 persistence and live preview
- ✅ Smart date/age display (< 20 months → "X months", ≥ 20 → "Y years")
- ✅ Toast notification system
- ✅ localStorage persistence
- 🔲 Visual cohesion polish (spacing, color, typography consistency)
- 🔲 "View more" expand/collapse on item cards

---

### v1.1 — Search, Filter & Sort

- ✅ Fuzzy search bar (Fuse.js, threshold 0.4, 300ms debounce)
- ✅ Filter side panel with collapsible accordion sections
- ✅ OR logic within a filter dimension, AND across dimensions
- ✅ Active filter pills with individual remove and "Clear all"
- ✅ Dynamic option counts update as filters apply
- ✅ Sort by: date added, price (asc/desc), age (newest/oldest), name (A–Z / Z–A)
- 🔲 Dark mode toggle
- 🔲 "Dry clean only" quick-filter pill
- 🔲 Item name visible on card hover (or global toggle)

---

### v1.2 — Closet Analytics Dashboard

- 🔲 Summary stats cards (total items, total spend, avg cost-per-wear)
- 🔲 Category breakdown chart (`recharts`)
- 🔲 Brand frequency chart
- 🔲 Price range distribution histogram
- 🔲 Occasion coverage gap indicator
- 🔲 Wear count tracking (`wornCount` field + "Log a Wear" button)
- 🔲 Sustainability score badge (🌱 at 20+ wears)
- 🔲 `useClosetStats` hook

---

### v1.3 — Auto Import (Email)

- ✅ Gmail OAuth import screen
- ✅ Firebase Auth integration
- ✅ Gmail API email thread parsing
- ✅ Structured item extraction (name, price, brand, category) from email HTML
- ✅ Batch import queue ("Import All Items" from a single email)
- ✅ Deduplication check — skip if item UUID already exists
- 🔲 Purchase date gleaned from confirmation email for age calculation
- 🔲 Hotmail / Outlook OAuth integration
- 🔲 Retailer-specific parsers (Amazon, Shein, Temu — note: Temu embeds data in images, OCR required)
- 🔲 "Find image" flow for items imported without photos

---

### v2.0 — Mobile & PWA

- ✅ Responsive layout for iPhone and Android screen sizes
- 🔲 PWA setup (`vite-plugin-pwa`) — `manifest.json` + service worker for "Add to Home Screen" support
- 🔲 Full-screen launch on iOS (no Safari browser chrome)
- 🔲 Offline support via service worker cache
- 🔲 Touch-friendly tap targets (min 44×44px) and swipe gestures
- 🔲 Bottom navigation bar on mobile
- 🔲 Camera input (`capture="environment"`) for direct photo capture on mobile

---

### v4.0 — Backend & Database

- ✅ Firestore NoSQL database with per-user closet collection
- ✅ Offline-first: localStorage as cache, Firestore sync on sign-in
- ✅ First-sign-in seed: uploads local closet to Firestore on first login
- 🔲 Conflict resolution (last-write-wins with `updatedAt` timestamps)
- 🔲 Multi-device real-time sync (WebSocket or polling)
- 🔲 "Sync" status indicator in nav

---

### v5.0 — Travel: Pack a Bag

- 🔲 Trip setup form (destination type, duration, luggage size)
- 🔲 Suggested packing checklist pulled from closet by occasion tag
- 🔲 `usePackingList` hook
- 🔲 Packing lists saved to Firestore

---

### v5.1 — Travel: Carry-On Weight Calculator

- 🔲 Weight progress bar (e.g. "4.2kg / 7kg")
- 🔲 Per-item weight chip (editable inline)
- 🔲 Default weight estimates per category

---

### v6.0 — Outfit Builder

- 🔲 Split-pane: closet grid (left) + outfit canvas (right)
- 🔲 Drag-and-drop via `@dnd-kit/core`
- 🔲 `Outfit` data model + `useOutfits` hook
- 🔲 Weather-based suggestions (Open-Meteo API + `navigator.geolocation`)

---

### v6.1 — Social & Sharing

- 🔲 "Share closet" read-only invite link
- 🔲 "Request to borrow" button
- 🔲 Privacy controls per item/category
- 🔲 Requires v4.0 backend

---

### v7.0 — Education & Care

- ✅ Interactive fabric care guide
- ✅ Material-to-care-instructions mapping
- ✅ Fiber Journey interactive visualization
- 🔲 Clothing lifespan tracker ("estimated wears remaining")
- 🔲 Repair and alteration log (date, description, cost)

---

### v8.0 — Sustainability

- 🔲 Sustainability score on item cards (🌱 at 20+ wears)
- 🔲 "Cost per wear" on card hover / detail view
- 🔲 "Worth It" leaderboard — top 5 most cost-effective items
- 🔲 "Guilt Items" filter — 0 wears + age > 6 months, with donate/sell CTA

---

### v9.0 — Monetization (Stripe)

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

### v3.0 — Onboarding & Personalization

- 🔲 First-launch onboarding (choose closet background, accent color)
- 🔲 CSS custom property injection at runtime
- 🔲 Onboarding completion flag in localStorage

---

### v3.1 — Onboarding Tour

- 🔲 Step-by-step feature walkthrough with anchored tooltips
- 🔲 Tour state machine with `tourCompleted` flag in localStorage

---

### v2.1 — Camera Roll Import

- 🔲 "Import from Camera Roll" button — native `<input type="file" accept="image/*">` opens iOS/Android photo library (no native app required)
- 🔲 "Take Photo" button — `capture="environment"` opens camera directly
- 🔲 AI clothing detection via Vision API (GPT-4o) — send image, receive structured metadata (category, color, approximate brand)
- 🔲 Pre-fill item form from detected metadata; user reviews before saving

> **No Swift or Xcode required.** The browser's native file input triggers the same photo picker as native apps on iOS and Android. Works as a PWA installed to the home screen.
