# 🔑 Key Rotation Runbook

> **Date:** 2026-06-29 · Closes the outstanding gap in `E1-4.3`.
> **When to use this:** a key/secret is suspected or confirmed exposed (committed by accident, leaked in a
> screenshot/log, a laptop is lost, a collaborator leaves, or as routine hygiene before a public launch).
> **Principle:** rotate the credential at its source first, then update every place that consumes it,
> then verify the old one is dead. Never skip the "verify it's dead" step — a rotated key that still works
> isn't rotated.

---

## Inventory — every secret this app holds, and where it lives

| Secret | Where it's used | Where it's stored | Client-exposed? |
|---|---|---|---|
| `VITE_SUPABASE_ANON_KEY` | Supabase client init | `.env` → Vercel env vars | Yes — by design, public-safe (RLS is the real boundary) |
| `VITE_SUPABASE_URL` | Supabase client init | `.env` → Vercel env vars | Yes — by design, not a secret |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth (Gmail + sign-in) | `.env` → Vercel env vars + Google Cloud Console | Yes — by design, public-safe |
| `SUPABASE_SECRET_KEY` (service_role) | Not currently used client-side (confirmed: never appears in `src/`) | `.env` only — **must never get a `VITE_` prefix** | **No — must never be** |
| `AZURE_CLIENT_SECRET` | Azure AD app (Microsoft Graph, planned `E1-5.x`) | `.env` only | **No — must never be** |
| `AZURE_TENANT_ID` / `AZURE_CLIENT_ID` | Azure AD app identification | `.env` only | No (not currently wired into client code) |

> Re-run `grep -rn "SUPABASE_SECRET_KEY\|AZURE_CLIENT_SECRET" src/` before every rotation to re-confirm
> neither has drifted into client code since this table was written.

---

## Rotation steps, per secret

### Supabase anon key / project URL
1. Supabase Dashboard → Project Settings → API → regenerate the anon key (or rotate via project transfer if URL changes).
2. Update `VITE_SUPABASE_ANON_KEY` in `.env` (local) and in Vercel's environment variables for every environment (Production/Preview/Development).
3. Redeploy.
4. Verify: confirm the app loads and a signed-in session still works against the new key. The anon key alone grants nothing without RLS — rotating it mainly protects against quota abuse / DoS, not data access.

### Supabase service_role key (`SUPABASE_SECRET_KEY`)
1. **Treat any exposure of this as critical** — it bypasses RLS entirely.
2. Supabase Dashboard → Project Settings → API → regenerate the `service_role` key.
3. Update `SUPABASE_SECRET_KEY` everywhere it's configured server-side (currently: nowhere in this codebase — confirm that's still true before assuming "nowhere" is correct).
4. Verify: re-run `grep -rn "service_role\|SUPABASE_SECRET_KEY" src/` — must return empty. If it ever returns a hit, treat that as its own incident, not just a rotation.

### Google OAuth Client ID / Secret
1. Google Cloud Console → APIs & Services → Credentials → create a new OAuth Client ID (or reset the secret on the existing one, if using a confidential client).
2. Update `VITE_GOOGLE_CLIENT_ID` in `.env` + Vercel.
3. Update the authorized redirect URIs on the new credential to match production + any preview domains.
4. Verify: sign in with Google end-to-end on production after deploy; confirm the old client ID/secret no longer authenticates (Google Console shows it revoked/deleted).
5. ⚠️ If `gmail.readonly` verification (`E1-4.9`) is already submitted/approved when this happens, rotating the OAuth client may require re-submitting for verification — check Google's current guidance before rotating in production.

### Azure AD (Client Secret / Tenant / Client ID)
1. Azure Portal → App registrations → the app → Certificates & secrets → generate a new client secret (old ones can have an expiry; don't wait for forced expiry to rotate).
2. Update `AZURE_CLIENT_SECRET` wherever it's deployed server-side.
3. Delete/expire the old secret in Azure Portal explicitly — don't just stop using it.
4. Verify: confirm the old secret returns an auth failure if accidentally retried.

---

## After any rotation — close the loop

- [ ] Update `.env.example` if the *shape* of any secret changed (new var name, etc.) — never put a real value in `.env.example`
- [ ] Confirm `.env` is still gitignored (`git check-ignore -v .env`)
- [ ] Re-run the full-history secret scan (`gitleaks detect --source . --log-opts="--all" -v --redact`) to confirm the old key wasn't *also* sitting somewhere in history that this rotation didn't anticipate
- [ ] If the exposure was public (e.g. committed to a public repo, even briefly), assume it was harvested — rotation is not optional, "probably nobody saw it" is not a control
- [ ] Note the rotation (date + which secret + why) somewhere durable — even a one-line entry in this file's history via git log is enough; don't need a separate log unless this happens often

## Routine (non-incident) rotation cadence

No hard requirement exists today (revisit once `E1-4.10`/Supabase platform hardening lands), but a sane
default for a pre-revenue app: rotate `SUPABASE_SECRET_KEY` and `AZURE_CLIENT_SECRET` every 6–12 months
as hygiene, and immediately on any team/collaborator change with prior access.
