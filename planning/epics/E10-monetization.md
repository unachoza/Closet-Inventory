# E10 · Monetization 🔅

> **Date:** 2026-06-20 · **Updated:** 2026-07-05 · **Pillar:** Business · **Detail:** medium · **README:** v1.0 (Stripe)
> **Goal:** Sustainable revenue via a PWA (no App Store / no 30% cut — Stripe ~2.9% + 30¢, keep ~97%).
> Free tier to hook; premium for the differentiated power features and the **cost-bearing** ones (web enrichment).
>
> ### 🧭 2026-07-05 rethink — tiers, free-tier durability, enrichment paywall
> Two decisions from the status/location planning session reshape this epic:
> 1. **The free tier requires a lightweight account** (anonymous or email) so images land in **secure cloud
>    storage**, not evictable base64 — this both closes a data-loss blind spot *and* makes "your images are
>    stored securely" a trust/marketing lever. This **supersedes** the old "free = local only."
> 2. **Web enrichment (the expensive path) is gated by a hybrid _monthly-quota + email-age_ model** — internal
>    framing for now; user-facing explanation is a later problem.
> _These are **internal planning docs** — no UI or logic yet._

---

## The user matrix — auth × data-richness (supersedes the flat "3 types")

The product's "3 user types" actually mix **two independent axes**. Modelling them as one ladder will bite us
(you can have a full account with zero Gmail, or Gmail-connected but shallow). The real space:

| | **No / lightweight account** | **Full account** |
|---|---|---|
| **Manual only** | ① Local-first trial (lightweight acct, secure storage, capped) | ④ Manual power user (sync, unlimited, no email) |
| **Gmail — recent/cheap parse** | ② Import-curious (recent, image-rich emails; cheap) | ⑤ Connected free (recent history, within quota) |
| **Gmail — deep/web enrichment** | — (requires account) | ⑥ Premium (18-mo scrape + web enrichment beyond quota) |

- **Transient state that matters most:** ①→④/⑤ **anonymous → account migration** — do the ~80 local items
  merge into the cloud on signup? (Yes; it's the key conversion moment — see US-10.5.)
- The former "just downloaded / gmail import / full profile" list maps to **columns/rows of this matrix**, not
  three rungs. Gmail OAuth builds the **user** profile (name/avatar); wardrobe data comes from **scraping**, a
  *separate* consent.

---

## US-10.1 — Upgrade to premium
_As a power user, I want to subscribe so that I unlock unlimited items, deep import, sync, and social._
- [ ] Stripe Checkout (hosted) + Customer Portal (self-serve billing)
- [ ] Webhook → Supabase `users.isPremium`
- [ ] Feature gates read `isPremium`

**Ticket stubs:** Stripe Checkout · Customer Portal · webhook→Supabase · gate helper.

## US-10.2 — Free tier that converts (revised)
_As a new user, I want a genuinely useful free tier so that I try before I buy — without risking my data._
- [ ] **Free = lightweight account** (anonymous or email/OTP), **secure cloud image storage**, cross-device
      read. Replaces "local only."
- [ ] **Item cap ~80** — see the note below; this is now a **business/cost cap**, not a technical ceiling.
- [ ] Free includes: manual entry, **recent/cheap Gmail parse** (image-rich, no web calls), status/location.
- [ ] Premium: unlimited items, **deep web enrichment** beyond quota, 18-month scrape, cloud sync across
      devices, social/borrow, camera import, multi-home custom locations (coordinate w/ E2 `P1-6`).
- [ ] Item-limit + feature enforcement in the closet hook / gate helper.

> **⚠️ Open tension to resolve (flagged, not decided):** the earlier steer was "free users get **local storage
> as much as the phone allows (~80)**"; the newer steer is "**require a lightweight account, images stored
> securely**." These pull opposite ways. Reconciliation drafted here: **free = lightweight account + secure
> storage**, and the **~80** becomes a *storage-cost* cap rather than the base64 ceiling. Confirm: (a) is ~80
> the number, and (b) is a truly-no-account/offline mode still wanted as a fallback?

**Ticket stubs:** free-limit enforcement · gate helper · lightweight-auth (anonymous/OTP) onboarding.

## US-10.3 — Data durability as a feature (the security/trust angle)
_As a free user, I want my closet backed up and my images stored securely so that I never lose it — the whole point of the product is not losing track of my stuff._
- [ ] **Why this exists (blind spot closed):** signed-out localStorage on iOS Safari is **evicted after ~7
      idle days** for non-installed sites — a local-only free user can silently lose their entire closet.
      Requiring a lightweight account + secure storage removes this.
- [ ] Free-tier images → secure object storage (signed URLs), not base64-in-localStorage.
- [ ] Messaging (internal note): "your closet is backed up · your images are stored securely" — a trust lever
      for a trust-first brand. Also nudge "Add to Home Screen" for PWA durability.
- [ ] Base64-local remains only a **transient offline buffer**, flushed to secure storage on next sign-in.

**Ticket stubs:** anonymous/lightweight auth path · base64→secure-storage flush on auth · "backed up" indicator.

## US-10.4 — Enrichment paywall (hybrid quota + age)
_As the business, I want the **cost-bearing** web-enrichment path gated so that heavy API usage maps to revenue, while cheap parsing stays free._
- [ ] **Cheap tier (free):** parse **recent, image-rich** order emails — no web calls, near-zero marginal cost.
- [ ] **Deep enrich (metered):** server-side PDP fetch + LLM enrichment for **thin/older** emails (fewer images
      → more web engagement → real API cost — see [E3 US-3.2](./E3-frictionless-fill.md#us-32--richer-details-from-the-web-️-priority-bumped)).
- [ ] **Hybrid gate:** _(internal model — user explanation deferred)_
  - **Monthly quota:** N free deep-enrichments / month (predictable billing).
  - **Age band:** emails **within X months** parse cheap/free; **older than X** consume quota or require premium
    (matches the cost curve — older = less structured = more enrichment).
  - Premium lifts the quota (and unlocks the full 18-month scrape).
- [ ] Per-user cost accounting so a runaway "deep scrape" can't blow the unit economics.

**Ticket stubs:** enrichment-cost meter per user · quota counter + reset · age-band router (cheap vs deep) · premium quota lift.

## US-10.5 — Anonymous → account migration
_As a trial user, I want my local closet to come with me when I create an account so that I don't start over._
- [ ] On signup, **merge the local (~80) closet into the cloud** (dedupe by id); flush base64 images to storage.
- [ ] This is the primary **conversion moment** — instrument it.
- [ ] Handle the edge: same person, two devices, both with local data → merge, last-write-wins (ties to E1 sync).

**Ticket stubs:** local→cloud merge on first auth · image flush · conversion instrumentation.

## US-10.6 — "Deeper enrichment available" indicator (freemium surface)
_As a user, I want a clear, non-nagging indicator that deeper web scraping is available so that I understand the upgrade without being blocked mid-flow._
- [ ] A subtle affordance on thin/older items ("Enrich from the web — uses 1 of your N credits" / "Premium").
- [ ] Shown at the moment it's useful (a sparse item), not as a global banner.
- [ ] Copy is internal-placeholder for now.

**Ticket stubs:** enrich-available badge on sparse items · quota-aware CTA state.

---

## Blind spots & open questions (be-critical log)

- [ ] **Gmail app verification is a hard gate on the whole scrape story.** `gmail.readonly` is a **restricted
      scope** → Google **app verification + CASA security assessment** required, or you're capped at 100 test
      users behind an "unverified app" screen (see launch memo). 18-month scraping *cannot* scale without it —
      this is a prerequisite for US-10.4/⑥, not a detail. Track as a launch gate.
- [ ] **Privacy scope:** 18-month inbox reading is a lot of PII for a trust brand — minimize to messages
      matching the retailer query; be explicit in consent.
- [ ] **~80 number is unvalidated** beyond the base64 math; once images are in secure storage, the cap is a
      pure cost/business choice — pick it against storage $ and conversion goals.
- [ ] **What's actually behind the paywall?** Confirm the split: is *recent Gmail import itself* free (with
      account), or is any Gmail import premium? Current draft: recent/cheap = free-with-account; deep = metered.
- [ ] **Web scraping fragility/ToS:** PDP scraping hits anti-bot (Cloudflare 403 already verified in E3) and
      retailer ToS — cost *and* reliability risk, not just billing.

---

## Dependencies
- **E1 (Supabase `isPremium` + secure storage + sync)** + **E5 (PWA install path)** are hard prerequisites.
- **E3 (web enrichment cost)** is what US-10.4 gates; **E12 (profile/onboarding)** hosts lightweight-auth +
  location naming; **E2 (multi-home custom locations, `P1-6`)** may be a premium affordance.
- Gate the differentiators (E2/E3/E4) and the **cost-bearing** paths behind premium; keep basic inventory +
  recent cheap import free. **Expand into full stories/tickets when scheduled.**
