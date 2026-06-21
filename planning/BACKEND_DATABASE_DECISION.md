# Backend & Database Decision — Firestore vs. Supabase
## Written 2026-06-20.

> **Date:** 2026-06-20 &nbsp;·&nbsp; **Status:** LEANING SUPABASE (updated 2026-06-20 — see "Decision update" below).
> **Audience:** personal strategy notes.
> This doc is the **single source of truth** for the backend choice. The README roadmap,
> [STRATEGY_REVIEW_2026-06-20.md](./STRATEGY_REVIEW_2026-06-20.md),
> [COMPETITIVE_ANALYSIS_2026-06-20.md](./COMPETITIVE_ANALYSIS_2026-06-20.md), and
> [EngagingWebForProductDetails.md](./EngagingWebForProductDetails.md) all defer to it.
> Until this is resolved, **priority #2 ("stand up the cloud DB") is ambiguous** — it means
> either "merge PR #44 (Firestore)" or "pivot to Supabase." Resolve this first.

---

## ⭐ Decision update (2026-06-20) — the swing vote is in

The original recommendation hinged on one question: *"Is v8 social/sharing committed, or someday-maybe?"*
**Answer (founder, 2026-06-20): committed — it's the main differentiator.** The [competitive
analysis](./COMPETITIVE_ANALYSIS_2026-06-20.md) reinforces this: borrowing + the status/location/availability
spine is the uncompeted core, and those are *inherently relational, access-controlled queries*
("what has my cousin borrowed", "show everything clean + at home + not on loan", "everything in the Aspen house").

That tips the recommendation from "merge Firestore #44" to **lean Supabase**, because:
- **Row-Level Security** is the natural enforcement layer for shared-closet access + per-item/category privacy.
- **Status & location** become first-class queryable columns (`WHERE status='clean' AND location='home'`) — exactly the relational filtering Firestore is weakest at.
- It still folds in image storage + the v2.2 scraper backend on one platform.

**The corollary is now load-bearing:** if going Supabase, do it **before** #44 ships. Migrating live Firestore
user data later is the worst path. The rest of this doc is the original even-handed comparison that led here.

---

## TL;DR

There is a real fork here, and it is **not** "which DB is better in the abstract." It is:

> **Am I willing to throw away the built-and-reviewed Firestore work in [PR #44](https://github.com/unachoza/Closet-Inventory/pull/44) and re-wire the Gmail OAuth path, in exchange for a relational platform that more cleanly fits v8 social/sharing and folds the v2.2 scraper backend + the image-storage fix into one vendor?**

- **Keep Firestore** if the priority is *shipping the cloud layer now* — the code exists, auth is wired, the localStorage→cloud seed/sync is designed.
- **Move to Supabase** if the priority is *the relational future* (v8 privacy ACLs, social graph) and *platform unification* (DB + Storage for images + Edge Functions for the v2.2 scraper, one vendor).

**My lean:** if v8 social/sharing is a genuine product goal and not a someday-maybe, Supabase pays for itself by consolidating four roadmap needs onto one platform. If the cloud layer just needs to *exist* so monetization/sync can land, merge #44 and move on. **Default recommendation: merge Firestore #44 now, revisit Supabase only if/when v8 becomes committed work** — don't redo a finished backend on spec.

---

## What's actually built today

- **`main` is localStorage-only** (`useLocalCloset`). No `firebase.ts` on `main`.
- The entire cloud layer — Firestore, Firebase Auth, first-sign-in seed, offline-first sync — lives in **PR #44 `firebaseAuth`** (open, reviewed). Treat it as "done, pending merge."
- Auth is already threaded through **Firebase Auth + `gapi-script`** for Google OAuth, which is *also* the token path for Gmail import. This coupling is the hidden cost of a switch (see below).

---

## Scorecard

| Dimension | Firestore | Supabase (Postgres) |
|---|---|---|
| **Already built** | ✅ PR #44 done + reviewed | ❌ green-field rebuild |
| **Auth / Gmail OAuth coupling** | ✅ already wired (Firebase Auth + gapi) | ⚠️ re-wire; Supabase does Google OAuth but the Gmail *access-token* flow needs rework |
| **Offline-first** | ✅ best-in-class SDK offline persistence | ⚠️ weaker; manual cache/queue layer |
| **Realtime sync** | ✅ native | ✅ native (Postgres replication) |
| **v5 analytics queries** | ⚠️ `count()`/`sum()`/`avg()` supported, but **no GROUP BY / joins** | ✅ full SQL (GROUP BY, window fns) |
| **v8 social — relational graph** | ⚠️ denormalize + fan-out writes | ✅ joins + foreign keys |
| **v8 social — per-item/category privacy** | ⚠️ security rules, awkward at field grain | ✅ Row-Level Security maps cleanly |
| **Image storage (base64 ceiling fix)** | ⚠️ Firebase Storage = separate setup | ✅ Supabase Storage in-platform |
| **v2.2 scraper backend** | Cloud Functions | ✅ Edge Functions in-platform |
| **Free tier** | generous (50k reads/day) | generous (500MB DB, 1GB storage) |
| **Vendor consolidation** | DB only; Storage/Functions are separate Firebase products | DB + Storage + Functions + Auth, one dashboard |

---

## The honest read on each "Supabase wins" claim

The temptation is to frame Supabase as unifying everything. Some of that is real; some is oversold. Being honest with myself:

### ⚠️ Oversold: "v5 analytics needs SQL"
A personal closet is **hundreds of items, not millions**. Total spend, category breakdown, brand frequency, cost-per-wear — all of it is a trivial client-side `reduce()` over the already-loaded array, on *either* database. Do **not** justify a backend rewrite on analytics performance. If anything, `useClosetStats` should compute in-memory regardless of DB choice. SQL is *nicer* for v5, not *necessary*.

### ⚠️ Half-true: "Firestore can't do analytics"
Firestore **does** have aggregation queries — `count()`, `sum()`, `avg()` (added 2023–2024). Its real limitation is **no GROUP BY and no joins** — so a "spend per category per month" pivot means either denormalized counter docs or read-all-and-compute. At closet scale, read-all-and-compute is fine. So this is a developer-ergonomics point, not a capability wall.

### ✅ Genuinely strong: v8 social/sharing fits relational
This is where Supabase earns its keep:
- **Row-Level Security** maps almost 1:1 onto v8's "privacy controls per item/category" — a policy like `visible_to includes auth.uid()` is native, declarative, and enforced at the DB. In Firestore the same thing is hand-rolled security rules that get gnarly at field granularity.
- **"Share closet" links, "request to borrow," friend graphs** are inherently relational (users ↔ shares ↔ items). Joins and foreign-key integrity are the right tool; Firestore forces denormalization and fan-out writes that drift out of sync.

### ✅ Genuinely strong: platform unification
One real argument that isn't about queries:
- **Supabase Storage kills the base64-in-localStorage ceiling** (MOBILE_PLAN 🔴 — ~5MB Safari cap, fails silently, worsens the moment camera import lands). Images go to object storage, the row stores a URL.
- **Supabase Edge Functions = the v2.2 scraper backend** for free (see [EngagingWebForProductDetails.md](./EngagingWebForProductDetails.md)). With Firestore I'd stand up Cloud Functions separately.
- So Supabase answers **three** open roadmap questions at once: DB (v5.1), image storage (mobile ceiling), and the v2.2 backend host.

### ✅ Genuinely strong (the counterweight): Firestore is *done*
The single biggest argument against switching:
- **PR #44 is built and reviewed.** A switch throws it away.
- **Gmail OAuth is entangled with Firebase Auth + gapi-script.** Supabase supports Google sign-in, but the Gmail *API access-token* flow (the thing that reads order emails) was built around the Firebase/gapi path and would need re-plumbing. That's the non-obvious tax — it's not just "swap the DB client."
- **Firestore's offline-first SDK is materially better** than anything I'd hand-roll on Supabase, and the localStorage→cloud seed/sync in #44 already leans on it.

---

## Decision framing (use this, not a feature checklist)

Ask in order:

1. **Is v8 social/sharing committed, or someday-maybe?**
   - *Committed* → Supabase's RLS + relational graph is worth the rebuild. Bias Supabase.
   - *Someday-maybe* → don't rebuild a finished backend on spec. Bias Firestore.
2. **Do I want to solve the image-storage ceiling and the v2.2 backend on the same platform as the DB?**
   - *Yes, consolidate* → Supabase.
   - *Fine to run Firebase Storage + Cloud Functions as separate pieces* → Firestore is fine.
3. **How much does "ship the cloud layer this month" matter vs. "best long-term shape"?**
   - *Ship now* → merge #44.
   - *Best shape, willing to spend the days* → Supabase.

---

## Recommendation

**Merge Firestore PR #44 now** to unblock monetization/sync/multi-device, **unless** v8 social/sharing is being pulled forward into committed near-term work — in which case **pivot to Supabase before merging #44**, because doing the migration *after* #44 ships (with real user data in Firestore) is strictly more painful than doing it now while `main` is still localStorage-only.

The one thing **not** to do: merge #44, then migrate to Supabase later for v8. That's the worst path — you pay the Firestore integration cost *and* the migration cost *and* a data-migration on live users.

---

## Effort (dev-days, ideal)

| Path | Scope | Estimate |
|---|---|---|
| **Merge Firestore #44** | rebase, resolve conflicts, QA seed/sync, ship | **1–2 days** |
| **Pivot to Supabase** | schema design, RLS policies, auth + Gmail-token re-wire, port `useCloudCloset`, data shape migration, QA | **5–8 days** |
| **Supabase Storage for images** (either path, but free if on Supabase) | upload pipeline, URL migration off base64 | **1.5–2.5 days** |

---

## Does the DB choice affect email-provider expansion? (Hotmail/Outlook/Yahoo/iCloud/Proton/AOL)

**Short answer: no — the DB choice is largely orthogonal.** What gates multi-provider import is *having a
backend at all* (which is this decision) plus the provider's protocol, not whether that backend is Firestore
or Supabase. Both can host the token store and the fetch functions.

Providers split into two protocol classes, and **that** split is what matters:

| Provider | Protocol | Backend need | Notes |
|---|---|---|---|
| Gmail | Google API (OAuth) | token refresh server-side | already wired |
| **Hotmail + Outlook.com** | **Microsoft Graph (OAuth)** | one integration | ⭐ **Hotmail and Outlook.com are the same Microsoft consumer mail — a single Graph integration covers BOTH.** Your #1 priority is cheaper than it looks. |
| Yahoo Mail | IMAP (OAuth) | **server-side IMAP** | browsers can't speak IMAP (raw TCP, not HTTP) — mandatory backend |
| iCloud Mail | IMAP (app-specific password) | server-side IMAP | no public API; app-password + IMAP only |
| AOL Mail | IMAP (OAuth, Yahoo-owned) | server-side IMAP | same stack as Yahoo |
| **ProtonMail** | **none usable from a web app** | ❌ | E2E-encrypted; no standard IMAP without Proton **Bridge** (desktop-only). **Effectively infeasible for a web app — drop it or treat as "export a file" only.** |

**Implications:**
- **OAuth-API providers** (Gmail, Microsoft Graph) are the easy tier — same shape as today's Gmail flow.
- **IMAP providers** (Yahoo, iCloud, AOL) need a server-side IMAP client. This is a backend *capability*, not a DB feature — so it's neutral to Firestore-vs-Supabase **with one nuance:** Supabase **Edge Functions run Deno**, where IMAP libraries are less mature than Node's (`imapflow`, `node-imap`). That's *not* a blocker — you can run a small **Node** service (Cloud Run / Render / Fly) alongside Supabase Postgres for the IMAP work. Just don't assume Edge Functions alone will carry heavy IMAP.
- **ProtonMail** is the only true wall, and it's a protocol wall, not a DB one.

**Net:** prioritize **Microsoft Graph next** (covers Hotmail #1 *and* Outlook in one build), then a shared **IMAP service** for Yahoo/iCloud/AOL, and **shelve ProtonMail**. None of this changes the Firestore-vs-Supabase math — but it *does* reinforce "you need a real backend," which is this decision.

---

## Open questions to resolve before acting

- [x] Is v8 social/sharing committed near-term, or parked? → **Committed (2026-06-20). Swing vote favors Supabase.**
- [ ] Confirm current Firestore aggregation limits against the live docs before relying on client-side compute as the v5 plan.
- [ ] If Supabase: prototype the Gmail access-token flow under Supabase Auth **first** — that's the riskiest unknown, spike it before committing.
- [ ] Decide IMAP host (Supabase Edge/Deno vs. a small Node service) before starting Yahoo/iCloud/AOL — affects the v2.3 estimate, not the DB choice.
