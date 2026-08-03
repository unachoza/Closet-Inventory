# 3-Day Beta Launch Plan

Created 2026-08-03. Target beta launch: 2026-08-06.
Everything here is launch-blocking (P0). Anything not on this list goes to
[POST_BETA_BACKLOG.md](./POST_BETA_BACKLOG.md) instead — no exceptions during
this push.

---

## Day 1 — Legal

- [ ] Business/support email set up
- [ ] Privacy policy updated — Gmail scope, what's stored in Supabase,
      retention, the account-deletion path (`delete-user-account` Edge
      Function is already deployed), **and PostHog session replay
      disclosure** (`disable_session_recording: false` in monitoring.ts)
- [ ] Terms of service, beta-appropriate
- [ ] Google OAuth consent screen matches policy URL, app name, and scopes
- [ ] Sign-in consent card's "Clothing order confirmations" claim verified —
      drop it if account sign-in isn't actually requesting Gmail read scope
- [ ] Scope audit: confirm account sign-in isn't requesting dead
      `gmail.readonly`

## Day 2 — Observability + PWA updates

- [ ] Sentry end-to-end run-through — real error, real crash, real unhandled
      rejection, confirm each lands with usable stack traces
- [ ] PostHog funnel run-through — walk onboarding → sign-in → name → install
      → first import → first item added, confirm every step fires
- [ ] Buffer-and-flush for pre-consent analytics — **shipped in code**
      (src/lib/monitoring.ts), needs deploying to production before any more
      install/onboarding testing, or events keep vanishing the way the
      2026-08-02 install tests did
- [ ] Set up a reverse proxy for PostHog ingestion — ad blockers silently drop
      10–25% of events per PostHog's own warning; on top of the consent gap,
      testers with ad blockers are currently under-reported twice over
- [ ] Instrument: time-to-first-import, items imported per session, current
      closet count, import abandonment point
- [ ] Confirm in-app Feedback button delivers somewhere it'll actually get read
- [ ] PWA update verification — install, ship a visible version bump, reopen,
      confirm the new build appears (`registerType: "autoUpdate"` is
      confirmed correct in vite.config.ts; `setupPwaUpdateCheck()` now also
      forces a check on `visibilitychange` — **shipped**)
- [ ] Notifications: decide in-app-only for beta (push deferred — iOS Safari
      <16.4 can't receive it at all, and testers are on those versions)

## Day 3 — P0 breakage + retention

- [ ] Onboarding replays inside the installed PWA — detect standalone mode,
      persist completion flag across the install boundary, skip "install as
      PWA" step when already standalone
- [ ] White screen after first Google sign-in (confirmed ~5–10s, not 40s) —
      throttled-network repro first to confirm bundle vs. blocking-query cause,
      then fix at the right layer (inline `index.html` splash if network;
      timeout + real failure state if a blocking await)
- [ ] Care pills break mobile layout — rewrite material→care mapping to ≤3-word
      labels, add a layout guard so no pill can ever force horizontal scroll
- [ ] Multiselect dropdown (Care) covers Material Composition — explicit Done
      affordance + close-on-outside-tap
- [ ] "What do you want to do first?" onboarding step — Load sample closet /
      Import from Gmail / Add manually, so onboarding doesn't dead-end in an
      empty closet
- [ ] Post-import summary — item count, top brands, closes the import loop

---

## Shipped ahead of schedule

- Pre-consent analytics buffer-and-flush (monitoring.ts) — queues events in
  memory while consent is undecided, replays on grant with original
  timestamps, discards on decline
- PWA update check on `visibilitychange` (src/lib/pwaUpdate.ts) — a
  backgrounded-then-reopened install now force-checks for a new build instead
  of waiting on a stray navigation
