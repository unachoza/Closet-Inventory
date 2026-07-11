# Supabase Security Configuration & Audit (E1-4.10)

**Last audited:** 2026-07-06

## Database-Level Security — ✅ Audited (code review)

### `service_role` / secret-key exposure — ✅ CLEAN
- `grep service_role|sb_secret|SUPABASE_SECRET` over `src/` → **zero matches**
- Client init (`src/lib/supabaseClient.ts`) uses `VITE_SUPABASE_ANON_KEY` only
- Secret key lives only in `.env`/`.env.local` (gitignored) + Vercel dashboard (server-side)

### `SECURITY DEFINER` functions — ✅ REVIEWED, both safe
Two functions bypass RLS by design; both are safe:

1. **`is_closet_member(_closet_id uuid)`** (`20260626000002_rls.sql`) — RLS-safe membership helper (prevents recursive RLS on `closet_members`). Returns a boolean only for the calling `auth.uid()`; cannot leak other users' rows. `stable`, `set search_path = public` (injection-safe).
2. **`handle_new_user()`** (`20260626000001_v1_spine.sql`) — signup trigger. Inserts profile + closet + owner membership **only for `new.id`** (the new user). No cross-user reads/writes. `on conflict do nothing`; `set search_path = public`.

Non-DEFINER functions (`set_updated_at`, `apply_sentimental_defaults`, `refresh_wear_rollup`) run as invoker → RLS applies. No action needed.

### RLS status — ✅ (verified prior)
All spine tables have RLS enabled (`20260626000002_rls.sql`); two-account isolation test passes 11/11 (`scripts/test-rls-isolation.mjs`, G0.2).

## Auth-Level Security — scoped for Google-OAuth-only app (2026-07-06)

**Context:** The app currently authenticates **only via Google OAuth** — no email/password flow.
This changes the value of the standard auth toggles:

- ⏭️ **Leaked-password protection** — **BLOCKED on free tier** (Supabase gates "Prevent use of leaked passwords" behind Pro plan, $25/mo — confirmed 2026-07-06: "available on Pro Plans and up"). **Not worth upgrading for**: it's a no-op in a Google-only flow (HaveIBeenPwned checks *passwords*, none exist). Revisit only if/when (a) email/password auth is added AND (b) already on Pro for other reasons.
- ⚠️ **Note:** Supabase "Enable email provider" is currently **ON** despite the app offering only Google sign-in. Since no UI exposes email/password, consider disabling the email provider to shrink attack surface (verify it doesn't break any magic-link/OTP flow first). Low priority.
- ⏭️ **CAPTCHA (reCAPTCHA v3)** — **SKIPPED (moot)**. reCAPTCHA attaches to email/password + email-OTP auth calls; the Google sign-in popup is Google's own flow with nothing to attach to. Revisit if/when email/password auth is added.
- ⏭️ **MFA / 2FA (TOTP)** — **DEFERRED to post-beta**. Supabase supports authenticator-app 2FA on top of any session (works with Google OAuth), but requires an enroll/challenge UI build — not launch-critical for 30 trusted Google-auth testers. For Google-only sign-in, first-factor breach/CAPTCHA/2FA protections already ride on Google's own account security.

## Storage & Secrets (verified prior)
- `item-photos` bucket private; 5-min signed URLs (`useSignedImageUrl` auto-refresh)
- Server-side size/MIME validation (`20260629000001_storage_validation.sql`)
- `.env`/`.env.local` gitignored; gitleaks CI clean; key-rotation runbook exists

## E1-4.10 status
🟡 **Partial** — code audit (service_role + SECURITY DEFINER) ✅ done & clean. Remaining: leaked-password + CAPTCHA dashboard toggles.
