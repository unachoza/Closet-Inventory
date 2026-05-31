# Closet-Inventory

Closet Inventory is a personal wardrobe management application that allows users to upload, categorize, and organize clothing items.

📖 Overview
Closet Inventory empowers users to create a comprehensive digital wardrobe with an intuitive, step-by-step process. Track your clothing items with detailed metadata, images, and smart date tracking—all stored locally in your browser.
✨ Key Highlights

- 🪜 9-Step Guided Flow – Streamlined item creation with visual progress tracking
- 📸 Image Management – Upload, preview, and persist clothing photos
- 🧠 Smart Date Handling – Intelligent age calculation (months vs. years)
- 💾 Local Persistence – All data stored securely in browser storage
- 🎨 Responsive Design – Beautiful grid layout that works on any device
- 🔔 Toast Notifications – Smooth, animated feedback for user actions

## 🚀 Quick Start Installation & Setup

### Clone the repository

git clone https://github.com/your-username/closet-inventory.git

### Navigate to project directory

cd closet-inventory

### Install dependencies

npm install

### Start development server

npm run dev

## 📌 Features

### 🪜 Multi-Step Item Creation Form

- Custom progress tracker with step labels
- Steps include: **category, color, size, brand, material, occasion, age/date, image upload**
- Reusable components: dropdowns, checkboxes, pill inputs
- Multi-step flow resets automatically after submission

### 📸 Image Upload + Preview

- File uploads via `<input type="file" />`
- Base64 conversion for persistence
- Live preview
- Optionally auto-generates stock photos by category

### 📅 Custom Date Picker + Intelligent Age Calculation

- Radix-based Month/Year selector
- Automatic age conversion:
     - `< 20 months → "X months"`
     - `≥ 20 months → "Y years"`

### 🔔 Animated Toast Notifications

- Radix UI + Framer Motion
- Context-driven system (`ToastProvider`)
- Alerts user when an item is successfully created

### 🗂️ Local Storage Persistence

All saved items include:

- UUID
- Normalized item payload
- Image thumbnail
- Auto-generated display name (brand + category)

### 👚 Closet Overview Grid

- Responsive layout displaying all stored items
- Clean, minimal UI
- Ready for sort/filter expansion

---

## Project Structure

src/
├── components/
│ ├── ProgressionTracker/ # Multi-step form progress UI
│ ├── DatePicker/ # Custom month/year selector
│ ├── ImageUploader/ # File upload + preview component
│ ├── Closet/ # Grid view and item cards
│ ├── Toast/ # Notification system
│ └── ui/ # Shared UI primitives (Button, Input, etc.)
├── hooks/
│ ├── useLocalCloset.ts # Closet data management hook
│ ├── useLocalStorage.ts # Generic localStorage hook
│ └── useStockPhoto.ts # Stock image generation
├── utils/
│ ├── types.ts # TypeScript interfaces & types
│ ├── constants.ts # App-wide constants (categories, colors)
│ └── formatters.ts # Date, age, and display formatters
├── styles/
│ ├── theme.css # CSS custom properties (colors, spacing)
│ └── \*.module.css # Component-scoped CSS modules
├── App.tsx # Root component
└── main.tsx # Application entry point

## Installation & Setup

git clone https://github.com/your-username/closet-inventory.git
cd closet-inventory
npm install
npm run dev

## Architecture Notes

- Uses composable, reusable UI components.
- Logic extracted into hooks for maintainability.
- Date and age logic fully abstracted from UI.
- LocalStorage interactions centralized in useLocalStorageCloset.
- Toast system decoupled and reusable across the app.
- Multi-step form automatically resets on submit.

## Tech Stach Libraries Used

npm run dev # Start development server
npm run build # Build for production
npm run preview # Preview production build
npm run test # Run test suite
npm run lint # Lint codebase

```

---

## 🎯 Features

### Multi-Step Item Creation

A comprehensive **9-step wizard** guides users through adding clothing items:

1. **Category** – Select item type (shirt, pants, dress, etc.)
2. **Color** – Choose primary and secondary colors
3. **Size** – Specify garment size
4. **Brand** – Enter manufacturer/brand name
5. **Material** – Define fabric composition
6. **Occasion** – Tag usage context (casual, formal, athletic)
7. **Age/Date** – Track purchase or acquisition date
8. **Image Upload** – Add photos with live preview
9. **Review** – Confirm details before saving

**Technical Implementation:**
- Custom progress tracker with step indicators
- Reusable form components (dropdowns, checkboxes, pill selectors)
- Automatic form reset after successful submission
- Validation at each step

### Image Upload & Preview

**Features:**
- Native file input with drag-and-drop support
- Base64 encoding for browser storage compatibility
- Real-time image preview
- Optional stock photo generation by category
- Optimized thumbnail generation

### Intelligent Date & Age Tracking

**Smart age conversion logic:**
- Items **< 20 months old** display as "X months"
- Items **≥ 20 months old** display as "Y years"

**Components:**
- Custom Radix UI-based month/year picker
- Fully accessible date selection interface
- Automatic calculation from purchase date to current age

### Toast Notification System

**Implementation:**
- Built with Radix UI primitives + Framer Motion
- Context-based provider for global access
- Configurable duration and positioning
- Smooth enter/exit animations
- Non-blocking, auto-dismissing alerts

### Local Storage Persistence

Each saved item includes:
- **UUID** – Unique identifier
- **Normalized payload** – Structured item data
- **Image thumbnail** – Base64-encoded preview
- **Display name** – Auto-generated from brand + category
- **Timestamps** – Created and last modified dates

### Closet Overview Grid

- **Responsive masonry/grid layout** adapting to screen size
- **Item cards** with image, name, and quick metadata
- **Hover effects** for enhanced interactivity
- **Empty state** guidance for new users
- Optimized for future filtering/sorting features

---

## 🏗️ Project Structure
```

src/
├── components/
│ ├── ProgressionTracker/ # Multi-step form progress UI
│ ├── DatePicker/ # Custom month/year selector
│ ├── ImageUploader/ # File upload + preview component
│ ├── Closet/ # Grid view and item cards
│ ├── Toast/ # Notification system
│ └── ui/ # Shared UI primitives (Button, Input, etc.)
├── hooks/
│ ├── useLocalCloset.ts # Closet data management hook
│ ├── useLocalStorage.ts # Generic localStorage hook
│ └── useStockPhoto.ts # Stock image generation
├── utils/
│ ├── types.ts # TypeScript interfaces & types
│ ├── constants.ts # App-wide constants (categories, colors)
│ └── formatters.ts # Date, age, and display formatters
├── styles/
│ ├── theme.css # CSS custom properties (colors, spacing)
│ └── \*.module.css # Component-scoped CSS modules
├── App.tsx # Root component
└── main.tsx # Application entry point

```

---

## 🛠️ Tech Stack

| **Category**        | **Technology**                      | **Purpose**                          |
|---------------------|-------------------------------------|--------------------------------------|
| **Framework**       | React 18+ (TypeScript)              | Component-based UI library           |
| **Build Tool**      | Vite 5+                             | Fast development and bundling        |
| **Styling**         | CSS Modules + Custom Properties     | Scoped styles with theme system      |
| **Animations**      | Framer Motion                       | Declarative animations               |
| **UI Primitives**   | Radix UI                            | Accessible, unstyled components      |
| **State Management**| React Hooks + Context               | Local and global state               |
| **Data Storage**    | Browser localStorage                | Client-side persistence              |
| **Testing**         | Vitest + React Testing Library      | Unit and integration testing         |
| **Type Safety**     | TypeScript 5+                       | Static type checking                 |

---

## 🏛️ Architecture & Design Patterns

### Design Principles

- **Component Composition** – Small, reusable components over monolithic structures
- **Separation of Concerns** – Business logic extracted into custom hooks
- **Accessibility First** – WCAG 2.1 compliant with Radix UI primitives
- **Progressive Enhancement** – Core functionality works without JavaScript (where possible)
- **Performance Optimized** – Code splitting, lazy loading, and memoization strategies

### Key Patterns

**Custom Hooks:**
- `useLocalCloset` – Centralized closet data operations (CRUD)
- `useLocalStorage` – Generic localStorage abstraction with type safety
- `useStockPhoto` – Fallback image generation logic

**Context Providers:**
- `ToastProvider` – Global toast notification system
- Theme context ready for future implementation

**Data Flow:**
```

User Input → Form State → Validation → Hook (useLocalCloset) → localStorage → UI Update

## ⚙️ Installation & Setup

git clone https://github.com/your-username/closet-inventory.git
cd closet-inventory
npm install
npm run dev

---

## 👤 User Persona

### Maya — "The Overwhelmed Fashionista"

> *"I keep buying things I already own, and I still feel like I have nothing to wear."*

| | |
|---|---|
| **Age** | 26 |
| **Occupation** | Marketing Coordinator |
| **Location** | Urban — NYC, LA, Chicago |
| **Devices** | iPhone, MacBook |
| **Tech Comfort** | High — uses 10+ apps daily |

**Lifestyle**
Maya shops frequently (online and in-store), follows trends on TikTok and Pinterest, and rotates between professional, casual, and going-out wardrobes. She genuinely cares about sustainability but struggles to resist fast fashion.

**Pain Points**
- Opens her closet in the morning and feels overwhelmed — takes 20+ minutes to decide
- Has bought the same type of white sneaker three times because she forgot she owned one
- Can't remember if she paid $40 or $200 for something, making it hard to know when to replace it
- Travels often and always over-packs because there's no system
- Has "guilt items" — pieces she bought and never wore — but can't track which ones

**Goals**
- Know exactly what she owns without digging through physical piles
- Get dressed faster with less decision fatigue
- Shop smarter — buy things that actually fill gaps, not duplicates
- Feel good about her wardrobe choices, not guilty about waste

**What She Values in an App**
- Beautiful, visual UI — feels like *her* closet, not a spreadsheet
- Fast to use — logging a new item should take under a minute
- Smart suggestions, not manual work — surface the right items for the context
- Privacy — her wardrobe is personal; no social pressure by default

---

## 🗺️ Roadmap

> ✅ = Shipped &nbsp;|&nbsp; 🔲 = Planned

---

### v1.0 — Foundation Polish *(current)*

**UI**
- ✅ Edit item with full detail view
- Visual cohesion across all views (consistent spacing, color, typography)
- Improved navigation and user journey between screens
- "View more" expand/collapse to reveal hidden item details

**Business Logic / Functionality**
- Material percentage breakdown (e.g. 80% cotton, 20% polyester)
- Consistent field normalization across all saved items

---

### v1.1 — Search, Filter & Sort

**UI**
- ✅ Fuzzy search bar with debounce and match highlighting
- ✅ Filter side panel (slide-in from left) with collapsible accordion sections per dimension
- ✅ Active filter pills row with individual remove and "Clear all"
- Sort dropdown (date added, price, age, name A–Z)
- Dark mode toggle (CSS custom property swap, button in nav)
- "Dry clean only" quick-filter pill
- Item name visible on card hover (or global toggle to show all names)

**Business Logic / Functionality**
- ✅ OR logic within a filter dimension, AND across dimensions
- ✅ Dynamic option counts update as filters are applied
- ✅ Sort: price (strip non-numeric), age (ordinal map), name (alphabetical)
- ✅ Fuse.js fuzzy match (threshold 0.4, ignoreLocation, 300ms debounce)

---

### v1.2 — Closet Analytics Dashboard

**UI**
- Dashboard screen with summary stats cards (total items, total spend, avg cost-per-wear)
- Category breakdown — pie or bar chart via `recharts`
- Brand frequency chart
- Price range distribution histogram
- Occasion coverage gap indicator (e.g. "You have no formal wear")
- Sustainability score badge 🌱 on items worn 20+ times

**Business Logic / Functionality**
- `useClosetStats` hook — pure computation over `ClothingItem[]`, no backend needed
- `costPerWear` = `parsedPrice / wornCount` (guard divide-by-zero)
- `totalSpend`, `avgCostPerWear`, `mostWornCategory` derived from localStorage
- Wear count tracking: `wornCount: number` field on each item, incremented via "Log a Wear" button
- Sustainability score: `wornCount > 20` → 🌱 badge; score = `wornCount / (parsedPrice / 10)`

---

### v1.3 — Auto Import (Email)

**UI**
- ✅ Gmail OAuth import screen (parse shopping confirmation emails)
- Connect Hotmail / Outlook account for email import
- Retailer logo shown during parsing (Amazon, Shein, Temu, ASOS)
- Items parsed without images displayed with placeholder + prompt to add photo later
- "Find image" flow: search camera roll, or search web → presented with 3 image options to pick

**Business Logic / Functionality**
- ✅ Gmail API OAuth + email thread parsing
- Hotmail OAuth integration (Microsoft identity platform)
- Retailer-specific email parsers for: Amazon, Shein, Temu (note: Temu embeds product data in images — OCR required or skip image, add in edit mode)
- Structured item extraction: name, price, brand, category from email HTML
- Deduplication check — skip import if item UUID already exists in localStorage

---

### v2.0 — Mobile

**UI**
- Responsive layout adapted for iPhone and Android screen sizes
- Touch-friendly tap targets (min 44×44px), swipe gestures on cards
- Bottom navigation bar on mobile (replaces sidebar nav)

**Business Logic / Functionality**
- Viewport breakpoint strategy — `min-width` media queries, no separate mobile codebase
- Image upload via `<input type="file" capture="environment">` to open camera directly on mobile

---

### v2.1 — Camera Roll Import

**UI**
- "Import from Camera Roll" button on the add-item flow
- Gallery picker — photo grid for selecting multiple images
- AI clothing detection overlay — highlights identified clothing items in the photo

**Business Logic / Functionality**
- Image parsing via Vision API (e.g. OpenAI GPT-4o) — send image, receive structured metadata (category, color, approximate brand)
- Filter camera roll for clothing/outfit-centric photos (ML confidence threshold)
- Pre-fill item form fields from detected metadata; user reviews before saving

---

### v3.0 — Onboarding & Personalization

**UI**
- First-launch onboarding flow for empty closet
  - Choose closet background image (curated set or upload own)
  - Choose accent color — applied to buttons, labels, pills, card borders
- Visual preview updates in real time as user picks options

**Business Logic / Functionality**
- Persist theme preferences (`accentColor`, `closetBackground`) in localStorage
- CSS custom property injection at runtime (`document.documentElement.style.setProperty(...)`)
- Onboarding completion flag — skip flow on subsequent launches

---

### v3.1 — Onboarding Tour

**UI**
- Step-by-step feature walkthrough via popup modals (tooltips anchored to UI elements)
- "Confirm" / "Skip" on each step; "Skip tour" exits early
- Progress indicator (Step 1 of 5)

**Business Logic / Functionality**
- Tour state machine: array of steps with target element selector, title, description
- `tourCompleted` flag in localStorage prevents re-showing
- Scroll-into-view for anchored tooltips; highlight overlay on target element

---

### v4.0 — Backend & Database

**UI**
- Account creation / login screen (email + password, or Google OAuth)
- "Sync" status indicator in nav (synced, syncing, offline)
- Option to keep closet local-only (no account required)

**Business Logic / Functionality**
- REST API or tRPC backend — CRUD endpoints for closet items
- Database: PostgreSQL (items, users, outfits, packing lists)
- Offline-first: localStorage as cache layer, sync on reconnect
- Conflict resolution: last-write-wins with `updatedAt` timestamps
- Multi-device sync via WebSocket or polling

---

### v5.0 — Travel: Pack a Bag

**UI**
- Trip setup form: destination type (beach, business, hiking, city), duration (days), luggage size (carry-on / checked)
- Suggested packing checklist — items pulled from user's closet, grouped by category
- User checks/unchecks items; can swap suggestions
- "Carry-on weight" indicator for v5.1

**Business Logic / Functionality**
- `usePackingList` hook — filter closet by occasion tag, group by category, limit quantity by trip length
- Luggage capacity rules: carry-on = 7kg / 22L, checked = 23kg; each item has estimated weight (default by category)
- Packing lists saved to localStorage: `{ id, tripName, itemIds[], packed[] }`
- No new clothing data model needed — reads existing `occasion` and `category` fields

---

### v5.1 — Travel: Carry-On Weight Calculator

**UI**
- Weight progress bar on the packing list screen (e.g. "4.2kg / 7kg")
- Per-item weight shown as a small chip; editable inline
- Warning indicator when approaching the limit

**Business Logic / Functionality**
- Default weight estimates per category (shirt ~200g, jeans ~600g, shoes ~800g)
- User can override per-item weight; stored on the `ClothingItem`
- Running total computed from selected packing list items

---

### v6.0 — Outfit Builder

**UI**
- Split-pane interface: left = closet grid (filterable), right = outfit canvas
- Drag items onto the canvas into category slots: Top, Bottom, Shoes, Accessory, Outerwear
- Canvas renders items as layered cards; supports reorder and swap
- Save outfit with a name and occasion tag; view saved outfits in an Outfits gallery

**Business Logic / Functionality**
- Drag-and-drop via `@dnd-kit/core`
- `Outfit` data model: `{ id, name, occasion, itemIds: string[], createdAt }`
- `useOutfits` hook — CRUD in localStorage
- Weather-based suggestions: fetch Open-Meteo API (no API key) via `navigator.geolocation`, map weather codes → occasion tags, auto-filter closet to matching items

---

### v6.1 — Social & Sharing

**UI**
- "Share closet" invite link — opens a read-only view of a friend's closet
- "Request to borrow" button on items in a shared closet
- Borrow request notification (in-app + SMS)

**Business Logic / Functionality**
- Requires v4.0 (backend) — shared closets are server-side, not localStorage
- Invite link generates a signed token with read-only scope
- Borrow request: push notification via SMS (Twilio) or email
- Privacy controls: user chooses which items/categories are visible in shared view

---

### v7.0 — Education & Care

**UI**
- ✅ Fabric care guide with washing instructions per material
- Clothing lifespan tracker — "estimated wears remaining" based on item age and wear count
- Repair and alteration log — accordion in edit view (date, description, cost)

**Business Logic / Functionality**
- ✅ Material-to-care-instructions mapping
- Lifespan model: average lifespan per category (jeans ~300 wears, cotton tee ~100 wears) minus `wornCount`
- `repairs: { date: string, note: string, cost?: string }[]` field on `ClothingItem`

---

### v8.0 — Sustainability

**UI**
- Sustainability score displayed on each item card (🌱 badge at 20+ wears)
- "Cost per wear" visible on card hover or in detail view
- "Worth It" leaderboard — top 5 most cost-effective items in the closet
- "Guilt Items" filter — items with 0 wears and age > 6 months, prompted with "donate or sell?" CTA

**Business Logic / Functionality**
- `costPerWear` = `parsedPrice / wornCount`
- `sustainabilityScore` = weighted formula: `wornCount × 0.6 + (lifespan / age) × 0.4`
- "Guilt items" query: `wornCount === 0 && monthsOld > 6`
- All computed client-side from existing `ClothingItem` fields + `wornCount`
