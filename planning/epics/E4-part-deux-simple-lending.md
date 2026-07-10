# E4 Part Deux — Simple Lending (Loan Modal + Lent View)

> **Date:** 2026-07-10 · **Parent epic:** [E4 · Shared & Social](./E4-shared-social.md) (US-4.2 lite, CP1–CP4, SL2, F3) ·
> **Status:** 📐 design · **post-MVP** (after [Part Une](./E4-part-une-view-friends-closet.md) ships)
> **Mockups:** [planning/design/mockups/simple-lending-flow.html](../design/mockups/simple-lending-flow.html)
> **Goal:** Track loans of **my** items to real people — who has what, since when, gently nudged home.
> Owner-recorded, works even when the borrower has no account. This is the *Lending Circle lite* that the
> Closet Pair origin story demands, and the on-ramp to full borrow-requests (US-4.2) later.

---

## What "simple" means (scope fence)

**In:** the owner records a loan on their own item; a Lent view; gentle nudges; one-tap return.
**Out (full US-4.2, later):** borrower-initiated requests, approvals, borrower-side views, care
acknowledgements (`care_ack`), trust tiers. Simple lending needs **no second account** — but when the
borrower *is* a known viewer (Part Une), we link the loan to them so upgrade is seamless.

**Already built to stand on (E2):** `ItemStatus "on_loan"`, `LoanRecord { borrowerName, since, dueBack? }`
on `ClothingItem`, `lend`/`return_loan` transitions in `src/utils/statusTransitions.ts`, and the
"With a friend" location kind (`other`). Simple lending is mostly **UI + one schema nudge**, not a new model.

---

## The three personas in the room

| Persona | Their loan | What the design owes them |
|---|---|---|
| **Maya (26)** | One-off: lent the going-out top after pres, forgot by Tuesday | Zero-ceremony capture — two taps from the card, freeform name, no due date required |
| **The Closet Pair (30–34)** | Recurring, two-way, cross-city: the grey blazer lives in transit | Person-first Lent view ("what's with MJ"), location auto-set to "With {person}", the **neutral nudge** so nobody has to compose an awkward text |
| **Sloane (29)** | High-value: Valentino heels "with a friend who definitely has them, I think" | Care note attached at lend time, `since` duration always visible (the black hole is *time*), lent history as provenance |

---

## US-4.2a — Record a loan in two taps
_As Maya, I want to mark an item "lent to Priya" the moment it leaves my hands so that my closet stays true without ceremony._

- [ ] "Lend…" from card quick actions (already a transition) opens the **loan modal**
- [ ] Person field: recent borrowers first, then freeform name; if the person is a Part-Une viewer, offer to link them
- [ ] Dates: `since` defaults to today; `dueBack` optional ("no rush" is a valid loan)
- [ ] Optional care note, **prefilled from the item's care data** for `is_high_value` items (Sloane)
- [ ] On save: status → `on_loan`, location → "With {person}" (`other` kind, auto-created per person), `LoanRecord` written

## US-4.2b — See everything that's out
_As the Closet Pair, I want one view of what's currently with another person so that I know what I can't wear without texting._

- [ ] "On loan" view grouped **by person** (not by item) — the mental model is "what does MJ have"
- [ ] Each item shows `since` as a human duration ("3 weeks") — duration is the signal, dates are noise
- [ ] Overdue = past `dueBack`, or a **soft threshold** (60 days) when no due date — flagged calmly (terracotta, not red)
- [ ] Entry points: bottom-nav Closet filter chip + the existing status border/legend

## US-4.2c — Nudge without the awkward text
_As Sloane, I want a neutral way to ask for my heels back so that the app is the bad guy, not me._

- [ ] "Nudge" on any loan opens a share sheet with a **prewritten, warm, editable** message ("Hey! Packing for a trip and think my Valentino heels might still be with you — no rush, just tracking my closet 💛")
- [ ] Never auto-sent, never in-app-to-borrower (they may have no account) — it's a composed text, owner presses send
- [ ] Nudged date recorded on the loan ("asked 2w ago") so she knows she already asked

## US-4.2d — One-tap return, honest status
_As the Closet Pair, I want "it's back" to be one tap so that state updates the moment it comes home._

- [ ] "Returned" on the loan/card → clears `LoanRecord`, location → home
- [ ] **Return prompt: "Straight to the wash?"** — default **dirty**, secondary "it's clean." Borrowed clothes come back worn; this mirrors the `return_home → dirty` domain rule.
  ⚠️ **Flag:** `return_loan` currently transitions `on_loan → clean` in `statusTransitions.ts` — this design
  proposes changing it to the same ask-with-dirty-default treatment (consistency with the 2026-07 `return_home`
  decision). One-line change + test update, but it's a **domain-rule change — confirm before building.**
- [ ] Return closes the loan into a per-item **loan history** (Sloane's provenance: "with Chloe, Mar–Jun 2026")

---

## Data model (delta only)

```
LoanRecord (existing, extend)
  borrowerName   string        -- freeform (exists)
  since          ISO (exists)
  dueBack?       ISO (exists)
+ borrowerViewerId? uuid       -- link to closet_viewers when known (Part Une bridge)
+ careNote?      string        -- lend-time care terms (precursor to US-4.5 care_agreement)
+ nudgedAt?      ISO           -- last nudge, shown as "asked 2w ago"

+ loan_history   (new table or JSONB array) -- closed loans: borrower, since, returnedAt
```

Supabase: `items.loan` already syncs as part of the item row; `loan_history` rides the same RLS as items.
No new policies needed until borrower-side access exists (full US-4.2).

## Tickets

- `E4-2.0a` Loan modal (person recents + freeform, dates, care-note prefill for high-value) wired to the existing `lend` transition; auto location → "With {person}" — _1.5d_
- `E4-2.0b` `LoanRecord` extensions (`careNote`, `nudgedAt`, `borrowerViewerId`) + `loan_history` on return — _1d_
- `E4-2.0c` "On loan" view: group-by-person, durations, overdue flags (dueBack or 60-day soft threshold) — _1.5d_
- `E4-2.0d` Nudge share-sheet with prewritten editable text + `nudgedAt` stamp — _0.5d_
- `E4-2.0e` Return prompt (dirty-default) — **includes the `return_loan → clean` domain-rule change (confirm first)** + statusTransitions test updates — _0.5d_

**Total ≈ 5 dev-days.** All five personas' lending stories (CP1–CP4, SL2, F3, Maya's one-off) are covered
by this slice; full borrow-requests (US-4.2 proper) layers on top without rework.

## Dependencies & notes

- **E2 status/location spine** (done) — loans are a status + a location + a record, nothing more.
- **Part Une optional but synergistic** — a linked viewer sees "you have Arianna's blazer" when full US-4.2 arrives.
- **Nudge copy is a product surface**, not filler — the Closet Pair's #1 pain is "no graceful way to ask."
  Tone: warm, blame-free, mentions the app as the reason for asking. Localize later (E13).
- Reminder scheduling (push at dueBack) deferred — needs notification infra; the Lent view's passive flags cover the MVP.
