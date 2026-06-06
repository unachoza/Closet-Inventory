# Testing Plan

## Current State
- **72 source files → 22 test files**
- Estimated coverage: ~30%
- Target: **80%+ by end of Week 3**

---

## What's Already Well Tested — Leave Alone

| File | Notes |
|---|---|
| `useClosetFilters` | 17 tests, edge cases covered |
| `useClosetSort` | Covered |
| `useFuzzySearch` | Covered |
| `parseProductsFromEmail` | Covered with retailer HTML mocks |
| `useCloudCloset` | 16 tests — signed in/out, all mutations |
| `Closet` | 3 test files — render, pagination, category |
| `CheckPill` | Covered |
| `CheckboxCollection` | Covered |
| `DropDownSelect` | Covered |
| `ErrorBoundary` | Covered |
| `PaginationControls` | Covered |
| `Carousel` | Covered |

---

## Week 1 — Pure Utilities & Hooks
> No DOM, no mocks. Fastest to write, highest confidence return.

### Pure Utility Functions

#### `normalizeCategories.ts`
- [ ] `"dress"` → `"dresses"` (singular → plural)
- [ ] `"top"` → `"tops"`
- [ ] Case insensitivity (`"TOPS"` → `"tops"`)
- [ ] Unknown value passthrough

#### `normalizeColors.ts`
- [ ] `"brown / taupe"` → groups under `"Brown"`
- [ ] Case variants (`"brown"`, `"Brown"` → same group)
- [ ] Multi-color splitting (`"blue / white"` → two separate color values)
- [ ] Unknown color passthrough

#### `normalizeToString.ts`
- [ ] Array input → joined string
- [ ] Already-string passthrough
- [ ] Null / undefined → empty string

#### `materialUtils.ts`
- [ ] String material → `MaterialBlend[]` with 100% percentage
- [ ] Already-array passthrough
- [ ] Multi-material string parsed correctly
- [ ] Percentage values preserved

#### `parseEmailToFormData.ts`
- [ ] Brand extracted from sender display name
- [ ] Brand extracted from email domain fallback
- [ ] Category inferred from item name (`"tank top"` → `"tops"`)
- [ ] HTML stripped before parsing
- [ ] HTML entities decoded (`TENCEL&#153;` → `"tencel"`)
- [ ] Returns `formItem` defaults for unrecognised fields
- [ ] _(future)_ Material inferred from name (`"COTTON MODAL TANK TOP"` → `["cotton", "modal"]`)
- [ ] _(future)_ Style tags extracted (`"FITTED MIDI DRESS"` → `{ fit: "fitted", hemLength: "midi" }`)

---

### Hooks

#### `usePagination`
- [ ] Returns correct page slice for page 1
- [ ] Returns correct page slice for middle page
- [ ] Last page returns remaining items (not a full page)
- [ ] `totalPages` calculated correctly
- [ ] `goToPage` clamps to valid range
- [ ] 0 items → 0 pages, no crash
- [ ] Items exactly divisible by page size → no empty last page

#### `uselocalStorage`
- [ ] Reads existing value from localStorage
- [ ] Returns default value when key absent
- [ ] Writes value on update
- [ ] Handles JSON parse error gracefully → returns default

#### `useLocalCloset`
- [ ] `addItem` appends item and persists to localStorage
- [ ] `addFullItem` appends full item without generating new id
- [ ] `removeItem` removes by id and persists
- [ ] `updateItem` merges partial data and persists
- [ ] `clearCloset` empties state and removes localStorage key
- [ ] `getCloset` reads directly from localStorage (not state)
- [ ] Legacy string `material` field auto-migrated to `MaterialBlend[]`

#### `useStockPhoto`
- [ ] Returns a URL for each known category
- [ ] Returns a fallback URL for unknown category

---

## Week 2 — Components
> RTL render tests. Mock context/hooks at the boundary.

#### `MaterialBlendInput`
- [ ] Renders existing materials
- [ ] "Add material" button appends a new row
- [ ] Percentage input updates the correct blend entry
- [ ] Remove button deletes that material row
- [ ] Shows validation error when total > 100%
- [ ] Calls `onChange` with updated blend array

#### `MaterialCompositionBar`
- [ ] Renders a segment per material
- [ ] Segment widths match percentages
- [ ] Single material fills 100% width
- [ ] Empty array renders nothing / no crash

#### `ProgressionTracker`
- [ ] Current step is visually active
- [ ] Completed steps are marked
- [ ] Step labels render correctly
- [ ] Does not render steps beyond total count

#### `Toast`
- [ ] Message text renders
- [ ] Auto-dismisses after duration
- [ ] Multiple toasts queue (second appears after first)
- [ ] Manual dismiss works
- [ ] `ToastProvider` required — throws outside provider

#### `SearchBar`
- [ ] Renders input
- [ ] Typing calls `onChange`
- [ ] `onChange` is debounced (fast typing = one call)
- [ ] Clear button resets value and calls `onChange("")`

#### `FilterAccordion`
- [ ] Renders one section per filter dimension
- [ ] Clicking section header expands it
- [ ] Clicking again collapses it
- [ ] Option counts render next to each value

#### `FilterPillsRow`
- [ ] Renders a pill per active filter
- [ ] Clicking X on a pill removes that filter
- [ ] "Clear all" removes all filters
- [ ] No pills rendered when no filters active

#### `FilterSidePanel`
- [ ] Opens when triggered
- [ ] Closes on backdrop click / close button
- [ ] Filter selections are reflected in the pill row
- [ ] Applying filters updates item count

#### `SearchSortBar`
- [ ] Renders sort dropdown
- [ ] Selecting an option fires `onSortChange` with correct key
- [ ] Current sort key shown as selected

#### `DatePicker / MonthYearPicker`
- [ ] Selecting a month fires `onChange` with correct value
- [ ] Selecting a year fires `onChange` with correct value
- [ ] Boundary months (Jan / Dec) selectable
- [ ] Does not allow future dates beyond current month

#### `ImageUploader`
- [ ] File input renders
- [ ] Selecting a file triggers `onChange` with base64 string
- [ ] Preview image appears after selection
- [ ] Invalid file type shows error or is ignored

---

## Week 3 — Integration Tests
> Multiple components working together. Use RTL + mocked Firestore/Auth.

### Flow 1: Add Item End-to-End
Steps 1–9 of the form → submit → item appears in Closet grid
- [ ] Can navigate forward through all 9 steps
- [ ] Back button returns to previous step
- [ ] Cannot advance past a required step without a value
- [ ] Submit on step 9 fires `addItem`
- [ ] After submit, item appears in the Closet grid
- [ ] Form resets to step 1 after submit
- [ ] Toast notification appears on success

### Flow 2: Edit Item
- [ ] Clicking edit on a card opens `EditItemView` prefilled with that item's data
- [ ] Changing a field and saving calls `updateItem` with new data
- [ ] Card in the grid reflects the updated values
- [ ] Clicking discard reverts and returns to the grid without saving
- [ ] Toast appears on successful save

### Flow 3: Gmail Import → Edit → Save
- [ ] Mock Gmail API returns email list → emails render
- [ ] Selecting an email shows the preview panel
- [ ] Detected products render as product cards
- [ ] Clicking "Import" on one product opens `EditItemView` prefilled
- [ ] "Add to Closet" saves and returns to Gmail view
- [ ] Toast confirms item added
- [ ] Clicking "Import All" on an email with 3 items opens batch mode

### Flow 4: Batch Import Queue
- [ ] `EditItemView` shows "1 of 3" on first item
- [ ] "Add to Closet" saves item 1 and advances to "2 of 3"
- [ ] "Skip" on item 2 advances to "3 of 3" without saving
- [ ] "Add to Closet" on item 3 returns to Gmail view
- [ ] All saved items appear in closet

### Flow 5: Toast Flow _(needs fixing — see Bug Fixes section)_
- [ ] Toast appears after adding item from form
- [ ] Toast appears after adding item from email import
- [ ] Toast appears after saving edit
- [ ] Toast does not linger after navigating away
- [ ] Toast does not stack unexpectedly during batch import

### Flow 6: Search + Filter Combined
- [ ] Typing a query narrows results
- [ ] Applying a category filter narrows further
- [ ] Active filter pill appears for each applied filter
- [ ] Removing a pill re-expands results
- [ ] "Clear all" restores full list
- [ ] Sort dropdown changes display order
- [ ] Combining search query + filter + sort all work simultaneously

### Flow 7: Firestore Sync
- [ ] Signing in with existing cloud data loads cloud items (not local)
- [ ] Signing in with no cloud data seeds from localStorage
- [ ] Adding an item while signed in writes to Firestore
- [ ] Removing an item while signed in deletes from Firestore
- [ ] Signing out falls back to localStorage items

---

## Week 4 — E2E (Playwright)
> Real browser. Real interactions. Cross-device.

### Browser Matrix

| Browser | Device | Priority |
|---|---|---|
| Chrome (latest) | Desktop | P0 |
| Safari / WebKit | Desktop | P0 |
| Safari | iPhone 13 | P0 |
| Chrome | Pixel 5 (Android) | P1 |
| Firefox | Desktop | P1 |
| Edge | Desktop | P2 |

### Critical E2E Flows

#### Add Item (all browsers)
- [ ] Full 9-step form completes without error
- [ ] Item appears in grid after submit
- [ ] Image upload works (desktop + mobile)

#### Filter + Search (all browsers)
- [ ] Search returns correct results
- [ ] Filters apply and clear correctly
- [ ] Filter side panel opens/closes on mobile

#### Gmail Import (Chrome only — OAuth)
- [ ] OAuth sign-in redirects and returns
- [ ] Emails load and display
- [ ] Importing an item lands in EditItemView

#### Modal Behaviour on Mobile _(needs fixing — see Bug Fixes section)_
- [ ] Filter side panel doesn't overflow viewport on iPhone
- [ ] Modal backdrop is tappable to dismiss
- [ ] Scroll inside modal doesn't scroll the page behind it
- [ ] Keyboard doesn't push modal off-screen on iOS

#### PWA (Safari iOS only)
- [ ] App installable via "Add to Home Screen"
- [ ] Launches full-screen (no Safari chrome)
- [ ] Offline mode shows cached closet

---

## 🐛 Known Bugs to Fix

### Material filter not working in Search/EntireClosetView
- **Symptom:** Selecting a material in the filter panel returns no results or incorrect results even when items with that material exist.
- **Likely cause:** Items store `material` as `MaterialBlend[]` (e.g. `[{ material: "cotton", percentage: 100 }]`) but `useClosetFilters` likely compares the filter value against the raw field, which is an array of objects — not a plain string match.
- **Fix:** In `useClosetFilters`, when filtering by `material`, extract the material name strings from the `MaterialBlend[]` array before comparing against the selected filter values.
- **Test to write:** item with `material: [{ material: "cotton", percentage: 100 }]` → apply "cotton" material filter → item appears in results.

---

### Remove item doesn't re-render the Closet grid
- **Symptom:** Clicking "Remove" on a clothing card removes the item from localStorage but the Closet grid doesn't update — the card visually stays until the page reloads.
- **Root cause:** `Card.tsx` calls `useLocalStorageCloset().removeItem`, which is a separate hook instance from the one `Closet.tsx` uses. They both read from the same localStorage key but have independent React state — so Card's `removeItem` updates localStorage but Closet's state never re-renders.
- **Fix:** Pass `onRemoveItem` as a prop from `Closet` down to `ClothingCard` (same pattern as `onEditItem`), so removal goes through the shared `useLocalStorageCloset` instance that Closet is already subscribed to. OR switch Card to use `useCloset()` from `ClosetContext` which is the single shared instance.
- **Test to write:** render Closet with 3 items → click Remove on card back → item disappears from grid without reload.

---

## 🐛 Bug Fixes / UX Issues to Address Before Testing

These flows are broken or incomplete and need fixing before or alongside tests:

### Toast Flow
- Toast timing inconsistent — sometimes doesn't appear after email import
- During batch import, toast fires on every item but overlaps badly
- Toast lingers when navigating away mid-flow
- **Fix:** Centralise toast triggers in `useCloudCloset` mutations, not scattered in individual components

### Post-Email Import Flow
- After "Import All" completes, return destination is inconsistent
- If user cancels mid-batch, state isn't fully reset
- Email preview panel stays selected after import — should deselect or confirm
- **Fix:** Audit `handleQueueAdvance` / `handleReturnToEmail` in `App.tsx`, add explicit state resets

### Modals on Mobile
- Filter side panel overflows on small screens (iPhone SE)
- Modal scroll locks the page body inconsistently on iOS Safari
- Backdrop tap to dismiss not reliable on touch
- Keyboard pushes content off screen when input is inside modal
- **Fix:** Audit all modal/panel components for `overflow`, `position: fixed`, and `touch-action` CSS; test at 375px viewport width

---

## Skip / Low Priority

| File | Reason |
|---|---|
| `FiberFlowChart`, `WeaveDiagram`, `JourneyC` | Purely visual, no logic |
| `Header.tsx` | Static markup |
| `Modal.tsx` | Thin Radix wrapper — test usage not the wrapper |
| `GmailImport/EmailPreview`, `EmailList` | Covered by integration test |
| `useGmailAuth`, `useGmailSearch` | Real OAuth — E2E only |
| `detectColorFromImage` | Requires canvas + CORS — E2E only |
| `main.tsx` | Entry point |
| `types.ts`, `constants.ts`, `journeyData.ts` | Data, not logic |

---

## Summary Checklist

```
Week 1 — Utilities & Hooks
  [ ] normalizeCategories
  [ ] normalizeColors
  [ ] normalizeToString
  [ ] materialUtils
  [ ] parseEmailToFormData
  [ ] usePagination
  [ ] uselocalStorage
  [ ] useLocalCloset
  [ ] useStockPhoto

Week 2 — Components
  [ ] MaterialBlendInput
  [ ] MaterialCompositionBar
  [ ] ProgressionTracker
  [ ] Toast
  [ ] SearchBar
  [ ] FilterAccordion
  [ ] FilterPillsRow
  [ ] FilterSidePanel
  [ ] SearchSortBar
  [ ] DatePicker / MonthYearPicker
  [ ] ImageUploader

Week 3 — Integration Flows
  [ ] Add item end-to-end
  [ ] Edit item
  [ ] Gmail import → edit → save
  [ ] Batch import queue
  [ ] Toast flow (after bug fix)
  [ ] Search + filter combined
  [ ] Firestore sync

Week 4 — E2E (Playwright)
  [ ] Playwright config (5 browser/device projects)
  [ ] Add item — Chrome + Safari desktop
  [ ] Add item — iPhone Safari
  [ ] Filter + search — all browsers
  [ ] Modal behaviour — mobile
  [ ] Gmail OAuth — Chrome
  [ ] PWA install — iPhone Safari

Bug Fixes (unblock testing)
  [ ] Toast flow — centralise triggers, fix overlap in batch mode
  [ ] Post-import flow — audit state resets in App.tsx
  [ ] Modals on mobile — overflow, scroll lock, backdrop tap, keyboard push
```
