# E4 Part Deux — Lending via Borrow Requests

> **Date:** 2026-07-10 (rev. 2 — same day) · **Parent epic:** [E4 · Shared & Social](./E4-shared-social.md) (US-4.2 + US-4.5) ·
> **Status:** 📐 design · **post-MVP** (after [Part Une](./E4-part-une-view-friends-closet.md) ships)
> **Mockups:** [lending-borrow-requests.html](../design/mockups/lending-borrow-requests.html) ·
> [activity-notifications.html](../design/mockups/activity-notifications.html)
> **Goal:** Lending flows through **borrow requests**: a viewer taps "Request to borrow," the owner approves
> with care instructions + a due date, the borrower marks it returned (clean or needs laundering), and the
> owner confirms the condition it came back in — which updates the item's status automatically.

> **Rev 2 decision (2026-07-10): request-based lending REPLACES owner-recorded simple lending.**
> Every borrow rides a request; the borrower must be an app user (consistent with E4's locked US-4.2
> decision — and Part Une makes that cheap: any friend who can see the closet already signed in).
> Rev 1's owner-recorded loan modal is superseded; its person-first Lent view, nudge copy, and
> duration-over-dates principles carry forward unchanged.

---

## The loop

```
borrower                          owner
────────                          ─────
Request to borrow  ──────────▶  Activity: request waiting
(optional note)                   ├─ Deny (with optional reason)
                                  └─ Approve:
                                       care instructions (prefilled from item care, editable/augmentable)
                                       + due date
◀──────────────────────────────  approved → item on_loan · location "With {borrower}"
… time passes; due-soon nudges in both Activities …
Mark returned  ────────────────▶  Activity: returned — confirm condition
 (returning clean /               owner logs condition:
  needs laundering)                 dry-cleaned · clean · needs wash · smells of perfume · stain · rip
                                  → status auto-maps · loan closes into history
```

## Personas, unchanged stakes

- **Maya** — requests must be one tap from a friend's item; approval is the ceremony, not the ask.
- **The Closet Pair** — the app replaces the awkward text in *both* directions now: asking to borrow AND
  asking for it back are neutral, logged interactions. Person-first "who has what" view carries over.
- **Sloane** — care instructions at approval are her contract ("must return dry cleaned"); the return-condition
  log is her provenance and her early-warning system (the perfume smell gets recorded, not remembered).

---

## US-4.2r — Request and approve

_As MJ (a Part-Une viewer), I want to tap "Request to borrow" on Arianna's blazer so that asking is one tap, not a composed text. As Arianna, I want to approve with my terms attached so that lending feels safe._

- [ ] "Request to borrow" on any visible, lendable item in a friend's closet (respects `isLendable`, US-4.4); optional short note ("for the Miami trip!")
- [ ] Owner sees the request in **Activity** (see Notifications below) with Approve / Deny inline
- [ ] **Approve sheet:** care instructions **prefilled from the item's care data**, editable and augmentable
      (chips + free text: "must return dry cleaned", "do not put in dryer") + **due date** (required on approve)
- [ ] Deny is guilt-free: optional reason, prewritten softeners ("it's traveling with me", "it's delicate")
- [ ] On approve: status → `on_loan`, location → "With {borrower}", care terms visible to both for the loan's duration (US-4.5 delivered)
- [ ] Requests expire quietly after 14 days unanswered

## US-4.2s — Return and condition

_As MJ, I want to mark the blazer returned and say whether it's clean so that handoff is honest. As Arianna, I want to log the state it actually came back in so that my closet stays true and the history remembers._

- [ ] Borrower marks **Returned**, choosing: **returning clean** · **needs laundering**
- [ ] Owner gets an Activity notification: "MJ marked the blazer returned" → **Confirm return**
- [ ] Owner's condition log (multi-select chips + note): `dry-cleaned` · `clean` · `needs wash` · `smells of perfume` · `stain` · `rip`
- [ ] **Condition auto-maps to status** (locked 2026-07-10):
      `dry-cleaned` / `clean` → `clean` · `needs wash` / `smells of perfume` → `dirty` · `stain` / `rip` → `in_repair`
      (worst wins when multiple chips are selected; note + chips stored on the closed loan)
- [ ] Loan closes into per-item history: borrower, dates, care terms, return condition (Sloane's provenance)
- [ ] Discrepancy is data, not drama: borrower said clean + owner logs stain → both records kept, no dispute UI (trusted circle)

## US-4.2t — Notifications (the Activity tab)

_As a user, I want lending events to reach me without the app becoming noisy — calm, in one place I already visit._

**Locked 2026-07-10: notifications live in an "Activity" section of the Profile hub** — no global bell, no
tray, no push (push is a later, separate design once PWA notification infra exists). Uncluttered and calm wins.

- [ ] **Activity** section card in the Profile hub; a small terracotta count dot when items await action
      (the profile avatar in the top nav carries the same dot — one subtle signal, no numbers in the nav)
- [ ] **Waiting** group (things needing *my* action) pinned above **Earlier** (informational, auto-read on view)
- [ ] Actionable notifications carry their actions inline: a borrow request shows Approve / Deny right in the
      row; a return shows Confirm return. No detours.
- [ ] Notification types + icon language (line icons, terracotta accent, no red):
      `borrow_request` (hanger with arrow) · `request_approved` (hanger with check) · `request_denied` (hanger, dash) ·
      `due_soon` (clock) · `marked_returned` (open box) · `condition_logged` (tag) · `viewer_joined` (Part Une; person with check)
- [ ] Empty state: "All quiet. Nothing needs you." — a state to aspire to, not an error
- [ ] Data: `notifications` table (user_id, type, payload jsonb, read_at, acted_at), RLS owner-scoped;
      written by the same transaction that mutates `borrow_requests`

## Data model

```
borrow_requests
  id             uuid PK
  item_id        uuid FK → items
  owner_id       uuid FK → auth.users
  borrower_id    uuid FK → auth.users     -- must be a closet_viewer of the owner (Part Une)
  note           text                      -- borrower's ask ("for the Miami trip!")
  status         enum: pending / approved / denied / returned_pending / closed / expired
  care_terms     text                      -- owner's instructions, prefilled from item care (US-4.5)
  due_back       date                      -- required on approve
  borrower_return_state  enum: clean / needs_laundering   -- set at mark-returned
  return_condition       text[]            -- owner's chips: dry-cleaned/clean/needs-wash/perfume/stain/rip
  return_note    text
  created_at / decided_at / returned_at / closed_at

notifications
  id / user_id / type / payload jsonb / read_at / acted_at / created_at
```

`LoanRecord` on the item becomes a **projection of the active approved request** (borrowerName from the
borrower's profile, since = decided_at, dueBack = due_back) — the E2 status spine (`on_loan`,
"With {person}" location) is unchanged. RLS: both parties can read a request; only the borrower can create
and mark-return; only the owner can decide and log condition.

**Status machine change (supersedes rev-1's open question):** `return_loan` stops being a one-tap
`on_loan → clean`; the transition target now comes from the condition auto-map (`clean` | `dirty` |
`in_repair`). `statusTransitions.ts` gains the mapping + tests; the dirty-vs-clean ask is resolved — the
owner's condition log *is* the answer.

## Tickets

- `E4-2.1r` `borrow_requests` + `notifications` tables, RLS, request state machine — _2d_
- `E4-2.2r` Borrower flow: Request-to-borrow on viewer items (gated on `isLendable`), mark-returned with clean/needs-laundering — _1.5d_
- `E4-2.3r` Owner flow: approve sheet (care prefill + due date), deny with softeners, confirm-return with condition chips + status auto-map (`statusTransitions.ts` change + tests) — _2d_
- `E4-2.4r` Activity tab in Profile hub: waiting/earlier groups, inline actions, count dot on avatar, empty state — _1.5d_
- `E4-2.5r` Lent/borrowed views (person-first, durations, due-soon flags — carried from rev 1) + loan history on items — _1.5d_

**Total ≈ 8.5 dev-days.** Depends on Part Une (viewers ARE the borrower pool) and E4-4.1 (`isPrivate`/`isLendable`).

## Notes

- **No push yet, by design** — due-soon urgency is served by the Activity dot; PWA push is a separate later design.
- Nudge copy (rev 1) survives as the `due_soon` notification's "send a reminder text" affordance — still
  leaves through the owner's own messenger, never app-to-borrower messaging.
- Care-ack (`US-4.5`'s borrower acknowledgement) is folded in cheaply: the borrower sees care terms on the
  approval notification; tapping "Got it" stamps `care_ack` — no extra screen.
