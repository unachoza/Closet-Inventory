# Beta Observability: PostHog + Sentry Dashboard Plan

Scope: 30-person beta of Closet Inventory. Five dashboards total (3 PostHog, 2 Sentry), ≤10 widgets each. Every metric must lead to an engineering or product decision.

---

## Division of responsibility

| Question | Tool |
|---|---|
| Did testers complete onboarding? | PostHog |
| Where did users abandon Gmail import? | PostHog |
| Which features are being used? | PostHog |
| What did the user do right before failing? | PostHog session replay |
| What exception was thrown? | Sentry |
| Which release introduced the regression? | Sentry |
| Which browser / device is affected? | Sentry |
| Which route or API request is slow? | Sentry |
| How many users hit the issue? | Both, joined by `user_id` + `release` |

---

# PostHog

## Global activation model

| Item | Definition |
|---|---|
| Activation event | `activation_reached` — fired once per user the first time all of: `account_created`, `gmail_connected`, `import_completed`, `item_confirmed` are true |
| Primary activation funnel | `account_created` → `gmail_connected` → `import_started` → `import_completed` → `item_confirmed` |
| Retention event | `closet_opened` (weekly retention against activation) |
| Time zone | Owner's TZ, weeks start Monday |
| Default range | Last 14 days for beta dashboards |

## Cohorts to create in PostHog

| Cohort | Definition | Purpose |
|---|---|---|
| Beta testers | `user_id` in seeded list of 30 tester IDs | Scope every dashboard |
| Activated | Performed `activation_reached` ever | Retention baseline |
| Stalled at import | Performed `import_started` but not `import_completed` in 24h | Support outreach |
| Zero-item importers | `import_completed` with `items_detected = 0` | Extraction-quality watch |
| Search users | Performed `closet_search_submitted` ≥3× in 7d | Value-seekers |
| Returning week-2 | Active in `week 0` AND `week 1` since first session | Real retention |

## Session-replay playlists to create

| Playlist | Filter |
|---|---|
| Failed imports | Event `import_failed` OR `import_completed` with `result != success` |
| Zero-item imports | Event `import_completed` with `items_detected = 0` |
| Zero-result searches | Event `closet_search_zero_results` |
| Rage clicks | Autocaptured rage-click on any page |
| OAuth abandon | Event `gmail_oauth_started` without `gmail_oauth_completed` within same session |
| First-session drop-off | New user, session ends without `activation_reached` |

## Events required BEFORE beta launch

Auth / onboarding: `account_created`, `onboarding_step_viewed`, `onboarding_step_completed`, `activation_reached`
Gmail import: `gmail_oauth_started`, `gmail_oauth_completed`, `gmail_oauth_failed`, `import_started`, `import_progress`, `import_completed`, `import_failed`, `item_confirmed`, `item_rejected`
Closet: `closet_opened`, `item_created`, `item_edited`, `item_deleted`, `item_viewed`
Search / filter: `closet_search_submitted`, `closet_search_results_viewed`, `closet_search_zero_results`, `search_result_opened`, `filter_applied`, `filter_removed`, `filter_zero_results`
Care: `care_guide_viewed`

## Events that can wait (post-beta)

Outfit builder events, share/export events, care-reminder notifications, price-history events, wear-count / laundry events.

---

## Dashboard 1 — Beta Launch Overview (PostHog)

Purpose: single morning check-in. If this dashboard is green, nothing else needs looking at.

| # | Widget | Question | Insight | Events / formula | Properties needed | Filters | Breakdown | Range | Viz | Threshold | Action |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Unique testers (7d) | Who used the app? | Trends → unique users | Any event | `user_id` | Cohort = Beta testers | — | 7d | KPI number vs prior 7d | <20 of 30 in a rolling 7d | DM inactive testers |
| 2 | Activated testers (cumulative) | How many hit first value? | Trends → unique users | `activation_reached` | `user_id` | Cohort = Beta testers | — | 30d cumulative | KPI | <15 of 30 by day 7 | Onboarding review |
| 3 | Activation rate | % of signups reaching activation | Formula A/B | A = users w/ `activation_reached`, B = users w/ `account_created` | `user_id` | Cohort = Beta testers | — | 14d | KPI % | <50% | Add funnel drill-down (D2) |
| 4 | Import completion rate | Is the flagship feature working? | Formula A/B | A = `import_completed(result=success)`, B = `import_started` | `import_id`, `result` | Cohort = Beta testers | — | 7d | KPI % | <75% | Open D2, watch failed-import replays |
| 5 | D1 / D7 return rate | Are they coming back? | Retention | First event = `activation_reached`, returning = `closet_opened` | `user_id` | Cohort = Beta testers | — | 14d cohort grid | Retention matrix | D7 <25% | Product review, ping cold cohort |
| 6 | Activation funnel | Where do users drop? | Funnel | `account_created` → `gmail_connected` → `import_started` → `import_completed` → `item_confirmed` | `user_id`, step timestamps | Cohort = Beta testers | Device type | 14d, any step 24h | Funnel | Any step <70% | Investigate that step in D2/D3 |
| 7 | Daily active testers | Trend up or down? | Trends → unique users, DAU | Any event | `user_id` | Cohort = Beta testers | — | 14d | Line | 3 consecutive down days | Triage — email or Sentry issue? |
| 8 | Feature adoption | Which launch features are used? | Trends → unique users per event | `import_completed`, `closet_search_submitted`, `care_guide_viewed`, `item_created` | `user_id` | Cohort = Beta testers | Event name | 14d | Stacked bar | Any feature <20% adoption | Kill / promote / rework |
| 9 | Sessions per user | Depth of engagement | Trends → total events / unique users | `$pageview` | `user_id`, `$session_id` | Cohort = Beta testers | — | 14d | Line | <2 sessions/user/wk | Ping testers, add nudge |
| 10 | Top friction sessions | What should I watch? | Session-replay playlist tile | Playlist: Rage clicks + Failed imports (merged) | `$session_id` | Cohort = Beta testers | — | 24h | Replay list (top 10) | Any new failed import | Watch replay, file Sentry issue if error |

---

## Dashboard 2 — Gmail Import Health (PostHog)

Purpose: isolate the highest-risk workflow. Every widget should tell you whether to ship a fix or dig deeper.

| # | Widget | Question | Insight | Events / formula | Properties needed | Filters | Breakdown | Range | Viz | Threshold | Action |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | OAuth funnel | Are users connecting Gmail? | Funnel | `gmail_oauth_started` → `gmail_oauth_completed` | `user_id`, `oauth_error_code` | Cohort = Beta testers | Browser | 14d, 15-min window | Funnel | Completion <85% | Check `oauth_error_code` distribution |
| 2 | Import funnel | Where does import fail? | Funnel | `import_started` → `import_progress` → `import_completed` → `item_confirmed` | `import_id`, `failure_stage` | Cohort = Beta testers | — | 14d, 24h window | Funnel | Any step <80% | Cross-check with Sentry Import perf |
| 3 | Import outcome mix | Success / partial / failure | Trends → total count | `import_completed` | `result` (success \| partial \| failure) | Cohort = Beta testers | `result` | 14d | Stacked bar (daily) | `failure` >10% of total | Open widget 8 |
| 4 | Median import duration | Is it getting slower? | Trends → median of numeric property | `import_completed` | `duration_ms` | Cohort = Beta testers | — | 14d | Line (p50 + p90) | p90 >60s or +30% wk/wk | Check Sentry `gmail.import` transaction |
| 5 | Items detected per import | Is extraction useful? | Trends → property histogram | `import_completed` | `items_detected` | Cohort = Beta testers | — | 14d | Histogram | >20% of imports w/ 0 items | Open widget 6, escalate parser |
| 6 | Zero-item imports | How often does import produce nothing? | Formula A/B | A = `import_completed(items_detected=0)`, B = `import_completed` | `items_detected` | Cohort = Beta testers | — | 7d | KPI % + trend | >15% | Parser regression review; watch replay playlist |
| 7 | Duplicate rate | Are we creating repeats? | Trends → median | `import_completed` | `duplicate_count` / `items_detected` (computed property) | Cohort = Beta testers | — | 14d | Line | Median >10% | Dedupe rule audit |
| 8 | Top failure reasons | What breaks most? | Trends → total count | `import_failed` | `failure_stage`, `error_code` | Cohort = Beta testers | `failure_stage` | 14d | Ranked bar | Any single code >30% of failures | File Sentry-tracked engineering ticket |
| 9 | Confirm-vs-reject ratio | Are the picks good? | Formula A/(A+B) | A = `item_confirmed`, B = `item_rejected` | `import_id`, `item_id` | Cohort = Beta testers | — | 14d | KPI % + line | <70% confirm | Extraction-quality product review |
| 10 | Failed-import replays | What did they experience? | Session-replay playlist | Playlist: Failed imports | `$session_id` | Cohort = Beta testers | — | 7d | Replay list | Any new entry | Watch top 3 daily |

### Required event properties for import events

`import_id`, `user_id`, `email_count_scanned`, `items_detected`, `items_confirmed`, `duplicate_count`, `duration_ms`, `result` (enum: success/partial/failure), `failure_stage` (enum: oauth/list/fetch/parse/persist), `error_code`, `app_version`, `browser`, `device_type`, `pwa_mode`.

Redaction rules: do NOT send email subject, body, from-address, merchant name (beyond a hashed `merchant_id`), or order totals into PostHog.

---

## Dashboard 3 — Search, Filters & Product Value (PostHog)

Purpose: is the closet actually useful after import?

| # | Widget | Question | Insight | Events / formula | Properties needed | Filters | Breakdown | Range | Viz | Threshold | Action |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Search adoption | Are people using search? | Trends → unique users | `closet_search_submitted` | `user_id` | Cohort = Beta testers | — | 7d | KPI + line | <40% of activated | Promote search in UI |
| 2 | Search → result → open | Does search work? | Funnel | `closet_search_submitted` → `closet_search_results_viewed` → `search_result_opened` | `query_length`, `result_count` | Cohort = Beta testers | — | 14d | Funnel | Open step <30% | Rank/relevance review |
| 3 | Zero-result rate | How often search fails | Formula A/B | A = `closet_search_zero_results`, B = `closet_search_submitted` | `query_text_hash`, `result_count` | Cohort = Beta testers | — | 14d | KPI % + line | >20% | Look at widget 4 |
| 4 | Top zero-result queries | What are they missing? | Trends → total count | `closet_search_zero_results` | `query_text_hash`, `query_length` | Cohort = Beta testers | `query_text_hash` (top 20) | 14d | Ranked bar | Any hash >5 hits/wk | Add synonyms / better tags |
| 5 | Most-used filters | Which filters matter? | Trends → total count | `filter_applied` | `filter_name`, `filter_value` | Cohort = Beta testers | `filter_name` | 14d | Bar | Any filter <2% of usage | Consider hiding in UI |
| 6 | Filter combos w/ zero results | Which combos are too tight? | Trends → total count | `filter_zero_results` | `filter_names` (sorted array), `filter_count` | Cohort = Beta testers | `filter_names` | 14d | Table / heatmap | Any combo >10 hits | Ease default matching |
| 7 | Care-guide views | Is care info valuable? | Trends → unique users | `care_guide_viewed` | `garment_type`, `care_symbols_shown` | Cohort = Beta testers | `garment_type` | 14d | Line | Falling wk/wk | Product review |
| 8 | Closet maintenance | Are they using the closet? | Trends → total count | `item_created`, `item_edited`, `item_deleted` | `user_id`, `source` (manual/import) | Cohort = Beta testers | Event | 14d | Line | Zero for activated user, 7d | Personal outreach |
| 9 | Time-to-first-search | How fast do they get value? | Trends → median time between events | `account_created` → `closet_search_submitted` | timestamps | Cohort = Beta testers | — | 30d | Line | Median >24h | Onboarding tweak |
| 10 | Search-frustration replays | Where are people stuck? | Session-replay playlist | Playlist: Zero-result searches + Rage clicks (merged) | `$session_id` | Cohort = Beta testers | — | 7d | Replay list | Any new frustration session | Watch, file design ticket |

---

# Sentry

## Required event context (send on every Sentry event)

| Field | Source | Example |
|---|---|---|
| `environment` | build | `production`, `staging` |
| `release` | build | `closet-inventory@1.4.0+g2a1c` (Sentry `release` format) |
| `dist` | build | build hash |
| Tag `app_version` | build | `1.4.0` |
| Tag `route` | React Router | `/closet`, `/import/gmail` |
| Tag `feature` | code path | `import`, `search`, `care`, `auth`, `closet` |
| Tag `workflow` | code path | `gmail.import`, `closet.search` |
| Tag `browser` | UA | `safari`, `chrome`, `firefox` |
| Tag `device_type` | UA | `mobile`, `desktop`, `tablet` |
| Tag `pwa_mode` | display-mode media query | `standalone`, `browser` |
| Tag `import_id` | when in import path | UUID |
| User context | anonymous id | `{ id: user_id, username: <anon-handle> }` — no email, no PII |
| Breadcrumbs | supabase, fetch, ui.click, navigation | default enabled |

## Transactions to instrument

`auth.signup`, `auth.login`, `gmail.oauth`, `gmail.import`, `gmail.import.parse`, `gmail.import.persist`, `closet.search`, `closet.filter`, `item.create`, `item.update`, `care_guide.load`.

Set `op` correctly (`http.client`, `db`, `ui.render`) so Performance widgets group cleanly.

## Release process for Sentry

1. `sentry-cli releases new $RELEASE`
2. Upload source maps
3. `sentry-cli releases finalize $RELEASE`
4. `sentry-cli releases deploys new -e production $RELEASE`

Every deploy = a distinct release; without this, Widgets 4/5/6 on Dashboard 5 don't work.

---

## Dashboard 4 — Production Reliability (Sentry)

Purpose: what broke, how bad, and who is affected.

| # | Widget | Dataset / source | Metric | Filters | Grouping | Viz | Warning | Critical | Action |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Total errors (24h) | Errors | `count(event.id)` | `environment:production` | — | KPI vs 24h prior | +50% vs 7d avg | +200% | Alert channel, open widget 5 |
| 2 | Affected users (24h) | Errors | `count_unique(user.id)` | `environment:production` | — | KPI | ≥3 of 30 | ≥10 of 30 | Page owner; open widget 5 |
| 3 | Error events over time | Errors | `count()` | `environment:production` | — | Line, 14d, 1h bins | Sustained upward slope | Any spike >5x baseline | Correlate with deploys (D5 widget 1) |
| 4 | New issues | Issues | `count()` where `firstSeen: -24h` | `environment:production` | Issue | Table (top 10) | ≥1 new/day | ≥3 new/day | Triage each; assign owner |
| 5 | Top issues by affected users | Issues | `count_unique(user.id)` | `environment:production`, `is:unresolved` | Issue title | Ranked table (top 10) | Any issue ≥3 users | Any issue ≥10 users | Fix / patch / rollback |
| 6 | Regressed issues | Issues | `count()` where `is:regressed` | `environment:production` | Issue | Table | ≥1 | ≥2 | Own; investigate the release that broke the fix |
| 7 | Errors by route | Errors | `count()` | `environment:production` | Tag `route` | Bar | Any route >20% of errors | Any route >40% | Route-specific triage |
| 8 | Errors by browser | Errors | `count()` | `environment:production` | Tag `browser` | Bar | Any browser >30% of errors when <20% of DAU | Any browser >50% | Browser-specific reproduction |
| 9 | Errors by feature | Errors | `count()` | `environment:production` | Tag `feature` | Bar | `import` >30% | `import` >50% | Cross-check PostHog D2 |
| 10 | Unhandled vs handled | Errors | `count()` | `environment:production` | `error.handled` | Stacked bar (daily, 14d) | Unhandled share >30% | Unhandled share >50% | Add try/catch or fix root cause |

Alert rules to attach:

- Any new issue affecting ≥3 users in 1h → Slack `#beta-alerts`
- Regression of a resolved issue → Slack `#beta-alerts`
- Error rate spike >5× 7d baseline (10-min window) → Slack `#beta-alerts` + email owner

---

## Dashboard 5 — Release & Performance Health (Sentry)

Purpose: is the latest deploy safe, and are the critical workflows fast enough?

| # | Widget | Dataset / source | Metric | Filters | Grouping | Viz | Warning | Critical | Action |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Crash-free sessions | Release Health | `crash_free_sessions` | `environment:production`, latest release | — | KPI | <99.5% | <99% | Rollback candidate |
| 2 | Crash-free users | Release Health | `crash_free_users` | `environment:production`, latest release | — | KPI | <95% | <90% | Rollback |
| 3 | New errors by release | Errors | `count()` where `firstSeen` in release window | `environment:production` | Tag `release` | Bar | Newest release ≥1 new issue | Newest ≥5 new issues | Own regressions in this release |
| 4 | Error rate by release | Errors | `count()/session_count` | `environment:production`, last 5 releases | Tag `release` | Bar | Newest >2× 5-release median | Newest >5× | Rollback / hotfix |
| 5 | Slowest routes (p75) | Performance / transactions | `p75(transaction.duration)` | `environment:production`, `op:navigation`, `transaction.status:ok` | Tag `route` | Table | Any route p75 >2s | Any route p75 >5s | Perf profile + fix |
| 6 | P75 transaction duration | Performance | `p75(transaction.duration)` | `environment:production`, `transaction: closet.*` | Transaction name | Line, 14d | +30% wk/wk | +100% wk/wk | Investigate top regressor |
| 7 | Failed API requests | Performance | `count()` where `http.status_code:>=500` | `environment:production` | `http.url` (grouped) | Line + top table | >1% of requests | >5% | Check Supabase status; escalate |
| 8 | Gmail import duration | Performance | `p50` + `p95` of `gmail.import` | `environment:production`, `transaction:gmail.import` | — | Line | p95 >45s | p95 >90s or +50% wk/wk | Parse-vs-persist split; check PostHog D2 W4 |
| 9 | Closet search duration | Performance | `p95(transaction.duration)` | `environment:production`, `transaction:closet.search` | — | Line | p95 >800ms | p95 >2s | Query plan review |
| 10 | Browser perf split | Performance | `p75(transaction.duration)` | `environment:production` | Tag `browser` + `device_type` | Bar | Safari mobile p75 >2× desktop chrome | Safari mobile p75 >5× | Mobile-Safari perf ticket |

Alert rules to attach:

- Crash-free users drops below 95% on latest release → page owner
- Any new-in-release issue affecting ≥3 users → Slack `#beta-alerts`
- p95 of `gmail.import` >90s over 15-min window → Slack `#beta-alerts`

---

## Smallest version to ship before beta

If time is tight, ship these first — the rest can wait one iteration:

**PostHog** — must have:
- Events: `account_created`, `gmail_oauth_started`, `gmail_oauth_completed`, `import_started`, `import_completed` (w/ `result`, `items_detected`, `duration_ms`, `failure_stage`), `item_confirmed`, `closet_search_submitted`, `closet_search_zero_results`, `activation_reached`
- Cohort: Beta testers
- Dashboard 1 widgets 1–4, 6, 10 (Overview essentials)
- Dashboard 2 widgets 1–4, 6, 8, 10 (Import health essentials)
- Session replay playlists: Failed imports, Zero-result searches

**Sentry** — must have:
- Release tagging + source maps uploaded on every deploy
- Tags: `environment`, `release`, `route`, `feature`, `browser`, `device_type`, `import_id`
- Transactions: `gmail.import`, `closet.search`
- Dashboard 4 widgets 1, 2, 4, 5, 7, 8 (reliability essentials)
- Dashboard 5 widgets 1, 2, 3, 8 (release health + import perf)
- Alerts: crash-free-users <95%, new issue ≥3 users, `gmail.import` p95 >90s

**Can wait** — post-beta widgets: search-frustration replays merge (D3 W10), duplicate rate (D2 W7), care-guide views (D3 W7), device-tier browser perf (D5 W10), regressed issues (D4 W6), sessions-per-user (D1 W9).
