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

> **✅ Resolved (2026-07-05):**
> - **(a) ~80 items confirmed** as the free-tier cap. Reframed: once images are in secure storage, 80 is a
>   **business/cost cap**, not a base64 technical ceiling. Validate against storage $ and conversion goals
>   before launch; the number is the right *order of magnitude*, not a sacred figure.
> - **(b) A true no-account/offline mode still exists as a fallback** — but it carries real data-loss risk
>   (iOS Safari evicts localStorage after ~7 idle days for non-installed sites) and is not the recommended
>   path. Users in offline mode are **progressively warned** at 30 / 50 / 75 items (see US-10.7 below).
>   Rejected alternative: force account creation immediately — too aggressive; a genuine free/local path must
>   remain for discovery and trust-building.

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

## US-10.7 — Progressive no-account warnings (offline → account conversion funnel)
_As a user in offline/no-account mode, I want clear, honest warnings as my closet grows so that I understand the risk to my data and can choose to protect it — without being forced into an account I didn't ask for._

> **Context (2026-07-05):** a true no-account offline mode still exists as a fallback. But iOS Safari evicts
> localStorage after ~7 idle days for non-installed sites — a user who hasn't visited in a week can silently
> lose their entire closet with zero warning. The progressive modal sequence is the mitigation: honest
> disclosure at each threshold, with a clear path to safety, without forced conversion.

**Three trigger thresholds:**

| Items | Modal tone | Core message |
|---|---|---|
| 30 | Informational (low urgency) | "Your closet is growing — create a free account to keep it safe" |
| 50 | Advisory (medium urgency) | "50 items stored locally — here's what that means for your data" |
| 75 | Warning (high urgency) | "75 items at risk — local storage can be cleared by your browser at any time" |

**Each modal must cover two distinct risks (both, not just one):**

1. **Security:** local storage has no access controls — on a shared device, another app or browser tab
   can read it. Your closet items (including photo data if base64) are not private without an account.
2. **iOS Safari 7-day idle eviction:** for non-installed web apps on iOS, Safari evicts localStorage for
   sites not visited in ~7 days. A user who travels and doesn't open the app for a week comes back to an
   empty closet. This is not hypothetical — it is Apple's documented ITP behavior.

**Modal spec per threshold:**

```
[30 items]
Title: "Your closet is growing"
Body:  "You have 30 items saved locally. Create a free account to back them up securely — 
        your data stays on your device right now, but it can be cleared if you don't visit 
        for a while. It takes 30 seconds."
CTA:   "Create free account" (primary) · "Not now" (dismiss, does not re-show until 50)

[50 items]
Title: "Keep your closet safe"
Body:  "50 items saved on this device. Two things to know: (1) On iPhone, Safari can 
        automatically clear app data after about a week of not visiting. (2) On a shared 
        device, anyone can access local data. A free account protects both."
CTA:   "Secure my closet" (primary) · "I understand the risk" (dismiss, re-shows at 75)

[75 items]
Title: "75 items at risk"  
Body:  "You've built a real wardrobe here. Local storage isn't backed up and can be 
        cleared without warning — especially on iPhone Safari. Create a free account now 
        to protect it. Free accounts include secure image storage."
CTA:   "Protect my closet — it's free" (primary) · "Remind me later" (snooze 7 days only)
```

**Behavior rules:**
- Each modal fires **once per threshold crossing** — not on every session.
- The 75-item modal snoozes for 7 days maximum, then re-shows if still no account. It does **not** have a
  permanent dismiss — at 75 items the risk is too high to let users silently ignore it forever.
- Modals are **non-blocking** — the user can always dismiss and continue using the app. No forced wall.
- Once a lightweight account is created, all three modals are permanently suppressed.
- Copy is **internal-placeholder** for now — final tone TBD, but the two risks (security + iOS eviction)
  must both be present in the 50 and 75 item modals.

**Ticket stubs:**
- `E10-7.1` Item-count threshold hook — fires when count crosses 30 / 50 / 75 in no-auth mode
- `E10-7.2` Modal component (3 variants keyed by threshold, dismissal state persisted to localStorage)
- `E10-7.3` 75-item 7-day snooze + re-show logic
- `E10-7.4` Suppress all modals on account creation (clear the threshold flags)

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
