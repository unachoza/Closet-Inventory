# 🚀 Launch Package — Nothing To Wear

> **Date:** 2026-06-29 · **Updated:** 2026-07-11 · **Audience:** founder (you), internal. Not customer-facing copy.
> This folder is the active launch package: this README (vision + MVP + honest read) +
> [LAUNCH_ROADMAP_2026-06-29.md](./LAUNCH_ROADMAP_2026-06-29.md) (original Block 0/A/B/C plan, checked off in place) +
> [LAUNCH_ROADMAP_July_update.md](./LAUNCH_ROADMAP_July_update.md) (re-cut around Block B + the Block A/C completion amendment) +
> [SPRINTS.md](./SPRINTS.md) (sequencing, supersedes the backlog order for now) +
> `epics/` (the epics currently being built: [E1](./epics/E1-cloud-backend.md), [E2](./epics/E2-inventory-truth.md) +
> [E2 Part Une](./epics/E2-part-une-inventory-truth-status-location.md), [E5](./epics/E5-mobile-pwa.md)).
> The other epics — including the now-designed (not yet built) [E4 Part Une](../epics/E4-part-une-view-friends-closet.md),
> the lending slice in [E4 Shared & Social](../epics/E4-shared-social.md), and the [E12 profile hub](../epics/E12-user-profile.md) —
> stay in [planning/epics/](../epics/README.md).

## Where things actually stand (2026-07-11)

> **Block 0 · Block A (security/privacy) · Block C (mobile/PWA) are all DONE.** Only Block B (inventory
> spine) has open tickets, and the launch-blocking piece left overall is the **privacy policy** (E1-4.13,
> in progress — unblocked since E1-4.8 shipped) plus Gmail verification Gate 1 (long external queue, start
> it, don't wait on it). See [LAUNCH_ROADMAP_July_update.md](./LAUNCH_ROADMAP_July_update.md) for the
> detail — this corrects that doc's own "zero movement on A/C" note, which was true on 2026-07-05 and is
> no longer true as of 2026-07-06 (A) / 2026-07-10 (C).

---

## What you're building

Not another outfit-planner. **An inventory & logistics system for your closet** — what you own, what
state it's in, where it physically is, and who has it. The name asks the real question: _do I actually
have nothing to wear, or is it dirty, in storage, or at Sarah's apartment?_ That's a genuinely different
product from "here's an outfit," and it's the wedge nobody else in this space has built. (Consistent
with [PRODUCT_VISION_2026-06-20.md](../PRODUCT_VISION_2026-06-20.md) — this doc doesn't redefine the
vision, it scopes the next 6–8 weeks of it.)

The five-pillar spine — **Location · Status · Availability · Care · Share** — is the long-term
differentiator. The MVP ships the first three plus a simple version of the fourth and fifth; Care (E8) and the full
social Share loop (E4) come after.

## You should feel good about this

You have **1303 passing tests** (up from 1089 at the June cut), a real type system threading through
forms → parser → repository → Postgres, a working Gmail-HTML parser handling a dozen+ retailer email
layouts, an offline-first sync design (local-first writes, last-write-wins reconcile) that's now wired
into the live app behind a single `ClosetProvider`, and you caught the Storage-pipeline gaps
(uncompressed uploads, hour-long signed URLs, missing bucket validation) **before** they shipped to a
real user, not after. You're also the one who keeps surfacing "wait, is this actually secure / does
this actually work" — that instinct is what's going to keep this launch from being a Tea-App headline.
That's not flattery, that's the actual state of the repo.

## Now the honest part (updated 2026-07-11)

The June honest-take called out two things. Both have moved:

**"Status & location is the least finished thing in the codebase"** — no longer true. The border-toggle
UI, edit-form capture, quick-action menu (`P1-4`), status-transition state machine (`P1-9`), and the
accessibility legend (`P1-10`) all shipped (PRs #112, #122–#126). What's still open in Block B is real
but smaller: the "where is everything" grouped view (`P1-5`), custom/multi-home locations (`P1-6`/`P1-7`),
status+location filter dimensions (`P1-8`), and status model v2 — `airing`/`stored` + reasons (`P1-11`).
See [E2 Part Une](./epics/E2-part-une-inventory-truth-status-location.md) for the live ticket list.

**Block 0 (prove-it gates)** — resolved 2026-06-30, unchanged since. Gmail import works end-to-end
against a real Google account (G0.1). RLS isolation holds against a second account (G0.2, 11/11 checks
pass). Cloud sync round-trips across devices (G0.3). The only remaining infrastructure risk that
surfaced: zero Postgres table GRANTs meant no signed-in user could read/write their data — this was
caught and fixed before launch (`20260629000002_grant_table_privileges.sql`).

**New honest thing to sit with:** the two blocks that were "fully open, zero movement" in the July 5
re-cut are now both **done** — Block A (security/privacy, PR #115–#117, #128–#129) and Block C (mobile +
PWA, PR #130–#135). That's real progress, but it also means **the privacy policy (E1-4.13) is now the
critical path**, not a background item — it's the only Block-A checklist item still open, and Gmail's
production verification queue (weeks-to-months, external, not on your clock) can't start in earnest
without it live at a public URL.

## How seriously you're taking security — and why "not yet passed" is the right answer

You explicitly invoked the Tea App breach in your own planning docs, which is the right instinct —
most solo builders don't think about this until something leaks. The seriousness shows up as **hard
gates, not a checkbox you tick and move on from**:

- RLS isolation must be _proven_ against a second account before anyone else's data goes near it (Block 0)
- Dev and prod are currently the **same Supabase project** — that gets split before real users land
- Account deletion + data export get built _before_ the privacy policy promises them, not after
- The Storage upload-validation migration is written but not pushed — it doesn't count as "done" until it's live
- Every one of the Tea App's specific failures (open buckets, no RLS, no deletion, hardcoded secrets, no audits) has a corresponding checklist item in the roadmap, not a vague "we'll be careful"

If I'd written you a section saying "security is locked down," that would be the false-confidence
version of exactly the mistake the Tea App made. The true version is: you know precisely what's unproven,
you've gated launch on proving it, and you're not shipping past those gates. That _is_ taking it
seriously — more so than a green checkmark would be.

---

## MVP — what actually ships at launch

| Feature                  | Your words                                                       | Build status                                                                                            |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Manual closet upload** | upload your closet manually                                      | ✅ Built — 9-step guided form, image upload (Storage + base64 fallback)                                 |
| **Gmail auto-import**    | scrape auto-import from Gmail                                    | ✅ Live end-to-end verified (2026-06-30) — Google OAuth sign-in, email import, parsing confirmed (G0.1) |
| **Status**               | know the status — dirty, needs repair, too small                 | 🟡 Core built (border/dot, edit-form, quick actions, state machine, legend) — reasons (`P1-11`) + filters (`P1-8`) open |
| **Location**             | know the location — storage, lent out, dry cleaner, summer house | 🟡 Core built (registry, edit-form, border toggle) — multi-home (`P1-6/7`), grouped view (`P1-5`), filters (`P1-8`) open |
| **PWA / mobile**         | needs to look better on mobile, browser rendering too buggy      | ✅ Built (2026-07-10) — manifest+icons, service worker, offline shell, iOS full-screen, bottom nav + FAB, Lighthouse 55/96/100/92 |

Plus, implicitly required to ship any of the above to real users responsibly:
**simple lend tracking** (free-text "lent to Sarah, due back," still open, part of Status/Location, not
the social loop) and **the security/privacy gate** above (Block A — ✅ done, PR #115–#117/#128–#129,
except the privacy policy itself which is in progress, `E1-4.13`).

**Explicitly NOT in MVP** (your stated next priorities, in order — tracked, not forgotten):

1. **Lending / Request-to-Borrow** as a social feature (E4) — accounts, invites, approve/return, trust model
2. **Hotmail/Outlook import** (E1-5.x) — separate identity provider, separate verification gate
3. _(implied third)_ Yahoo import (E1-6.x) — separate protocol shape (IMAP, not REST), separate review

## Timeline

See [LAUNCH_ROADMAP_2026-06-29.md](./LAUNCH_ROADMAP_2026-06-29.md) for the full numbers. Short version:
**2 weeks isn't real; 1 month is at risk specifically because of the full-PWA choice; ~6–8 weeks is the
honest target.** The roadmap also has the complete privacy-policy checklist and the Gmail
verification-vs-test-mode plan (test mode unblocks your 30 waitlisters in weeks; full verification +
CASA run in parallel for the public launch).

## Where to look next

- **Detailed checklists, ticket maps, Block 0/A/B/C breakdowns:** [LAUNCH_ROADMAP_2026-06-29.md](./LAUNCH_ROADMAP_2026-06-29.md) (Block 0/A checked off in place) + [LAUNCH_ROADMAP_July_update.md](./LAUNCH_ROADMAP_July_update.md) (Block B re-cut + the Block A/C completion amendment)
- **Sequencing / what supersedes the backlog right now:** [SPRINTS.md](./SPRINTS.md)
- **The epics being built:** [E1 Cloud Backend](./epics/E1-cloud-backend.md) (done) · [E2 Inventory Truth](./epics/E2-inventory-truth.md) + [E2 Part Une](./epics/E2-part-une-inventory-truth-status-location.md) (in progress) · [E5 Mobile & PWA](./epics/E5-mobile-pwa.md) (done)
- **Designed but not yet built:** [E4 Part Une — view a friend's closet](../epics/E4-part-une-view-friends-closet.md) · [E4 Shared & Social](../epics/E4-shared-social.md) (Part Deux — lending via borrow requests, rev 2) · [E12 profile hub](../epics/E12-user-profile.md)
- **Everything else (post-MVP backlog, unchanged):** [planning/epics/](../epics/README.md)
