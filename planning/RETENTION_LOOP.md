# Retention Loop — Strategy

**Status (updated 2026-08-06):** Day 7 and the Profile echo have shipped; Day
0/2-3/14/30 have not. See [POST_BETA_BACKLOG.md](launch/POST_BETA_BACKLOG.md)'s
"Retention" section for what's left and in what order.
**Owner:** Growth/Product + Design
**Related:** [E8-care-knowledge.md](epics/E8-care-knowledge.md) · [E11-laundry-forecasting.md](epics/E11-laundry-forecasting.md) · [E12-user-profile.md](epics/E12-user-profile.md)

---

## What's shipped vs. what's still the plan

The horizon table below is still the accurate spec for the whole loop — Day 0
through Day 30 — but two rows are already built and the table doesn't say so.
Read "✅ Ready" in the data-readiness table as "the data existed," not "the
surface shipped."

- **Day 7 ("Care becomes the habit surface") — shipped 2026-07-31.**
  `useClosetFabrics.ts` (the data layer), `YourFabrics.tsx` (the personalized
  card grid), and `InteractiveGuide.tsx`'s tab toggle (defaults to *Your
  Fabrics* once `resolvableCount >= 3`, falls back to the encyclopedia
  otherwise) are all live.
- **Profile echo — shipped, and shipped differently than this doc's mockup
  describes.** `FabricProfileCard.tsx` is a secondary discovery path to Day
  7, not a horizon of its own, but it's the one piece of this loop with a
  finished design artifact
  ([retention-combined.html](design/mockups/retention-combined.html)) — worth
  flagging the divergence: the mockup shows stacked horizontal bars with raw
  per-material counts ("Wool 11", "Cotton 38"); the shipped version is a
  donut grouped by fiber category (`groupFabricsByCategory.ts` — natural
  animal / natural plant / semi-synthetic / synthetic / other), matching
  fiber-category percentages rather than raw material counts. Not a bug, a
  deliberate product call made when it was built — just correcting this doc
  so it stops contradicting the code.
- **Day 0, Day 2–3, Day 14, Day 30 — none built.** No `retentionLifecycle.ts`
  scheduler exists, so none of these have a trigger even if the surface
  itself were built. See "The loop" below (unchanged) for the spec, and
  `POST_BETA_BACKLOG.md` for sequencing.

---

## The problem

Import is the peak moment. A tester connects Gmail, watches a closet build itself, and leaves with one clear story: *"it inventoried my closet from my inbox."* Then the app goes quiet. Nothing about the product today gives someone a reason to open it again on Day 3, Day 7, or Day 30.

The brand is calm and editorial — terracotta, Lora headers, a photograph behind everything. Streaks, badges, and progress bars are off the table by taste and by precedent: the one show-once prompt already in the codebase (`src/hooks/demoLifecycle.ts`) states the house rule in its own doc comment — *"No confetti, no streaks — a small hanger mark and one sentence."*

**The return has to come from usefulness, not from gamification.**

## The story problem hiding inside the retention problem

Today the app tells three unrelated stories:
1. **Import** — "it built my closet from my inbox." Real, fast, lands in 15 minutes.
2. **Search** — a working inventory of what's owned.
3. **Care** — a 1,529-line fabric-and-fiber encyclopedia (`src/Content/Fabric&Fiber.ts`) rendered by `InteractiveGuide.tsx`, which takes **zero props** and never once calls `useCloset()`. It's a textbook on merino wool, not a treatment of *her* clothes.

Personalizing Care isn't an unrelated fourth feature bolted on for retention — it's the fix that makes the product tell **one** story: *your closet, known.* It also happens to be the only retention lever that's fully buildable with data the app already has.

---

## What today's data can answer

| Capability | Status | Why |
|---|---|---|
| Material → care content | ✅ Ready | `resolveFiber()` (`src/utils/materialUtils.ts:210`) and `MATERIAL_TO_CARE_GROUP` / `inferCareFromMaterial()` (`src/Features/FashionParser/inference/inferCare.ts`) already map an item's material to real `CARE_GROUPS` content. No new content to author. |
| Counts, brands, value | ✅ Ready | `closet` array (brand, price, category) is fully in scope at the import queue's drain point. |
| "Added N days ago" | ⚠️ Needs one field | `ClothingItem` has no `createdAt`. The DB column `items.created_at` already exists — this is a type + repository-mapping change, not a migration. |
| "You haven't worn 40% of this" | ❌ Blocked | `wear_events` + a working rollup trigger exist server-side, but no client code ever writes a wear event. Every item's `wornCount` is `undefined` today. This is [E11](epics/E11-laundry-forecasting.md)'s job, not this phase's. |
| Push notification on Day 3 | ❌ No infra | VitePWA runs in `generateSW` mode, which cannot host `push`/`notificationclick` handlers. No transactional email exists either. See "On push" below. |

---

## The loop

Delivery is **in-app, on open, once** — the `demoLifecycle.ts` show-once pattern, generalized. Nothing pushes to a closed app in this phase.

| Horizon | Surface | Copy example | Data |
|---|---|---|---|
| **Day 0** | **The Reveal.** Trigger decided 2026-08-06: **idle/time-based** — no interaction on the Gmail import screen for N minutes (proposed 2–3, tune after real usage) — not the existing `import_finished` event alone, since that fires once per import session and doesn't mean she's actually done browsing. Copy also includes the date range of imported items (free from `ClothingItem.purchaseDate`, already stored per item) — e.g. *"You've imported 142 items from June 2026 to May 2024"* — with room to hint she may have more importable history if the range doesn't reach far back. Requires `retentionLifecycle.ts` (below) so it only ever fires once. | *"142 pieces. 11 brands. Tracked."* | ✅ |
| **Day 2–3** | **The Care Note.** One sentence pulled from her own materials. Expands in place; a "View full Care guide" link at the bottom leads to the encyclopedia for anyone who wants it. | *"You own 11 wool pieces. Three shouldn't go in the dryer."* | ✅ |
| **Day 7** | **Care becomes the habit surface.** Opens on *Your Fabrics* — her materials, ranked by how much of her closet they cover — with the encyclopedia demoted to a second tab. | — | ✅ |
| **Day 14** | **The Quiet Addition.** A single line acknowledging growth since import. | *"6 pieces joined since you imported."* | ⚠️ `createdAt` |
| **Day 30** | **Seasonal resurfacing.** Uses `item.style?.season` (`inferSeason.ts`) plus a one-time hemisphere answer. | *"It's cooling off — here are your 8 coats."* | ⚠️ `createdAt` + hemisphere |
| *(later, not this phase)* | **Rediscovery.** *"You haven't worn 40% of this."* Depends entirely on E11's wear-log write path. | — | ❌ |

### Milestones worth calling out (counts, never streaks)
First import complete · closet passes 50 / 100 / 250 pieces · first brand with 5+ pieces owned · first complete material profile (every item has a resolvable fiber) · one season observed since import.

---

## On seasonal resurfacing's location signal

No weather API, no background geolocation. Both are out of character for an app that already goes out of its way not to over-ask (it currently over-scopes Gmail read access at sign-in and that's flagged as a bug to fix, not a pattern to repeat — see internal note `signin-consent-gmail-scope-claim`). `inferSeason.ts` only ever needs to know **hemisphere** — it outputs `spring/summer/fall/winter`, not a temperature.

- **Ask once.** A single hemisphere question (Northern / Southern), either folded into onboarding or surfaced the first time seasonal resurfacing would otherwise fire.
- **Store it in `profiles.settings` (Json)** — that column already exists (`src/lib/database.types.ts:440`), so this needs zero migration.
- **Follow-on, not this phase:** a real climate/weather API for temperature-accurate resurfacing (not just a hemisphere-flipped season label), once the coarse version proves the loop is worth the precision.

---

## On push notifications

The app cannot push to a closed browser or backgrounded PWA today. That's not a gap in this plan — it's the honest state of the infra:

- VitePWA is configured in `generateSW` mode (`vite.config.ts`), which precaches the app shell but cannot register `push` or `notificationclick` service-worker handlers.
- There's no `push_subscriptions` table, no server-side sender, no scheduler.
- iOS Safari only allows web push to an **installed** (Add to Home Screen) PWA — a real constraint even after the infra exists.

**Real push would require, as a separate decision:** switching VitePWA to `injectManifest` with a hand-written service worker, a `push_subscriptions` table + permission-prompt UX, and a scheduled sender (cron or edge function) to actually fire the Day-3/7/14/30 nudges when the app is closed. None of that is built in this phase. Everything above ships as in-app-only and still works for anyone who opens the app during that window — it just can't reach for them.

---

## Analytics

`track()` (`src/lib/analytics.ts`) uses a closed TypeScript union — new events require editing it. Events to add for this loop:

- `reveal_shown`
- `care_note_shown`
- `care_note_dismissed`
- `care_note_actioned`
- `closet_fabrics_viewed`
- `hemisphere_prompt_answered`

---

## What shipped from the original "this phase" scope

Historical note — this is what the original Phase 1 scope actually produced,
not a forward-looking plan anymore:

1. This document.
2. ~~Two static design directions (`retention-option-a.html`, `-b.html`)~~ —
   these never got built as two separate files; the actual artifact is the
   single combined mockup, [retention-combined.html](design/mockups/retention-combined.html)
   (Reveal, Care Note, Day 7, Seasonal, Profile echo, all in one file).
3. A brand token update: `--primitive-brand-rose-terracotta` repointed to `#8f6256`.

`createdAt` plumbing, the Reveal's idle-trigger + insertion point,
`useClosetFabrics.ts`, and `retentionLifecycle.ts` were the "build phase"
items called out here — `useClosetFabrics.ts` has since shipped (Day 7,
above); the rest are sequenced in `POST_BETA_BACKLOG.md`.


feat: retention keystone — retentionLifecycle scheduler, createdAt, Day 0 Reveal

- retentionLifecycle.ts + useRetentionLifecycle.ts: generalizes
  demoLifecycle.ts's show-once pattern into a { day0, day2_3, day14, day30 }
  persisted map, so every retention horizon shares one scheduler instead of
  reinventing show-once bookkeeping
- createdAt on ClothingItem: DB column already existed and was read then
  discarded (supabaseClosetRepository.rowToItem) -- now mapped through;
  localClosetRepository.add() stamps it for local-only items, same pattern
  as updatedAt. No migration needed.
- Day 0 Reveal: full-screen one-time card (WhatsChangedScreen precedent)
  showing piece count, brand count, closet value (flags incomplete totals
  with '+' rather than presenting an undercount as exact), and the imported
  date range. Trigger is idle-based via a new generic useIdleTimer hook,
  wired into GmailImport (2.5 min idle, only armed after a search actually
  returns results) rather than the existing import_finished event, which
  fires once per session rather than once ever.
- fix: FabricProfileCard used fabrics.length instead of resolvableCount,
  contradicting its own 'same rule as Care tab' doc comment (regression
  test included, confirmed failing on the old code)
- 33 new tests across retentionLifecycle, useIdleTimer, revealStats,
  RevealScreen, and the useReveal integration hook
- fix: RevealScreen's date-range formatting used the browser's local
  timezone on a UTC midnight timestamp, silently shifting the displayed
  month back one for anyone west of UTC -- caught by a test, fixed by
  formatting in UTC
- docs: mark backlog items 12-14 done in POST_BETA_BACKLOG.md



fix: Reveal trigger — replace blind 2.5min idle with navigate-away + short idle fallback

The original idle-only trigger never fired in testing: GmailImport only
mounts once signed in and once a search has results, so 2.5 minutes of
total silence was both slow to verify and rarely reached in practice.

- Primary trigger, instant: fires the moment she lands on a top-level tab
  (Closet/Care/Search/Profile) having imported something this Gmail
  session. Tracked via hasImportedThisGmailSession, set in
  handleGmailImport/handleGmailImportAll in App.tsx.
- Fallback trigger, 10s (down from 2.5min): still lives in GmailImport
  itself, now gated on hasImported and not hasNextPage -- only arms once
  something's been imported AND there's nothing left to page through, so a
  short pause is a real done signal instead of a blind guess.
- Renamed GmailImport's onIdle prop to onDone and useReveal's handleIdle to
  handleTrigger, since neither is purely idle-driven anymore.
Caught a real bug building the primary trigger, not just by inspection --
by a test. First pass checked previousView === gmail, but the actual
single-item-import flow is gmail -> edit -> (later) carousel, since
importing routes straight to the edit form. By the time she navigates to a
top-level tab, previousView is edit, not gmail -- that check would never
have fired in the realistic case. Fixed to fire on any transition into a
top-level view from any non-top-level one (edit, form, gmail, journey),
which covers the real flow without also firing for someone bouncing
between top-level tabs who never touched Gmail.

Added 8 new tests: 3 end-to-end through the real App (primary trigger,
including the only-fires-once and no-import-no-reveal cases), 5 isolated
on GmailImport's idle-fallback gating. tsc -b --noEmit clean, full suite
1707 passing.