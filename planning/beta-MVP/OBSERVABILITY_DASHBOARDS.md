# Observability Dashboards — Founding Members Beta

**Scope:** 30 testers · Vercel PWA · Gmail-import headline · beta launch 2026-07-19
**Companion to:** [TIGHT_MVP_2026-07-16.md](./TIGHT_MVP_2026-07-16.md) · **Code:** `src/lib/analytics.ts`, `src/lib/monitoring.ts`

> **Rule of thumb.** PostHog answers *"who did what and where did they get stuck?"* Sentry answers *"what broke, on which release, for how many people?"* If a question can be answered by either, put it in the one whose native primitive fits best — do not build it in both. Every widget below leads to an engineering, product, or comms decision; anything that doesn't isn't here.

**Budget:** 5 dashboards · ≤ 10 widgets each · 50 widgets total.

---

## Tool division (do not duplicate)

| Question | Tool |
|---|---|
| Did testers reach first value? | PostHog |
| Where in Gmail import do they drop? | PostHog funnel |
| Which features are actually used? | PostHog trends |
| What did the user do before failing? | PostHog session replay |
| Which exception broke it? | Sentry issue |
| Which release introduced the regression? | Sentry release |
| Which browser / route is impacted? | Sentry facet |
| Is the current deploy safe? | Sentry release-health |
| How many users hit the bug? | Linked by `user_id` in both |

---

## Event taxonomy — what to ship before Sunday

`src/lib/analytics.ts` currently emits: `account_created`, `signed_in`, `import_started`, `import_results_shown`, `import_finished`, `item_added`, `item_edited`, `item_deleted`, `search_used`, `filter_used`, `care_guide_opened`, `screen_viewed`, `feedback_submitted`.

### Required before beta (add to `AnalyticsEvent` union)

| Event | Where fired | Required properties | Why it matters |
|---|---|---|---|
| `gmail_oauth_started` | User taps "Connect Gmail" | `mode` | Denominator of the OAuth funnel |
| `gmail_oauth_completed` | OAuth returns success | `mode`, `latency_ms` | Numerator of the OAuth funnel |
| `gmail_oauth_failed` | OAuth returns error / user cancels | `mode`, `reason` (`user_cancel`, `token_expired`, `scope_denied`, `network`, `unknown`) | Isolate consent-screen abandonment vs real errors |
| `import_failed` | Any thrown error inside the import pipeline | `import_id`, `failure_stage` (`scan`, `parse`, `dedupe`, `persist`), `error_code`, `duration_ms` | Stage-level failure ranking (funnel can't) |
| `import_item_confirmed` | User taps "Add" on a parsed result | `import_id`, `source_domain`, `was_edited` (bool) | The activation moment — see activation section |
| `search_zero_results` | Search query returns 0 items | `query_length`, `filter_count` | Zero-result rate + top failed queries |
| `search_result_opened` | User taps an item from a search result list | `query_length`, `result_rank` | Search → value funnel |
| `item_view` | Item detail page shown | `source` (`grid`, `search`, `care`, `import`) | Search-to-view step; drives retention insight |

### Property additions to existing events

| Event | Add property | Why |
|---|---|---|
| `import_started` | `import_id` (uuid v4 generated client-side) | Correlate across `import_started` / `import_results_shown` / `import_finished` / `import_failed` |
| `import_results_shown` | `import_id`, `items_detected`, `duration_ms` | "Zero-item imports" KPI + duration histogram |
| `import_finished` | `import_id`, `items_confirmed`, `duplicate_count`, `duration_ms` | Duplicate rate + confirmed-vs-detected drop |
| `search_used` | `query_length`, `has_filters` | Filter-combined-with-search analysis |
| `filter_used` | `active_filter_count` | "No-result filter combinations" table |

### Auto-registered person / super properties

Set in `initMonitoring()` after `posthog.identify()`:

| Property | Source | Used in |
|---|---|---|
| `app_version` | `__APP_VERSION__` (already registered) | All release-comparison widgets |
| `browser` | PostHog auto-capture | Search-frustration segments |
| `device_type` | PostHog auto-capture | Mobile/desktop splits |
| `pwa_mode` | `window.matchMedia('(display-mode: standalone)').matches` | Installed-tester cohort |
| `is_founding_member` | Set once at first sign-in | Filter out your own dogfooding |

### Can wait (post-beta)

- `outfit_created`, `laundry_marked`, `location_set` (features are flagged off)
- Server-side event mirroring (only client events for now — one runtime, one taxonomy)
- Revenue / conversion events (no paid tier yet)

### **Never** send to PostHog

Email addresses, subject lines, message bodies, sender/recipient info, item prices, product URLs. `import_id` is a random uuid — it does **not** encode any Gmail content.

---

## Activation, retention, cohorts, replays

### Activation event — `import_item_confirmed` (first time per user)

Explicit choice: activation is the moment a tester keeps a machine-parsed item, because that is the smallest observable proof the headline feature delivered value. Manual `item_added` is a distant second-best (proves engagement, not that Gmail import worked).

### Primary activation funnel

`account_created` → `gmail_oauth_completed` → `import_started` → `import_results_shown` (`items_detected > 0`) → `import_item_confirmed`
Time window: **7 days from `account_created`.** First-touch attribution.

### Retention event — `screen_viewed` where `view != 'onboarding'`

Weekly retention curve, cohorted by signup week. Two cohorts is enough for a 30-person beta (invite Sunday, top-up Wednesday).

### Cohorts to build

| Cohort | Definition | Used for |
|---|---|---|
| `Activated` | Performed `import_item_confirmed` ≥ 1× | Retention numerator; healthy-user baseline |
| `Stalled at OAuth` | Did `gmail_oauth_started` but not `gmail_oauth_completed` in 24h | DM list for onboarding help |
| `Stalled at Import` | `import_started` but no `import_item_confirmed` in 24h | Support-outreach list |
| `Search Adopters` | ≥ 3 `search_used` in first 7 days | Confirms the "testers say they love Search" claim |
| `PWA Installed` | `pwa_mode = true` on any event | Compare retention vs browser-tab users |
| `Zero-item Import` | Any `import_results_shown` with `items_detected = 0` | Parser-improvement backlog input |

### Session-replay playlists to save

| Playlist | Filter | Why |
|---|---|---|
| **Failed imports** | Session contains `import_failed` | Watch what testers saw before the error |
| **Zero-item imports** | Session contains `import_results_shown` with `items_detected = 0` | See if it's an empty inbox or a parser miss |
| **Zero-result searches** | Session contains `search_zero_results` | Find missing-content vs bad-query patterns |
| **Rage-clicks / dead-clicks** | PostHog autocapture rage/dead-click | Untriaged UX friction |
| **Feedback submitters** | Session contains `feedback_submitted` | Watch alongside the feedback row for context |

---

## PostHog dashboard 1 — Beta Launch Overview

**Check daily at 9am and 9pm.** Answers "are testers reaching value, and are they coming back?"

| # | Widget | Insight type | Events / formula | Filters | Breakdown | Time range | Alert / review threshold | Action when unhealthy |
|---|---|---|---|---|---|---|---|---|
| 1 | **Unique testers (7d)** | Trend · KPI (unique users) | `$pageview` OR `screen_viewed` | Exclude `is_founding_member=false` if you want internal-only; else none | none | Last 7 days | < 20 of 30 by Day 3 | DM the missing 10; check invite link |
| 2 | **Activated testers (cumulative)** | Trend · KPI (unique users) | `import_item_confirmed` | First-time only | none | Since launch | < 15 by Day 5 | Watch a stalled-user replay; talk to 2 |
| 3 | **Activation rate** | Formula (KPI) | `A/B` where A = unique users w/ `import_item_confirmed`, B = unique users w/ `account_created` | none | none | Since launch | < 50% | Fix the top-abandoned funnel step |
| 4 | **Import completion rate** | Formula (KPI) | `import_finished` unique users / `import_started` unique users | none | none | Last 7 days | < 60% | Open Gmail Import Health dash |
| 5 | **D1 / D7 retention** | Retention insight | Start = `signed_in`, Return = `screen_viewed` (non-onboarding) | none | Signup week cohort | Since launch | D1 < 40% or D7 < 20% | Ship an outbound "come back and try X" nudge |
| 6 | **Primary activation funnel** | Funnel | `account_created` → `gmail_oauth_completed` → `import_started` → `import_results_shown` → `import_item_confirmed` | Conversion window 7d | Breakdown by `mode` | Since launch | Any single-step drop > 40% | Fix that step first; nothing else moves the top-line |
| 7 | **Daily active testers** | Trend · line (DAU) | `screen_viewed` (unique users, daily) | none | none | Last 14 days | Two straight days declining | Announce something / release a fix |
| 8 | **Feature adoption (7d)** | Trend · bar (unique users per event) | `search_used`, `filter_used`, `care_guide_opened`, `item_added`, `import_started`, `feedback_submitted` | none | Event name | Last 7 days | Any headline feature < 30% reach | Reconsider surfacing / onboarding for it |
| 9 | **Feedback submitted** | Trend · KPI + table | `feedback_submitted` count + linked Supabase `feedback` rows | none | `view` property | Last 7 days | Any spike → read the messages within the hour | Reply to each; triage bugs into Sentry issues |
| 10 | **Top friction sessions** | Session replay list | Playlist: **Failed imports** + **Rage-clicks** merged | Last 24h | none | Last 24h | > 3 unwatched per day | Watch top 3; file issues; DM the user if severe |

---

## PostHog dashboard 2 — Gmail Import Health

**The riskiest workflow gets its own dashboard.** Answers "of the people who try to import, who succeeds, why do the others fail?"

| # | Widget | Insight type | Events / formula | Filters | Breakdown | Time range | Alert / review threshold | Action when unhealthy |
|---|---|---|---|---|---|---|---|---|
| 1 | **OAuth funnel** | Funnel | `gmail_oauth_started` → `gmail_oauth_completed` | Conversion window 10 min | Breakdown by `browser` | Last 7 days | Completion < 70% | Check Google consent screen state (unverified warning?) |
| 2 | **Import pipeline funnel** | Funnel | `import_started` → `import_results_shown` → `import_item_confirmed` → `import_finished` | Conversion window 30 min · same session · `import_id` matched | Breakdown by `mode` | Last 7 days | Any step < 60% | Open the replay playlist for that step |
| 3 | **Import outcome mix** | Trend · stacked bar (daily) | `import_finished` (success), `import_failed` (fail), `import_results_shown` with `items_detected=0` (empty) | none | Outcome | Last 14 days | Failure share > 15% | Rank failures by `failure_stage`; hotfix top one |
| 4 | **Median import duration** | Trend · line | `import_finished.duration_ms` — median | Only `count > 0` | none | Last 14 days | Median > 20s or p90 > 60s | Profile backend; check Supabase edge fn logs |
| 5 | **Items detected per import** | Trend · histogram | `import_results_shown.items_detected` | none | none | Last 14 days | Long left tail (mode = 0–2) | Parser tuning — pair with Zero-item playlist |
| 6 | **Zero-item imports** | Trend · KPI + line | `import_results_shown` where `items_detected = 0` (count + rate vs total) | none | none | Last 7 days | Rate > 20% | Watch the playlist; check inbox is real |
| 7 | **Duplicate rate** | Trend · line | `import_finished.duplicate_count` / `import_finished.items_confirmed` | none | none | Last 14 days | > 10% | Tighten dedupe key |
| 8 | **Failure reason (ranked)** | Trend · ranked bar | `import_failed` count | none | `failure_stage`, then `error_code` | Last 7 days | Any single reason > 30% of failures | File a Sentry-linked ticket for the top one |
| 9 | **OAuth failure reasons** | Trend · ranked bar | `gmail_oauth_failed` count | none | `reason` | Last 7 days | `user_cancel` > 40% → consent-screen copy issue, not code | Rewrite the "Google hasn't verified this app" onboarding hint |
| 10 | **Failed-import replays** | Session replay list | Playlist: **Failed imports** + **Zero-item imports** | Last 24h | none | Last 24h | > 2 unwatched | Watch top 2; add fixture to test suite |

---

## PostHog dashboard 3 — Search, Filters, and Product Value

**Answers the tester quote: "testers *say* they love Search — do 4% actually use it?"** Also covers Care and manual maintenance.

| # | Widget | Insight type | Events / formula | Filters | Breakdown | Time range | Alert / review threshold | Action when unhealthy |
|---|---|---|---|---|---|---|---|---|
| 1 | **Search usage rate** | Formula (KPI) | Unique users with `search_used` / unique active users | none | none | Last 7 days | < 40% | Add a search prompt on empty closet grid |
| 2 | **Search → value funnel** | Funnel | `search_used` → `search_result_opened` → `item_view` | Same session, 5-min window | none | Last 7 days | Result-opened step < 50% | Check ranking / result density |
| 3 | **Zero-result rate** | Trend · KPI + line | `search_zero_results` / `search_used` | none | none | Last 14 days | > 25% | Look at top-terms widget |
| 4 | **Top zero-result terms** | Trend · ranked bar (table) | `search_zero_results` count | none | `query` (only if query is stripped of PII — else `query_length`) | Last 30 days | Any term > 5 hits/week | Add synonym / improve fuzzy match |
| 5 | **Most-used filters** | Trend · bar | `filter_used` count | `action = 'add'` only | `dimension` | Last 14 days | Any filter < 5 uses in 14 days | Consider hiding it from the beta UI |
| 6 | **No-result filter combos** | Trend · table | `search_zero_results` where `filter_count > 0` | none | `active_filter_count` | Last 14 days | Any combo > 10 hits | Loosen default AND/OR logic for that combo |
| 7 | **Care-guide views** | Trend · line | `care_guide_opened` (unique users + count) | none | `from` property | Last 14 days | Unique users < 10 in 14d | Surface Care from item card, not just nav |
| 8 | **Item creation** | Trend · line | `item_added` | none | `source` (`manual` vs `import`) | Last 14 days | Manual > import for > 3d | Import is the headline — investigate why manual is winning |
| 9 | **Item edits** | Trend · line | `item_edited` (count + unique users) | none | `fields[0]` | Last 14 days | Same field edited by > 30% of users | The default for that field is wrong |
| 10 | **Search-frustration replays** | Session replay list | Playlist: **Zero-result searches** + **Rage-clicks** | Last 7 days | none | Last 7 days | > 3 unwatched | Watch top 2; open UX tickets |

---

## Sentry dashboard 1 — Production Reliability

**Answers "what's broken right now, for whom?"** Check on every deploy and every morning.

Required Sentry setup (send once on init; already partially done — see `monitoring.ts`):

| Tag / context | Value source | Purpose |
|---|---|---|
| `release` | `__APP_VERSION__` (git SHA + package version) | Regression tracking (already set) |
| `environment` | `production` / `preview` / `dev` from Vercel | Filter production-only |
| `user.id` (anonymous) | Supabase `auth.user.id` | Affected-users counts, cross-tool joins |
| `route` | React Router pathname | Errors-by-route bar |
| `feature` tag | `gmail_import` / `search` / `care` / `closet` / `onboarding` | Errors-by-feature |
| `pwa_mode` tag | Same as PostHog super-property | Installed-vs-browser split |
| `import_id` context | Same uuid as PostHog | Manually cross-link a Sentry issue with a PostHog session |
| `browser`, `device_type` | Sentry auto-context | Browser bar |

| # | Widget | Dataset / query | Metric | Filters | Grouping | Visualization | Warning | Critical | Investigation action |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Total errors (7d)** | Errors | `count()` | `environment:production` | — | KPI | > 100 | > 300 | Open issue list, sort by users affected |
| 2 | **Affected users (7d)** | Errors | `count_unique(user)` | `environment:production` | — | KPI | > 5 | > 10 | Read messages; hotfix if > 30% of beta |
| 3 | **Error events over time** | Errors | `count()` per hour | `environment:production` | — | Area / line | Sustained > 2× baseline for 2h | 10× spike in any hour | Check most-recent deploy; consider rollback |
| 4 | **New issues** | Issues | New in last 24h | `environment:production` | — | Table (title, culprit, users) | ≥ 1 with users > 3 | ≥ 1 unhandled | Assign + label; link to the deploy that shipped it |
| 5 | **Regressed issues** | Issues | State = regressed in last 7d | `environment:production` | — | Table | ≥ 1 | ≥ 1 with users > 3 | Re-open the original fix PR |
| 6 | **Top issues by users** | Issues | Top 10 by `count_unique(user)` | `environment:production` | — | Ranked table | Top row users > 5 | Top row users > 10 | Fix top row before anything else |
| 7 | **Errors by route** | Errors | `count()` | `environment:production` | `tag:route` | Bar (ranked) | Any route > 25% of total errors | Any route > 50% | That route is the entire reliability story — fix it |
| 8 | **Errors by browser** | Errors | `count()` | `environment:production` | `tag:browser` | Bar | One browser > 60% of errors when it's < 40% of usage | One browser > 80% of errors | Reproduce in that browser; probably a polyfill / Safari quirk |
| 9 | **Errors by release** | Errors | `count()` | `environment:production` | `tag:release` | Bar (last 5 releases) | Newest release > previous | Newest > 2× previous | Compare deployed diff; consider `vercel promote --previous` |
| 10 | **Unhandled vs handled** | Errors | `count()` | `environment:production` | `tag:handled` (`yes`/`no`) | Stacked bar (daily) | Any unhandled event on today's release | Unhandled event with > 3 users | Unhandled = crashed a workflow — fix same day |

---

## Sentry dashboard 2 — Release and Performance Health

**Answers "is the latest release safe, and where is the app slow?"** Check after every deploy.

Required transactions (name explicitly in code — do not rely on route auto-names):

| Transaction | Started at | Finished at |
|---|---|---|
| `auth.signup` | Sign-up submit | Supabase session established |
| `auth.login` | Sign-in submit | Supabase session established |
| `gmail.oauth` | User taps "Connect Gmail" | OAuth token stored |
| `gmail.import` | `import_started` | `import_finished` or `import_failed` |
| `closet.search` | Search input submit | Results rendered |
| `closet.filter` | Filter applied | Results rendered |
| `item.create` | Form submit | Row confirmed in Supabase |
| `item.update` | Edit submit | Row confirmed in Supabase |
| `care_guide.load` | Care tab opened | Guide content rendered |

| # | Widget | Dataset / query | Metric | Filters | Grouping | Visualization | Warning | Critical | Investigation action |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Crash-free sessions** | Release health | `crash_free_rate(session)` | `environment:production`, current release | — | KPI | < 99% | < 97% | Halt further rollout of that release |
| 2 | **Crash-free users** | Release health | `crash_free_rate(user)` | `environment:production`, current release | — | KPI | < 98% | < 95% | Same — rollback or hotfix |
| 3 | **New errors by release** | Errors | `count()` where issue first-seen in that release | `environment:production` | `tag:release` | Bar (last 5 releases) | ≥ 1 in latest | ≥ 3 in latest | List the new issues; decide fix-forward vs rollback |
| 4 | **Error rate by release** | Errors + sessions | `count()` / `count(session)` | `environment:production` | `tag:release` | Line (last 5 releases) | Latest > previous by 25% | Latest > previous by 100% | Compare diff of the two releases |
| 5 | **Slowest transactions** | Performance | `p95(transaction.duration)` | `environment:production` | `transaction` name | Ranked table | Any transaction p95 > 3s | p95 > 8s | Trace-view the slowest sample |
| 6 | **P75 duration over time** | Performance | `p75(transaction.duration)` | `environment:production`, `transaction:closet.search` OR `gmail.import` | `transaction` | Line | Trend up 25% over 3 days | Trend up 100% over 3 days | Correlate to release; profile |
| 7 | **Failed API requests** | Performance | `failure_rate()` on HTTP spans | `environment:production` | `http.url` (top 10) | Line + table | > 2% | > 5% | Check Supabase logs for the failing endpoint |
| 8 | **Gmail import duration** | Performance | `p50` and `p95` of `gmail.import` | `environment:production` | — | Dual-line | p95 > 30s | p95 > 60s | Backend profile; likely Supabase edge fn cold start |
| 9 | **Search duration** | Performance | `p75(transaction.duration)` on `closet.search` | `environment:production` | — | Line | p75 > 500ms | p75 > 1.5s | Index / fuzzy-match perf work |
| 10 | **Browser performance** | Performance | `p75(transaction.duration)` on all transactions | `environment:production` | `tag:browser` | Bar | Any browser > 2× median of others | Any browser > 4× | Reproduce on that browser; ship targeted fix |

---

## Smallest version required before Sunday

If time is short, ship **exactly this** — everything else can go up Monday.

**Events (must be firing on prod):**
- Existing 13 events (already done)
- Add: `gmail_oauth_started`, `gmail_oauth_completed`, `gmail_oauth_failed`, `import_failed`, `import_item_confirmed`, `search_zero_results`
- Add properties: `import_id` on all import events; `items_detected` on `import_results_shown`; `items_confirmed`, `duplicate_count`, `duration_ms` on `import_finished`
- `posthog.identify()` on sign-in; register `app_version`, `pwa_mode`, `is_founding_member`

**PostHog — 1 dashboard, 6 widgets ("Day-1"):**
1. Unique testers (KPI)
2. Activated testers (KPI)
3. Primary activation funnel
4. Import pipeline funnel
5. Feedback submitted (table)
6. Failed-import replay playlist

**Sentry — 1 dashboard, 4 widgets ("Deploy safety"):**
1. Total errors (7d)
2. Affected users (7d)
3. Top issues by users
4. New errors by release

Everything else on this page is Week-1 backlog and slot into the full 5-dashboard plan above.

---

## What's deliberately not here (and why)

- **Revenue / conversion / LTV.** No paid tier; vanity numbers for a 30-person beta.
- **Cohort deep-dives beyond the 6 listed.** More cohorts = more places to look; a solo founder debugging a beta will never open the 12th one.
- **Server-side event mirroring.** Adds a second taxonomy to maintain; the whole app runs in the browser today.
- **Custom Sentry alerts to Slack.** Vercel + email is enough at 30 users; wire Slack when the volume justifies context-switching.
- **A "search quality" dashboard.** Folded into Dashboard 3 — a separate one would be < 10 widgets of overlap.
