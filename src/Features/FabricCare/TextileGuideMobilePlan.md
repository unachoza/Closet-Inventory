# Textile Guide — Mobile & Brand Audit

## Context

The "Textile Compendium" guide (reached via NavBar → **fabric** view) doesn't follow
the app's brand aesthetic and is awkward on mobile. The user asked to audit
`TextileGuildInteractive` specifically for **brand colors**, the **nav TOC**, and the
**comparison table** on mobile.

**File identity (important):** the file literally named `TextileGuildInteractive.tsx`
is *deleted* in the working tree. The **live component** is
`src/Features/FabricCare/InteractiveGuide.tsx` (it still *exports* a symbol named
`TextileGuildInteractive`), styled by `src/Features/FabricCare/TextileGuide.css`,
rendered at `src/App.tsx:231` for `view === "fabric"`. `FabricCare.tsx` is **not
mounted anywhere** — its "Open Textile Guide" button is dead code. This audit targets
`InteractiveGuide.tsx` + `TextileGuide.css`.

The whole change is confined to those two files (plus optional dead-code cleanup).
Brand tokens live in `src/tokens.css`; breakpoints in `src/styles/breakpoints.css`
(`--bp-xs` 480 / `--bp-sm` 600 / `--bp-md` 768). Fonts (`--font-display` Playfair,
`--font-mono` DM Mono) already match `index.css` — **do not touch fonts.**

## Decisions (from the user)

- **Comparison table:** make columns **sortable** + add a **"pick up to 3 to compare"**
  mode that renders the chosen fibers side-by-side (fits mobile).
- **Brand colors:** **accent only** — remap the gold accent to brand terracotta;
  **keep** sage/blue/mauve category colors (they functionally encode
  natural / semi / synthetic).

---

## 1. Brand: gold accent → terracotta (`TextileGuide.css`)

The component declares its **own** `:root` palette (`TextileGuide.css:10-33`) that never
references `tokens.css`. The single off-brand offender is `--gold`, used for every
active/interactive state (active TOC link, active weave-tab border, links, `::before`
bullets, key-facts, `.pill-med`).

- Remap the gold ramp to brand terracotta from `tokens.css`:
  - `--gold` → `#8f6256` (deep umber / `--Primary-Pink-Darker`)
  - `--gold-light` → `#b28675` (`--Primary-Pink`) — used on the dark hero
  - `--gold-pale` → keep a soft terracotta tint (e.g. `--terra-pale #FBF0E8`) for
    `.pill-med` background so the pill stays legible.
- Leave `--sage` / `--dusty-blue` / `--mauve` (+ their `-pale` variants) as-is — they are
  the category coding the user chose to keep.
- Also align the base neutrals to brand while here: `--cream #FAF7F2` and
  `--warm-white #FFFDF9` are near-dupes of brand alabaster `#faf8f5` / white `#ffffff` —
  nudge to the brand values so surfaces match the rest of the app. (Low risk; these are
  local vars.)
- Remove the stray render-blocking `@import "https://fonts.googleapis.com/..."`
  (`TextileGuide.css:8`) — `index.css` already loads Playfair + DM Mono; this duplicates
  it and blocks first paint.

## 2. Nav TOC mobile fix (`TextileGuide.css` + small effect in `InteractiveGuide.tsx`)

Root causes at 375px: `justify-content: space-evenly` fights horizontal overflow, the
scrollbar is hidden with **no affordance** that it scrolls, the sticky bar **overlaps the
app NavBar**, and the active tab never scrolls into view.

- `.toc-inner` (`:141`): change `justify-content: space-evenly` → `flex-start` so the 8
  items pack and scroll cleanly instead of squashing.
- `.toc-nav` (`:133`): change `top: 0` → `top: var(--header-height, 56px)`. The app NavBar
  is `position: sticky; z-index: 100; height: var(--header-height)`
  (`NavBar.css:5,15`) and the TOC currently sticks *behind* it. Keep/verify z-index below
  the NavBar's 100.
- Add an **edge-fade** affordance (mask-image / gradient on `.toc-nav`) so users see the
  strip is scrollable.
- In `InteractiveGuide.tsx`: add an effect keyed on `activeNavId` that
  `scrollIntoView({ inline: "nearest" })`s the active `.toc-link` button (use a ref map or
  `querySelector`), so the highlighted section's tab is always visible.
- Clean up the tangle of `:focus`/`:focus-visible` overrides (`:195-212`) — replace with a
  single accessible focus-visible style instead of blanket `outline: none`.
- Apply the same treatment to the weave-tab strip (`.weave-tabs.toc-nav`), which shares
  the class.

## 3. Comparison table → sortable + pick-to-compare (`InteractiveGuide.tsx` + CSS)

The 15-row / 7-column table (`InteractiveGuide.tsx:302-363`) currently just
horizontal-scrolls. The row data is an **inline literal** — first lift it to a typed
`const FIBER_ROWS` array (module scope) so it can be sorted/filtered immutably.

- **Sortable columns:** add `sortKey` / `sortDir` state; clicking a `<th>` sorts a *copy*
  of `FIBER_ROWS` (immutable — `[...rows].sort(...)`). Qualitative columns
  (Breathability/Durability/Eco) sort by a rank map (Very Low…Very High); Cost by `$`
  count. Show a ▲/▼ indicator in the active header.
- **Pick-to-compare:** a chip/row of fiber toggles above the table; selecting up to **3**
  filters to those rows. On mobile this is the primary path — 3 fibers fit side-by-side;
  with 0 selected, show all (desktop default). Enforce the max-3 immutably.
- Keep the existing `.pill` high/med/low coloring (med pill re-tinted via step 1).
- Mobile CSS (`@media (--bp-sm)`): keep the table structure (comparison intent preserved)
  but tighten cell padding/font so 3 columns fit; retain `overflow-x: auto` as the
  fallback when all rows are shown.

## 4. Bugs / cleanup found in passing (`TextileGuide.css`)

- `.weave-tab:hover { background-color: red; }` (`:624-631`) — literal red hover; remove.
- Two orphan selectors with no rule block (`:621-622`) — delete.
- `.section-header { border: solid black 1px; }` (`:885`) — stray off-brand black border;
  remove (or make it a hairline `var(--border)`).
- Inline white-background hacks on `.care-label`/`.care-value` (`:471,482`) — fold into the
  class rules.
- Optional: delete the orphaned `FabricCare.tsx` dead "Open Textile Guide" button /
  commented import, or leave a note — it renders nothing today.

## Files to modify

- `src/Features/FabricCare/TextileGuide.css` — palette remap, TOC/table/mobile CSS, bug fixes.
- `src/Features/FabricCare/InteractiveGuide.tsx` — active-tab scroll effect; table sort +
  pick-to-compare state and controls; lift `FIBER_ROWS` to module scope.
- (optional) `src/Features/FabricCare/FabricCare.tsx` — dead-code note/cleanup.

## Verification

1. `npx tsc --noEmit` and run the existing suites:
   `src/Features/FabricCare/__tests__/InteractiveGuide.test.tsx` and `App.test.tsx`.
   Add unit coverage for the new sort comparator (rank map) and the max-3 pick logic.
2. Drive the **mobile preview at 375px** (repo's supported floor) via `preview_start`
   (dev server) → navigate to the app → NavBar → "fabric" view:
   - TOC: confirm it sits **below** the app NavBar (no overlap), scrolls with a visible
     fade, and the active tab scrolls into view as you scroll sections.
   - Table: sort by a column, then pick 2–3 fibers and confirm the side-by-side view fits
     without body horizontal scroll.
   - Brand: confirm active nav/tabs/links/bullets are terracotta, not gold.
3. Capture before/after screenshots at 375px for TOC + comparison table.
4. Also sanity-check at desktop width that the table still defaults to all-rows and
   sorting works.