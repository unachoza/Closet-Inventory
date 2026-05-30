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

npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run test suite
npm run lint         # Lint codebase
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
│   ├── ProgressionTracker/    # Multi-step form progress UI
│   ├── DatePicker/             # Custom month/year selector
│   ├── ImageUploader/          # File upload + preview component
│   ├── Closet/                 # Grid view and item cards
│   ├── Toast/                  # Notification system
│   └── ui/                     # Shared UI primitives (Button, Input, etc.)
├── hooks/
│   ├── useLocalCloset.ts       # Closet data management hook
│   ├── useLocalStorage.ts      # Generic localStorage hook
│   └── useStockPhoto.ts        # Stock image generation
├── utils/
│   ├── types.ts                # TypeScript interfaces & types
│   ├── constants.ts            # App-wide constants (categories, colors)
│   └── formatters.ts           # Date, age, and display formatters
├── styles/
│   ├── theme.css               # CSS custom properties (colors, spacing)
│   └── *.module.css            # Component-scoped CSS modules
├── App.tsx                     # Root component
└── main.tsx                    # Application entry point
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

## 🗺️ Roadmap
- v1 - Currently Working on 

Edit Item and adding details view
Visual Cohesion
Navigation / User Journey
Material Percentages

- v1.1 – Enhanced Filtering & Sorting

 Filter by category, color, brand, material, occasion
 Sort by age, price, date added
 Search functionality with fuzzy matching

- v1.2 – Advanced Features

 Email parsing for auto-import from shopping confirmations
 "Pack a Bag" travel mode for trip planning
 Outfit builder (inspired by Clueless)
 Weather-based outfit suggestions
 Closet Analytics

- v1.3 – User Experience

 User authentication (optional cloud sync)
 Multi-device sync
 Export wardrobe as CSV/JSON
 Dark mode support

- v1.4 – Education & Care

 Fabric care guide and washing instructions
 Sustainability metrics (wear frequency, cost per wear)
 Clothing lifespan tracking
 Repair and alteration logs