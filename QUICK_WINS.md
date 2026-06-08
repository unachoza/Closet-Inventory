# Quick Wins

Scoped from the README roadmap — items close to the existing architecture, ordered by effort.

---

## 🟢 Tiny (1–2 hours each)

### 1. Export Closet / Download CSV ✅ *(v1.0 roadmap)*
Closet data is already in-memory as `ClothingItem[]`. A `JSON → CSV` transform + `<a download>` trigger — no new state, no new routes. One utility + one button in the NavBar.

### 2. Sort by `purchaseDate` *(bonus — post item-age feature)*
`useClosetSort` currently fakes "age" as a condition label (`new`, `good`, `fair`). Now that items have `purchaseDate`, add `purchasedNewest` / `purchasedOldest` sort keys that sort on real ISO dates. ~5-line change in `useClosetSort.ts`.

### 3. "Dry clean only" quick-filter pill *(v1.1 roadmap)*
The `care` field is already indexed by `useClosetFilters`. One hardcoded toggle pill above the filter panel calls `toggleFilter("care", "dry clean")`. No new infrastructure — just a UI shortcut.

---

## 🟡 Small (half-day each)

### 4. Item count + basic stats bar *(lite v1.2 warmup)*
No chart library needed. A stat strip above the grid — total items, total spend, avg price — computed from the closet array. The README calls for `recharts` later, but the numbers themselves are trivial aggregations that work great as text chips. Extract a `useClosetStats` hook.

### 5. "View more / collapse" on item cards *(v1.0 roadmap)*
Cards currently show a fixed back-face. Toggle a `showAllDetails` boolean and conditionally render notes / price / purchaseDate fields that are currently hidden. The existing card-flip handles show/hide logic — this is just adding another layer inside.

### 6. Cost-per-wear chip on the card back *(v8.0, but self-contained)*
`price` is already on `ClothingItem`. Add a `wornCount?: number` field + a "Log a Wear" +1 button persisted in localStorage. Display `$price / wornCount` as a small chip. Fully isolated — no backend needed.

---

## 🟠 Medium (1 day each)

### 7. Dark mode toggle *(v1.1 roadmap)*
CSS custom properties are already defined in `index.css`. Add a `[data-theme="dark"]` override block + a toggle in the NavBar that writes to `localStorage`. The design system is already token-based so it's mostly a variable remap.

### 8. Conflict resolution for Firestore *(v4.0 roadmap)*
Add `updatedAt` timestamp to `ClothingItem` + last-write-wins merge in `useCloudCloset`. Seeding logic is already present — this is a timestamp comparison on the sync path.

---

## Suggested sequencing

Given item-age (purchase date parsing) just shipped, the natural follow-ons that build on each other:

1. **CSV export** — zero dependencies, instant user value, reuses the closet array already in memory
2. **Sort by purchaseDate** — leverages the date field just added
3. **Stats bar** — total items + total spend already gets computed in the CSV export transform
4. **"Dry clean only" pill** — trivial once you've read through `toggleFilter`
