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

5. **Consistent post-add destination.** Multi-item email returns to the email
   preview; single-item dumps to the closet. Proposal: always return to the
   preview with the added item checked off, plus a persistent "Done — go to
   closet" button.
6. **Visited-email state.** Faded / checked treatment on emails already scanned,
   persisted per-user, so users can see where they left off in a search.
7. **Sticky scroll from email preview → detected-product cards on mobile.**
   Likely nested scroll containers fighting or the preview capturing touch.
   Needs on-device diagnosis.

## Smarter forms (conditional logic)

8. **Category-driven size options.** Shoes → 6, 6.5, 7…; pants → 24, 25, 26…;
   dresses → 0, 2, 4…; tops → XS–XXL. One `sizeScalesByCategory` map feeding a
   size control.
9. **Source-driven condition prompt.** eBay / Poshmark / ThredUp / Depop /
   Mercari → surface a condition field (NWT, excellent, good, fair). Skip for
   first-party retail (default: new).

## Care

10. **"Your Care" vs. the reference library.** Sharpen the two competing care
    stories — personalized care drawn from the user's real fabrics vs. the
    general reference. Needs a friendlier word than "encyclopedia": candidates —
    *Care Library*, *Care Basics*, *Fabric Guide*, *Look It Up*, *Care A–Z*.
11. **Stain removal guide, conditional-logic version.** Ask what the stain is,
    then route to the right chemistry:
    - **Enzymes** — break large biological molecules into smaller removable
      pieces (blood, grass, food, sweat)
    - **Surfactants** — lift oily soils and grease
    - **Solvents** — dissolve certain dyes, inks, and resinous residues

## Retention

**See [RETENTION_LOOP.md](../RETENTION_LOOP.md) for the full horizon spec**
(Day 0/2-3/7/14/30 + Rediscovery) — this section is just the sequencing for
what's left. Day 7 ("Your Fabrics") and the Profile echo have already
shipped; everything below is what remains, in dependency order.

12. ~~**`retentionLifecycle.ts` — keystone.**~~ Done 2026-08-06:
    `src/hooks/retentionLifecycle.ts` (pure) + `useRetentionLifecycle.ts`
    (localStorage persistence, key `ntw-retention-lifecycle`) — a
    `{ day0, day2_3, day14, day30 }` show-once map, generalized from
    `demoLifecycle.ts`'s pattern. `hasShown`/`markShown` per horizon.
13. ~~**`createdAt` on `ClothingItem`.**~~ Done 2026-08-06: added to
    `types.ts`; `supabaseClosetRepository.ts`'s `rowToItem()` now maps the
    already-existing `row.created_at` (was read then discarded);
    `localClosetRepository.ts`'s `add()` stamps it for local-only items,
    same pattern as `updatedAt`. No migration needed — the DB column
    already existed.
14. ~~**Day 0 — The Reveal.**~~ Done 2026-08-06 (branch `feat/retention-loop`):
    `src/Features/Reveal/` — `revealStats.ts` (piece/brand/value/date-range
    aggregation, flags `hasCompleteValue` when a price is missing so the UI
    can say "$X+" instead of presenting an undercount as fact),
    `RevealScreen.tsx` (full-screen one-time card, `WhatsChangedScreen.tsx`
    precedent), `useReveal.ts` (ties `retentionLifecycle` + stats
    together). Trigger: idle-based via new generic `useIdleTimer.ts`, wired
    into `GmailImport.tsx` (`onIdle` prop, 2.5 min, only armed once a search
    has actually returned results) — not the existing `import_finished`
    event, since that fires per session, not once ever. `reveal_shown`
    added to the `AnalyticsEvent` union. 33 new tests (idle timer,
    lifecycle, stats aggregation, screen rendering, integration). One real
    bug caught by a test during this build: `RevealScreen`'s date
    formatting used the browser's local timezone on a UTC midnight
    timestamp, silently shifting the displayed month back by one for
    anyone west of UTC — fixed by formatting in UTC explicitly.
15. **A shared bottom-sheet primitive.** None exists in the codebase today —
    needed by both Day 2–3 (Care Note) and Day 30 (Seasonal).
16. **Day 2–3 (Care Note), Day 14 (Quiet Addition), Day 30 (Seasonal +
    one-time hemisphere ask into `profiles.settings`, no migration
    needed).** See `RETENTION_LOOP.md`'s horizon table for copy/data per
    surface.
17. **Five missing analytics events** — `reveal_shown`, `care_note_shown`,
    `care_note_dismissed`, `care_note_actioned`, `hemisphere_prompt_answered`.
    Only `closet_fabrics_viewed` exists today.
18. **Email search date-range observability (P0, distinct from the
    Reveal).** `GmailImport.tsx`'s `emailDateRange` already computes
    oldest/newest email date across a search's results for the on-screen
    header — today it's transient, UI-only, never leaves the client. Send it
    to analytics (`{ oldestEmailDate, newestEmailDate, resultCount }` on
    search completion) — shows how far back into a user's inbox a search
    actually reaches, a proxy for how much history is even findable.
    Browser/OS needs no new code — PostHog's default autocapture already
    attaches `$browser`/`$os`/`$device_type` to every event.
19. **Profile-driven pill presets.** Guided setup for most-worn brands, common
    materials, common occasions. Those become the top-of-list pills everywhere,
    so mobile entry is tapping instead of typing. Directly reduces the free-text
    problem in (1).

    **Possible overlap, not resolved here:** item 14 (the Reveal) already
    surfaces piece count, brand count, and closet value at import time — a
    standalone "Day-7 closet data-viz card" (how many pieces, cost,
    category breakdown) that used to be its own item here may now be
    redundant with that. Flagging rather than silently dropping — worth a
    product call before building either.

## Search

20. **Collapse / rework Advanced Search.** Refactor and revise — currently too
    heavy for the MVP surface area.

## Quality & cross-browser

21. **E2E coverage for the critical flows.** Playwright is already installed and
    a PWA suite exists (`test:e2e:pwa`, port 4174). Missing: onboarding →
    sign-in → name → install, and the full Gmail import funnel end to end.
22. **Cross-browser pass.** Safari (desktop + iOS), Chrome, Firefox. Testers are
    disproportionately on iOS Safari, including versions below 16.4 — see
    the existing old-Safari CSS constraints (range-syntax media queries and
    `color-mix()` both need fallbacks).
23. ~~**Safari default UI cleanup.**~~ Promoted into launch and done
    2026-08-06 (PR #200): `appearance: none` + a matching `currentColor` SVG
    chevron added to all 6 `<select>` usages (`PurchasedField` month/year,
    `EditItemView` condition/status/location, `SearchSortBar` sort). Widened
    in the same pass to the same root problem in a different form — raw
    Unicode arrow/caret glyphs (▼▶▲↕←→), which render inconsistently across
    platforms just like native select chevrons — fixed in the Gmail
    skipped-items toggle, the Fiber Comparison sort caret, and
    `PaginationControls`'s prev/next buttons. Not touched: `<input
    type="date">`'s native picker chrome (3 usages) — a materially bigger
    lift than a CSS fix, and inline typographic arrows in prose/CTA text
    (e.g. "Open Your Fabrics →"), a different risk category since they
    render in the surrounding font rather than as an isolated control glyph.
24. **Emoji → Noun Project icons.** No emoji in the UI. Swap every one for an
    icon from the Noun Project library already licensed for this project.
    Needs: an inventory of current emoji use, a shared `<Icon>` component, and
    consistent sizing/color tokens so icons inherit theme like text does.

## PWA polish

25. **"What's new while you were away" screen.** On reopen, if
    `setupPwaUpdateCheck()` (src/lib/pwaUpdate.ts) picked up a fresh build since
    last session, show a small one-time card: 1–3 bullet points, plain language,
    no changelog dump. Needs a way to tag each release with its own short bullet
    list (probably a small JSON/markdown keyed by `APP_VERSION`) and a
    last-seen-version marker in localStorage to decide whether to show it.
26. **"Add to Home Screen" walkthrough animation.** Low-tech users likely don't
    know PWA install is a feature at all. A short animated explainer (share
    sheet → Add to Home Screen → icon appears) surfaced at the right moment —
    probably the existing `InstallStep` onboarding screen — rather than relying
    on static instructions.

## Performance & bundle optimization

27. **Defer Supabase realtime + storage from boot.** The eager `x` chunk
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

## Observability & database hardening (queued 2026-08-06)

Sourced from the [July 27 Observability & Launch-Readiness Audit](https://app.notion.com/p/3aae67b4d3ca817ab35cfe9797cb2679)
and its [July 31 Delta Check](https://app.notion.com/p/3afe67b4d3ca815fb464c6ddc09e1672),
plus the 2026-08-04 env/Supabase/Vercel isolation handoff.

**Verification discipline.** The July 27 audit's own failure mode was asserting
state it couldn't see ("assume not started" for Sentry — it was installed all
along, just consent-gated). So every item below is tagged with how it was
established. Items marked **[live 2026-08-06]** were re-checked this session
against the prod project (`rawuntspvetfdtrqggen`) via Supabase advisors /
`list_migrations` / `list_tables`, or via `vercel env ls`. Items marked
**[July 31, not re-verified]** are carried forward and should be re-confirmed
before anyone acts on them.

**Headline: the July 31 "Still Open" list is six days older and fully intact.**
Nothing in it has moved. Two new findings this session (items 40 and 41) came
out of the Vercel env check and were not in either audit.

### Blocking-ish — do before or alongside the next tester wave

36. **Two unapplied location migrations — one is a live bug on BOTH
    projects.** **[live 2026-08-06]** The audits framed this as a single
    dev→prod drift item. It is actually two separate migrations, and the
    second was in *neither* project and in no audit. The repo has 13
    migration files; prod has applied 11, dev 12.

    **36a — `20260707000002_locations_client_kinds` (dev only, not prod).**
    The drift the July 20/27/31 audits each flagged, now ~30 days old. It
    rewrites `locations.kind`'s CHECK from the v1-spine vocabulary
    (`primary_residence`/`secondary_residence`/`storage_unit`/`traveling`/
    `other`) to the client's (`home`/`storage`/`suitcase`/`other`). Verified
    live: dev's CHECK is the new vocabulary, **prod's is still the old
    one**. Meanwhile `locationSync.ts:79` seeds starter rows using the
    *client* kinds. So on prod, seeding a user's starter locations violates
    the CHECK for 3 of the 4 rows (`home`, `storage`, `suitcase`); only
    `other` satisfies it. Path in: `supabaseClosetRepository.resolveLocations()`
    → `ensureUserLocations()`, hit when an item is saved with a location.

    **36b — `20260708000001_locations_is_primary` (applied to NEITHER).**
    New finding, in no prior audit. Adds `locations.is_primary` plus a
    partial unique index. Verified live: the column is absent from prod
    *and* dev. But `locationsRepository.ts` already queries it in
    production code — `listLocations()` does
    `.select("id, label, kind, is_primary")` (line 35), `addLocation()`
    inserts `is_primary: false`, and `setPrimary()` updates it. Every one
    of those fails with a PostgREST undefined-column error today.

    **Why this is live and not gated.** `showStatusLocation()` only gates
    *UI rendering*. It does not gate the data path. `LocationsProvider`
    wraps the app unconditionally (`App.tsx:377`) → `useLocationsStore`
    fires `refresh()` on mount for any signed-in user → `listLocations()`
    → the failing query. Confirmed the flag is off in both Vercel
    environments (`VITE_SHOW_STATUS_LOCATION` does not appear in
    `vercel env ls` at all, and `features.ts:20` requires the literal
    string `"true"`), and it makes no difference to this path.

    **Blast radius is real but quiet.** `useLocationsStore` catches the
    throw into `error` state rather than crashing, and `getLocation()`
    falls back to the hardcoded `PRIMARY_LOCATION`, so the UI degrades
    silently instead of breaking visibly. That is exactly why nobody
    noticed. Net effect today: every signed-in user fires a guaranteed-
    failing query on every app mount, and `primaryLocation` is `undefined`
    for all of them.

    **This is the `feedback`-table failure mode a third time** — a
    well-formed migration sitting in the repo, never applied, with live
    code calling against it. Worth fixing the *process* (a CI check that
    diffs `supabase/migrations/` against both projects' applied lists)
    alongside the migrations themselves, or this recurs.

    **Sequencing note:** apply 36a before 36b. 36b's backfill promotes each
    user's `kind = 'home'` row to primary, and on prod no row can be
    `'home'` until 36a's CHECK is in place.

    Unrelated but adjacent, for anyone chasing the original question:
    **`createdAt` needs no migration** — `items.created_at` already exists
    in prod and is mapped both directions (see item 13).
37. **Error tracking is installed but the picture is incomplete.** **[July 31,
    not re-verified]** Sentry starts unconditionally on app load as of the
    July 31 window (`src/main.tsx`), independent of analytics consent — so a
    repeat of the July 25 incident would now be visible. What's still absent
    is anything watching from *outside* the app: see items 38 and 39.
38. **Uptime / synthetic monitor on the prod URL + login flow.** **[July 31,
    not re-verified]** Still not started. This plus item 37 is what would
    have caught the `lventer06@gmail.com` case (item 42) at the time rather
    than in a manual audit weeks later.
39. **Automate the §7 nightly integrity check.** **[live 2026-08-06 —
    partially blocked]** The July 27 audit's secondary finding was that the
    audit itself went dark for a week and a live user-facing bug sat
    undetected the whole time. The check wants both queries from that audit's
    §7 addendum — orphaned profiles, and the higher-severity "orphaned *and*
    signed back in" variant.

    **Tooling gap found this session:** the `auth.users` join query is
    blocked by the Claude Code permission classifier, so it could not be run
    from this session at all. That means the July 31 doc's "current orphan
    count in prod: 0" is **carried forward, not independently confirmed
    today**. Whatever automates this needs to run somewhere with real
    credentials — a Supabase scheduled function or a CI job — not from an
    agent session.

### New this session — found via `vercel env ls`

40. **`VITE_POSTHOG_HOS` is a truncated variable name.** **[live 2026-08-06]**
    Vercel has `VITE_POSTHOG_HOS` (Preview + Production, set 28d ago). The
    code reads `VITE_POSTHOG_HOST` (`src/lib/monitoring.ts:90`,
    `src/vite-env.d.ts:13`). The configured value has therefore never been
    applied — PostHog has silently used the `https://us.i.posthog.com`
    fallback since it was set. Not necessarily breaking (the fallback is the
    normal US host), but nobody has been getting the host they configured.
    Fix: add `VITE_POSTHOG_HOST` correctly, confirm ingestion still works,
    then remove the typo'd var. **Do not** narrow it with
    `vercel env rm NAME <env>` — per the 2026-08-04 handoff that command
    ignores the environment argument and deletes from all environments.
41. **Sentry + PostHog are single vars shared across Preview and Production.**
    **[live 2026-08-06]** `VITE_SENTRY_DSN` and `VITE_POSTHOG_KEY` each
    appear on one row reading `Preview, Production` — the same shape that was
    wrong for the Supabase vars and got split on 2026-08-04. Consequence:
    every PR-preview session writes errors and product analytics into the
    same Sentry project and PostHog instance as real beta users. Beta funnel
    numbers will include your own preview testing. Split them the same way
    the Supabase vars were (dashboard: edit → uncheck environment), or at
    minimum set a distinguishing `environment` tag so preview traffic can be
    filtered out after the fact.

### Carried forward — verify before acting

42. **`lventer06@gmail.com` never reached Supabase.** **[July 31, not
    re-verified]** Attempted signup 2026-07-20, no `auth.users` row in
    *either* project — so the flow failed before it ever hit the backend.
    Google's OAuth test-user allowlist was checked and does not explain it
    (both known testers are on it). Leading unverified theory: an OAuth
    redirect issue specific to signing in from an installed PWA on a phone
    home screen. Not independently diagnosable until items 37–38 exist; this
    case is the concrete justification for both, not a separate mystery.
43. **Three anon-callable `SECURITY DEFINER` functions.** **[live 2026-08-06]**
    `handle_new_user`, `is_closet_member`, `rls_auto_enable` — all still
    callable by both `anon` and `authenticated` via `/rest/v1/rpc/…`.
    Unchanged since July 18.

    **Explicitly not in scope: `ensure_user_bootstrap`.** It now also appears
    in this lint family (`authenticated_security_definer_function_executable`,
    new since the July 27 audit). That is **expected and by design** — per
    the July 31 delta it's scoped to `auth.uid()`, can never be called for
    another user's id, and has `anon` revoked. Recorded here so a future
    hardening pass doesn't "fix" it and break sign-in self-repair.
44. **Three functions with mutable `search_path`.** **[live 2026-08-06]**
    `set_updated_at`, `apply_sentimental_defaults`, `refresh_wear_rollup`.
    Unchanged.
45. **Leaked-password protection disabled.** **[live 2026-08-06]** Still off.
    Worth noting this is close to moot in practice — the app is
    Google-OAuth-only, no email/password path exists — so it's a
    clean-advisor-dashboard item, not a real exposure. Deprioritize
    accordingly rather than treating it as a peer of 43/44.
46. **`product_enrichment_cache` — RLS enabled, zero policies.** **[live
    2026-08-06]** Table still empty. Effect today is that nothing can read or
    write it under RLS. Needs a decided intent (service-role-only? drop the
    table?) written down, not just a policy bolted on.
47. **`import_jobs` table does not exist.** **[live 2026-08-06]** Confirmed
    absent from `list_tables`. Was specced alongside `items.import_job_id`
    for import observability. Overlaps with item 18's email-search
    date-range telemetry — decide whether client-side analytics covers the
    need before building a table for it.
48. **Three unindexed foreign keys.** **[live 2026-08-06]**
    `closets.created_by`, `wear_events.occasion_tag_id`,
    `wear_events.photo_id`. Pre-traffic, so not urgent.
49. **RLS init-plan re-evaluation lints — now 9, not 7.** **[live
    2026-08-06]** The July 27 audit recorded 7; today's advisor reports 9.
    The two new ones are `feedback_insert_own` / `feedback_select_own`,
    added when the `feedback` migration finally landed. Mechanical fix
    (`auth.<fn>()` → `(select auth.<fn>())`) across `profiles`, `closets`,
    `closet_members`, `locations`, `feedback`. Do not copy "identical 7"
    forward again.
50. **Unused indexes — baseline only.** **[live 2026-08-06]** Six now
    (`enrichment_cache_retailer_idx`, `items_location_idx`,
    `item_tags_tag_idx`, `wear_events_item_idx`, plus `feedback_user_id_idx`
    and `feedback_created_at_idx`). Expected on pre-traffic tables. Re-check
    after real beta usage; do not remove anything now.
51. **Build the §3 journey events for the 5 P0 flows.** **[July 31, not
    re-verified]** Per the July 18 spec. Overlaps directly with item 17's
    five missing retention events — do them as one pass, working from the
    July 18 event taxonomy as the source of truth.
52. **Put the audit itself on a schedule.** **[live 2026-08-06]** The July 27
    audit's own recommendation. There is a `nightly-audit` skill in this repo
    already; it just isn't scheduled. Five-minute cron. Not beta-blocking,
    but the last gap cost a week of blindness.

### Verified healthy — no action, recorded so it isn't re-litigated

- **Supabase env isolation held.** **[live 2026-08-06]** `vercel env ls`
  shows `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` each on **two
  separate rows** (one Preview, one Production), exactly the shape the
  2026-08-04 handoff prescribed. Previews no longer read or write the live
  beta database.
- **The `feedback` table fix held.** **[live 2026-08-06]** Present in prod
  with RLS enabled and 2 policies. It had been silently missing for 15 days
  while `feedbackService.ts` wrote into the void; that is genuinely closed.
- **`createdAt` needs no migration.** **[live 2026-08-06]** `items.created_at`
  (timestamptz, defaults `now()`) exists in prod and is mapped in both
  repositories. See item 13.

### Open questions this session could not answer

- **Does the dev Supabase project have its own Google OAuth client, or share
  prod's?** Partial answer found: `VITE_GOOGLE_CLIENT_ID` is a **single
  Vercel var scoped `Production, Preview`** — so the *frontend* uses one
  Google client across both environments. What that does **not** settle is
  whether the dev Supabase project's own Auth → Providers → Google config
  points at that same client. Needs the dev dashboard; not exposed through
  the Supabase MCP tools.
- **Is `localhost:5173` in the dev project's Redirect URLs?** Not reachable
  from the available tooling — check Authentication → URL Configuration in
  the dev dashboard directly. Do not infer it from the prod Site URL fix
  described in the July 31 delta; that was a separate project.

---

## Accessibility — deferred from the 2026-08-04 screen-reader pass

Fixed in that pass (not backlog, listed for context): carousel `alt` was the
raw data-URI, filter panel controls stayed tabbable while closed, combobox
panels dropped focus to `<body>` on close, `PillComboField`'s orphan `<label>`,
missing `aria-current="step"` on the Add wizard, `scope="col"` on the legal
tables. **Not** verified with a real screen reader — see V2-MVP.md item.

28. **Carousel category cards are keyboard-unreachable.** `Carousel.tsx:51-75`
    renders each card as a `motion.div` with `onClick` — no role, no tabIndex,
    no key handler. There is already a TODO on line 50 saying they should be
    buttons. Keyboard and screen-reader users cannot pick a category from the
    home view at all; the only route to a filtered list is the Search tab.
    Deferred from the 2026-08-04 pass because converting to `motion.button`
    collides with the repo's global button CSS and needed more regression
    surface than 2 days from launch allowed.
29. **Add-wizard step tabs are click-only.** Same shape: `ProgressionTracker`
    renders `<li onClick>`. `aria-current="step"` now announces *which* step
    you're on, but you still can't jump between steps by keyboard. Lower
    severity than 28 — Next/Back buttons work — so this is polish.
30. **No focus management on modals.** `Components/Modal/Modal.tsx` sets
    `role="dialog"` + `aria-modal="true"` and closes on Escape, but never moves
    focus into the dialog, never traps Tab inside it, and never restores focus
    to the trigger on close. Because `aria-modal="true"` tells a screen reader
    to ignore everything outside the dialog, focus sitting outside it is worse
    than the attribute being absent. Affects every consumer
    (`AccountDataModal`, discard-confirm, etc.). Wants a shared
    `useFocusTrap` hook rather than per-modal patches.
31. **View switches are silent and don't move focus.** No router, so
    `document.title` never changes and `document.activeElement` stays `<body>`
    across a view change — verified live on 2026-08-04. A screen-reader user
    tapping Search or Profile gets no signal anything happened. Cheap fix: a
    visually-hidden `role="status"` announcing the new view, plus focusing that
    view's heading. Also worth a real `<main>` landmark — the app currently
    exposes `header` and two `nav`s and no main.
32. **No automated a11y coverage.** Deliberately did not add
    `@axe-core/playwright` two days from launch. Worth adding after: it would
    have caught the `alt` and aria-hidden-focus bugs above, though not the
    focus-management ones.

## Navigation — tab-label↔view naming (2026-08-05)

From `planning/audits/July29.html`'s "Label↔view mismatches ('Closet'→carousel)
untouched" note. Every bottom-nav tab has a *third* name in the hamburger
drawer too, and none of the three (nav label / drawer label / internal
`ViewType` string) fully agree:

| Nav tab | Internal `ViewType` | Drawer label (now) |
|---|---|---|
| Closet | `carousel` | "Back to Carousel" |
| Care | `fabric` | "Care Guide" (was "Fabric Guide") |
| Search | `entireCloset` | "Search" (was "View All") |
| Email | `gmail` | "Import Gmail" |

**Fixed 2026-08-05 — cosmetic only:** drawer labels for Care/Search now match
their nav tab ("Care Guide", "Search"), decided with the user (Closet/Email
kept as-is; Care/Search were "open to suggestions" — scissors→Care and the
real search+filter UI inside the view were the deciding factors).

33. **Full internal rename, deferred.** `ViewType`'s `fabric`→`care` and
    `entireCloset`→`search` were explicitly *not* renamed — touches
    `App.tsx`, `ViewContext.tsx`, `types.ts`, `NavBar.tsx`, `BottomNav.tsx`,
    `CardDetails.tsx`, `FabricProfileCard.tsx` (fabric only) plus every test
    asserting those strings. Invisible to users (they never see `ViewType`
    literals), so deferred as a correctness-not-urgency item — do it in a
    quiet week, not 2 days from launch.
34. **`carousel`/`overview` are two different views for one nav tab.** The
    "Closet" tab lands on `carousel` (the category-picker hero); tapping a
    category switches to `overview` (the actual item grid, `<Closet>`).
    Neither name is user-facing, so not urgent, but worth folding into the
    item 33 rename rather than doing twice.
35. **`GmailImport.tsx:427` header typo** — "Import from Gmail!!" (stray
    double exclamation mark). One-character fix, noticed in passing during
    the nav-label audit, not yet applied.

## Added after launch

_(append new scope-creep ideas here with a date)_
