# Privacy Policy — Draft (Nothing To Wear)

> **Status:** rough draft for founder review, not legal advice, not yet published. Placeholders in
> `{{brackets}}` need real values before this goes live. Once approved, this needs to be hosted at a
> public URL and linked from the Google OAuth consent screen (required for verification, `E1-4.9a`).
> **Date:** 2026-07-11 · Ticket: `E1-4.13`

---

## Privacy Policy

**Effective date:** {{launch date}}
**Last updated:** {{launch date}}

Nothing To Wear ("NTW," "we," "us") is a personal wardrobe-inventory app. This policy explains what
data we collect, why, how long we keep it, and how you can delete it.

### 1. What we collect

| Data | Source | Why |
|---|---|---|
| Google account identity (name, email, profile photo) | Google Sign-In | Create and secure your account |
| Gmail message content — **read-only** | Gmail API (`gmail.readonly` scope) | Parse purchase-confirmation emails to auto-import wardrobe items |
| Wardrobe data (items, photos, status, location, notes) | You, directly, or parsed from imported emails | The core product — your closet inventory |
| Uploaded photos | You, directly | Visual record of your items |
| Basic usage/error data | Sentry (errors), PostHog (product analytics) — **only after you consent** via the in-app banner | Fix bugs, understand feature usage |

We do **not** request Gmail send, delete, or modify permissions — only `gmail.readonly` (read messages)
and `userinfo.email` (your email address). We cannot send email as you or alter your inbox.

### 2. Why each is collected

- **Google identity** — required to create your account and keep your closet private to you.
- **Gmail content** — read once per import request to find and parse purchase-confirmation emails into
  wardrobe items. We do not read your inbox in the background or without your action.
- **Wardrobe data & photos** — the product itself; this is what you're using NTW to track.
- **Usage/error data** — only collected if you accept the consent banner; used to find bugs and see
  which features are used, never sold or used for advertising.

### 3. How long we keep it

- Your account and wardrobe data are kept **as long as your account is active**.
- Deleting an item removes it immediately.
- Deleting your account (Settings → Account & Data → Delete Account) **permanently erases** your
  profile, closet, items, photos, and Google identity link — see Section 5.
- We do not retain parsed email content separately from the wardrobe item it produced; only the
  extracted item data (name, price, category, etc.) is stored, not the raw email body.

### 4. Who we share it with

- **Supabase** — our infrastructure provider (database, file storage, authentication). Supabase
  processes data on our behalf and does not use it for its own purposes.
- **Sentry** — error tracking, only if you consent. Receives error stack traces, which may incidentally
  include non-sensitive app state.
- **PostHog** — product analytics, only if you consent. Receives anonymized usage events.
- **We do not sell your data.** We do not share it with advertisers. We do not use Gmail content, your
  wardrobe data, or your identity for advertising of any kind.
- We may disclose data if required by law, or to protect the security of the service (e.g.,
  investigating abuse).

### 5. Your rights — deletion & export

- **Export:** Settings → Account & Data → Export My Data downloads a full JSON copy of your profile,
  closets, items, and wear history.
- **Delete:** Settings → Account & Data → Delete Account permanently erases your data, including your
  Storage photos and your Google-linked identity (`auth.users` record) — this is irreversible.
- These rights are available to every user at any time, without needing to contact support, in
  compliance with GDPR/CCPA data-subject rights.

### 6. Google Limited Use disclosure

NTW's use of information received from Google APIs adheres to the
[Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy),
including the Limited Use requirements:

- Gmail data is used **only** to provide and improve the wardrobe-import feature you directly request.
- Gmail data is **never used for advertising**.
- Gmail data is **never sold, transferred, or shared** with third parties except: (a) to provide the
  core NTW feature (e.g., Supabase as infrastructure), (b) to comply with the law, or (c) as part of a
  merger/acquisition where the successor commits to this same policy.
- Gmail data is **not read by humans**, except (a) with your explicit consent, (b) if necessary for
  security purposes (e.g., investigating abuse), or (c) to comply with the law.

### 7. Security

- Your data is protected by row-level security (only you can read or write your own rows).
- Data is encrypted in transit (HTTPS/TLS) and at rest (Supabase-managed encryption).
- Photos are stored in a private bucket; access requires a short-lived signed URL, never a public link.
- We do not store your Gmail password — authentication is entirely handled by Google's own OAuth flow.

### 8. Children

NTW is not directed to children under 13 (or the relevant age of digital consent in your region), and
we do not knowingly collect data from them.

### 9. Changes to this policy

We'll update the "Last updated" date above and, for material changes, notify users via email or in-app
notice.

### 10. Contact

Questions or requests about your data: **{{privacy contact email}}**

---

## Terms of Service — placeholder

A separate, short Terms of Service is also required for the Google OAuth consent screen. Recommend
generating one alongside this policy (e.g., via Termly/iubenda) rather than drafting from scratch —
scope is small (single-user personal-inventory app, no marketplace/payments yet).

---

## Open items before publishing

- [ ] Fill in `{{launch date}}` and `{{privacy contact email}}`.
- [ ] Confirm final consent-banner copy links to this policy (currently plumbed but not linked, per `E1-4.14`).
- [ ] Have this reviewed by an actual lawyer or a policy-generation service before treating it as binding — this draft is a founder-level starting point, not legal sign-off.
- [ ] Publish at a stable public URL and link it (plus the ToS) in the Google Cloud Console OAuth consent screen.
