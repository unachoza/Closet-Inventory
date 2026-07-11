# E4 · Shared & Social ⭐

> **Date:** 2026-06-20 · **Pillar:** Social (the differentiator + growth loop) · **Detail:** full · **README:** v8.1 · **Est:** ~9–13 dev-days
> **Goal:** Let people share closets and **borrow** real garments with trusted friends/family — the
> "Our Closet" origin and the only feature with a built-in growth loop. Built on Supabase RLS (E1) and
> the availability/loan model (E2).
> ⚠️ Hardest, riskiest milestone: trust, privacy, and the empty-network cold-start. Spec it before building.

---

> **📐 2026-07-10 — US-4.1 designed:** the share-link MVP (hybrid 2-hour teaser link → Google sign-in →
> durable viewer grant, framed as the acquisition funnel) is fully specced in
> [E4 Part Une — View a Friend's Closet](./E4-part-une-view-friends-closet.md) with UI mockups in
> [planning/design/mockups/friend-view-flow.html](../design/mockups/friend-view-flow.html).
> Lending is specced in [E4 Part Deux — Lending via Borrow Requests](./E4-part-deux-simple-lending.md)
> (post-MVP; rev 2 replaced owner-recorded simple lending with request → approve-with-care-terms →
> return → condition-confirm, and puts notifications in a profile **Activity** tab).

## US-4.1 — Share my closet with someone I trust
_As the "Our Closet" user, I want to share my closet (or parts of it) with a friend so that we can see each other's wardrobes._
- [ ] Invite a friend (link or email)
- [ ] Accepted connection = mutual or one-way visibility
- [ ] Per-item / per-category privacy (RLS-enforced) — hide what I don't want shared

**Tickets**
- `E4-1.1` Data model: `connections`, `shares` tables + RLS policies — _2d_
- `E4-1.2` Invite flow (generate link / send invite) + accept — _2d_
- `E4-1.3` Per-item/category privacy controls (`visible_to`) — _1.5–2d_
- `E4-1.4` "Friends' closets" browse view — _1.5d_

## US-4.4 — Privacy: visibility vs. lendability are separate
_As a user sharing my closet, I want fine-grained control over what others can see and what they can borrow — two independent axes — so that I share comfortably and intimates never leak by accident._

**Two independent flags per item:**
- `isPrivate` — hidden from all shared views (not visible to anyone but me)
- `isLendable` — visible to connections but **not** borrowable (the "you can see it, you can't borrow it" case)

**Default behavior:**
- [ ] **Intimates + underwear categories are `isPrivate` by default** — never shown in a shared closet link unless the owner explicitly opts them in
- [ ] Any item can be marked private regardless of category
- [ ] Any visible item can be marked not-for-loan (visible but `isLendable: false`)
- [ ] Borrow flow (US-4.2) must respect `isLendable` — non-lendable items show no "Request to borrow" action
- [ ] RLS enforces `isPrivate` server-side; UI enforces `isLendable` on the borrow action

**Tickets**
- `E4-4.1` Add `isPrivate` + `isLendable` to `ClothingItem` / `@ntw/types` `Item`; default intimates+underwear to private — _0.5d_
- `E4-4.2` Privacy controls UI (per-item toggles + category defaults) — _1.5d_
- `E4-4.3` RLS policy for `isPrivate`; gate borrow action on `isLendable` — _1d_

## US-4.2 — Borrow something from a friend
_As the "Our Closet" user, I want to request to borrow a friend's item so that sharing is tracked, not chaotic._
- [ ] "Request to borrow" on a visible friend's item (borrower **must be an app user** — locked decision)
- [ ] Owner approves/declines; on approve → item `on_loan` to me (reuses E2 `loan`)
- [ ] Both see status; due-back reminders
- [ ] "Borrowed from me / by me" views; overdue flags

**Tickets**
- `E4-2.1` Borrow-request model + state machine (request→approve/decline→return) — _2d_
- `E4-2.2` Wire approved borrow into E2 `loan`/`on_loan` with real `borrowerId` — _1d_
- `E4-2.3` Borrowed-by-me / lent-by-me views + reminders — _1.5d_

## US-4.5 — Care-agreement on borrow (the thesis-prover)
_As an owner lending a high-value piece, I want my care requirements attached to the approval so that the borrower can't ruin it by washing it wrong._
- [ ] On approve (esp. `is_high_value`), owner attaches `care_agreement` ("dry clean before return", "handwash · cold · hang dry")
- [ ] Borrower must **acknowledge** (`care_ack`) before the loan activates
- [ ] Care terms visible to both for the loan's duration
- [ ] (Directly addresses the real pain: shrinking / over-drying lent clothes)

**Ticket:** `E4-5.1` `care_agreement` + `care_ack` on `borrow_requests`; approval UI surfaces care; pre-fill from item care — _1d_

## US-4.6 — Lending-buddy trust (analytics-driven)
_As a user, I want frequent, same-size lending partners recognized so that trusted friends get smoother access._
- [ ] Surface "you + X are the same size and lend often" (from E7 analytics)
- [ ] Optionally promote a buddy to a higher-trust permission tier (suggest, don't auto-apply — see DATA_MODEL open Q5)
- [ ] Sentimental/heirloom + `is_high_value` items stay excludable regardless

**Ticket stubs:** buddy detection (size match + loan frequency) · trust-tier on `connections` · per-buddy permission UI.

## US-4.3 — Trust & safety basics
_As a user, I want control and clarity so that sharing feels safe._
- [ ] Revoke a connection / unshare at any time
- [ ] Clear indicator of what each friend can see
- [ ] Block/report (basic)

**Tickets**
- `E4-3.1` Revoke/unshare + visibility audit view — _1d_
- `E4-3.2` Block/report scaffold — _1d_

---

## Dependencies
- **E1 (Supabase + RLS)** — hard dependency; RLS is the privacy enforcement layer.
- **E2 (loan + availability)** — borrowing reuses the loan object; only available items are borrowable.
- **Cold-start:** pair with an invite incentive; borrowing is useless until a friend joins. Consider a "shared closet of two" MVP (just you + one invited person) before broad social.

## Definition of done (epic)
Trusted users can share (with privacy controls), request/approve borrows that flow through the E2 loan model, see who has what, and revoke access. The growth loop (invite → join → borrow) is live.
