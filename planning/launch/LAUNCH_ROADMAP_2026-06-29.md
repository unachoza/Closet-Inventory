# 🚀 Launch Roadmap — Beta to Waitlist (2026-06-29)

> **Goal:** Ship a _safe, honest_ beta to the **30-person waitlist** as fast as is responsible.
> **Decision context (2026-06-29):** Gmail = test-user mode now (verify in parallel) · capacity = solo ~30 hrs/wk + moderate AI · PWA = full installable · lending = simple E2 free-text (NOT E4 social).
> **Supersedes** the `SPRINTS.md` 8-item order _for launch sequencing_. Post-launch reverts to the epic backlog.

---

## ⏱️ Timeline verdict — read this first

**2 weeks: not realistic. 1 month: at risk (because you chose full installable PWA). Honest target: ~6–8 weeks to a safe beta.**

| Block                                | Scope                                                                                                                                                     | Ideal dev-days |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| **0 · Prove-it gates**               | Verify Gmail import + RLS isolation actually work (see below)                                                                                             | 0.5–1          |
| **A · Launch-gate security/privacy** | RLS 2nd-account tests, dev/prod split, account deletion+export, push storage migration, secret scan, CSP/HSTS, privacy policy + Limited Use               | 5–8            |
| **B · Inventory spine** ⭐           | status (chip+transitions+quick-actions), location (field+tag+grouped view+CRUD), status/location filters, simple lend modal + lent-out view, availability | 6–9            |
| **C · Mobile + full PWA**            | responsive fixes, touch/bottom-nav/FAB, manifest+icons, service worker, offline shell, iOS full-screen                                                    | 5–7            |
|                                      | **+20% integration/bugfix/sync-verification buffer**                                                                                                      | —              |

≈ **16–24 ideal dev-days → ~19–29 with buffer → ~6–8 calendar weeks** at 30 hrs/wk.

**The one lever that pulls this to ~4–5 weeks:** drop **full PWA → "fix mobile rendering only"** and ship installable-PWA as a fast-follow. Waitlisters can use the responsive web app on day one; "add to home screen" lands a week or two later. Strongly recommended if the 1-month target is hard.

---

## 🚦 Block 0 — Prove-it gates (DO THESE FIRST, half a day)

✅ **ALL GATES CLEARED (2026-06-30)** — Launch thesis validated. The critical GRANT bug was fixed in `20260629000002_grant_table_privileges.sql`; both infrastructure and end-to-end flows now work.

- [x] **`G0.1` Prove Gmail import works end-to-end.** (2026-06-30) ✅ Sign in with Google account via Supabase Auth, live email import, products parse correctly.
- [x] **`G0.2` Prove RLS blocks a second account.** (2026-06-30) ✅ Two-account isolation test (`scripts/test-rls-isolation.mjs`): 11/11 pass. User B cannot read/write/delete user A's items, closet_members, or Storage objects.
- [x] **`G0.3` Prove cloud sync round-trips with a live session.** (2026-06-30) ✅ Add item on device A, appears on device B after refresh. Cloud sync infrastructure validated end-to-end. - Chip now shows Local↔Cloud, Signed out↔Signed in (email), and Synced/Behind/Offline/Error separately so state is unambiguous

---

## 📋 Reorganized launch priority

1. **Block 0 — Prove-it gates** (above)
2. **Block A — Security & Privacy** (launch gate; non-negotiable per "pristine" bar)
3. **Block B — Inventory Spine** ⭐ (status · location · availability · simple lend — the differentiator)
4. **Block C — Mobile + PWA**
5. **🚀 LAUNCH to 30 waitlisters (test-user mode)**

**Explicitly POST-MVP (do NOT build for launch):**

- **E4 Lending/Request-to-Borrow** social loop — _your stated #1 post-MVP priority_. Needs RLS + profiles + trust model. The MVP only gets E2 free-text "lent out" tracking.
- **Hotmail/Outlook + Yahoo import** (E1-5.x / E1-6.x) — _your stated #2 post-MVP_. Separate identity providers, separate verification gates.
- E11 laundry forecast, E12 profile, E6 outfit builder, E7 insights, E8 care deep-dive, E9 travel, E10 monetization.

---

## 🔐 Block A — Security & Privacy launch checklist

Each item maps to an existing E1-4.x ticket; this is the launch-ordered view.

### ✅ **BLOCK A COMPLETE — ALL MUST-HAVES DONE (2026-07-07)** 

**Must-have before a single real user (hard gate):**

- [x] ✅ `G0.2` RLS second-account isolation proven (tables + Storage) (2026-06-30) — _also Block 0_
- [x] ✅ **Dev/prod Supabase split** (2026-07-06) — dev project `closet-inventory-dev` (`lfdpvyygqblnckksvufn`) split out from prod (`rawuntspvetfdtrqggen`); `.env.local` points local dev at dev, Vercel/prod stay on prod; verified end-to-end (Google sign-in against dev → `profiles` row on dev dashboard). (`E1-4.12` dev/prod portion)
- [x] ✅ **Storage validation pushed to prod** (2026-06-30) — server-side size/MIME enforcement live via `20260629000001_storage_validation.sql` (`E1-4.11`)
- [x] ✅ **Account deletion + data export** (2026-07-07) — legal right-to-erasure/portability deployed. Delete rows AND Storage objects. Edge Function live on prod + dev. (`E1-4.8`)
- [x] ✅ **Secret hygiene** (2026-06-30) — `.env` gitignored ✓, full git history clean (zero leaks via gitleaks) ✓, CI secret scanning live and passing ✓ (`E1-4.3`)
- [x] ✅ **Base64→Storage migration + legacy wipe** (2026-07-06) — prod/dev have 0 base64 rows; write-path guard `ensureStoredPhoto` prevents future base64 reaching `primary_photo_url`. (`E1-2.2` / `E1-4.5`)

**Strongly recommended before launch:**

- [ ] CSP (`script-src 'self'`) + HSTS at the Vercel layer — verify it doesn't break Google OAuth SDK first (`E1-4.7`)
- [x] ✅ Supabase platform hardening (2026-07-06) — `service_role` never in browser ✓, `SECURITY DEFINER` functions audited safe ✓, leaked-password protection deferred (Pro-plan-gated + no-op for Google-OAuth-only); CAPTCHA skipped + 2FA deferred post-beta — see `docs/SECURITY_CONFIG.md` (`E1-4.10`)
- [x] ✅ CI dependency + secret scanning (2026-06-30) — gitleaks + npm audit passing on every PR (`E1-4.3`)
- [ ] Logging hygiene — never log tokens/OAuth codes/PII (`E1-4.12`)

---

## 📜 Privacy Policy — LEGAL-1 (required for Google + for launch) — ⏳ IN PROGRESS (2026-07-07)

**Status:** E1-4.8 (account deletion + export) now live and verified deployed (2026-07-07). Unblocks writing and publishing the policy.

- [ ] **Engage:** write or generate (Termly/iubenda/Vanta-style) a policy hosted at a **public URL** (needed for the OAuth consent screen)
- [ ] **Data collected:** Google account identity; Gmail message content (read-only, parsed for import only); uploaded photos; wardrobe data
- [ ] **Why each is collected** — plain-language Gmail-parsing-for-import justification
- [ ] **Retention:** how long emails/photos are kept; what "delete" means in your system (permanent via cascading Storage + profiles deletion)
- [ ] **Third parties:** name Supabase as infra processor; state data is **not sold / not used for ads**
- [ ] **User rights:** account deletion + data export (must match the built `E1-4.8` feature — both now live)
- [ ] **Google Limited Use disclosure** (required for restricted scopes): Gmail data won't be used for ads, won't be sold/transferred except for security, isn't human-read except w/ consent or for security/legal
- [ ] **Contact** for privacy requests
- [ ] **Terms of Service** URL (recommended; sometimes required by Google)
- [ ] Link both URLs in the Google OAuth consent screen config

---

## 🔑 Gmail OAuth — launch-now (test mode) + verify-in-parallel

### Launch-now: test-user mode (no verification needed)

- [ ] In Google Cloud Console, keep the OAuth app in **"Testing"** publishing status
- [ ] Add your **30 waitlisters' Gmail addresses** as test users (cap = 100). ⚠️ They must sign in with the _exact_ Google account you list. Note: **Gmail import only benefits the Gmail users** among your waitlist — collect which providers they use.
- [ ] Write onboarding copy explaining the **"Google hasn't verified this app"** warning is expected for beta, with click-through steps (_Advanced → Go to Nothing To Wear_). This _will_ spook non-technical users without it.
- [ ] ⚠️ **Caveat to verify:** apps in Testing status issue refresh tokens that **expire after ~7 days** for sensitive/restricted scopes — meaning test users may need to **re-auth weekly** until you reach production verification. Confirm this against current Google policy; if true, it undermines `E1-4.4` server-side refresh while in test mode and belongs in your onboarding expectations.

### Verify-in-parallel: production verification + CASA (start NOW, ~1–3 months)

**Gate 1 — OAuth app verification**

- [ ] Verify domain ownership (Google Search Console) for the prod domain
- [ ] Privacy policy + ToS URLs live and linked on consent screen
- [ ] App logo, support email, developer contact
- [ ] Written justification for _why_ `gmail.readonly` is needed (specific: "parses purchase-confirmation emails to auto-import wardrobe items")
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

> ✅ **In progress on branch `EPIC-status-location`** (2026-07-04/05) — see
> [E2-part-une-inventory-truth-status-location.md](epics/E2-part-une-inventory-truth-status-location.md) for the
> full ticket-level breakdown (`P1-*`) and a July roadmap re-cut in
> [LAUNCH_ROADMAP_July_update.md](LAUNCH_ROADMAP_July_update.md).

- **Status:** `E2-1.2` `statusTransitions.ts` + tests _(not started — `P1-9`)_ · [x] `E2-1.3` status chip on card (2026-07-04) — shipped as the overview status **dot** in `Location + Status` border-toggle mode ([FilteredCard.tsx](../../src/Features/SearchCloset/FilteredCard.tsx)) · `E2-1.4` quick-action menu (desktop ⋯ / mobile long-press) _(not started — `P1-4`)_
- **Location:** [x] `E2-2.1` location field + primary default (2026-07-04) — [`locations.ts`](../../src/utils/locations.ts) registry + `EditItemView` select, home = neutral default · `E2-2.2` `locationGroups.ts` + tests _(not started — `P1-5`)_ · [x] `E2-2.3` location tag on card, hidden at home (2026-07-04) — border-toggle color-coding · `E2-2.4` "where is everything" grouped view _(not started — `P1-5`)_
- **Filters:** `E2-3.1` status+location dimensions in `useClosetFilters` (⚠️ hardcoded `DIMENSIONS` array edit) _(not started — `P1-8`)_ · `E2-3.2` quick-view presets _(not started)_
- **Simple lend (MVP version):** `E2-5.1` `loan` object + lend modal (free-text borrower + due date) _(not started — parent E2, out of branch scope)_ · `E2-5.2` "lent out" view + overdue flag _(not started)_
- **Availability:** `E2-6.1` `isAvailable(item)` = clean + home + not on loan _(not started — depends on E2-5.\*)_

**Beyond the original ticket map — added this branch:** an overview **border-toggle** (Off → Location → Location+Status, cycling control in the sticky top bar) as the visible surface for status/location, plus seeded demo data so it's visible immediately. Not in the original scope note above, but it _is_ the status+location differentiator this block promised.

---

## 📱 Block C — Mobile + Full PWA — ticket map

Pull from `E5-mobile-pwa.md`. (Lever: if cutting to ~4-5 weeks, do only the _touch/responsive_ half now, defer the PWA-shell half.)

- **Mobile/touch:** `E5-1.1` 44×44 tap-target audit · `E5-1.2` bottom nav · `E5-1.3` Add-Item FAB · `E5-bug.1` sticky-nav overlap
- **PWA shell:** `E5-2.1` manifest + icons · `E5-2.2` service worker · `E5-2.3` iOS full-screen · `E5-3.1` offline closet view

---

## 🎯 Definition of "ready to launch"

- [ ] Block 0 gates all green (Gmail import, RLS isolation, sync round-trip proven)
- [ ] Block A security must-haves complete; privacy policy live
- [ ] Status + location + simple-lend usable on mobile
- [ ] App is installable / mobile-clean (per chosen PWA scope)
- [ ] 30 waitlisters added as Google test users + onboarding email with the unverified-app explainer
- [ ] Gmail verification Gate 1 _submitted_ (not necessarily approved)
