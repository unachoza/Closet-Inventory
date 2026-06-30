# 🚀 Launch Roadmap — Beta to Waitlist (2026-06-29)

> **Goal:** Ship a *safe, honest* beta to the **30-person waitlist** as fast as is responsible.
> **Decision context (2026-06-29):** Gmail = test-user mode now (verify in parallel) · capacity = solo ~30 hrs/wk + moderate AI · PWA = full installable · lending = simple E2 free-text (NOT E4 social).
> **Supersedes** the `SPRINTS.md` 8-item order *for launch sequencing*. Post-launch reverts to the epic backlog.

---

## ⏱️ Timeline verdict — read this first

**2 weeks: not realistic. 1 month: at risk (because you chose full installable PWA). Honest target: ~6–8 weeks to a safe beta.**

| Block | Scope | Ideal dev-days |
| ----- | ----- | -------------- |
| **0 · Prove-it gates** | Verify Gmail import + RLS isolation actually work (see below) | 0.5–1 |
| **A · Launch-gate security/privacy** | RLS 2nd-account tests, dev/prod split, account deletion+export, push storage migration, secret scan, CSP/HSTS, privacy policy + Limited Use | 5–8 |
| **B · Inventory spine** ⭐ | status (chip+transitions+quick-actions), location (field+tag+grouped view+CRUD), status/location filters, simple lend modal + lent-out view, availability | 6–9 |
| **C · Mobile + full PWA** | responsive fixes, touch/bottom-nav/FAB, manifest+icons, service worker, offline shell, iOS full-screen | 5–7 |
| | **+20% integration/bugfix/sync-verification buffer** | — |

≈ **16–24 ideal dev-days → ~19–29 with buffer → ~6–8 calendar weeks** at 30 hrs/wk.

**The one lever that pulls this to ~4–5 weeks:** drop **full PWA → "fix mobile rendering only"** and ship installable-PWA as a fast-follow. Waitlisters can use the responsive web app on day one; "add to home screen" lands a week or two later. Strongly recommended if the 1-month target is hard.

---

## 🚦 Block 0 — Prove-it gates (DO THESE FIRST, half a day)

These two assumptions are load-bearing for the entire launch and **neither is currently verified**. If either fails, the roadmap changes shape — so spend the half-day before committing to estimates.

- [ ] **`G0.1` Prove Gmail import works end-to-end.** Sign in with a real Google account, run a live import, confirm products parse. ⚠️ The docs contradict themselves: the SPRINTS interlude marks the Gmail spike `E1-1.1` ⏸️ **blocked** (`redirect_uri_mismatch`, 24h+), but Block B marks it ✅. The live `useSupabaseAuth` uses Supabase-mediated `signInWithOAuth` (may work where the standalone `GmailSpike` didn't) — but the entire parser suite runs on **canned fixtures, never a live API round-trip**. Resolve this contradiction empirically before building a Gmail-centric launch.
- [ ] **`G0.2` Prove RLS blocks a second account.** Create a 2nd Supabase user, attempt to read/write account #1's items + Storage objects. Must fail. This is a ~half-day test that **gates the entire launch thesis** (don't repeat the Tea App breach). If isolation is broken, every other estimate is moot.
- [ ] **`G0.3` Prove cloud sync round-trips with a live session.** E1-1.x is marked done but was never exercised with a real signed-in session (only unit-tested). Add an item on device A, confirm it appears on device B. Launching 30 users onto never-exercised sync is a day-eater if it's subtly broken.

---

## 📋 Reorganized launch priority

1. **Block 0 — Prove-it gates** (above)
2. **Block A — Security & Privacy** (launch gate; non-negotiable per "pristine" bar)
3. **Block B — Inventory Spine** ⭐ (status · location · availability · simple lend — the differentiator)
4. **Block C — Mobile + PWA**
5. **🚀 LAUNCH to 30 waitlisters (test-user mode)**

**Explicitly POST-MVP (do NOT build for launch):**
- **E4 Lending/Request-to-Borrow** social loop — *your stated #1 post-MVP priority*. Needs RLS + profiles + trust model. The MVP only gets E2 free-text "lent out" tracking.
- **Hotmail/Outlook + Yahoo import** (E1-5.x / E1-6.x) — *your stated #2 post-MVP*. Separate identity providers, separate verification gates.
- E11 laundry forecast, E12 profile, E6 outfit builder, E7 insights, E8 care deep-dive, E9 travel, E10 monetization.

---

## 🔐 Block A — Security & Privacy launch checklist

Each item maps to an existing E1-4.x ticket; this is the launch-ordered view.

**Must-have before a single real user (hard gate):**
- [ ] `G0.2` RLS second-account isolation proven (tables + Storage) — *also Block 0*
- [ ] **Dev/prod Supabase split** — you're currently running ONE project as both. Real users' data must not mix with dev data. (`E1-4.12`)
- [ ] **Push** `20260629000001_storage_validation.sql` to prod (`supabase db push`) — server-side size/MIME enforcement is written but not live (`E1-4.11`)
- [ ] **Account deletion + data export** — legal right-to-erasure/portability; your privacy policy will *promise* this, so it must exist. Delete rows AND Storage objects. (`E1-4.8`)
- [ ] **Secret hygiene** — confirm `.env` gitignored, scan git history for leaked keys, rotate anything exposed (`E1-4.3`)
- [ ] **Base64→Storage migration + legacy wipe** for any existing cloud items; no orphaned base64 left behind (`E1-2.2` / `E1-4.5`)

**Strongly recommended before launch:**
- [ ] CSP (`script-src 'self'`) + HSTS at the Vercel layer — verify it doesn't break Google OAuth SDK first (`E1-4.7`)
- [ ] Supabase platform hardening: `service_role` key never in browser, audit `SECURITY DEFINER` functions, enable leaked-password protection (`E1-4.10`)
- [ ] CI dependency + secret scanning (`E1-4.3`)
- [ ] Logging hygiene — never log tokens/OAuth codes/PII (`E1-4.12`)

---

## 📜 Privacy Policy — to-do (required for Google + for launch)

- [ ] **Engage:** write or generate (Termly/iubenda/Vanta-style) a policy hosted at a **public URL** (needed for the OAuth consent screen)
- [ ] **Data collected:** Google account identity; Gmail message content (read-only, parsed for import only); uploaded photos; wardrobe data
- [ ] **Why each is collected** — plain-language Gmail-parsing-for-import justification
- [ ] **Retention:** how long emails/photos are kept; what "delete" means in your system
- [ ] **Third parties:** name Supabase as infra processor; state data is **not sold / not used for ads**
- [ ] **User rights:** account deletion + data export (must match the built `E1-4.8` feature)
- [ ] **Google Limited Use disclosure** (required for restricted scopes): Gmail data won't be used for ads, won't be sold/transferred except for security, isn't human-read except w/ consent or for security/legal
- [ ] **Contact** for privacy requests
- [ ] **Terms of Service** URL (recommended; sometimes required by Google)
- [ ] Link both URLs in the Google OAuth consent screen config

> **Dependency:** finalize the policy *after* `E1-4.8` (deletion/export) is built, so it doesn't promise something that isn't there.

---

## 🔑 Gmail OAuth — launch-now (test mode) + verify-in-parallel

### Launch-now: test-user mode (no verification needed)
- [ ] In Google Cloud Console, keep the OAuth app in **"Testing"** publishing status
- [ ] Add your **30 waitlisters' Gmail addresses** as test users (cap = 100). ⚠️ They must sign in with the *exact* Google account you list. Note: **Gmail import only benefits the Gmail users** among your waitlist — collect which providers they use.
- [ ] Write onboarding copy explaining the **"Google hasn't verified this app"** warning is expected for beta, with click-through steps (*Advanced → Go to Nothing To Wear*). This *will* spook non-technical users without it.
- [ ] ⚠️ **Caveat to verify:** apps in Testing status issue refresh tokens that **expire after ~7 days** for sensitive/restricted scopes — meaning test users may need to **re-auth weekly** until you reach production verification. Confirm this against current Google policy; if true, it undermines `E1-4.4` server-side refresh while in test mode and belongs in your onboarding expectations.

### Verify-in-parallel: production verification + CASA (start NOW, ~1–3 months)
**Gate 1 — OAuth app verification**
- [ ] Verify domain ownership (Google Search Console) for the prod domain
- [ ] Privacy policy + ToS URLs live and linked on consent screen
- [ ] App logo, support email, developer contact
- [ ] Written justification for *why* `gmail.readonly` is needed (specific: "parses purchase-confirmation emails to auto-import wardrobe items")
- [ ] Record demo video of the consent flow + exact scope usage
- [ ] Submit for verification; respond to review rounds (Google's queue — weeks)

**Gate 2 — CASA security assessment** (restricted-scope requirement, after Gate 1)
- [ ] Determine tier — `gmail.readonly`-only likely **Tier 2** (self-assessment via approved tool), not Tier 3 (full pentest)
- [ ] Engage a CASA-authorized validator from Google's approved list
- [ ] Remediate findings (overlaps Block A — `E1-4.3/4.7/4.10`)
- [ ] Submit report; **repeat annually** for as long as the restricted scope is used

> **Bottom line on Gmail:** verification is **not** your launch blocker — test mode unblocks the 30-user beta in weeks. But start Gate 1 now because the review queue is the long pole for the eventual public launch.

---

## 🧱 Block B — Inventory Spine (the differentiator) — ticket map

Pull from `E2-inventory-truth.md`. Status clean/dirty + wornCount stay E11's canonical fields; E2 extends the enum.

- **Status:** `E2-1.2` `statusTransitions.ts` + tests · `E2-1.3` status chip on card · `E2-1.4` quick-action menu (desktop ⋯ / mobile long-press)
- **Location:** `E2-2.1` location field + primary default · `E2-2.2` `locationGroups.ts` + tests · `E2-2.3` location tag on card (hidden at home) · `E2-2.4` "where is everything" grouped view
- **Filters:** `E2-3.1` status+location dimensions in `useClosetFilters` (⚠️ hardcoded `DIMENSIONS` array edit) · `E2-3.2` quick-view presets
- **Simple lend (MVP version):** `E2-5.1` `loan` object + lend modal (free-text borrower + due date) · `E2-5.2` "lent out" view + overdue flag
- **Availability:** `E2-6.1` `isAvailable(item)` = clean + home + not on loan

---

## 📱 Block C — Mobile + Full PWA — ticket map

Pull from `E5-mobile-pwa.md`. (Lever: if cutting to ~4-5 weeks, do only the *touch/responsive* half now, defer the PWA-shell half.)

- **Mobile/touch:** `E5-1.1` 44×44 tap-target audit · `E5-1.2` bottom nav · `E5-1.3` Add-Item FAB · `E5-bug.1` sticky-nav overlap
- **PWA shell:** `E5-2.1` manifest + icons · `E5-2.2` service worker · `E5-2.3` iOS full-screen · `E5-3.1` offline closet view

---

## 🎯 Definition of "ready to launch"

- [ ] Block 0 gates all green (Gmail import, RLS isolation, sync round-trip proven)
- [ ] Block A security must-haves complete; privacy policy live
- [ ] Status + location + simple-lend usable on mobile
- [ ] App is installable / mobile-clean (per chosen PWA scope)
- [ ] 30 waitlisters added as Google test users + onboarding email with the unverified-app explainer
- [ ] Gmail verification Gate 1 *submitted* (not necessarily approved)
