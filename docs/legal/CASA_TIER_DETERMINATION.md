# CASA Tier Determination — Nothing To Wear

**Date:** 2026-07-11 · Ticket: `E1-4.9c`

## Determination: **Tier 2**

## Why

Google requires a CASA (Cloud Application Security Assessment) for apps using **restricted scopes**.
The tier is set by scope sensitivity and app risk profile, not by app size:

- The only restricted scope requested is **`gmail.readonly`** (`src/hooks/useGmailAuth.tsx`,
  `src/hooks/useSupabaseAuth.ts`) — read-only access to Gmail messages. No `gmail.send`,
  `gmail.modify`, or full-account-access scopes are requested.
- `userinfo.email` is a non-restricted scope and doesn't affect tier.
- Google's published tier guidance puts **read-only access to a single restricted scope, with no
  write/send/delete capability**, at **Tier 2** — a self-assessment via one of Google's approved
  scanning tools (e.g., NowSecure, Data Theorem), not a full third-party penetration test (Tier 3,
  reserved for apps with broader restricted-scope access, financial data, or higher user-risk profiles).
- Nothing about NTW's usage pattern pushes it into Tier 3: no enterprise/admin-level scopes, no
  access to other users' Gmail, no scope beyond reading purchase-confirmation emails.

## What Tier 2 requires

1. Engage a Google-approved CASA assessor from the
   [Google-published list](https://appdefensealliance.dev/casa) (self-assessment tools, not a manual
   pentest firm).
2. Run the assessor's automated scan against the production app + API surface.
3. Remediate any findings — expected overlap with existing hardening: `E1-4.7` (CSP/HSTS), `E1-4.10`
   (Supabase auth-config audit), `E1-4.3` (secret hygiene), all already substantially done per
   `docs/SECURITY_CONFIG.md`.
4. Submit the resulting report through the OAuth verification flow in Google Cloud Console.
5. **Repeat annually** for as long as `gmail.readonly` remains in use — this is a recurring
   compliance cost, not a one-time gate.

## Confirm before committing

- [ ] Re-check Google's current tier-assignment table at verification time (`E1-4.9`) — Google has
      changed tier boundaries before, and the actual tier is ultimately assigned by Google during the
      verification review, not self-declared. Treat "Tier 2" here as the planning assumption, not a
      guarantee.
- [ ] Confirm the specific approved-assessor list and current self-assessment tool options at
      submission time (the list changes periodically).

## Estimated cost/time

Tier 2 self-assessments are typically **lower-cost and faster** than Tier 3 (weeks, not months;
assessor fees are commonly in the low-hundreds-to-low-thousands USD range depending on the tool/vendor,
versus Tier 3's multi-thousand-dollar manual pentest engagements) — but exact current pricing should be
confirmed directly with an approved assessor, since Google doesn't publish fixed rates.
