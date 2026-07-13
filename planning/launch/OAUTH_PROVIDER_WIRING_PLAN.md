# Wiring up Outlook/Hotmail + Yahoo email import — step-by-step plan

> **Date:** 2026-07-12
> **Grounds:** `E1-cloud-backend.md` US-1.5 (tickets `E1-5.x` / `E1-6.x`), `KEY_ROTATION_RUNBOOK.md`, `SPRINTS.md`.
> **TL;DR:** Hotmail **is** Outlook is Microsoft Graph — one integration. The Azure app registration is
> already done (creds in `.env`). Yahoo is a separate, heavier IMAP-based track. See the feasibility call at the bottom.

---

## 0. The one thing to internalize first

**"Hotmail", "Outlook", "Outlook.com", "Live", "MSN", and "Microsoft account (MSA)" are all the same integration.**
They all authenticate through the **Microsoft identity platform (Entra / Azure AD)** and read mail through the
**Microsoft Graph API** (`Mail.Read`). There is no separate "Hotmail API". So "ship Hotmail" = "ship the Microsoft
Graph email adapter." Do it once and every Microsoft-family address works.

Yahoo is genuinely different: OAuth2 **but IMAP** (`XOAUTH2`), not a REST API. The token dance is similar; the
fetch/parse layer is not reusable from the Gmail/Graph shape.

How the current Gmail path works, for reference (what we're cloning):
- `useGmailAuth` (`src/hooks/useGmailAuth.tsx`) → `useGoogleLogin` grants `gmail.readonly`, token kept **in memory only**.
- Emails fetched client-side from `https://www.googleapis.com/gmail/v1/...` (`src/Features/GmailImport/constants.ts`).
- Parsed by `parseProductsFromEmail.ts` (provider-agnostic once you have the HTML body).

The security bar to match (from the epic's DoD): **no plaintext token persistence, least-privilege scope, revoke-on-logout.**

---

## Legend for the "who does it" column

| Marker | Meaning |
|---|---|
| 🤖 **Claude** | I can do this in the repo: write hooks/adapters/parsers/tests, scaffold `.env` keys, update the privacy policy. |
| 👤 **You (hard boundary)** | I *cannot* do this even if asked — create accounts, drive OAuth consent screens, submit verification, enter billing, type secret **values**. Console/portal work + anything irreversible or account-level. |
| 👤🤖 **Together** | You click through the portal; I turn what you get (IDs, redirect URIs, scopes) into working code. |

---

# TRACK A — Outlook / Hotmail (Microsoft Graph)

**Net new dev effort: ~3.5–4.5 days.** Registration is already done. Publisher Verification is a *post-beta polish*
item, not a blocker (see §A6).

### A1 — Confirm the existing Azure app registration is beta-ready · 👤🤖 · ~1–2 hrs
The app registration already exists (`AZURE_TENANT_ID/CLIENT_ID/CLIENT_SECRET` are in `.env`, confirmed). You need to
verify two settings in the portal; I can't see the portal:
- **Supported account types** must be **"Accounts in any organizational directory and personal Microsoft accounts"**
  (AAD + **MSA**). This is what lets consumer Hotmail/Outlook.com users connect. If it's currently single-tenant, flip it. *(ticket `E1-5.2`)*
- **Redirect URI**: a **SPA** platform redirect URI must be registered for your Vercel prod URL **and** `http://localhost` for dev.
- **API permissions**: delegated `Mail.Read` + `offline_access` (already noted as granted in `SPRINTS.md:94`).
- **Portal:** https://entra.microsoft.com → App registrations → your app → *Authentication* / *API permissions*.

### A2 — Spike: prove the Graph token flow under Supabase Auth · 👤🤖 · ~1–1.5 days · *(ticket `E1-5.1`)*
This is the **real risk** in Track A — do not skip it. Gmail's model (one OAuth call both signs the user in *and*
returns a scoped token) may not port cleanly. Supabase's Azure provider signs the user **in**, but whether it hands
back a **Graph-usable `Mail.Read` provider token** is the open question. Two possible outcomes:
1. **Supabase Azure provider returns a usable provider token** → clone the Gmail pattern almost directly. Best case.
2. **It doesn't** → we run a **standalone MSAL.js browser OAuth flow** (`@azure/msal-browser`) for the mail scope,
   separate from app sign-in — mirroring how `useGmailAuth` is decoupled from app auth today.
- 🤖 I write the spike harness and both candidate flows; 👤 you do the actual interactive sign-in click-through
  (I can't complete a consent screen).
- **Docs:** https://learn.microsoft.com/entra/identity-platform/v2-oauth2-auth-code-flow ·
  https://supabase.com/docs/guides/auth/social-login/auth-azure

### A3 — Build `useMicrosoftAuth` + Graph fetch/parse adapter · 🤖 · ~2–3 days · *(ticket `E1-5.4`)*
Fully automatable once A2 picks the flow. I write:
- `src/hooks/useMicrosoftAuth.tsx` — parallel to `useGmailAuth`, same in-memory-token / revoke-on-logout contract.
- A Graph email-fetch adapter hitting `https://graph.microsoft.com/v1.0/me/messages` (filter to order-confirmation
  senders, pull HTML body).
- Wire the fetched HTML into the **existing** `parseProductsFromEmail.ts` (provider-agnostic — big reuse win).
- Unit + integration tests to match the Gmail test suite bar (≥80%).
- **Graph mail docs:** https://learn.microsoft.com/graph/api/user-list-messages

### A4 — Scaffold env keys · 🤖 writes shape / 👤 pastes values · ~15 min
🤖 I add the key *names* to `.env.example` and wire them into config. 👤 You paste the real values into `.env` and into
**Vercel → Settings → Environment Variables** (I never handle secret values). `AZURE_CLIENT_SECRET` must **never** get a
`VITE_` prefix (it's server-only — see `KEY_ROTATION_RUNBOOK.md`).

### A5 — Privacy-policy update: Microsoft scope + data handling · 🤖 drafts / 👤 publishes · ~0.5 day · *(ticket `E1-5.5`, bundle w/ `E1-4.13`)*
🤖 I draft the added Microsoft-scope disclosure in `docs/legal/PRIVACY_POLICY_DRAFT.md`. 👤 You publish it (publishing
public content is your call).

### A6 — Microsoft Publisher Verification · 👤 (hard boundary) · **post-beta, NOT a launch blocker** · *(ticket `E1-5.3`)*
This removes the "unverified publisher" warning. It is **not required for a 30-person beta** (see feasibility §).
When you do it:
- Requires a **Microsoft AI Cloud Partner Program (CPP, formerly MPN)** account with a **verified Partner One ID**
  — business verification (can involve D-U-N-S lookup) is the slow part: **days-to-weeks in Microsoft's queue.**
- The app must be registered with a **work/school Entra account** (apps registered with a *personal* MS account
  **can't** be publisher-verified) and have a non-`*.onmicrosoft.com` **publisher domain** set.
- Once the CPP account is verified, associating it with the app takes **minutes**. Microsoft charges **nothing** for this.
- **Portal:** https://partner.microsoft.com/membership · https://learn.microsoft.com/entra/identity-platform/publisher-verification-overview

---

# TRACK B — Yahoo Mail (OAuth2 + IMAP)

**Net new dev effort: ~3.5–5 days, and it does not share the Gmail/Graph fetch shape.** *(tickets `E1-6.x`)*

### B1 — Create a Yahoo Developer app · 👤 (hard boundary) · ~0.5 day · *(ticket `E1-6.2`)*
- 👤 Register an app in the **Yahoo Developer Network**, request the **mail-read** scope, get Client ID + Secret.
- **Portal:** https://developer.yahoo.com/apps/

### B2 — Spike: Yahoo OAuth2 token flow · 👤🤖 · ~1–1.5 days · *(ticket `E1-6.1`)*
Confirm whether Supabase's **generic/custom OAuth** provider can carry Yahoo, or whether we need a fully custom flow.
Yahoo mail access is **OAuth2 + IMAP `XOAUTH2`**, not a REST API — this shapes everything downstream.

### B3 — Build IMAP fetch adapter + parse layer · 🤖 · ~2–3 days · *(ticket `E1-6.3`)*
Cannot reuse the Gmail-API-shaped fetch. Browsers can't speak IMAP directly, so this realistically needs a **small
server-side/Edge Function IMAP client** (Supabase Edge Functions, where `delete-user-account` already lives) that
authenticates with the Yahoo token and returns message HTML — which *then* feeds the existing `parseProductsFromEmail.ts`.
- 🤖 I write the Edge Function + adapter + tests.

### B4 — Yahoo production app review · 👤 (hard boundary) · **tbd, Yahoo's queue** · *(ticket `E1-6.4`)*
Yahoo reviews mail-scope apps before production. Timeline is Yahoo's queue — treat as external/uncertain.

### B5 — Privacy-policy update: Yahoo scope · 🤖 drafts / 👤 publishes · *(ticket `E1-6.5`)*

---

## What accounts you need to create *for this work*

| Provider | For | Needed when | Cost |
|---|---|---|---|
| **Microsoft Entra / Azure app registration** | Outlook/Hotmail — Graph OAuth | ✅ **Already created** | Free |
| **Microsoft Partner Center (CPP / Partner One ID)** | Outlook — Publisher Verification (removes warning) | Post-beta, before scaling | Free (business-verification queue is the cost) |
| **Yahoo Developer Network** | Yahoo — OAuth2 mail-read app | Only if pursuing Yahoo | Free |

Everything else (Supabase, Vercel, Google Cloud, Sentry, PostHog, GitHub) already exists — see the accounts artifact.

---

## Feasibility: can Hotmail ship in 2 weeks, before beta?

**Yes — realistically achievable for a 30-person beta.** Reasoning, from the binding constraint outward:

1. **The external verification gate does not block beta.** Microsoft's rule that "users can't consent to unverified
   multi-tenant apps" is gated on **risk-based step-up consent**, which is an **organizational-tenant admin** setting.
   Personal/consumer **Hotmail/Outlook.com (MSA)** accounts have no admin — they instead see a clickable
   **"unverified publisher" warning** and can still grant `Mail.Read`. This is *exactly* the posture Gmail import ships
   in today (unverified-app warning, click through). So Publisher Verification (§A6, the multi-week queue) is a
   **post-beta polish item, off the critical path.**
2. **The account/registration groundwork is already done** — Azure app registration exists, `Mail.Read` + `offline_access`
   granted, creds in `.env`. That erases `E1-5.1`'s registration half and most of `E1-5.2`.
3. **Remaining work is ~3.5–4.5 dev days** (A2 spike 1–1.5d + A3 build 2–3d), all of which I can do except the interactive
   consent click-throughs and pasting secrets.
4. **The one real risk is the A2 token-shape spike** — whether Supabase's Azure provider returns a Graph-usable token, or
   we fall back to a standalone MSAL.js flow. Budget the 1–1.5 days honestly; if it forces the MSAL path, you're still
   inside two weeks, just with less slack. **Do the spike first, day one** — it's the only thing that could surprise you.

**Conditions for the "yes":** (a) beta users connect *personal* Hotmail/Outlook.com accounts, accepting the unverified
warning; (b) app registration flipped to AAD+**MSA** multi-tenant (§A1); (c) the A2 spike lands in its budget.

**Yahoo in the same 2 weeks: no.** Separate account + review queue + a **server-side IMAP** adapter that can't reuse the
Gmail/Graph fetch shape. It's a distinct ~4–5 day track with its own external review. Sequence it **after** beta.
