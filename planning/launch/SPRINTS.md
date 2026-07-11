# Sprints — 2-Day Sprint Sequencing

> **Date:** 2026-06-20 · **Updated:** 2026-07-11 · **Audience:** personal build plan. Index of epics: [README.md](../epics/README.md).
> Each sprint ≈ **2 ideal dev-days**. Calendar time will run longer — treat the sprint _number_ as
> sequence, not a calendar promise. Tickets reference epic files (e.g. `E2-1.3`).
> Now part of the launch package — see [planning/launch/README.md](./README.md) for the launch overview.

---

## 🚀 LAUNCH MODE (2026-06-30, revised 2026-07-11) — see [LAUNCH_ROADMAP](./LAUNCH_ROADMAP_2026-06-29.md) + [July update](./LAUNCH_ROADMAP_July_update.md)

> ✅ **Block 0 COMPLETE (2026-06-30)** — All three gates verified:
> - G0.1 Gmail import: live end-to-end (Google OAuth + parsing)
> - G0.2 RLS isolation: 11/11 checks pass (user B blocked from user A's data)
> - G0.3 Cloud sync: round-trip verified (item on device A appears on device B)
> - **Critical fix:** Postgres GRANT bug (zero table privileges) discovered and fixed.
>
> ✅ **Block A (security/privacy) COMPLETE (2026-07-06/07, PR #115–#117, #128–#129)** — dev/prod Supabase
> split, account deletion + data export, base64→Storage write-guard, secret hygiene, logging hygiene,
> Sentry+PostHog. Only the privacy policy itself (`E1-4.13`) remains open, now unblocked and in progress.
>
> ✅ **Block B (inventory spine) MOSTLY DONE** — status/location core (border toggle, edit-form, quick
> actions, state machine, a11y legend) shipped PR #112, #122–#126. Open: grouped "where is everything"
> view, multi-home locations, status+location filters, status-reason model v2 — see
> [E2-part-une-inventory-truth-status-location.md](epics/E2-part-une-inventory-truth-status-location.md).
>
> ✅ **Block C (mobile + full PWA) COMPLETE (2026-07-09/10, PR #130–#135)** — touch targets, bottom nav +
> FAB, PWA manifest + service worker, offline shell, Lighthouse audit (55/96/100/92).
>
> **The 8-item order below is the BACKLOG sequence. For the next ~6–8 weeks it is SUPERSEDED by the
> launch roadmap**, which reorders around shipping a safe beta to the 30-person waitlist:
> **✅ Block 0 (done) → ✅ A (done) → B (inventory spine — mostly done, filters/multi-home open) → ✅ C (done) → 🚀 launch (privacy policy is now the critical path, then Gmail test-user mode).**
> Lending social loop (E4) and Hotmail/Yahoo import (E1-5/6) are explicitly **post-MVP** — user's stated
> next priorities, in that order. E4's first slice (view-a-friend's-closet) and the E12 profile hub are
> now **designed** (PR #136–#138) but not scheduled/built. Resume the backlog order below after launch.

---

## 🔢 Backlog priority order (set by user, updated 2026-06-24 — 8-item)

Canonical *post-launch* sequence. Supersedes both the earlier _E2-before-E1_ plan **and** the interim 6-item order. **E2 Inventory Truth is back in, at #4.**

1. **Hotfixes** — Sprint 3.5 (E0/E3/E5 user-feedback bugs + polish)
2. **Database / full-stack** — E1 (Supabase + RLS + service-layer port). **Run the E3 US-3.2 web-enrichment feasibility spike _inside_ this sprint** (server-side anyway) — if Cloudflare is beatable, full web-enrichment slots at #2.5/#3; if it 403-stalls, it waits and mobile keeps #3.
3. **Mobile PWA** — E5 (installable, touch, bottom nav, offline shell)
4. **Inventory Truth** — E2 (location, status, availability, taxonomy season/occasion/vibe, photos, provenance, fit/measurements)
5. **User Profile** — E12 (functional vs. social split; machine/lifestyle; body measurements → "fits me")
6. **Laundry** — E11 (wear tracking + forecast + weight/volume; consumes E12 machine/lifestyle)
7. **Sharing / lending / social** — E4 (needs E1 RLS + E12 profile + privacy model)
8. **Care & Knowledge** — E8 (deeper stain/care content + education UI/UX overhaul)

> **E3 Frictionless Fill is ongoing/cross-cutting** (now ⭐ the differentiator) — import fixes ship in Sprint 3.5; web-enrichment spike rides in #2; Microsoft Graph + Chrome extension layer on after E1.
> **Note the dependency:** E11 (#6) consumes E12 (#5) machine/lifestyle, and its clean/dirty `status` + `wornCount` are shared with E2 (#4) — build E2's status field as E11's enum, one canonical definition.

---

## Roadmap of blocks

| Order           | Epic                                           | Outcome                                                                |
| --------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| ✅ done         | **E0 · Trustworthy Core**                      | green suite, core bugs fixed, types tightened                          |
| ✅ done         | **Security + Backend Foundation**              | localStorage purge (#76/#78), Phase 0 scaffold, Supabase + Azure setup |
| ✅ done         | **Sprint 3.5 · Hotfixes**                      | re-auth bug, import/form UX, mobile + branding polish                  |
| 2               | **E1 · Cloud Backend** (+ E3 web-enrich spike) | Supabase + RLS + service-layer port + image storage; Cloudflare spike  |
| 3               | **E5 · Mobile & PWA**                          | installable, touch-friendly, bottom nav, offline                       |
| 4               | **E2 · Inventory Truth** ⭐                    | location, status, availability, taxonomy, photos, provenance, fit      |
| 5               | **E12 · User Profile**                         | functional vs. social; machine/lifestyle; body measurements            |
| 6               | **E11 · Laundry & Wear** ⭐                    | "I wore this" + forecast + weight/volume (consumes E12)                |
| 7               | **E4 · Shared & Social** ⭐                    | sharing + privacy (intimates private) + borrowing (needs E1 RLS + E12) |
| 8               | **E8 · Care & Knowledge**                      | deeper stain/care content + education UI/UX overhaul                   |
| ongoing         | **E3 · Frictionless Fill** ⭐                  | email import, web-enrich, pill-tags, Chrome ext — the moat             |
| later           | E6 / E7 / E9 / E10                             | expand when scheduled                                                  |

---

## Detailed sprints

### Block A — E0 Trustworthy Core ✅ DONE

- **Sprint 1 — Green base + filter fix:** `E0-1.1` strip logs · `E0-1.2` green suite · `E0-2.1`/`E0-2.2` material filter + test · `E0-5.2` title-case CAPS ✅
- **Sprint 2 — Remove-rerender + honest dates:** `E0-3.1` route removal via `ClosetContext` · `E0-3.2` test · `E0-4.1` MonthYearPicker commit · `E0-4.2` test ✅
- **Sprint 3 — Import guard + typing:** `E0-5.1` skip-no-category + test · `E0-6.1` tighten `ClothingItem` typing ✅
     > _DoD:_ suite green, four bugs fixed w/ regression tests, typing tightened. ✅

---

### Interlude — Security + Backend Foundation ✅ DONE (2026-06-24)

Completed between Block A and B:

- ✅ **PR #76 / PR #78** — localStorage security purge: `gmail_auth_token` + caches removed from localStorage; purge runs on every app mount in `App.tsx`. On `main`.
- ✅ **Phase 0 monorepo scaffold** — npm workspaces · `@ntw/types` package · `src/services/closetRepository.ts` interface · `src/services/localClosetRepository.ts` impl · 10 unit tests green.
- ✅ **Supabase project** — `rawuntspvetfdtrqggen.supabase.co` · anon + secret keys in `.env` · Google + Azure OAuth providers enabled.
- ✅ **Azure App Registration** — Entra ID tenant under `ariannacodes@gmail.com` · `AZURE_TENANT_ID/CLIENT_ID/CLIENT_SECRET` in `.env` · Microsoft Graph `Mail.Read` + `offline_access` permissions · SPA redirect URI registered.
- ✅ **Gmail OAuth spike** (`E1-1.1`, 2026-06-30) — verified live. Google OAuth sign-in + email import + parsing works end-to-end. Supabase-mediated flow succeeds where standalone spike had issues. `GmailSpike.tsx` can be cleaned up post-launch.
- ✅ **`ENGINEERING_BRIEF_2026-06-23.md` reconciled** — Firebase → Supabase/Postgres+RLS throughout.

---

### Sprint 3.5 — Import UX Debt, Bugs & Polish ✅ DONE (except `E8-3.1`, still open)

> User-feedback grab-bag. The CRITICAL re-auth bug blocks user testing of the import flow — do it first. This is bigger than 2 days; split into 3.5a (bugs) and 3.5b (polish/features) if needed.

**P0 — Critical**

- ✅ `E3-bug.2` **🔴 Back to email re-auth** — `useGmailAuth` token lost on Gmail view unmount. Fix: lift token into `AppShell`-level ref/context so Gmail ↔ Edit navigation preserves it. Regression test required.

**P1 — Bugs / regressions**

- ✅ `E3-bug.3` **Skip item hidden under Add to Closet** — layout regression in `EditItemView` batch controls; z-index / order fix.
- ✅ `E5-bug.1` **Mobile: item detail header under sticky nav** — full-height card heading slides under the sticky nav; add `margin-top`/`scroll-margin-top`.
- ✅ `E3-bug.4` **Email fetch loading pulse** — restore visible pulse/spinner in `GmailImport` during live Gmail API calls.
- ✅ `E0-7.1` **Onboarding says "MyCloset"** — update branding to "Nothing To Wear".

**P2 — Import & form UX**

- ✅ `E3-6.1` **EditItemView optional fields** — relax validation for `mode === "create"`: `price`/`occasion`/`care` optional; `name`/`category`/`color`/`size`/`brand` mandatory.
- ✅ `E3-4.1` **Email-list header: count + date range** — "Found 20 emails · May 2018 – Dec 2018" instead of just "Found 100 emails".
- ✅ `E3-7.1` **Material-blend editor rework** — fix the disabled-at-100% / hard-to-reach-100% interaction.
- ✅ `E0-2.3` **Material filter sort by blend %** — sort filtered results descending by matched fiber's `MaterialBlend.percentage`; regression test.

**P3 — Polish / small features**

- ✅ `E0-7.2` **Search-result pills "Sloppy"** — pull match pills inside the card on their own layer so they don't detach on hover.
- ✅ `E2-9.1` **Swim category** — add `swim` to `CategoryType` + Form list + Carousel; map bikini/one-piece/swimsuit/tankini/two-piece. ⚠️ hardcoded-list audit.
- ✅ `E2-7.1` **Notes as bulleted list** — auto-bullet textarea + `<ul>` read mode.
- `E8-3.1` **Stain guide** — add nail polish + turmeric; expand stain coverage.

> **Larger feature work (own sprints, not 3.5):**
>
> - `E2-8.x` **Fit + measurements** (`fit` field; `measurements{ waist, chest, hips, length }` optional numbers, in↔cm) → **Block D (E2 #4)**, pairs with the E11 weight/volume model.
> - `E4-4.x` **Privacy: visibility vs. lendability** (intimates private by default; `isPrivate` + `isLendable`) → **Block G (E4 #7)**, needs E1 RLS.

---

### Block B — E1 Cloud Backend (Supabase) ✅ DONE · Priority 2

- ✅ **Spike + schema (2026-06-30):** `E1-1.1` Gmail-token-under-Supabase verified ✅ · `E1-1.2` schema (incl. E11 wear/status + E12 profile columns)
- ✅ **RLS + port:** `E1-1.3` RLS isolation verified ✅ (G0.2, 11/11) · `E1-1.4` port `useCloudCloset` ✅ (2026-07-06, wired behind a single `ClosetProvider`)
- ✅ **Seed + offline:** `E1-1.5` first-sign-in seed ✅ · `E1-1.6` offline-first reconcile ✅ (2026-07-07) · `E1-3.1` sync indicator ✅ (2026-07-06, `CloudSyncControl` + `SyncStatusIndicator`)
- ✅ **Security hardening:** `E1-4.1` bucket privacy audit ✅ · `E1-4.2` RLS isolation test ✅ · `E1-4.3` CI security scanning live ✅ · `E1-4.11` upload validation pushed ✅ · `E1-4.8` account deletion + export ✅ (2026-07-07, PR #117) · `E1-4.12` dev/prod Supabase split ✅ (2026-07-06, PR #115)
- **Image storage:** `E1-2.1` Storage upload (off base64) ✅ · `E1-2.2` base64→Storage ✅ (2026-07-06) — reframed as a write-path guard (`ensureStoredPhoto`); prod/dev had 0 base64 rows, so this is prevention, not backfill
- **Still open:** `E1-4.13` privacy policy (in progress, unblocked by `E1-4.8`) · `E1-4.9` Google OAuth verification + CASA (long external queue, start it) · backups/PITR
     > _DoD:_ private synced offline-capable closet on Supabase; images in Storage; Gmail import works under Supabase Auth. **Met.** Full detail: [E1-cloud-backend.md](epics/E1-cloud-backend.md).

### Block C — E5 Mobile & PWA ✅ DONE (2026-07-09/10) · Priority 3

- ✅ **Touch + nav:** `E5-1.1` 44×44 audit (PR #130) · `E5-1.2` bottom nav (PR #133) · `E5-1.3` Add-Item FAB (PR #133) · `E5-bug.1` sticky-nav overlap
- ✅ **PWA shell (PR #132):** `E5-2.1` manifest + icons · `E5-2.2` service worker (Workbox precache, deliberately zero `runtimeCaching` for Supabase)
- ✅ **iOS + offline:** `E5-2.3` iOS full-screen meta tags · `E5-3.1` offline closet view + e2e regression suite (PR #134)
- ✅ **Phase E — baselines + Lighthouse (PR #135):** screenshot baselines current; Lighthouse Performance 55 / Accessibility 96 / Best Practices 100 / SEO 92. Follow-ups logged, not launch-blocking: code-split main bundle (`E5-follow.1`), onboarding-overlay contrast (`E5-follow.2`).
     > _DoD:_ installable PWA, full-screen iOS, touch-friendly, bottom nav, offline closet. **Met.** Full detail: [E5-mobile-pwa.md](epics/E5-mobile-pwa.md).

### Block D — E2 Inventory Truth ⭐ 🟡 CORE DONE, second wave open · Priority 4

> Status/location core shipped on branch `EPIC-status-location` (PR #112, #122–#126) — see
> [E2-part-une-inventory-truth-status-location.md](epics/E2-part-une-inventory-truth-status-location.md)
> for the full `P1-*` ticket list. Builds everything except the clean/dirty wear bits (those are E11).

- ✅ **Location core:** `E2-2.1` location field + primary default · `E2-2.3` location tag on card (border toggle). **Open:** `E2-2.2`/`P1-5` "where is everything" grouped view · `P1-6`/`P1-7` custom/multi-home locations
- ✅ **Status core:** `E2-1.3` status chip/dot on card · `P1-3b` edit-form capture · `P1-4` quick-action menu · `P1-9` status-transition state machine · `P1-10` a11y legend. **Open:** `P1-11` status model v2 (`airing`/`stored` + reasons)
- **Still open:** `P1-8` status/location filter dimensions · **Availability + lending** (`E2-6.1` `isAvailable`, `E2-5.x` lend modal + "Lent out" view — not started)
- **Second-wave (this is where the differentiator data lands):** `E2-10.x` taxonomy (season/occasion/vibe tags) · `E2-11.x` provenance/origin/sentiment · `E2-12.x` multi-photo + view modes ✅ (multi-photo shipped, E1-2.3) · `E2-8.x` fit + measurements · `E2-9.1` swim ✅ done (Sprint 3.5)
     > _DoD:_ location + status + availability live; taxonomy tags, photos, provenance, fit/measurements modeled. **Location + status live; availability/lending + second-wave still open.**

### Block E — E12 User Profile 📐 mockups designed, not built · Priority 5

> Profile-hub mockups (hub, locations, sharing) shipped as design docs 2026-07-11 (PR #138) — no code yet.

- `E12-1.x` profile (functional vs. social split) + machine/lifestyle config
- `E12-4.x` body measurements → "fits me now" filter (uses E2 item measurements)
     > 🔭 Multi-closet/multi-home routing (`E12-2/3`) stays LIGHT — far horizon.
     > _DoD:_ profile split shipped; machine/lifestyle ready for E11; "fits me" filter works.

### Block F — E11 Laundry & Wear ⭐ · Priority 6

> Consumes E12 machine/lifestyle. Wear `status`/`wornCount` fields likely already added in E2 (#4) — reuse, don't redefine.

- **Wear loop:** `E11-1.x` canonical wear fields (if not from E2) + one-tap "I wore this" (mobile) + undo · `E11-6.x` `wear_events` history + timeline
- **Forecast:** `E11-2.x` `laundryForecast` + nudge + laundry-status view
- **Physical model:** `E11-3.x` `itemPhysical.ts` weight/volume + load-fullness
- **Profile-tuned:** `E11-4.x` machine + lifestyle nudges (from E12)
     > 🔭 Calendar planning (`E11-5.x`) stays LIGHT — far horizon.
     > _DoD:_ one-tap wear logging + history; forecast respects machine + lifestyle; items carry weight/volume.

### Block G — E4 Shared & Social ⭐ 📐 first slice + lending designed, not built · Priority 7

Needs E1 (RLS) + E12 (shareable profile) + E2 (loan/availability). Spec cold-start + trust first.

> **Design docs shipped 2026-07-11** (PR #136/#137, no code yet): [E4 Part Une](../../epics/E4-part-une-view-friends-closet.md)
> — teaser share-link MVP (view-only, converts to a Google-sign-in viewer grant) — and Part Deux in
> [E4-shared-social.md](../../epics/E4-shared-social.md) — lending via borrow requests + Activity
> notifications, rev 2. `return_loan` dirty-default is an open question flagged in that doc.

- connections/shares model + RLS + invite/accept (`E4-1.1`, `E4-1.2`)
- **privacy: `isPrivate` + `isLendable`, intimates private by default** (`E4-4.x`) + per-item privacy + friends' closets (`E4-1.3`, `E4-1.4`)
- borrow request→approve→return (`E4-2.x`) · **care-agreement on borrow** (`E4-5.1`) · lending-buddy trust (`E4-6.x`) · borrowed/lent views + reminders + revoke
     > Consider a **"shared closet of two"** MVP (you + one invitee) before broad social, to beat the empty-network problem.

### Block H — E8 Care & Knowledge · Priority 8

- `E8-3.1` stain guide: nail polish + turmeric + expanded coverage
- `E8-4.x` education UI/UX overhaul (fabric guide, fiber journey, stain views) + deeper care content
     > _DoD:_ richer stain/care content; the education surfaces feel premium and mobile-friendly.

---

## Cadence notes

- **Palate-cleanser quick wins** (sort by `purchaseDate`, stats strip, branch prune) can slot between blocks without derailing sequence.
- **Re-estimate after E1 (Block B)** — velocity there tells you whether the block sizes are realistic; adjust accordingly.
- **E3 web-enrichment** — run the Cloudflare feasibility spike _inside_ the #2 database sprint (server-side anyway); if beatable, full enrichment slots at ~#2.5/#3; if it 403-stalls, it waits and mobile keeps #3.
- **E3 ongoing** — import fixes (Sprint 3.5) ship continuously; the email-provider expansion (Microsoft Graph) rides on top of E1.
