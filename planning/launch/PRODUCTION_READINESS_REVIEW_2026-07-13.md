# Production Readiness & Operational Risk Review — 2026-07-13

**Scope:** Private beta launch (30–100 users) readiness. Reviewed as Staff Backend Engineer / DevOps / Security Engineer / Startup CTO.
**Verdict up front: do not launch tomorrow. Launch in ~3–5 working days after the P0 list below.** The gap is not polish — it's three authorization bugs, a missing beta gate, and zero disaster-recovery story.

---

## 1. Verdict & minimum bar to launch

**Would I launch this beta tomorrow? No.**

The app is genuinely close (~55–60% production-ready, consistent with your own "~80% feature-ready" estimate — features and production readiness are different axes). But three findings are exploitable *by your own beta users* on day one, and one incident class (data loss) currently has no recovery path.

### P0 — must fix before any invite goes out (est. 2–4 days total)

1. **Fix `closet_members` RLS policies** (`supabase/migrations/20260626000002_rls.sql:65-68`).
   - `closet_members_insert`: `with check (user_id = auth.uid() OR is_closet_member(closet_id))` lets **any member add any user to a closet**, and lets any user **insert themselves into any closet whose UUID they learn**. This is the load-bearing authorization boundary and it is broken.
   - `closet_members_delete`: any member — including `role='viewer'` — can **delete the owner's membership row** and lock them out.
   - `closets_update_member` / `closets_delete_member`: a viewer can update or **delete the closet itself**. Roles exist in the check constraint but no policy enforces them.
   - Fix: gate membership INSERT/DELETE and closet UPDATE/DELETE on `role = 'owner'` (or owner/editor as appropriate). ~half a day including tests.

2. **Add a beta gate.** `handle_new_user()` (`20260626000001_v1_spine.sql:144`) auto-provisions a profile + closet for *any* Google account that signs in. Nothing makes this beta "private." Add an `beta_allowlist` table checked inside the trigger (raise on miss), or use Supabase Auth restrictions. ~2 hours.

3. **Harden the CSP** (`vercel.json:8`). Current policy sets only `script-src`, `object-src`, `base-uri`. Missing `default-src`, `connect-src`, `img-src`, `frame-ancestors`, `form-action` — so the app can be iframed anywhere (clickjacking) and a successful XSS can exfiltrate to any host. Since Supabase tokens live in `localStorage` (default `createClient`, `src/lib/supabaseClient.ts:16`), CSP is your blast-radius control. ~2 hours + prod verification (already on your launch list as item 7).

4. **Backups you can actually restore.** Upgrade to Supabase Pro if not already (daily backups; ideally PITR). **Supabase database backups do NOT cover Storage buckets** — add a nightly `item-photos` sync to a second bucket/S3 (a 20-line script + cron). Do one restore drill into a scratch project. ~half a day. Today, a bad migration or fat-fingered delete = permanent photo loss for every beta user.

5. **Sentry release + source maps** (`@sentry/vite-plugin` + release step in `ci.yml`). Without it every production error is minified gibberish and your beta feedback loop is "users DM me screenshots." ~2 hours.

6. **Run the RLS isolation test in CI.** `scripts/test-rls-isolation.mjs` exists and is never invoked by any workflow. Wire it in (against a dev project) so P0-1 stays fixed. ~2 hours.

### P1 — first two weeks of beta (safe to launch without, not safe to ignore)

- Fix account-deletion storage cleanup: `delete-user-account/index.ts:62` and `accountDataService.ts:71` list only the first 100 storage objects — a 200-photo user (your own target persona!) leaves orphans, breaking your delete-my-data promise. Paginate the listing.
- Delete Storage objects when items are deleted (currently orphaned — cost bleed + GDPR gap).
- Restrict Edge Function CORS from `*` to the app origin; add a confirmation nonce to account deletion.
- Per-user quotas / rate limiting (item count cap, upload count cap). Nothing today stops one user from inserting unbounded rows or uploading 10MB × N.
- Change `ALTER DEFAULT PRIVILEGES ... TO anon` (`20260629000002:28,41`) to `authenticated` only — one future migration that forgets `ENABLE ROW LEVEL SECURITY` exposes a whole table to the public anon key.
- Basic uptime monitoring (even UptimeRobot on the Vercel URL + Supabase health endpoint).

---

## 2. Scalability

| Users | Verdict | What holds / what breaks |
|---|---|---|
| **30** | ✅ Works | Everything holds. Supabase free/Pro tier is idle at this load. |
| **100** | ✅ Works, with papercuts | Full-closet `getAll()` fetches + client merge on every app open are fine; image egress starts to matter (no thumbnails). |
| **1,000** | ⚠️ Degrades | No pagination anywhere (`supabaseClosetRepository.ts:217-221`); `select('*', materials)` pulls every jsonb column on list views; per-row `EXISTS` RLS subqueries on item_photos/tags/wear_events; fuse.js index rebuilt per keystroke over the whole array (`useFuzzySearch.ts:52,63`); 5-min signed URLs mean zero CDN caching of images. First real architectural work required here. |
| **10,000** | ❌ Requires changes | Needs: keyset pagination + slim list selects, Postgres FTS (tsvector + GIN) replacing client fuse.js, image transform/thumbnail pipeline + long-lived cacheable URLs, `(select auth.uid())` initplan fix + denormalized owner column on hot tables, incremental wear-rollup trigger (current one recomputes COUNT/MAX per mutation), connection-pool awareness on bulk import (import fires 2 concurrent statements per item). |

**First major architectural change lands around 1,000–2,000 users** (or earlier, at ~2–3k items in a single power-user closet): pagination + server-side search + image thumbnails. Nothing requires replatforming — Supabase/Postgres carries this to 10k+ users if the query layer grows up.

**Bottleneck order (first → later):** image egress & signed-URL churn → unpaginated `getAll()` sync merges → client-side search → RLS per-row subqueries → wear-rollup trigger → DB compute tier.

## 3. Storage

**Current design:** private `item-photos` bucket, client-direct upload of client-compressed images (1200px, JPEG q0.8 — `src/utils/compressImage.ts`), path `<userId>/<uuid>.<ext>`, owner-prefix storage RLS (correct pattern), 10MB server-side cap + mime allowlist, served via **300-second signed URLs** with no CDN caching and **no thumbnails**.

**The good:** compression before upload is the single best decision here (~250–400KB/photo instead of 3–5MB originals). Private bucket + owner-prefix policy is right.

**Sizing (at ~0.3MB/photo, 200 clothing + ~10 profile/outfit photos/user):**

| Users | Storage | Est. monthly egress* | Cost impact |
|---|---|---|---|
| 30 | ~2 GB | ~15–30 GB | Included in Pro |
| 100 | ~6 GB | ~50–100 GB | Included in Pro |
| 500 | ~32 GB | ~250–500 GB | Egress overage begins (~$0.09/GB past 250GB) |
| 1,000 | ~63 GB | ~0.5–1 TB | ~$25–70/mo egress overage |

\* Egress dominated by the fact that **every grid view re-downloads full 1200px images** — no `srcset`, no thumbnails, only 2 `loading="lazy"` attributes in the whole app, and 5-minute signed URLs defeat browser + CDN caching.

**Expensive mistakes to prevent now:**
1. **The 300s signed-URL TTL** (`storageService.ts:19`) is the most expensive line in the codebase at scale. Every session re-signs and re-fetches every visible image. Raise TTL to hours/days for own-closet images, or switch to Supabase image transformations with render tokens.
2. **No thumbnails.** A closet grid of 200 items downloads ~60MB. Generate 200px/600px variants (Supabase Image Transformations is a checkbox + `?width=` param on Pro) — this cuts egress ~10× and fixes mobile LCP simultaneously.
3. **Orphaned objects:** item delete doesn't delete the Storage object; account delete only clears 100 objects. Cost bleeds silently and deletion promises break.
4. **`item_photos` table is dead code** — nothing writes to it; the app uses the denormalized `items.primary_photo_url` string with no trigger keeping them in sync. Pick one model before multi-photo ships, or the migration later is painful.

## 4. Database

Schema is genuinely good for this stage: sensible entities (profiles, closets, closet_members, locations, items, item_photos, item_materials, tag_vocab, item_tags, wear_events), RLS enabled on every user-scoped table, `is_closet_member()` SECURITY DEFINER helper correctly avoids the recursion trap, controlled tag vocabulary, wear-event rollups.

**What becomes slow first, in order:**
1. **Client-side search** (fuse.js rebuild per keystroke) — ~2–3k items on mobile.
2. **`items` list query** — `.order('created_at')` with **no index on `created_at`**; `select('*')` drags style/enrichment/measurements/loan jsonb into every list.
3. **RLS `EXISTS` chains** on item_photos/item_materials/item_tags/wear_events (per-row items lookup + function call); un-wrapped `auth.uid()` misses the initplan optimization — wrap as `(select auth.uid())` inside `is_closet_member`.
4. **`refresh_wear_rollup`** recomputes COUNT/MAX from scratch on every wear-event mutation — linear in an item's lifetime wear history. Switch to delta updates.
5. **Missing indexes:** `closets.created_by`, `items.created_at`, `items.updated_at` (used by last-write-wins reconcile!).

**Other flags:** `setPrimaryLocation` is a non-transactional 3-step (can strand zero primaries); import fires DELETE+INSERT materials per item concurrently (400 statements for a 200-item import); migration `20260707000002` swaps a CHECK constraint with no guard for existing rows; the grants-fix migration's own comment admits the schema had never survived a real prod round-trip until recently.

## 5. Performance

- **Initial load:** ~1MB single JS chunk (acknowledged in `vite.config.ts:40`), zero `React.lazy`/route splitting, render-blocking 4-family Google Fonts import in `index.html:5`. Self-reported Lighthouse Perf **55**. Fix: split routes (Gmail import, guides, profile are obvious lazy candidates), self-host or `preconnect`+`font-display:swap` the fonts. This alone likely moves Perf 55 → 75+.
- **Image loading:** no thumbnails/srcset/lazy-loading (see Storage). This is the #1 perceived-perf item for the core screen.
- **Pagination:** none, anywhere. Fine at 200 items; a liability past ~1k.
- **Search/filtering:** client-side over the full array; Fuse index built **twice** per debounced change. Cheap fix now: memoize the Fuse index on the items array. Real fix later: Postgres FTS.
- **Cache opportunities (ranked):** longer signed-URL TTLs + `Cache-Control` on storage objects → thumbnail variants → memoized search index → IndexedDB-first render with background reconcile (partially exists via the synced repository) → HTTP caching for tag_vocab/static data.
- **PWA:** service-worker precache is correctly conservative (app shell only, no Supabase API caching — good judgment). But **the offline write queue does not exist** (`syncedClosetRepository.ts:88-89` — "durable retry queue is deferred"). An offline PWA that silently drops mutations is worse than no offline claim: users will add items in a closet with no signal, and lose them.

## 6. Reliability — what breaks first if you got popular tomorrow

Top 10 production risks, ranked (probability × impact):

1. **RLS membership policies** — closet takeover/lockout by any authenticated user (see P0-1).
2. **No backup/restore story for Storage; PITR unconfirmed** — one bad migration or delete = unrecoverable photo loss.
3. **No beta gate on signup** — a leaked URL turns "private beta" into open registration overnight.
4. **Silent offline write loss** — flaky mobile networks (your core context: closets, suitcases, basements) drop mutations with no user-visible failure.
5. **Unreadable production errors** — no source maps, no release tagging; incidents diagnosed by screenshot.
6. **Image egress melt** — a power user with 500 photos on cell data, or 50 users browsing at once; slow grids read as "the app is down."
7. **No rate limiting / quotas** — one abusive or buggy client can bloat the DB and storage bill unbounded.
8. **Migrations unproven against non-empty prod** — the CHECK-swap pattern in `20260707000002` fails hard the day a row exists; grants incident already demonstrated this class.
9. **No kill switches / feature flags** — any bad ship requires a redeploy to mitigate; combined with no staging env, prod is the test environment.
10. **Bulk import concurrency** — Gmail import of a large closet fires hundreds of concurrent statements; likely the first "app hung" report.

**Failure cascades (weakest links):**
- **Storage outage** → uploads fail → closet creation fails → wardrobe map missing images → beta users churn. *Mitigation: graceful placeholder + queued upload retry.*
- **Database outage** → app appears empty on fresh devices; existing devices survive on IndexedDB (your local-first design is the best resilience feature you have — lean on it). *Mitigation: explicit "offline/degraded" banner.*
- **Auth outage (Google or Supabase)** → no new sign-ins; existing sessions survive until token refresh. *Mitigation: none needed at beta scale, document it.*
- **CDN/Vercel outage** → app shell still loads from service-worker cache for returning users. Genuinely decent.
- **Email (Gmail API) outage** → import fails; core app unaffected. Correctly isolated.
- Weakest link overall: **Supabase is a single point of failure for auth + DB + storage + edge functions**. Acceptable at this stage — but it's why the backup drill is P0.

## 7. Security summary

Covered above; consolidated ranking: (1) closet_members INSERT policy, (2) member DELETE/closet mutation without role gates, (3) CSP gaps, (4) tokens in localStorage (mitigate via CSP; consider later), (5) `anon` default-privilege footgun, (6) SECURITY DEFINER audit (mostly fine; `refresh_wear_rollup` lacks `set search_path`), (7) storage path convention vs deletion cleanup mismatch, (8) no rate limiting, (9) open signup, (10) Edge Function CORS `*` + no deletion nonce.

**Genuinely good:** Supabase-native OAuth (not bespoke), RLS on every table, private bucket with owner-prefix policy, DOMPurify on the only HTML-injection path, secrets clean (verified — no service keys in the client bundle or git history), gitleaks + npm audit in CI, consent-gated analytics that truly doesn't load SDKs on refusal.

## 8. Operational readiness

| Capability | State | Minimum for beta |
|---|---|---|
| Error reporting | 🟡 Partial (Sentry consent-gated, no source maps/release) | Source maps + release tag in CI |
| Logging | 🟡 Supabase defaults only | Learn `get_logs`/dashboard before launch day, not during the incident |
| Uptime monitoring | 🔴 Missing | UptimeRobot/BetterStack on app URL + Supabase health |
| Alerts | 🔴 Missing | Sentry alert → email on new issue; Supabase disk/CPU emails on |
| Analytics | 🟡 PostHog installed, **zero events captured** | 5 events: signup, first_item_added, 10th_item_added, search_used, session_return. You cannot learn from a beta you can't measure. |
| Dashboards | 🔴 Missing | One PostHog dashboard: signups, activation (≥10 items), D7 return |
| Backups | 🔴 Unverified; storage not covered | Pro tier + nightly storage sync + one restore drill |
| Recovery plan | 🔴 Missing | One page: how to restore DB, how to restore photos, how to roll back a deploy, who to email (all of them are you — write it anyway, for 2am-you) |
| CI/CD | 🟡 typecheck+lint+unit; no e2e, no build step, lint warnings uncapped (`--max-warnings 99999`) | Add `npm run build` + RLS isolation script to CI |
| Secrets mgmt | 🟢 Clean | — |
| Rate limiting | 🔴 Missing | P1 |
| Feature flags | 🔴 Missing | Post-beta (PostHog flags are free and already installed) |

## 9. Cost projection (monthly, USD)

| Users | Supabase | Vercel | Egress overage | Sentry/PostHog | Email/Auth | **Total** |
|---|---|---|---|---|---|---|
| 30 | Pro $25 (+PITR $100 optional) | $0–20 | $0 | $0 (free tiers) | $0 (OAuth free) | **~$25–145** |
| 100 | $25 (+PITR) | $20 | $0 | $0 | $0 | **~$45–165** |
| 1,000 | $25–35 (compute bump) | $20 | ~$25–70 | ~$0–26 | ~$10 | **~$100–260** |
| 10,000 | ~$100–200 (compute + storage) | $20–150 | ~$150–400 (unless thumbnails ship — then ~$50) | ~$50–100 | ~$25 | **~$350–900** |

Infra cost is a non-issue through 1,000 users. The only cost cliff is image egress, and thumbnails + longer URL TTLs flatten it. **PITR ($100/mo) is the one "expensive" line worth paying during beta** — it's the price of undoing any mistake for a month; drop it later if cash matters.

## 10. Technical debt triage

**Pay before launch:** RLS role gates; beta allowlist; CSP; backup + restore drill; Sentry source maps; RLS test in CI; storage-deletion pagination bug.

**Safe to postpone (deliberately):** pagination, FTS, thumbnails pipeline, code splitting, offline write queue (but add a visible "couldn't sync" toast now — 1 hour — so failure is at least honest), item_photos model decision, feature flags, wear-rollup rewrite, transactional setPrimaryLocation, import batching.

**Debt that isn't debt:** local-first IndexedDB layer, conservative SW caching, consent gating, controlled tag vocab, client-side compression. Keep all of it.

## 11. Hidden risks solo founders miss

1. **You are the bus factor for a system holding other people's data.** Write the one-page recovery doc; put Supabase org access + domain + Vercel in a password manager with a trusted contact.
2. **Google OAuth verification.** Your Gmail-import scopes (read email) will trigger Google's restricted-scope review — weeks of lead time and a published privacy policy required, and the unverified-app screen caps you at 100 test users. Already on your list; it's the longest external lead time you have. Start now.
3. **Photos of people.** Clothing photos will include mirrors, faces, kids, home interiors. Your privacy policy and deletion path must actually work (see the 100-object bug).
4. **Beta users = friends = silent churners.** Friends don't file bug reports; they quietly stop opening the app. Without PostHog events you'll read silence as satisfaction.
5. **Dependabot automerge with no e2e gate** — a dependency bump can break prod on a weekend, auto-merged.
6. **The migrations have effectively never run against a populated production database.** Your first post-launch migration is the riskiest deploy in this project's history. Adopt: snapshot before every migration, guards on every destructive ALTER.
7. **Apple/i0S PWA reality:** iOS storage eviction can wipe IndexedDB for infrequent users — your local-first layer is not durable storage on iOS. Cloud sync (which had never round-tripped until recently) is the real source of truth; treat it that way.

## 12. Devil's advocate — assume I want this startup to fail

- **Positioning:** "Closet inventory" is a chore-app framing. The graveyard is full of them (Stylebook, Cladwell, Whering, Acloset survive by *outfit recommendations*, not inventory). Cataloging 200 items is a 3–6 hour onboarding tax paid before any value arrives. Your Gmail import is the only real answer to this and it's buried as a feature, not the funnel.
- **Onboarding:** the demo-data-with-removal-prompt suggests you already know the empty-closet problem. If activation requires photographing 200 garments, your D1 retention will decide everything, and 30 friends being polite will hide it.
- **Differentiation:** fiber/material guides, wear tracking, and location/suitcase tracking are genuinely differentiated (travel + storage is an underserved wedge). But the README leads with inventory. The wedge should lead.
- **Pricing:** none exists. Fine for beta — but decide what the paid tier is *before* you build habits around free unlimited photo storage, because storage is your only real marginal cost and "unlimited free photos" is the one promise you can't walk back gracefully.
- **Retention mechanics:** nothing brings a user back. No "you haven't worn this in 90 days," no packing-list generator, no cost-per-wear report. Wear data is collected but never reflected back. That's the retention feature, and it's missing.
- **Architecture:** the local-first + Supabase choice is right. The failure mode isn't the stack — it's that sync had never been proven end-to-end until the grants fix, and the sharing model (the viral loop!) exists only as mockups with a broken authorization layer underneath it.
- **Marketing:** zero landing page/waitlist evidence in the repo. A 30-person friends beta produces love, not signal. Recruit at least 10 strangers.

**The three most likely reasons Nothing To Wear would fail:**

1. **Onboarding tax kills activation.** Users won't photograph 200 items before seeing value. *Prevention:* make Gmail import the front door; deliver a "your closet's value / cost-per-wear" insight at item #10, not #200; measure activation (≥10 items) as the only beta metric that matters.
2. **No retention loop.** An inventory, once built, has no reason to be reopened. *Prevention:* ship one reflective loop in beta — weekly "worn/not-worn" digest or a trip packing list — and watch D7/D30 return, not signups.
3. **Trust rupture in a friends-beta.** One incident — a friend sees another's closet via the RLS hole, photos lost with no backup, deleted account whose photos persist — and word-of-mouth inverts in a 30-person social graph. *Prevention:* the P0 list above. This is precisely why the security items block launch.

---

*Full source citations for every finding are in the review threads; key files: `supabase/migrations/20260626000002_rls.sql`, `vercel.json`, `src/lib/supabaseClient.ts`, `src/services/storageService.ts`, `src/services/syncedClosetRepository.ts`, `src/hooks/useFuzzySearch.ts`, `supabase/functions/delete-user-account/index.ts`, `vite.config.ts`, `.github/workflows/ci.yml`.*
