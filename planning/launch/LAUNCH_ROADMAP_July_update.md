# 🚀 Launch Roadmap — July Update (2026-07-05, amended 2026-07-11)

> **Amendment (2026-07-11):** this doc's central claim below — *"Block A has had zero movement since June
> 29 · Block C not touched this cycle"* — was accurate on 2026-07-05 and is **no longer true**. Both blocks
> completed the same week this doc's ink dried:
> - **Block A (security/privacy)** ✅ done 2026-07-06/07 — dev/prod Supabase split (PR #115), account
>   deletion + data export (PR #117), base64→Storage write-guard, logging hygiene + Sentry/PostHog
>   (PR #128/#129). Only the privacy policy itself (`E1-4.13`) remains open — see
>   [E1-cloud-backend.md](epics/E1-cloud-backend.md) for the full checklist.
> - **Block C (mobile + PWA)** ✅ done 2026-07-09/10 — touch targets, bottom nav + FAB (PR #130/#133), PWA
>   shell + service worker + offline (PR #132/#134), Lighthouse audit (PR #135). See
>   [E5-mobile-pwa.md](epics/E5-mobile-pwa.md).
> - Also since this doc: `P1-4`/`P1-9`/`P1-10` (quick actions, status-transition machine, a11y legend)
>   shipped, closing most of "still open within Block B" below — only `P1-5`/`P1-6`/`P1-7`/`P1-8`/`P1-11`
>   remain. And the two open gaps this doc surfaced (share ticket home, stain-guide scoping) got answered:
>   share got its ticket as [E4 Part Une](../epics/E4-part-une-view-friends-closet.md) (design, PR #136),
>   with lending as Part Deux in [E4-shared-social.md](../epics/E4-shared-social.md) (PR #137) — neither
>   built yet. Stain guide (`E8-3.1`) is still unscoped/open.
>
> The rest of this document is left as-is below — a historical record of the 2026-07-05 re-cut.

> **Supersedes nothing** — this is a **re-cut of priorities**, not a redo. [LAUNCH_ROADMAP_2026-06-29.md](LAUNCH_ROADMAP_2026-06-29.md)
> stays the record of the original launch-gate plan (Block 0 gates, Block A security, Block C mobile/PWA); it has
> been checked off in place where work landed. This doc picks up **where the last four weeks of work actually
> went** — almost entirely **Block B — Inventory Spine** — and re-organizes what's left as five MVP pillars
> instead of the original A/B/C block structure.
>
> **Why a new file instead of editing June's:** the June doc's Block 0/A/C sections are still accurate as
> written (nothing there has changed); rewriting it around Block B would bury the security/PWA checklist that's
> still the real launch gate. This doc is additive — read it *alongside* June's, not instead of it.

---

## Where the work actually went: Block B — Inventory Spine ⭐

Everything shipped since 2026-06-29 sits inside Block B, on branch `EPIC-status-location`:

- Status + location data model, edit-form capture, seeded demo data, and the overview **border-toggle** UI
  (Off → Location → Location+Status) — see [E2-part-une-inventory-truth-status-location.md](epics/E2-part-une-inventory-truth-status-location.md)
  for the full ticket list (`P1-1` through `P1-11`).
- A parallel type-system cleanup (condition → `WearState`, `swim` category added, `underwear` folded into
  `intimates`) landed alongside it and is fully audited (`tsc` clean, full suite green).
- Planning depth added: persona consolidation (`USER_PERSONAS.md`), status-reason model (`P1-11`), location
  filter spec (`P1-8`), border/status legend + a11y (`P1-10`), monetization tier rethink (`E10`), and email
  classification for import (`E3` US-3.10/3.11).

**Still open within Block B** (tracked as `P1-*` in the Part Une doc): quick-action menu (`P1-4`), grouped
"where is everything" view (`P1-5`), custom/multi-home locations (`P1-6`/`P1-7`), status+location filter
dimensions (`P1-8`), status-transition helper (`P1-9`), status model v2 — `airing`/`stored` + reasons (`P1-11`).

**Not touched this cycle, still fully open:** Block A (security/privacy launch gate), Block C (mobile + PWA).
Neither has moved since June 29 — do not read Block B's progress as launch-readiness progress on those.

---

## MVP re-cut — five pillars

The user's own framing for "what MVP needs" cuts across the original A/B/C blocks differently — by **product
surface** rather than launch-gate category. Recording it here as the priority lens going forward:

| # | Pillar | What it covers | State |
|---|---|---|---|
| 1 | **Inventory** | What items, and their details (fashion parser: category, color, material, price, brand) | ✅ built (E3 fashion parser, multi-retailer) |
| 1 | **Location** | Where it is: primary home, secondary residence, seasonal storage, lent out, dry cleaners | 🟡 registry + edit-form done; multi-home/custom labels + filter + grouped view open (`P1-5/6/7/8`) |
| 2 | **Status** | Fits, dirty, needs repair | 🟡 core enum + edit-form done; reasons/nudges + quick-actions open (`P1-4/9/11`) |
| 3 | **Care** | Washing guide by fabric, stain guide | 🟡 fabric/fiber care content exists ([E8](../epics/E8-care-knowledge.md)); **stain guide needs a real pass**, esp. **food stains: tomato sauce, turmeric, curry** (see below) |
| 4 | **Share** | Basic viewing privileges now; robust share/borrowing (Lending Circle) **after launch** | ⏳ not started — MVP scope is intentionally thin here |

> **Note on numbering:** the user's own list had two items tied at "1" (inventory, location) — preserved as-is
> above since it reflects that both are foundational/parallel, not that location is optional.

### On Care → stain guide

[E8-care-knowledge.md](../epics/E8-care-knowledge.md) currently has **no structured stain-guide content** —
confirmed by search; "stain" only appears as a fiber-property adjective in `src/Content/Fabric&Fiber.ts`. This
is greenfield, not an update. Explicitly called out for **food stains**: tomato sauce (oil + pigment, two-step
treatment), turmeric (curcumin dye — notoriously hard to fully remove, sun/UV-assisted removal is the folk
remedy worth documenting), curry (turmeric + oil + spice — compound stain, treat as both). **Not drafted yet** —
flagging as a distinct next deliverable, likely its own section/story in `E8`, not squeezed into this doc.

### On Share

Deliberately **thin for MVP**: basic view-only sharing (give someone read access to your closet), not the full
Lending Circle (request-to-borrow, due dates, trust model — that's [E4-shared-social.md](../epics/E4-shared-social.md),
explicitly deferred post-launch per the June roadmap's "Explicitly POST-MVP" list). This re-cut doesn't change
that call — E4 stays post-MVP. What's new here is naming "basic viewing privileges" as an MVP-scope item that
isn't in the June doc's Block B ticket map at all — **it needs a ticket**, not just a mention. Flagging as an
open gap below.

---

## Open gaps this re-cut surfaces

- **"Basic share (view-only)" has no ticket anywhere yet** — not in E2, E4, or E1. Needs a home; likely a light
  E1 (Supabase RLS: read-only grant to a second user) + E4 (the minimal, pre-Lending-Circle slice) split. Ask:
  should this be pulled into E4 as "E4 Part Une" (mirroring the E2 Part Une pattern), or is it small enough to
  live as a ticket under E1?
- **Stain guide is unscoped work, not a checkbox** — no existing story/epic section owns it. Recommend a new
  `E8` user story (e.g. `US-8.x — Stain guide`) rather than treating it as a quick content add, since "how much
  chemistry detail is correct/safe to publish" is itself a judgment call (e.g. bleach-based advice interacting
  with fabric type) worth scoping deliberately.
- **This doc doesn't re-sequence Block A/C** — they're both still fully open and, per the original roadmap, are
  the actual hard launch gates (security is "non-negotiable per the pristine bar"; mobile/PWA gates the "usable
  on mobile" launch-readiness line). The Inventory Spine work being further along should **not** be read as "the
  timeline moved up" — Block A has had zero movement since June 29.
