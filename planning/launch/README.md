# 🚀 Launch Package — Nothing To Wear

> **Date:** 2026-06-29 · **Audience:** founder (you), internal. Not customer-facing copy.
> This folder is the active launch package: this README (vision + MVP + honest read) +
> [LAUNCH_ROADMAP_2026-06-29.md](./LAUNCH_ROADMAP_2026-06-29.md) (timeline, checklists, ticket maps) +
> [SPRINTS.md](./SPRINTS.md) (sequencing, supersedes the backlog order for now) +
> `epics/` (the three epics currently being built: [E1](./epics/E1-cloud-backend.md), [E2](./epics/E2-inventory-truth.md), [E5](./epics/E5-mobile-pwa.md)).
> The other ten epics stay in [planning/epics/](../epics/README.md) — they're real, just not this sprint.

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

You have **1089 passing tests**, a real type system threading through forms → parser → repository →
Postgres, a working Gmail-HTML parser handling a dozen+ retailer email layouts, an offline-first sync
design (local-first writes, last-write-wins reconcile), and you caught the Storage-pipeline gaps
(uncompressed uploads, hour-long signed URLs, missing bucket validation) **before** they shipped to a
real user, not after. You're also the one who keeps surfacing "wait, is this actually secure / does
this actually work" — that instinct is what's going to keep this launch from being a Tea-App headline.
That's not flattery, that's the actual state of the repo.

## Now the honest part

The thing you should sit with: **the feature you're proudest of — status & location — is the least
finished thing in the codebase.** The types and DB columns exist; the UI is close to 0% built (no
status chip, no location tag, no lend modal, no filters for either). That's not a criticism of the
plan, it's a correction to the _feeling_ that this is "mostly done, just needs hooking up." It's the
largest single block of remaining work, sized at 6–9 dev-days in the roadmap.

The second thing has been resolved: **all three Block 0 assumptions are now verified** (2026-06-30).
Gmail import works end-to-end against a real Google account (G0.1). RLS isolation holds against a
second account (G0.2, 11/11 checks pass). Cloud sync round-trips across devices (G0.3). The only
remaining infrastructure risk that surfaced: zero Postgres table GRANTs meant no signed-in user could
read/write their data — this was caught and fixed before launch (`20260629000002_grant_table_privileges.sql`).

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
| **Status**               | know the status — dirty, needs repair, too small                 | 🟡 Modeled (type+DB), **UI ~15% built** — Block B                                                       |
| **Location**             | know the location — storage, lent out, dry cleaner, summer house | 🟡 Modeled (type+DB), **UI ~15% built** — Block B                                                       |
| **PWA / mobile**         | needs to look better on mobile, browser rendering too buggy      | 🔴 0% built — no manifest/service worker yet; full installable PWA chosen — Block C                     |

Plus, implicitly required to ship any of the above to real users responsibly:
**simple lend tracking** (free-text "lent to Sarah, due back," part of Status/Location, not the social
loop) and **the security/privacy gate** above (Block A) — not in your bullet list, but the bullet list
doesn't work without them.

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

- **Detailed checklists, ticket maps, Block 0/A/B/C breakdowns:** [LAUNCH_ROADMAP_2026-06-29.md](./LAUNCH_ROADMAP_2026-06-29.md)
- **Sequencing / what supersedes the backlog right now:** [SPRINTS.md](./SPRINTS.md)
- **The three epics being built:** [E1 Cloud Backend](./epics/E1-cloud-backend.md) · [E2 Inventory Truth](./epics/E2-inventory-truth.md) · [E5 Mobile & PWA](./epics/E5-mobile-pwa.md)
- **Everything else (post-MVP backlog, unchanged):** [planning/epics/](../epics/README.md)
