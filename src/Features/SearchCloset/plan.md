# Enhanced Filtering & Sorting — Implementation Game Plan

**Feature:** `entireCloset` view with filtering, sorting, fuzzy search, and responsive grid 
**Figma Mockup:** [Option A — Sticky Top Bar + Filter Pills](https://www.figma.com/design/PLOPvJkCyxX4yi4ChjxgI6) 
**Approach:** Separate view alongside existing `carousel`/`overview`, no changes to current views

---

## Architecture Overview


```
App.tsx
├── ViewType += "entireCloset"
├── <EntireClosetView />
│   ├── <StickyTopBar />          — collapsed nav: logo + Add Item / Overview / Import Gmail
│   ├── <SearchSortBar />         — fuzzy search input + sort dropdown + results count
│   ├── <FilterPillsRow />        — horizontal scrollable filter pills with active states
│   └── <FilteredItemGrid />      — responsive 3-4 col grid with FilteredCard components
│       └── <FilteredCard />      — image + title + filter-matching pills
├── hooks/
│   ├── useClosetFilters.ts       — filter state, active filters, toggle/clear logic
│   ├── useClosetSort.ts          — sort state + comparator functions
│   └── useFuzzySearch.ts         — fuzzy matching with Fuse.js
└── utils/
   └── filterConstants.ts        — filter option definitions extracted from closet data
```

---


## Phase 0: Prep (0.5 day)

### 0.1 Add `"entireCloset"` to ViewType
- **File:** `src/utils/types.ts`
- **Change:** `ViewType = "carousel" | "form" | "overview" | "edit" | "gmail" | "entireCloset"`
- This is the only change to an existing type — everything else is additive


### 0.2 Add nav button in App.tsx
- **File:** `src/App.tsx` 
- Add a `"View Entire Closet"` button to `button-container` alongside existing buttons
- Add `{view === "entireCloset" && <EntireClosetView ... />}` render branch
- Wire up `onEditItem` callback to reuse existing `handleEditItem` flow


### 0.3 Install Fuse.js
- `npm install fuse.js` — lightweight (~5KB gzipped), zero-config fuzzy search
- No other new dependencies needed


---


## Phase 1: Filter & Sort Hooks (1 day)


### 1.1 `useClosetFilters` hook
- **File:** `src/hooks/useClosetFilters.ts` (~80 lines)
- **State shape:**
 ```
 {
   category: string[]      // e.g. ["tops", "bottoms"]
   color: string[]         // e.g. ["black", "navy"] 
   brand: string[]         // e.g. ["Zara", "H&M"]
   material: string[]      // e.g. ["cotton", "silk"]
   occasion: string[]      // e.g. ["casual", "work"]
 }
 ```
- **Functions:** `toggleFilter(dimension, value)`, `clearDimension(dimension)`, `clearAll()`, `activeFilterCount`
- **Logic:** Each dimension is multi-select (OR within, AND across). An item passes if it matches at least one value in every active dimension
- Derive available filter options dynamically from closet data (not hardcoded) — `useMemo` over `closet` to extract unique values per dimension with counts
- Returns `filteredItems` and all state/actions


### 1.2 `useClosetSort` hook
- **File:** `src/hooks/useClosetSort.ts` (~50 lines)
- **Sort options:** `dateAdded` (default, by array index — newest last), `priceAsc`, `priceDesc`, `ageNewest`, `ageOldest`, `nameAZ`, `nameZA`
- **Comparators:** Handle missing/empty values gracefully (items without price sort to end)
- Parse `price` string → number (strip "$" and commas)
- Parse `age` string → sortable value (map "new"→0, "< 1 year"→0.5, "1-2 years"→1.5, etc.)
- Returns `sortKey`, `setSortKey`, `sortedItems(items)`


### 1.3 `useFuzzySearch` hook 
- **File:** `src/hooks/useFuzzySearch.ts` (~40 lines)
- Wraps Fuse.js with debounced input (300ms)
- Search keys: `name`, `brand`, `material`, `color`, `category`, `occasion`, `notes`
- Fuse options: `threshold: 0.4`, `ignoreLocation: true` (good fuzzy tolerance)
- When query is empty, returns all items (passthrough)
- Returns `searchQuery`, `setSearchQuery`, `searchResults(items)`


### 1.4 Pipeline composition
- In `EntireClosetView`: `closet → fuzzySearch → filter → sort → display`
- Each hook is independent and composable — no coupling between them
- `useMemo` at each stage to prevent unnecessary recalculation


---


## Phase 2: EntireClosetView Component (1 day)


### 2.1 `EntireClosetView` container
- **File:** `src/Features/EntireCloset/EntireClosetView.tsx` (~100 lines)
- Composes all hooks + child components
- Manages which filter dropdowns are open (only one at a time)
- Handles scroll-to-top on filter change
- Passes `onEditItem` down to cards


### 2.2 `StickyTopBar` component
- **File:** `src/Features/EntireCloset/StickyTopBar.tsx` (~50 lines)
- Fixed position bar (~56px height) with:
 - "My Closet Inventory" title (links back to carousel view)
 - Collapsed nav buttons: "+ Add Item", "Overview", "Import Gmail"
- Uses `position: sticky; top: 0; z-index: 100`
- Dark background matching existing nav aesthetic (#1a2140)


### 2.3 `SearchSortBar` component
- **File:** `src/Features/EntireCloset/SearchSortBar.tsx` (~60 lines)
- Search input with magnifying glass icon and placeholder text
- Sort dropdown (styled select or custom dropdown matching dark theme)
- Results count: "Showing {filtered} of {total} items"
- Search input has `autoFocus` and clear (✕) button when query is non-empty


### 2.4 `FilterPillsRow` component
- **File:** `src/Features/EntireCloset/FilterPillsRow.tsx` (~90 lines)
- Horizontal scrollable row of filter pills
- Each dimension pill shows: label + "▾" when inactive, "label: value ✕" when active
- Active pills get purple highlight (accent color), inactive get dark outline
- Clicking inactive pill opens dropdown below it with checkbox options + counts
- "Clear All" link at the end (only visible when filters are active)
- Dropdown uses existing `Modal` pattern or a lightweight popover


### 2.5 `FilterDropdown` component
- **File:** `src/Features/EntireCloset/FilterDropdown.tsx` (~70 lines)
- Positioned absolutely below its trigger pill
- Lists available values with checkboxes and item counts
- Closes on outside click or Escape key
- Values with 0 matching items are dimmed but still selectable


---


## Phase 3: Item Grid & Cards (1 day)


### 3.1 `FilteredItemGrid` component
- **File:** `src/Features/EntireCloset/FilteredItemGrid.tsx` (~60 lines)
- CSS Grid: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- Gap: `1.25rem`
- Max-width container: `1400px`, centered
- Viewport target: ~3 items at 1024px, ~4 items at 1440px
- Uses `framer-motion` `AnimatePresence` with layout animations for smooth filter transitions
- Empty state: "No items match your filters" with "Clear All Filters" button
- Infinite scroll OR "Show More" button (avoids heavy pagination for browse-all UX)


### 3.2 `FilteredCard` component
- **File:** `src/Features/EntireCloset/FilteredCard.tsx` (~80 lines)
- Simpler than existing `ClothingCard` flip-card — single-sided for browse efficiency
- **Layout (top to bottom):**
 - Image area (aspect-ratio: 4/5, object-fit: cover, rounded top corners)
 - Title overlay at bottom of image (semi-transparent gradient backdrop)
 - Pills row below image: shows properties matching active filters (highlighted purple) + 1-2 always-visible pills (category, color)
- Click → calls `onEditItem(item)` to open edit view
- Hover effect: slight scale + shadow lift (CSS transition)
- **Card sizing:** `min-height: 320px`, responsive width from grid


### 3.3 `FilterMatchPills` sub-component
- **File:** `src/Features/EntireCloset/FilterMatchPills.tsx` (~40 lines)
- Receives item + activeFilters
- Renders pills for: category (always), color (always), + any property matching an active filter
- Matching pills get accent border + background; non-matching pills get subtle style
- Max 4 pills visible, "+N more" overflow indicator


---


## Phase 4: Styling (0.5 day)


### 4.1 `EntireCloset.css`
- **File:** `src/Features/EntireCloset/EntireCloset.css` (~200 lines)
- Design tokens from existing `index.css`: `#222c51` background, border radii, spacing scale
- Dark theme consistent with existing app:
 - Card background: `rgba(30, 36, 65, 0.85)` with `backdrop-filter: blur(8px)`
 - Pill colors: inactive `#2e3861`, active `rgba(140, 120, 200, 0.3)` with `#8c78c8` border
 - Search/sort inputs: `#293055` with `#4a5280` border
- Responsive breakpoints:
 - `≥1200px`: 4 columns
 - `≥900px`: 3 columns 
 - `≥600px`: 2 columns
 - `<600px`: 1 column (stacked, filter pills become horizontally scrollable)
- Filter dropdown: `max-height: 300px; overflow-y: auto` for long lists
- Smooth transitions on all interactive elements (200ms ease)


---


## Phase 5: Testing (1 day)


### 5.1 Hook unit tests


- `useClosetFilters.test.ts` — toggle on/off, multi-select within dimension, AND across dimensions, clear single dimension, clear all, dynamic option extraction with counts
- `useClosetSort.test.ts` — each sort key produces correct order, handles missing prices/ages, stable sort
- `useFuzzySearch.test.ts` — exact match, fuzzy match ("blak" → "Black"), empty query passthrough, searches across multiple fields


### 5.2 Component integration tests
- `EntireClosetView.test.tsx` — renders grid with all items, filter reduces count, sort reorders, search narrows results, "Showing X of Y" updates, clear all resets, click card triggers onEditItem
- `FilterPillsRow.test.tsx` — pills render for each dimension, click opens dropdown, select option activates pill, ✕ removes filter, Clear All works


### 5.3 Coverage target: 80%+ on all new files


---


## Phase 6: Polish & Edge Cases (0.5 day)


- Empty closet state ("Your closet is empty — add your first item!")
- All-filtered-out state ("No items match — try removing some filters")
- Keyboard accessibility: Tab through pills, Enter/Space to toggle, Escape to close dropdowns
- URL state persistence (optional stretch): encode filters in query params so browser back works
- Performance: virtualize grid if closet exceeds ~200 items (react-window)
- Framer-motion enter/exit animations matching existing app feel


---


## File Summary


| File | Type | Lines (est) | Phase |
|------|------|-------------|-------|
| `src/utils/types.ts` | modify | +1 line | 0 |
| `src/App.tsx` | modify | +15 lines | 0 |
| `src/hooks/useClosetFilters.ts` | new | ~80 | 1 |
| `src/hooks/useClosetSort.ts` | new | ~50 | 1 |
| `src/hooks/useFuzzySearch.ts` | new | ~40 | 1 |
| `src/Features/EntireCloset/EntireClosetView.tsx` | new | ~100 | 2 |
| `src/Features/EntireCloset/StickyTopBar.tsx` | new | ~50 | 2 |
| `src/Features/EntireCloset/SearchSortBar.tsx` | new | ~60 | 2 |
| `src/Features/EntireCloset/FilterPillsRow.tsx` | new | ~90 | 2 |
| `src/Features/EntireCloset/FilterDropdown.tsx` | new | ~70 | 2 |
| `src/Features/EntireCloset/FilteredItemGrid.tsx` | new | ~60 | 3 |
| `src/Features/EntireCloset/FilteredCard.tsx` | new | ~80 | 3 |
| `src/Features/EntireCloset/FilterMatchPills.tsx` | new | ~40 | 3 |
| `src/Features/EntireCloset/EntireCloset.css` | new | ~200 | 4 |
| Tests (4 files) | new | ~400 | 5 |


**Total new code:** ~1,330 lines across 14 new files + 2 modified files 
**New dependency:** `fuse.js` (5KB gzipped) 
**Estimated effort:** ~4.5 days


---


## Implementation Order (TDD)


```
Phase 0  ──►  Phase 1  ──►  Phase 2  ──►  Phase 3  ──►  Phase 4  ──►  Phase 5  ──►  Phase 6
Prep          Hooks         Container      Grid+Cards    CSS/Style     Tests          Polish
(0.5d)        (1d)          (1d)           (1d)          (0.5d)        (1d)           (0.5d)
```


Each phase is independently testable. Hooks (Phase 1) can be fully unit-tested before any UI exists. Components render with mock data first, then wire to real hooks.


---


## Key Design Decisions


1. **Separate view, not a mode of existing Closet** — avoids breaking the carousel + paginated overview flow that already works well for casual browsing
2. **Hooks-first architecture** — `useClosetFilters`, `useClosetSort`, `useFuzzySearch` are independent, composable, and testable in isolation
3. **Dynamic filter options** — extracted from actual closet data via `useMemo`, not hardcoded lists. New brands/materials appear automatically
4. **Fuse.js for search** — battle-tested fuzzy matching library, handles typos gracefully, tiny bundle
5. **CSS Grid over flexbox** — `auto-fill` + `minmax` gives us responsive columns without media query breakpoints for the grid itself
6. **Single-sided cards** — the flip-card pattern from existing `ClothingCard` is great for detail browsing but too heavy for a filterable grid with 40+ items. Click-to-edit is faster
7. **Filter-matching pills** — visually connects "why is this item showing" to the active filters, reinforcing the filtering mental model


---


## Risks & Mitigations


| Risk | Impact | Mitigation |
|------|--------|------------|
| Large closet (200+ items) slows render | Medium | Virtualize with `react-window` if needed |
| Price/age strings are inconsistent | Low | Robust parsing with fallback sort position |
| Filter dropdown positioning on mobile | Medium | Use portal + collision detection, or switch to bottom sheet on small screens |
| Fuse.js threshold too aggressive/lenient | Low | Configurable threshold, test with real closet data |
| Existing tests break from ViewType change | Low | Only additive change, no existing views affected |




