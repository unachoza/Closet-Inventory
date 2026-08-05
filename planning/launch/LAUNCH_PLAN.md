# 3-Day Beta Launch Plan

Created 2026-08-03. Target beta launch: 2026-08-06.
Everything here is launch-blocking (P0). Anything not on this list goes to
[POST_BETA_BACKLOG.md](./POST_BETA_BACKLOG.md) instead — no exceptions during
this push.

---

## Day 1 — Legal

- [ ] Business/support email set up
- [ ] Privacy policy updated — Gmail scope, what's stored in Supabase,
      retention, the account-deletion path (`delete-user-account` Edge
      Function is already deployed), **and PostHog session replay
      disclosure** (`disable_session_recording: false` in monitoring.ts)
- [ ] Terms of service, beta-appropriate
- [ ] Google OAuth consent screen matches policy URL, app name, and scopes
- [ ] Sign-in consent card's "Clothing order confirmations" claim verified —
      drop it if account sign-in isn't actually requesting Gmail read scope
- [ ] Scope audit: confirm account sign-in isn't requesting dead
      `gmail.readonly`

## Day 2 — Observability + PWA updates

- [ ] Sentry end-to-end run-through — real error, real crash, real unhandled
      rejection, confirm each lands with usable stack traces
- [ ] PostHog funnel run-through — walk onboarding → sign-in → name → install
      → first import → first item added, confirm every step fires
- [x] Buffer-and-flush for pre-consent analytics — **shipped in code**
      (src/lib/monitoring.ts), needs deploying to production before any more
      install/onboarding testing, or events keep vanishing the way the
      2026-08-02 install tests did
- [ ] Set up a reverse proxy for PostHog ingestion — ad blockers silently drop
      10–25% of events per PostHog's own warning; on top of the consent gap,
      testers with ad blockers are currently under-reported twice over
- [ ] Instrument: time-to-first-import, items imported per session, current
      closet count, import abandonment point
- [ ] Confirm in-app Feedback button delivers somewhere it'll actually get read
- [x] PWA update verification — install, ship a visible version bump, reopen,
      confirm the new build appears (`registerType: "autoUpdate"` is
      confirmed correct in vite.config.ts; `setupPwaUpdateCheck()` now also
      forces a check on `visibilitychange` — **shipped**)
- [ ] Notifications: decide in-app-only for beta (push deferred — iOS Safari
      <16.4 can't receive it at all, and testers are on those versions)

## Day 3 — P0 breakage + retention

- [ ] Onboarding replays inside the installed PWA — detect standalone mode,
      persist completion flag across the install boundary, skip "install as
      PWA" step when already standalone
- [ ] White screen after first Google sign-in (confirmed ~5–10s, not 40s) —
      throttled-network repro first to confirm bundle vs. blocking-query cause,
      then fix at the right layer (inline `index.html` splash if network;
      timeout + real failure state if a blocking await)
- [x] Care pills break mobile layout — rewrite material→care mapping to ≤3-word
      labels, add a layout guard so no pill can ever force horizontal scroll
      (`CARE_GROUP_TAGS` short-tag table, `.card-details__care-pill`
      `max-width: min(11.25rem, 60vw)` + ellipsis guard — PR #195)
- [x] Multiselect dropdown (Care) covers Material Composition — explicit Done
      affordance + close-on-outside-tap (PR #195); the dropdown itself also
      turned out to be genuinely clipped/mispositioned in three ways, fixed
      2026-08-04: a ~200px gap under Care/Occasion when a taller sibling
      stretched their shared grid row, the panel getting cut off past the
      edit form's scrollable area with the Done button unreachable, and the
      Material Composition panel getting clipped by its own row's reveal
      animation wrapper. Panels now auto-scroll into view on open
      (`usePanelIntoView`) and no longer inherit an unrelated ancestor's
      clipping `overflow: hidden`.
- [ ] "What do you want to do first?" onboarding step — Load sample closet /
      Import from Gmail / Add manually, so onboarding doesn't dead-end in an
      empty closet
- [ ] Post-import summary — item count, top brands, closes the import loop

---

## Shipped ahead of schedule

- **PR #195 (ui-nits/material-care-occasion), 2026-08-04 — expanded well
  beyond its original scope after live testing surfaced real regressions:**
  - Occasion field is a multi-select pill combo in `EditItemView` (was
    single-select), matching the add-flow.
  - Material Composition input is a searchable, typo-tolerant combobox
    (`MaterialCombobox`, fuse.js) instead of free text. Typed input
    force-matches to the nearest canonical material (`cottton`→`cotton`,
    `viscos`→`viscose`) — no more silent "custom value" fallback. Safe only
    because the canonical list (`MATERIAL_COLORS`, materialUtils.ts) was
    expanded first to cover every term FashionParser's own material map
    actually produces (merino wool, flannel, organza, scuba, tulle, twill,
    crepe, mesh, knit, crochet, terry, faux leather) — otherwise a real,
    already-correct imported value could get silently mangled.
  - Fixed a real material-inference regression (not part of this PR's
    original scope, caught by manual test): importing "Cotton Modal Tank
    Top" from email only picked up one material instead of splitting
    50/50 — `GmailImport`'s material resolver let a low-fidelity
    single-keyword guess win over the richer name-inferred blend.
  - Fixed a self-inflicted regression from earlier same-PR work: the
    perf/route-level-lazy-loading split (below) made `.edit-form` depend on
    the Add wizard's CSS chunk having loaded first, so editing an item
    without visiting Add first rendered a full-viewport-width, unpadded
    form. `.edit-form` is now fully self-contained.
  - "Dry clean" care pill now shows a dedicated dry-cleaning icon instead
    of a washing machine; added a distinct icon for "No fabric softener"
    (was falling through to a generic tag icon).
  - "Back to Email" button's arrow no longer rides only the first line
    when the label wraps to two — real icon, vertically centered against
    the full label.
  - `ProgressionTracker` decoupled from the Add wizard (`steps`/`id` now
    optional props) so it's reusable elsewhere without pulling in
    wizard-specific CSS.
- Pre-consent analytics buffer-and-flush (monitoring.ts) — queues events in
  memory while consent is undecided, replays on grant with original
  timestamps, discards on decline
- PWA update check on `visibilitychange` (src/lib/pwaUpdate.ts) — a
  backgrounded-then-reopened install now force-checks for a new build instead
  of waiting on a stray navigation
- PR #193 (fix/pwa-update-visibilitycheck): fixed a regression the above
  introduced — an update landing mid-session used to force-reload the page
  with no warning, which could've wiped an in-progress Gmail import queue.
  Now shows a Refresh banner instead; reload only happens on that click.
  Also: "What's changed" screen now actually fires (existing testers were
  silently baselining and would never have seen it), with shown/dismissed
  analytics so the keep-or-kill call is data-driven; real `pwa_installed`
  event on Chrome/Android install (was previously unanswerable — feeds
  directly into the still-open "PostHog funnel run-through" item below);
  `is_standalone` + both feature-flag states now on every event as
  super-properties; self-hosted fonts (removes a render-blocking Google
  Fonts `@import` that was ahead of `<meta charset>`, fixes the white PWA
  splash flash — distinct from the Day 3 post-sign-in white screen, still
  open below).
- Route-level code splitting (perf/route-level-lazy-loading): `React.lazy` on
  the 7 non-default views (form, gmail, fabric, journey, entireCloset,
  profile, edit) — Carousel/Closet stay eager since carousel is the initial
  view. Eager first-paint JS+CSS dropped from ~597 KB to ~281 KB gzipped
  (~53%). Biggest single contributor: `GmailImport` and its Google API client
  dependency were previously bundled eagerly even though only reachable from
  the Gmail view — now a 45 KB gzip chunk fetched only on navigation. One
  caveat found during the trace: `Fabric&Fiber.ts` (the 1,535-line care
  content file) stays anchored in the eager bundle regardless, since
  `materialUtils.ts` — used by the closet's own filter/sort hooks and card
  display — imports from it; lazy-loading the `fabric` view only shed
  `InteractiveGuide.tsx`/`WeaveDiagram.tsx` themselves, not that content file.
- Content split (Fabrics&Fibers folder): Split the monolithic
  `Fabric&Fiber.ts` (1,535 lines) into 6 focused modules by export type
  in `src/Content/Fabrics&Fibers/`. Follows the "many small files"
  principle (200-400 lines typical). Tree-shakes WEAVE_TYPES,
  STAIN_GUIDE, and SOURCES out of the eager bundle (~6 KB gzip savings);
  FIBERS stays eager (used by `materialUtils.resolveFiber` on the closet
  path), and CARE_GROUPS stays eager because it's shared between multiple
  lazy views (Rollup hoists shared deps). Win for maintainability
  (each file has one purpose) more than perf, but both matter.
