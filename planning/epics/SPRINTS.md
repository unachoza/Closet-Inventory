# Sprints — 2-Day Sprint Sequencing

> **Date:** 2026-06-20 · **Audience:** personal build plan. Index of epics: [README.md](./README.md).
> Each sprint ≈ **2 ideal dev-days**. Calendar time will run longer — treat the sprint *number* as
> sequence, not a calendar promise. Tickets reference epic files (e.g. `E2-1.3`).

---

## ⚠️ One reordering to confirm

Your earlier ranking was **bugs → DB → mobile → v2.2** (before the v1.5 Inventory flagship existed).
This plan slots **Inventory (E2) *before* the Supabase migration (E1)**, because:
- E2 is the **flagship differentiator** and builds fine **localStorage-first** (no backend needed yet).
- It ships the **`wornCount` early win** that E7/E8/E9 depend on.
- It **feeds E4 (borrow) and E6 (outfit)** — building it first unblocks them.
- E1 then migrates the **already-complete** data model (incl. status/location columns) **once**, instead of mid-build.

If you'd rather keep DB strictly second, swap the E2 and E1 blocks below — they're cleanly separable.
**This is the one judgment call worth your veto.**

---

## Roadmap of blocks

| Sprints | Epic | Outcome |
|---|---|---|
| 1–3 | **E0 · Trustworthy Core** | green suite, core bugs fixed, types tightened |
| 4–9 | **E2 · Inventory Truth** ⭐ | status/location/availability/laundry/lend + `wornCount` |
| 10–14 | **E1 · Cloud Backend** | Supabase + RLS + sync + image storage |
| 15–18 | **E5 · Mobile & PWA** | installable, touch-friendly, offline |
| 19+ | **E4 · Shared & Social** ⭐ | sharing + borrowing (needs E1+E2) |
| later | E3 / E6 / E7 / E8 / E9 / E10 | expand those epics when scheduled |

---

## Detailed sprints

### Block A — E0 Trustworthy Core
- **Sprint 1 — Green base + filter fix:** `E0-1.1` strip logs · `E0-1.2` green suite · `E0-2.1`/`E0-2.2` material filter + test · `E0-5.2` title-case CAPS
- **Sprint 2 — Remove-rerender + honest dates:** `E0-3.1` route removal via `ClosetContext` · `E0-3.2` test · `E0-4.1` MonthYearPicker commit · `E0-4.2` test
- **Sprint 3 — Import guard + typing:** `E0-5.1` skip-no-category + test · `E0-6.1` tighten `ClothingItem` typing
> _DoD:_ suite green, four bugs fixed w/ regression tests, typing tightened.

### Block B — E2 Inventory Truth ⭐
- **Sprint 4 — Status model + logic:** `E2-1.1` fields · `E2-1.2` transitions + tests · `E2-6.1` `isAvailable` + tests · `E2-1.5` log-a-wear
- **Sprint 5 — Status on the card:** `E2-1.3` status chip · `E2-1.4` quick-action menu (desktop + mobile long-press)
- **Sprint 6 — Location:** `E2-2.1` location field · `E2-2.2` `locationGroups` + tests · `E2-2.3` location tag
- **Sprint 7 — Where-is-everything + filters:** `E2-2.4` grouped view · `E2-3.1` Status/Location filter dimensions
- **Sprint 8 — Quick views + laundry:** `E2-3.2` quick-view presets · `E2-4.1` `laundryForecast` + tests · `E2-4.2` nudge strip
- **Sprint 9 — Lend tracking:** `E2-5.1` lend modal + `loan` · `E2-5.2` "Lent out" view + overdue
> _DoD:_ status + location live on cards/filters, laundry nudge, lending tracked, `isAvailable` shared, `wornCount` shipped.

### Block C — E1 Cloud Backend (Supabase)
- **Sprint 10 — Spike + schema:** `E1-1.1` ⚠️ Gmail-token-under-Supabase spike · `E1-1.2` schema (incl. E2 status/location columns)
- **Sprint 11 — RLS + port (1):** `E1-1.3` RLS owner-only · `E1-1.4` port `useCloudCloset` (start)
- **Sprint 12 — Port (2) + seed:** `E1-1.4` finish · `E1-1.5` first-sign-in seed
- **Sprint 13 — Offline + sync state:** `E1-1.6` offline-first reconcile · `E1-3.1` sync indicator
- **Sprint 14 — Image storage:** `E1-2.1` Storage upload (off base64) · `E1-2.2` migrate existing base64
> _DoD:_ private synced offline-capable closet on Supabase; images in Storage; Gmail import works under Supabase Auth.

### Block D — E5 Mobile & PWA
- **Sprint 15 — Touch + nav (1):** `E5-1.1` 44×44 audit · `E5-1.2` bottom nav (start)
- **Sprint 16 — Nav + FAB:** `E5-1.2` finish · `E5-1.3` Add-Item FAB
- **Sprint 17 — PWA shell:** `E5-2.1` manifest + icons · `E5-2.2` service worker
- **Sprint 18 — iOS + offline:** `E5-2.3` iOS full-screen · `E5-3.1` offline closet view
> _DoD:_ installable PWA, full-screen iOS, touch-friendly, bottom nav, offline closet.

### Block E — E4 Shared & Social ⭐ (Sprints 19+)
Needs E1 (RLS) + E2 (loan/availability). Spec the cold-start + trust model first. Suggested first cut:
- **Sprint 19–20** — connections/shares model + RLS + invite/accept (`E4-1.1`, `E4-1.2`)
- **Sprint 21** — per-item privacy + friends' closets view (`E4-1.3`, `E4-1.4`)
- **Sprint 22–23** — borrow request→approve→return + wire to E2 loan (`E4-2.1`, `E4-2.2`)
- **Sprint 24** — borrowed/lent views + reminders + revoke (`E4-2.3`, `E4-3.1`)
> Consider a **"shared closet of two"** MVP (you + one invitee) before broad social, to beat the empty-network problem.

---

## Cadence notes
- **Palate-cleanser quick wins** (sort by `purchaseDate`, stats strip, branch prune) can slot between blocks without derailing sequence.
- **Re-estimate after Block A** — velocity on the first 3 sprints tells you whether 2-day sprints are realistic for you; adjust block lengths accordingly.
- **E3 v2.2 web-enrichment** stays parked behind its feasibility spike (Cloudflare) regardless of where it lands in sequence.
