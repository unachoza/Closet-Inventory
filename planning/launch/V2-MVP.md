# Nothing To Wear — Unified Launch Readiness Report

**Date:** 2026-07-16 · **Target launch:** Sun 2026-07-19, 16:00 · **Audience:** 30 Founding Members
**Author role:** CTO / PM / Staff Eng / UX / Growth / QA (composite)
**Supersedes for launch purposes:** MVP_LAUNCH_ACTION_LIST-JULY-11-2026, LAUNCH_ROADMAP_July_update

---

## 1. Executive Summary (247 words)

You are 3 days from a beta launch to 30 people. The product is closer to ready than the July 11 action list implies. Block 0 / A / C are done. Block B has core status + location shipped. The four MVP surfaces — **Inventory, Search, Care, Gmail Import** — are functionally live; polish, not architecture, is the remaining work.

**The pivot is correct.** Cutting lending, borrowing, custom locations, status v2, packing, analytics, and share-links from launch scope removes ~3 weeks of work you do not need to validate the wedge. What you actually need to learn from 30 people is: _does Gmail Import feel magical enough to be the reason they stay, and does the closet feel useful enough after week 1?_

**Biggest accomplishment:** Gmail auto-import + parser working end-to-end against real accounts (G0.1), 1303 tests green, PWA shipped with Lighthouse 96 a11y, RLS verified. This is not a prototype.

**Biggest risks (ranked):**

1. **Privacy policy not published** — blocks Google OAuth consent screen and TestFlight review. This is Sunday's single hardest gate.
2. **Gmail import UX is not "magical" yet** — parsing works, but onboarding/progress/confidence indicators are thin.
3. **TestFlight for a PWA is a category error** — you cannot ship a React/PWA through TestFlight without a native wrapper (Capacitor). See §8.
4. **Onboarding still too long / too technical** for a Sunday audience of non-technical founding members.

**Recommended focus (Thu–Sun):** privacy policy live → Gmail Import polish → onboarding cut → PWA install flow (not TestFlight) → PostHog + Sentry sanity check. Everything else on the July 11 list is post-beta.

---

## 2. Executive Dashboard

| Metric               | Score           | Notes                                                                           |
| -------------------- | --------------- | ------------------------------------------------------------------------------- |
| **Launch Readiness** | **78%**         | Blockers are external (privacy policy URL, OAuth test users) + polish, not code |
| Engineering          | 88%             | 1303 tests, PWA shipped, RLS verified, dev/prod split done                      |
| UX                   | 70%             | Onboarding + Gmail Import polish are the gap                                    |
| Product              | 82%             | MVP scope is coherent and defensible                                            |
| Reliability          | 75%             | Sentry live; backups/PITR not yet enabled; no restore test                      |
| **Confidence Level** | **Medium-High** | Contingent on privacy policy landing by Fri EOD                                 |
| **Beta Risk Level**  | **Low-Medium**  | 30 people, PWA install, no payments, no PII beyond email metadata               |

---

## 3. Tight MVP Checklist

### Must Finish (before Sun 16:00)

| #   | Item                                                                   | Priority | Effort | Launch Impact                       |
| --- | ---------------------------------------------------------------------- | -------- | ------ | ----------------------------------- |
| M1  | Publish privacy policy at public URL                                   | P0       | 2h     | Unblocks OAuth + TestFlight         |
| M2  | Add 30 waitlisters as Google OAuth test users                          | P0       | 30m    | Without this, import fails silently |
| M3  | Onboarding cut: 9 screens → 4 max, remove technical language           | P0       | 4h     | Kills abandonment                   |
| M4  | Gmail Import: progress bar + confidence badges + graceful failure copy | P0       | 6h     | The "magical" moment                |
| M5  | Onboarding copy explaining "unverified app" warning                    | P0       | 1h     | Kills fear-of-scam abandonment      |
| M6  | PostHog events on 8 core funnel steps (§9)                             | P0       | 3h     | Without this you learn nothing      |
| M7  | Sentry alert to phone/email on error rate spike                        | P0       | 1h     | You are one person; you cannot poll |
| M8  | In-app "Send Feedback" widget → email/Notion                           | P0       | 2h     | The primary beta artifact           |
| M9  | Enable Supabase daily backups + one restore drill                      | P1       | 2h     | Non-negotiable pre-real-users       |
| M10 | Test Gmail Import fresh on 3 real accounts end-to-end                  | P0       | 2h     | Golden path smoke                   |
| M11 | PWA install flow: iOS "Add to Home Screen" walkthrough card            | P0       | 2h     | Replaces TestFlight (see §8)        |

### Nice to Have (Thu–Sat, drop if slipping)

| #   | Item                                                          | Priority | Effort |
| --- | ------------------------------------------------------------- | -------- | ------ |
| N1  | Search filter panel polish (chips, clear-all)                 | P2       | 3h     |
| N2  | Stain guide: nail polish, turmeric, red wine, oil (4 entries) | P2       | 2h     |
| N3  | Fix color-contrast on onboarding overlay (a11y 96→100)        | P2       | 1h     |
| N4  | Code-split main JS bundle (Lighthouse Perf 55→75)             | P2       | 3h     |
| N5  | Empty-state illustrations for closet / search                 | P3       | 2h     |

### Post-Beta (do not touch)

Simple lend modal · Lent-out view + isAvailable · Status/location filter dimensions · Custom multi-home locations · Status model v2 (airing/stored) · Fit + measurements · Taxonomy tags · Outlook import · Yahoo import · Share-link MVP · Borrow requests + Activity · Profile hub · Server-side Gmail token storage · Retry/outbox queue · Full Gmail Verification Gate 1 submission

---

## 4. Kill List — Features We Will NOT Build Before Launch

| Feature                                          | Why it's tempting                                    | Why it should wait                                             | User signal to justify later                                       |
| ------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Lend modal + lent-out view**                   | The name "Nothing To Wear" implies it; feels obvious | 30 people will not lend enough in week 1 to validate the model | ≥3 founding members ask "can I mark something as lent?" unprompted |
| **Custom / multi-home locations**                | Real user pain (summer house, storage)               | 4 starter kinds cover 90% of week-1 use                        | 3+ users add fake items to work around missing labels              |
| **Status v2 (airing/stored + reasons)**          | Feels incomplete                                     | Zero users have hit the ceiling of v1                          | Users add notes explaining WHY something is dirty/repair           |
| **Status + location filter dimensions**          | Users will want them                                 | Only after they have >30 items and status is populated         | Search analytics show >5 filter clears without result              |
| **Share-link / view-a-friend's-closet**          | Viral loop, "cool factor"                            | Legal + RLS + invite flow is 2 weeks of work                   | Any user asks to show closet to specific named person 2x           |
| **Outlook / Yahoo import**                       | Feature parity                                       | Each is a separate OAuth verification queue                    | 20% of signups have non-Gmail primary                              |
| **Advanced analytics (cost-per-wear, insights)** | Retention hook                                       | Requires ≥30 items + wear tracking, which nobody has yet       | Users voluntarily open the app to check something specific         |
| **Packing / travel mode**                        | Delightful feature                                   | Solves a problem 2 users/month have                            | Direct request from 3+ users                                       |
| **Profile hub**                                  | Feels incomplete without it                          | Settings menu is enough for 30 people                          | Users can't find a setting or share preference twice               |
| **Gmail Verification Gate 1 (full CASA)**        | Removes "unverified app" warning                     | Weeks-to-months external queue; test-mode covers 30 users      | Waitlist crosses 100 people                                        |

**Protect me from:** rewriting the onboarding illustration, adding a splash screen, refactoring the sync layer, "just one more" fabric care entry, adding a dark-mode toggle that isn't already 90% done.

---

## 5. Beta Readiness Review

| Dimension   | Score  | Verdict                              | Gap                       |
| ----------- | ------ | ------------------------------------ | ------------------------- |
| Product     | 8/10   | Scope is right, wedge is defensible  | Gmail Import magic moment |
| UX          | 6.5/10 | Functional; onboarding too heavy     | Cut, don't polish         |
| Reliability | 7/10   | Sentry + tests; no backup drill      | 2h of drill work          |
| Engineering | 8.5/10 | Type system + RLS + PWA solid        | None blocking launch      |
| Polish      | 6/10   | Rough edges in import + empty states | Focus on import only      |
| Confidence  | 7.5/10 | High for 30 people; not for public   | Correct posture           |

---

## 6. TestFlight Guide (Read This — You Cannot Use TestFlight)

**Blunt truth:** TestFlight is Apple's beta distribution channel for **native iOS apps built with Xcode**. You have a React/TypeScript/Supabase **PWA**. There is no `.ipa` file to upload. TestFlight rejects web wrappers unless they are packaged as a real iOS binary.

**Your three real options for Sunday, ranked:**

### Option A (RECOMMENDED for launch): Ship as a PWA — no TestFlight

- Send founding members a **direct URL** (nothingtowear.app or your Vercel domain).
- Provide a **1-screen "Add to Home Screen" guide** — one screenshot for iOS Safari (Share → Add to Home Screen), one for Android Chrome (menu → Install app).
- After install, the PWA behaves like a native app: full-screen, offline shell, home-screen icon.
- **Effort: 2h.** No Apple Developer account, no review queue, no App Store fees, instant updates on every deploy.
- **This is what you should do Sunday.**

### Option B (Post-beta, if you want App Store): Wrap in Capacitor, then TestFlight

- Wrap the PWA using **Capacitor** (Ionic's native wrapper — treats your existing React app as a webview inside a native shell).
- Steps: `npm i @capacitor/core @capacitor/ios`, `npx cap init`, `npx cap add ios`, `npx cap sync`, open Xcode, build archive, upload to App Store Connect, distribute via TestFlight.
- Requires: **Apple Developer account ($99/yr)**, a Mac with Xcode, ~1–2 weeks first time (provisioning, entitlements, icon sets, screenshots).
- TestFlight caps: **100 internal testers** (immediate, no review), **10,000 external testers** (requires Apple beta review, 24–48h).
- **Do this in August, not this week.**

### Option C: Native rebuild — do not consider

Do not.

### PWA Launch Setup for Sunday (Option A concrete steps)

1. Confirm manifest + icons + service worker are live on your production domain (they are — PR #132/#134).
2. Test "Add to Home Screen" on your own iPhone Safari and one Android device end-to-end.
3. Write the install card: 2 screenshots + 3 lines of copy. Show it on first visit if `!window.matchMedia('(display-mode: standalone)').matches`.
4. In the launch email, lead with the install instruction, not "click here to sign up."
5. Feedback: in-app widget + a plain email address (feedback@nothingtowear.app or a Notion form).

---

## 7. Analytics & Observability

**Stack (recommended, cheap, solo-founder-appropriate):**

| Layer             | Tool                                         | Why                                                         |
| ----------------- | -------------------------------------------- | ----------------------------------------------------------- |
| Product analytics | **PostHog** (already installed per PR #128)  | Free tier fine at 30 users; funnels + session replay in one |
| Errors            | **Sentry** (already live per PR #128/#129)   | Add mobile source maps + alert on rate spike                |
| Backend logs      | Supabase logs + `get_logs` MCP               | Zero cost, sufficient at this scale                         |
| Uptime            | **BetterStack** or **UptimeRobot** free tier | 1 endpoint check every 3min → phone push                    |
| Perf              | Vercel Analytics (already available)         | Core Web Vitals dashboard, free                             |

**Minimum event set to instrument by Sunday:**

| #   | Event                                              | Where                  | Why it matters            |
| --- | -------------------------------------------------- | ---------------------- | ------------------------- |
| 1   | `auth_signup_started` / `auth_signup_completed`    | Auth flow              | Signup conversion         |
| 2   | `onboarding_step_viewed {step_n}`                  | Each onboarding screen | Where do people drop off? |
| 3   | `onboarding_completed`                             | End of flow            | Activation baseline       |
| 4   | `gmail_import_started`                             | OAuth click            | Import funnel top         |
| 5   | `gmail_import_completed {item_count, duration_ms}` | Callback               | Import success + volume   |
| 6   | `gmail_import_failed {reason}`                     | Error path             | The critical failure mode |
| 7   | `item_added_manual`                                | Add form submit        | Fallback path             |
| 8   | `item_edited`                                      | Edit save              | Engagement signal         |
| 9   | `search_performed {query_len, result_count}`       | Search submit          | Search value              |
| 10  | `care_viewed {garment_type}`                       | Care page open         | Care engagement           |
| 11  | `session_started` / `session_ended`                | App open/close         | Retention                 |
| 12  | `feedback_submitted`                               | Widget submit          | Voice-of-user pipeline    |

**First 3 dashboards to build:**

1. **Activation Funnel:** signup → onboarding_completed → first_item_added → D1 return
2. **Gmail Import Health:** started → completed rate; median items imported; failure reasons breakdown
3. **Retention:** D1, D3, D7 return by cohort (weekly)

---

## 8. Beta Feedback System

**Design principle:** one primary channel, two fallback channels. Do not fragment.

| Channel                    | Tool                                                                                           | When                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Primary: In-app widget** | Fixed bottom-right "Feedback" button → modal → posts to Notion database (via webhook) or email | Every session                         |
| Fallback: Email            | `feedback@nothingtowear.app` in onboarding + settings                                          | For screenshots, longer thoughts      |
| Structured: Weekly survey  | Typeform or Google Form, 5 questions, sent Sunday nights                                       | End of each beta week                 |
| Deep: User interview       | 6 x 20min calls in week 2, calendly link                                                       | Only after 1 week of usage data       |
| Bug reports                | GitHub Issues (public) or Notion (private)                                                     | Auto-linked from Sentry error → issue |

**Triage workflow (30 min/day, morning ritual):**

1. Read overnight feedback + Sentry alerts.
2. Tag: `bug` / `ux-friction` / `feature-request` / `praise`.
3. Reply within 24h to every submitter with a name.
4. Weekly: cluster feature requests, count votes, decide 1–2 to build.

---

## 9. Growth (solo-founder-realistic)

| Channel                                        | Impact                 | Effort                   | Priority | Next Action                                                 |
| ---------------------------------------------- | ---------------------- | ------------------------ | -------- | ----------------------------------------------------------- |
| Waitlist site SEO (nothingtowear-waitlist.app) | Medium                 | Low                      | P1       | Add meta tags + OG image + 1 blog post ("Why I built this") |
| Instagram (founder POV)                        | High for this audience | Medium                   | P1       | 3 posts/wk: closet stories, before/after, import demo GIF   |
| Founder updates (email to waitlist)            | High                   | Low                      | P0       | Send Sunday launch email; then weekly Sunday updates        |
| Product Hunt                                   | Low pre-beta           | Skip until public launch |
| Engineering blog                               | Low near-term          | Skip                     |
| TikTok                                         | High potential         | High effort              | P3       | Only if instagram traction validates                        |
| Content calendar                               | Structural             | Low                      | P2       | 1 IG post/week + 1 email/week, batched Sunday               |

**Do not do this week:** paid ads, SEO backlinks, cold DMs, influencer outreach, podcast tour.

---

## 10. Launch Day Schedule — Sunday 2026-07-19

| Time            | Action                                                                                                 | Owner |
| --------------- | ------------------------------------------------------------------------------------------------------ | ----- |
| Sat 20:00       | Final privacy policy check, deploy freeze after this                                                   | You   |
| Sun 08:00       | Coffee. Read Sentry overnight. Check Vercel deployment green.                                          | You   |
| Sun 09:00       | Smoke test: signup → Gmail import → add manual item → search → care view. Fresh browser, real account. | You   |
| Sun 10:00       | Run through onboarding on iPhone (real device, PWA install)                                            | You   |
| Sun 11:00       | Verify PostHog events firing; verify Sentry not silent                                                 | You   |
| Sun 12:00       | Buffer / eat / walk                                                                                    |       |
| Sun 13:00       | Draft the launch email in Gmail; do NOT send yet                                                       | You   |
| Sun 14:00       | Add 30 waitlisters as OAuth test users (final list)                                                    | You   |
| Sun 15:00       | Final go/no-go: privacy policy live? OAuth working? Sentry clean? Analytics firing?                    | You   |
| **Sun 16:00**   | **Send launch email → waitlist (30 people)**                                                           | You   |
| Sun 16:15       | Post to Instagram: "It's live."                                                                        | You   |
| Sun 16:30–20:00 | Watch Sentry, PostHog live funnel, respond to any DMs/emails within 15 min                             | You   |
| Sun 20:00       | End-of-day check: signup count, import success rate, error count. Note top 3 friction points.          | You   |
| Sun 21:00       | Stop. Do not fix things live. Write a Monday-morning list.                                             | You   |

---

## 11. Beta Success Metrics (Week 1 targets, 30 users)

| Metric                                             | Target                | Yellow | Red  |
| -------------------------------------------------- | --------------------- | ------ | ---- |
| Signup activation (email → account created)        | 80% (24/30)           | 60–79% | <60% |
| Onboarding completion                              | 70% (17/24)           | 50–69% | <50% |
| Gmail Import attempted                             | 60% of activated (14) | 40–59% | <40% |
| Gmail Import completed successfully                | 80% of attempts (11)  | 60–79% | <60% |
| Items in closet (median) after D1                  | ≥15                   | 5–14   | <5   |
| Search performed at least once                     | 50% of D1 returners   | 30–49% | <30% |
| D1 retention                                       | 60%                   | 40–59% | <40% |
| D7 retention                                       | 40%                   | 25–39% | <25% |
| Bug reports / crashes                              | <5 P1s week 1         | 5–10   | >10  |
| Qualitative NPS-ish (would recommend to a friend?) | 40%+ yes              | 25–39% | <25% |

---

## 12. Biggest Risks

| #   | Risk                                                                | Likelihood | Impact       | Mitigation                                                                  | Owner |
| --- | ------------------------------------------------------------------- | ---------- | ------------ | --------------------------------------------------------------------------- | ----- |
| R1  | Privacy policy not published by Fri EOD → OAuth broken Sun          | Med        | Critical     | Draft today (Thu), publish Fri AM, verify OAuth consent screen Fri PM       | You   |
| R2  | Gmail parser fails on unusual retailer email → looks broken to user | Med        | High         | Add graceful failure UI + "manually add" fallback + confidence badges       | You   |
| R3  | PWA install confusion → users bounce before adding closet           | High       | Med          | 1-screen install card + 15-sec Loom in launch email                         | You   |
| R4  | "Unverified app" warning scares users at OAuth                      | High       | Med          | Onboarding copy explaining "This is safe because…" + your face + first name | You   |
| R5  | Supabase project down / no backup restore drill                     | Low        | Critical     | Enable daily backups + 30-min restore drill Fri                             | You   |
| R6  | Sentry noise floods your inbox → real signal missed                 | Med        | Med          | Alert threshold: >5 errors in 5min, not per-error                           | You   |
| R7  | You burn out on Monday responding to 30 people                      | High       | Med          | Set expectation in launch email: "I read everything, reply within 48h"      | You   |
| R8  | User asks for feature X (borrow, packing) and feels ignored         | Med        | Low          | Public "Roadmap & Kill List" Notion page linked in launch email             | You   |
| R9  | RLS regression exposes another user's closet                        | Low        | Catastrophic | Re-run G0.2 (11-check RLS test) Sat AM before freeze                        | You   |
| R10 | You keep coding Sunday morning and break prod                       | Med        | Critical     | Deploy freeze Sat 20:00. No exceptions.                                     | You   |

---

## 13. Blind Spots (things a co-founder would catch)

- **Terms of Service** — you need one, even a 1-page one. Same URL structure as privacy policy. Free templates fine.
- **Data Processing / Limited Use disclosure for Gmail scopes** — Google requires specific language about how you use Gmail data. Copy verbatim from Google's Limited Use policy page.
- **Account deletion is live but is it tested end-to-end?** Run it against a real account this week.
- **Data export format** — you built it; is the export machine-readable AND human-readable? Beta users will ask.
- **Accessibility past Lighthouse** — screen reader pass on the closet grid + Gmail Import flow. VoiceOver, 15 min.
- **Email deliverability** — launch email from what domain? SPF/DKIM/DMARC set? Test to Gmail/Outlook/iCloud first.
- **Cookie / analytics consent banner** — PostHog + Sentry technically require one in EU. Add a minimal one or geo-restrict.
- **Rate limiting on OAuth callback / signup** — protect against a bored beta user hammering endpoints.
- **Session timeout / refresh token expiry** — the 7-day test-mode refresh caveat needs onboarding copy or users will silently disconnect Gmail.
- **Backup + restore for Supabase Storage (images)**, not just Postgres. Confirm bucket versioning.
- **Customer support inbox** — one dedicated email you actually watch. Not your personal inbox.
- **"Delete my account" is discoverable** — in Settings, not buried. Trust signal.
- **iOS PWA quirks** — no push notifications on iOS PWA until iOS 16.4+ and with limitations. Manage expectations.
- **What if Gmail import returns zero items?** Empty state that isn't "you failed."
- **What if Vercel or Supabase has an outage Sunday?** Status page (single line "we're checking") on a static host.
- **Legal name / entity behind the app** — required in privacy policy. Sole prop or LLC name.
- **You are the single point of failure for 30 people this week.** Block your calendar. Tell family.

---

## 14. Executive Dashboard (One-Page Final)

### Overall Launch Readiness: **78% · GO (conditional on privacy policy)**

### Top 5 Priorities (Thu–Sun, in order)

1. **Publish privacy policy at a public URL** (2h, blocks everything else)
2. **Cut onboarding to 4 screens, non-technical copy** (4h)
3. **Polish Gmail Import: progress + confidence badges + graceful failures** (6h)
4. **Ship PWA install card + drop TestFlight** (2h)
5. **PostHog funnel + Sentry alert + backup drill** (5h)

### Top 5 Risks

1. Privacy policy slipping → OAuth broken Sunday
2. Gmail Import feels rough → wedge doesn't land
3. PWA install confusion → early abandonment
4. Unverified-app OAuth warning → fear-driven abandonment
5. You burn out responding to 30 people in week 1

### Kill List Summary

Lending · lent-out view · custom locations · status v2 · advanced filters · share-links · borrow requests · Outlook/Yahoo · profile hub · packing · analytics dashboards · Gmail full verification · outbox queue. **~3 weeks of work removed from launch scope.**

### Sunday Blockers (must be true at 15:00 go/no-go)

- [ ] Privacy policy URL returns 200 on public internet
- [ ] Google OAuth consent screen shows correct app name + privacy URL
- [ ] 30 waitlisters added as OAuth test users
- [ ] Gmail Import completes on 3 fresh accounts
- [ ] PostHog events fire (verify in Live view)
- [ ] Sentry receives + alerts on a test error
- [ ] Supabase backup ran overnight + one test restore succeeded
- [ ] iPhone Safari "Add to Home Screen" works and opens standalone
- [ ] RLS test G0.2 re-run: 11/11 pass
- [ ] Launch email drafted, tested to your own inbox

### Beta Confidence: **7.5 / 10**

High enough to ship to 30 friends. Not high enough for public launch. Correct posture.

### Immediate Next Steps (next 24 hours)

1. Write privacy policy (use Termly or Iubenda template — 90 min).
2. Deploy privacy policy to `nothingtowear.app/privacy`.
3. Update Google Cloud OAuth consent screen with URL.
4. Rip 5 screens out of onboarding.
5. Add PostHog events (list in §7).

---

_End of report. Report generated 2026-07-16. Next review: post-launch retro Mon 2026-07-20 09:00._
