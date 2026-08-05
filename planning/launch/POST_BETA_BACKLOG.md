# Post-Beta Backlog

**Rule: nothing in this file gets worked on until beta is live.**
Created 2026-08-03. Target beta launch: 2026-08-06 (3 days).

This is the parking lot for scope creep. If an idea shows up mid-sprint and it
isn't on the 3-day launch plan, it goes here — not into the branch.

---

## Data integrity (free-text is leaking bad values)

1. **Normalizer for all free-text fields** — category, brand, occasion.
   Material is effectively done (see item 2 below) — same shape needed for
   the rest: trim → lowercase → alias map → fuzzy match to canonical vocab.
   Applies to manual entry *and* parsed import values. Open decision for
   these remaining fields: silent correct vs. visible "→ Cotton, tap to
   undo" chip (preferred) vs. suggest-and-confirm — material settled on
   silent force-match (see item 2), which may or may not be the right call
   for category/brand/occasion.
2. ~~**Material Composition → dropdown** instead of free text.~~ Done
   2026-08-03, hardened 2026-08-04: `MaterialCombobox` (searchable,
   canonical list from `MATERIAL_COLORS`, now 39 entries after reconciling
   against FashionParser's own material map). No free-text fallback —
   typed input always force-matches to its closest canonical option via
   fuse.js (`cottton`→`cotton`, `viscos`→`viscose`), replacing the original
   "Other" pass-through.
3. ~~**Occasion → multi-select pills**~~ Done 2026-08-03: `EditItemView`'s
   occasion field now matches the add-flow (`PillComboField multiSelect`,
   comma-joined string like `care`/`PillGroup`).
4. **Occasion filter dimension doesn't split comma-joined values.**
   `useClosetFilters.ts`'s `extractValues()` pushes a plain `string` field
   as one literal value — for `occasion` (typed `string`, not `string[]`,
   comma-joined for multi-select since item 3 above and already true for the
   add-flow before that), an item tagged "casual, formal" filters as the
   single glued option `"casual, formal"` instead of two selectable filters.
   `care` doesn't have this problem because it's typed `string | string[]`
   and `extractValues` already flattens arrays. Fix: either comma-split
   plain-string values in `extractValues` (risk: a legitimate value
   containing a literal comma, e.g. free-typed "date, dinner" style text,
   would wrongly split — audit for that first) or change `occasion`'s type
   to `string[]` to match `care` (bigger: touches the Supabase column,
   `exportCloset`/`importCloset`, and every existing single-occasion item).

## Import flow

4. **Consistent post-add destination.** Multi-item email returns to the email
   preview; single-item dumps to the closet. Proposal: always return to the
   preview with the added item checked off, plus a persistent "Done — go to
   closet" button.
5. **Visited-email state.** Faded / checked treatment on emails already scanned,
   persisted per-user, so users can see where they left off in a search.
6. **Sticky scroll from email preview → detected-product cards on mobile.**
   Likely nested scroll containers fighting or the preview capturing touch.
   Needs on-device diagnosis.

## Smarter forms (conditional logic)

7. **Category-driven size options.** Shoes → 6, 6.5, 7…; pants → 24, 25, 26…;
   dresses → 0, 2, 4…; tops → XS–XXL. One `sizeScalesByCategory` map feeding a
   size control.
8. **Source-driven condition prompt.** eBay / Poshmark / ThredUp / Depop /
   Mercari → surface a condition field (NWT, excellent, good, fair). Skip for
   first-party retail (default: new).

## Care

9. **"Your Care" vs. the reference library.** Sharpen the two competing care
   stories — personalized care drawn from the user's real fabrics vs. the
   general reference. Needs a friendlier word than "encyclopedia": candidates —
   *Care Library*, *Care Basics*, *Fabric Guide*, *Look It Up*, *Care A–Z*.
10. **Stain removal guide, conditional-logic version.** Ask what the stain is,
    then route to the right chemistry:
    - **Enzymes** — break large biological molecules into smaller removable
      pieces (blood, grass, food, sweat)
    - **Surfactants** — lift oily soils and grease
    - **Solvents** — dissolve certain dyes, inks, and resinous residues

## Retention (beyond the day-30 work)

11. **Day-7 closet data-viz card.** Very basic: how many pieces, what the closet
    cost, breakdown by category. Retention card, not a full dashboard.
12. **Profile-driven pill presets.** Guided setup for most-worn brands, common
    materials, common occasions. Those become the top-of-list pills everywhere,
    so mobile entry is tapping instead of typing. Directly reduces the free-text
    problem in (1).

## Search

13. **Collapse / rework Advanced Search.** Refactor and revise — currently too
    heavy for the MVP surface area.

## Quality & cross-browser

14. **E2E coverage for the critical flows.** Playwright is already installed and
    a PWA suite exists (`test:e2e:pwa`, port 4174). Missing: onboarding →
    sign-in → name → install, and the full Gmail import funnel end to end.
15. **Cross-browser pass.** Safari (desktop + iOS), Chrome, Firefox. Testers are
    disproportionately on iOS Safari, including versions below 16.4 — see
    the existing old-Safari CSS constraints (range-syntax media queries and
    `color-mix()` both need fallbacks).
16. **Safari default UI cleanup.** Native `<select>` arrows and other UA-default
    controls look wrong against the design system. Needs
    `appearance: none` + custom chevron on selects, and an audit of any other
    control rendering with Safari defaults.
    *Candidate for promotion into launch — it's visible on the exact browser
    most testers will use.*
17. **Emoji → Noun Project icons.** No emoji in the UI. Swap every one for an
    icon from the Noun Project library already licensed for this project.
    Needs: an inventory of current emoji use, a shared `<Icon>` component, and
    consistent sizing/color tokens so icons inherit theme like text does.

## PWA polish

18. **"What's new while you were away" screen.** On reopen, if
    `setupPwaUpdateCheck()` (src/lib/pwaUpdate.ts) picked up a fresh build since
    last session, show a small one-time card: 1–3 bullet points, plain language,
    no changelog dump. Needs a way to tag each release with its own short bullet
    list (probably a small JSON/markdown keyed by `APP_VERSION`) and a
    last-seen-version marker in localStorage to decide whether to show it.
19. **"Add to Home Screen" walkthrough animation.** Low-tech users likely don't
    know PWA install is a feature at all. A short animated explainer (share
    sheet → Add to Home Screen → icon appears) surfaced at the right moment —
    probably the existing `InstallStep` onboarding screen — rather than relying
    on static instructions.

## Performance & bundle optimization

20. **Defer Supabase realtime + storage from boot.** The eager `x` chunk
    (80 KB gzip) is mostly the Supabase client (auth/realtime/storage). Auth is
    needed at startup, but realtime (live presence, real-time feeds) and storage
    (file uploads) may not be. Investigate lazy-loading them or shimming on first
    use. Risk: any code that unconditionally imports
    `{ createClient } from '@supabase/supabase-js'` at the module level will
    fail. Scope: grep for the pattern, audit import sites, and measure the
    savings. Current blocker: Rollup's chunking decision (hoisting
    `inferCare.ts` because it's shared between multiple lazy views) keeps
    CARE_GROUPS in the eager bundle even though it's logically lazy. May need
    `manualChunks` config to split further, or accept the 80 KB as a fixed cost.

---

## Added after launch

_(append new scope-creep ideas here with a date)_
