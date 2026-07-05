# E1 · Cloud Backend & Data (Supabase)

> **Date:** 2026-06-20 · **Pillar:** Foundation · **Detail:** full · **README:** v5.1 · **Est:** ~7–11 dev-days
> **Goal:** Stand up the cloud layer on **Supabase** (decided — [BACKEND_DATABASE_DECISION](../../backend/BACKEND_DATABASE_DECISION.md)):
> per-user closet in Postgres, image storage off base64, offline-first sync. Do NOT merge Firestore PR #44.
> **Riskiest unknown first:** Gmail access-token flow under Supabase Auth.

---

## US-1.1 — Sign in and keep my closet in the cloud ✅
_As Maya, I want my closet synced to my account so that I see the same wardrobe on phone and laptop._
- [x] Supabase Auth sign-in (Google)
- [x] Per-user `items` table; RLS so a user reads/writes only their own rows
- [x] localStorage acts as offline cache; reconciles on reconnect
- [ ] First sign-in seeds the cloud from existing local closet

**Tickets**
- `E1-1.1` ✅ **Done** (2026-06-30) — `GmailSpike.tsx` + `useSupabaseAuth.ts` implement the token flow; live Google OAuth sign-in verified (G0.1). Gmail access token survives under Supabase Auth and email import works end-to-end. — _1–1.5d_
- `E1-1.2` ✅ **Done** (PR#88, 2026-06-26) — `items` table mirroring `ClothingItem` incl. E2 status/location columns; migrations `20260626000001_v1_spine.sql` + `20260628000004_items_e2_columns.sql`, pushed to remote. — _1d_
- `E1-1.3` ✅ **Done** (2026-06-30) — owner-only RLS policies (PR#88, `20260626000002_rls.sql`) verified via real two-account isolation test (`scripts/test-rls-isolation.mjs`): 11/11 checks pass — user B cannot read/update/delete user A's items, closet_members, or Storage objects. Required a critical GRANT fix first (`20260629000002_grant_table_privileges.sql`) — see `E1-4.2`. — _0.5d_
- `E1-1.4` Port `useCloudCloset` to Supabase client; keep `useLocalCloset` as offline cache — _2–3d_
- `E1-1.5` First-sign-in seed: upload local closet to Supabase — _1d_
- `E1-1.6` Offline-first reconcile (last-write-wins via `updatedAt`) — _1–1.5d_
  - _Hardening (hot fix):_ background writes no longer swallow failures silently (`.catch(() => {})`). `SyncedClosetRepository` now reports failures to a `syncFailureTracker`, which logs the real error and drives a `SyncStatusIndicator` in the NavBar ("N changes not synced"). A successful `getAll` reconcile clears it. Tests: `syncFailureTracker.test.ts`, `syncedClosetRepository.syncFailure.test.ts`, `SyncStatusIndicator.test.tsx`. **Retry queue still deferred** — recovery rides on the next successful reconcile (reload / sign-in).

## US-1.2 — Images that don't blow the storage budget
_As Maya, I want my photos stored properly so that big closets and camera imports don't silently fail._
- [x] Images upload to Supabase Storage; row stores a **path**, not a URL or base64 (signed URLs are resolved at display time, never persisted — see `useSignedImageUrl`)
- [ ] Existing base64 images migrate to Storage (`E1-2.2`, not started)
- [x] Upload handles failure with a user-facing message

**Tickets**
- `E1-2.1` ✅ **Done** (2026-06-29) — Supabase Storage bucket + upload pipeline (replaces base64 in `ImageUploader` when signed in). `storageService.uploadItemPhoto` uploads to `<userId>/<uuid>.<ext>`; `item-photos` row stores the bare path; `useSignedImageUrl` signs it for display and auto-refreshes before expiry. Offline/signed-out unchanged (base64 → localStorage). — _1–1.5d_
  - Photos are downscaled/recompressed (≤1200px longest edge, JPEG q0.8 — `compressImageToBlob`) before upload, same pipeline as the offline base64 path. Reduction is proportional to original size, not a fixed target — see `scaledSize` tests.
  - ✅ Server-side bucket constraints pushed to remote (2026-06-30) — `20260629000001_storage_validation.sql` enforces `file_size_limit` (10MB) + `allowed_mime_types` (jpeg/png/webp/heic) at the bucket level.
  - Verified: `tsc --noEmit` clean, full vitest suite green (1089 tests incl. new compression/validation tests). NOT verified: a live signed-in upload round-trip against Supabase Storage (no authenticated browser session available in-session) — the actual bucket RLS/size/mime enforcement is unverified end-to-end.
- `E1-2.2` One-time migration: base64 localStorage images → Storage URLs — _1d_ — not started

## US-1.3 — Know my sync state
_As Maya, I want a sync indicator so that I know my data is safe / when I'm offline._
- [ ] Nav shows synced / syncing / offline
- [ ] Pending local writes flush on reconnect

**Tickets**
- `E1-3.1` Sync-status indicator in NavBar — _0.5d_

## US-1.4 — Trust NTW with my login & profile data
_As Maya, I want to trust NTW with my Google login and personal profile info so that my identity, photos, and wardrobe data can't be leaked or accessed by anyone but me._
- [ ] Handle client credentials & user tokens securely
- [ ] Cross-account protection & user-flow protection

> **Context — don't repeat the Tea App breach.** The Tea app leaked users' faces, legal
> names, and home addresses (multiple federal class-actions) because of avoidable cloud-storage
> and credential mistakes. Each precaution below maps to a specific failure they committed.

**Precautions checklist (each = a Tea App "sin" to avoid)**
- [x] ✅ **No unsecured buckets** (2026-06-30) — `item-photos` bucket is private, authenticated-only CRUD, path-based RLS, signed URLs only (5-min expiry). Audit completed `E1-4.1`. _(Tea: open Firebase bucket, anyone with the URL)_
- [x] ✅ **RLS everywhere** (2026-06-30) — owner-only RLS on every table + Storage; verified via two-account isolation test (11/11 pass, `scripts/test-rls-isolation.mjs`). _(Tea: no access controls)_
- [ ] **Data minimization** — only collect what's needed; if any verification image/ID is ever introduced, delete immediately after use and prove deletion. _(Tea: promised deletion, kept images for years)_
- [ ] **No orphaned legacy data** — when migrating off base64 / PR #44 / any old store, securely wipe or migrate-and-delete the old data; never leave legacy copies behind. _(Tea: left data in old unsecured store after migrating)_ ⚠️ **Blocked on `E1-2.2`** (base64→Storage migration not yet started).
- [ ] **Encryption at rest & in transit** — confirm Supabase encryption at rest is on; all transport over HTTPS/TLS. _(Tea: files + 1M+ DMs stored unencrypted)_
- [x] ✅ **No hardcoded secrets** (2026-06-29) — `.env` gitignored, never committed (verified via full git history). Source scanned for key-shaped strings: clean. Full git history (552 non-merge commits, every branch + remote ref) scanned with `gitleaks`: zero leaks. Dead unused env vars (`VITE_FIREBASE_*`, `VITE_GITHUB_CLIENT_ID`) identified and removed. Key-rotation runbook written (`planning/launch/KEY_ROTATION_RUNBOOK.md`). _(Tea: keys hardcoded in source)_
- [x] ✅ **Routine security audits** (2026-06-30) — CI secret/dependency scanning configured (`security.yml` + `dependabot.yml`) and **now exercised on every push** (first real CI run confirmed passing: gitleaks 10s, npm audit 15s). Periodic access review and anomalous-access monitoring/alerting not started (Supabase-platform concern, `E1-4.10`). _(Tea: no testing or monitoring)_
- [x] ✅ **Token handling (interim, branch `security-xss`)** — Gmail access token moved out of localStorage to **in-memory only** (`useGmailAuth`); legacy persisted token purged on mount; cleared on sign-out. Server-side token storage + refresh remains the E1 target (`E1-4.4`). Scope is already least-privilege (`gmail.readonly`).

**Tickets**
- `E1-4.1` ✅ **Done** (2026-06-30) — Bucket privacy audit completed. `item-photos` bucket: private by default (no public access), authenticated-only CRUD, path-based RLS isolation (`foldername()[1] = auth.uid()`), 5-min signed URLs with auto-refresh, server-side MIME/size validation pushed. — _0.5d_
- `E1-4.2` ✅ **Done** (2026-06-30) — Two-account RLS isolation test (`scripts/test-rls-isolation.mjs`) passes 11/11: trigger-created closets, item CRUD isolation, closet_members isolation, Storage upload/download/signedUrl/delete isolation. **Critical finding:** all tables had zero Postgres GRANTs for `authenticated`/`anon`/`service_role` — fixed by `20260629000002_grant_table_privileges.sql` (also sets `ALTER DEFAULT PRIVILEGES` so future tables inherit). This means no signed-in user could ever read/write their own data prior to this fix — Block 0 / G0.2 + G0.3 unblocked. — _0.5–1d_
- `E1-4.3` ✅ **Done** (2026-06-30) — env-only config ✓, `.env` gitignored ✓, full git-history secret scan (gitleaks, zero leaks) ✓, CI secret+dep scanning live and passing (gitleaks 10s, npm audit 15s on every PR). Key-rotation runbook written (`planning/launch/KEY_ROTATION_RUNBOOK.md`). — _0.5–1d_
- `E1-4.4` Gmail token storage & scope review (least-privilege, secure storage, revoke-on-logout) — _0.5–1d_
- `E1-4.5` Data-minimization + legacy-wipe checklist enforced in the base64→Storage migration (`E1-2.2`) — _bundled_

### Broader hardening checklist (beyond the Tea App list)

**Auth & session**
- [ ] Short-lived access tokens + refresh-token rotation; sign-out revokes the session everywhere
- [ ] Enable Supabase **leaked-password protection** (HaveIBeenPwned) and a CAPTCHA on auth to blunt credential-stuffing/bots
- [ ] Offer MFA where Supabase supports it; enforce email verification before first write

**Authorization (defense in depth)**
- [ ] RLS is the *only* security boundary — never rely on client-side checks; default-deny, add explicit allow policies
- [ ] Audit any Postgres `SECURITY DEFINER` functions/views (they bypass RLS); keep them minimal and reviewed
- [ ] Anon key only on the client; **`service_role` key never ships to the browser** (server/edge functions only)

**Input validation & injection / XSS**
- [x] ✅ **Replaced the hand-rolled email-HTML sanitizer with DOMPurify** (branch `security-xss`) — `createSanitizedHtml` in `EmailPreview.tsx` now calls `DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })`; inline handlers (`onerror`/`onload`), `javascript:`/`data:` URLs, and `<svg onload>` are all stripped. Regression tests in `EmailPreview.xss.test.tsx`.
- [x] ✅ **Moved fetched email bodies (PII) off localStorage** (branch `security-xss`) — `gmail_email_bodies_cache` + `gmail_emails_cache` now live in **sessionStorage** (tab-scoped), are cleared on logout, and legacy localStorage copies are purged on mount. Tests in `useAdvancedSearch.test.ts`.
- [ ] Validate every input at the boundary with Zod (form data, parsed email fields, API/edge-function payloads)
- [ ] Supabase client uses parameterized queries — never string-concatenate SQL in edge functions

**Network & transport**
- [ ] **Content-Security-Policy — `script-src 'self'`** as the defense-in-depth backstop to the DOMPurify fix (blocks inline/injected script execution even if a sanitizer is ever bypassed). Set at the hosting layer (Vercel/Netlify headers) or an `index.html` `<meta>` tag; verify it doesn't break the Google OAuth SDK or inline styles before enabling. Then lock down `style-src`/`img-src`/`connect-src` (Supabase, Gmail API, Cloudinary origins).
- [ ] HSTS + HTTPS-only; secure cookies (`HttpOnly`, `Secure`, `SameSite`) for any session cookie
- [ ] Lock CORS to known origins on edge functions (no `*` in production)

**Storage upload safety**
- [x] Validate file type + size on upload; reject non-image content; cap dimensions/bytes — client-side live (`validateImageFile`); server-side bucket constraints written (`20260629000001_storage_validation.sql`) but **not pushed to remote yet** — client check alone is bypassable
- [x] Short-expiry signed URLs; no long-lived/public links to user images — `signItemPhotoPath` TTL dropped 1hr → 5min; `useSignedImageUrl` auto-refreshes ~30s before expiry while mounted

**Privacy & compliance**
- [ ] Privacy policy + ToS; explicit consent for the Gmail scope at connect time
- [ ] Self-serve **account deletion + data export** (GDPR/CCPA right-to-erasure / portability) — delete rows *and* Storage objects
- [ ] ⚠️ **Google OAuth restricted-scope review** — `gmail.readonly` is a *restricted* scope; a public production app needs Google's verification + an annual third-party **CASA security assessment**. Scope this early (long lead time)

**Operational**
- [ ] Separate dev / prod Supabase projects; no prod data in dev
- [ ] Backups + point-in-time recovery enabled and restore-tested
- [ ] Logging hygiene — never log tokens, OAuth codes, or PII; error messages don't leak internals
- [x] ✅ Dependency security in CI (2026-06-29) — `npm audit --audit-level=high` step + `dependabot.yml` weekly auto-update PRs configured; lockfile already committed. Current state: 1 critical + 8 high, all in devDependencies (vite/vitest/jsdom/stylelint toolchain — not shipped to the browser bundle, not in `package.json` `dependencies`). `npm audit fix` available, not yet run.
- [ ] Written incident-response + breach-notification plan before public launch

**Tickets (hardening)**
- `E1-4.6` ✅ **Done** (PR#76, 2026-06-23) — Swap email sanitizer to DOMPurify; XSS regression tests added (`EmailPreview.xss.test.tsx`). — _0.5d_
- `E1-4.7` CSP + HSTS + secure-cookie + CORS-allowlist config — _0.5–1d_
- `E1-4.8` Self-serve account deletion + data export (rows + Storage) — _1–1.5d_
- `E1-4.9` Google OAuth verification + CASA assessment (scoping done 2026-06-29 — needed before real-user launch) — _tbd, long lead, budget 1–3mo_
  - `E1-4.9a` OAuth consent screen: domain verification, privacy policy + ToS URLs, logo, support contact, scope justification — _0.5d_
  - `E1-4.9b` Record scope-usage demo video; submit for Google verification; respond to review rounds — _tbd, Google's queue, not ours_
  - `E1-4.9c` Determine CASA tier (likely Tier 2 for `gmail.readonly`-only); engage an approved validator/tool — _tbd_
  - `E1-4.9d` Remediate any CASA findings (likely overlaps E1-4.6/4.7/4.10) — _tbd_
  - `E1-4.9e` Submit CASA report to Google; **recurring annually** for as long as `gmail.readonly` is used — _recurring_
  - `E1-4.9f` Add "Limited Use" data-policy disclosure to privacy policy (no ad use, no resale, no human review w/o consent) — _bundled w/ E1-4.13_
- `E1-4.10` Supabase platform hardening: leaked-password protection, CAPTCHA, `service_role` audit, `SECURITY DEFINER` review — _0.5d_
- `E1-4.11` ✅ **Done** (2026-06-30) — Upload validation (type/size) + short-expiry signed URLs. Client validation + 5-min signed URLs with auto-refresh live. Server-side bucket constraints (`file_size_limit` 10MB, `allowed_mime_types` jpeg/png/webp/heic) pushed to remote via `20260629000001_storage_validation.sql`. Dimension capping not addressed (compression already caps display dims). — _0.5d_
- `E1-4.12` Backups/PITR enabled + restore test; dev/prod project split; logging-hygiene pass — _0.5–1d_
- `E1-4.13` Publish privacy policy (data collected, retention, third parties/Supabase, deletion/export rights, Limited Use disclosure) — _0.5–1d, blocked on E1-4.8 existing first_

## US-1.5 — Import from Hotmail/Outlook and Yahoo, not just Gmail
_As Maya, I want to connect whichever email I actually use so that order-confirmation import isn't Gmail-only._

> **Scope note (added 2026-06-29):** today's Gmail import rides entirely on Supabase Auth's
> Google OAuth provider — one `signInWithOAuth({provider:"google"})` call both signs the user
> in *and* grants the Gmail scope. Outlook/Hotmail (Microsoft) and Yahoo are separate identity
> providers with their own OAuth implementations; there is no shared "add another provider"
> toggle. Each is realistically its own spike-first mini-track, mirroring `E1-1.1`'s "prove the
> token flow before porting" approach — not a quick follow-up to the Gmail work.

- [ ] User can connect a Microsoft/Outlook account and import order-confirmation emails
- [ ] User can connect a Yahoo Mail account and import order-confirmation emails
- [ ] Both follow the same RLS/token-handling bar already set for Gmail (no plaintext token persistence, least-privilege scope, revoke-on-logout)

**Tickets — Microsoft (Outlook/Hotmail)**
- `E1-5.1` ⚠️ **Spike:** Microsoft identity platform OAuth (Azure AD app registration) + Graph API `Mail.Read` token flow under Supabase Auth (Supabase supports Azure as a provider — prove the token shape before porting) — _1–1.5d_
- `E1-5.2` Azure app registration: multi-tenant config (so any Microsoft/Outlook/Hotmail user can connect, not just one org) — _0.5d_
- `E1-5.3` Microsoft **Publisher Verification** (Partner Center) — removes the "unverified app" warning; analogous gate to Google's verification — _tbd, separate from Google's process_
- `E1-5.4` Build parallel auth hook (`useMicrosoftAuth`) + Graph-API email-fetch/parse adapter alongside the existing Gmail one — _2–3d_
- `E1-5.5` Privacy policy update: add Microsoft scope + data handling — _bundled w/ E1-4.13_

**Tickets — Yahoo**
- `E1-6.1` ⚠️ **Spike:** Yahoo OAuth2 token flow. Yahoo's modern mail access is OAuth2 + IMAP (`XOAUTH2`), **not** a REST API like Gmail's — confirm whether Supabase Auth's generic OAuth provider support covers it or a custom flow is needed — _1–1.5d_
- `E1-6.2` Register app in Yahoo Developer Network; request mail-read scope — _0.5d_
- `E1-6.3` Build IMAP-based email-fetch adapter (can't reuse the Gmail-API-shaped parser as-is) + parse layer — _2–3d_
- `E1-6.4` Yahoo's production-mode app review for mail-scope apps — _tbd, Yahoo's queue_
- `E1-6.5` Privacy policy update: add Yahoo scope + data handling — _bundled w/ E1-4.13_

---

## Dependencies
- **E0** (clean base) recommended first.
- **E2 schema:** include status/location columns in `E1-1.2` so the inventory spine syncs without a later migration.
- Decommission PR #44 (reference only).

## Definition of done (epic)
Signed-in users have a private, synced, offline-capable closet on Supabase; images in Storage; sync state visible; Gmail import still works under Supabase Auth; **US-1.4 security precautions checklist fully verified** (private buckets, RLS proven against a second account, no hardcoded secrets, encryption at rest/in transit, no orphaned legacy data, secure token handling).
