# E4 · Shared & Social ⭐

> **Date:** 2026-06-20 · **Pillar:** Social (the differentiator + growth loop) · **Detail:** full · **README:** v8.1 · **Est:** ~9–13 dev-days
> **Goal:** Let people share closets and **borrow** real garments with trusted friends/family — the
> "Our Closet" origin and the only feature with a built-in growth loop. Built on Supabase RLS (E1) and
> the availability/loan model (E2).
> ⚠️ Hardest, riskiest milestone: trust, privacy, and the empty-network cold-start. Spec it before building.

---

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

## US-4.2 — Borrow something from a friend
_As the "Our Closet" user, I want to request to borrow a friend's item so that sharing is tracked, not chaotic._
- [ ] "Request to borrow" on a visible friend's item
- [ ] Owner approves/declines; on approve → item `on_loan` to me (reuses E2 `loan`)
- [ ] Both see status; due-back reminders
- [ ] "Borrowed from me / by me" views; overdue flags

**Tickets**
- `E4-2.1` Borrow-request model + state machine (request→approve/decline→return) — _2d_
- `E4-2.2` Wire approved borrow into E2 `loan`/`on_loan` with real `borrowerId` — _1d_
- `E4-2.3` Borrowed-by-me / lent-by-me views + reminders — _1.5d_

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
