# MVP Launch Action List — July 11, 2026

**Estimated completion: ~80%** — Blocks 0/A/C done; Block B (inventory spine) has core status/location shipped but lending, availability, and filters still open.

## Top 10 launch blockers

1. Publish the privacy policy at a public URL (unblocks OAuth consent screen + everything below it).
2. Add the 30 waitlisters as Google OAuth test users.
3. Write onboarding copy explaining the "Google hasn't verified this app" warning.
4. Build the simple lend modal (free-text borrower + due date).
5. Build the "lent out" view + `isAvailable` derivation.
6. Add status/location as filter dimensions in the filter panel.
7. Verify CSP/HSTS live against a deployed Vercel preview (confirm Google OAuth still completes).
8. Submit Gmail OAuth verification Gate 1 (domain verify, consent screen, scope justification).
9. Confirm the 7-day test-mode refresh-token expiry against current Google policy and set onboarding expectations accordingly.
10. Enable Supabase backups/PITR and run one restore test.

---

## E1 · Cloud Backend

- 🔴 Publish privacy policy (data collected, retention, deletion, Limited Use disclosure).
- 🔴 Verify CSP/HSTS live on a deployed Vercel preview, confirming Google OAuth still works.
- 🔴 Submit Gmail OAuth verification Gate 1; engage a CASA validator once accepted.
- 🟡 Enable Supabase backups/PITR and run a restore test.
- 🟡 Move Gmail token storage server-side with refresh handling.
- 🟡 Build a durable retry/outbox queue for offline writes that fail to sync.
- ⚪ Add Microsoft/Outlook import.
- ⚪ Add Yahoo import.

## E2 · Inventory Truth (Status & Location)

- 🔴 Build the simple lend modal (free-text borrower + due date).
- 🔴 Build the "lent out" view and `isAvailable` derivation (clean + home + not on loan).
- 🔴 Add status + location as filter dimensions in the filter side panel.
- 🟡 Build the "where is everything" grouped-by-location view.
- 🟡 Add custom / multi-home locations (user-defined labels beyond the 4 starter kinds).
- ⚪ Add status model v2 — `airing`/`stored` states + structured reason field.
- ⚪ Add fit + measurements.
- ⚪ Add taxonomy tags (season/occasion/vibe) and provenance.

## E5 · Mobile & PWA

- 🟡 Code-split the main JS bundle to improve load performance (Lighthouse Perf 55).
- 🟡 Fix color-contrast failures on the onboarding overlay and small primary button (a11y 96→100).

## E8 · Care & Knowledge

- 🟡 Expand the stain guide (nail polish, turmeric, red wine, oil, ink, blood, grass, makeup).

## E4 · Shared & Social

- ⚪ Build the share-link MVP (teaser view + Google sign-in viewer grant) — designed, not built.
- ⚪ Build lending via borrow requests + Activity notifications — designed, not built.

## E12 · User Profile

- ⚪ Build the profile hub (functional vs. social split, machine/lifestyle config) — mockups only, not built.
