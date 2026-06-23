# E1 · Cloud Backend — Architecture & Stack Decision

> **Date:** 2026-06-22 · **Status:** proposed (supersedes the Path A recommendation in
> [E1-cloud-backend_PLAN.md](./E1-cloud-backend_PLAN.md)) · **Defers to:**
> [BACKEND_DATABASE_DECISION.md](../BACKEND_DATABASE_DECISION.md) (Supabase, committed 2026-06-20)
> **Scope:** framework, database, GraphQL layer, libraries, deployment, observability — for the roadmap v1–v11.

---

## TL;DR — the recommendation

- **Database:** Supabase Postgres — already decided. ✅
- **API:** A **single GraphQL BFF** (GraphQL Yoga on Node/Fastify) — gives you the unified GraphQL endpoint you want **and** a home for custom AI logic.
- **The non-negotiable rule:** the BFF **forwards the user's Supabase JWT to Postgres so Row-Level Security stays the enforcement layer.** It does **not** connect as `service_role` for user data.
- **Privileged work** (Gmail/IMAP tokens, Stripe webhooks, AI vendor keys, the v2.2 scraper) runs in **separate service-role contexts** (Edge Functions or a worker on the same Node service) — never reachable from the client.
- **Deploy:** Supabase (managed DB/Auth/Storage/Edge) + the Node BFF on **Render or Fly.io** (long-running — you need it for IMAP anyway).
- **Observe:** **Sentry** (errors + tracing) + **Supabase Logs / `pg_stat_statements`**, OpenTelemetry-ready. **Not Datadog** at this stage.

This is a **refined Path A** — a gateway, but a *RLS-preserving* one. It reconciles "I want GraphQL + custom AI control" with "RLS is the load-bearing reason I picked Supabase."

> **No AI?** The custom gateway loses its main justification — go **Path B (`pg_graphql`-native)** instead. See [Variant: No AI](#variant-no-ai--pg_graphql-native-becomes-the-default).

---

## ⚠️ Why the original Path A needs correcting

The E1 plan's Path A recommends a custom Node gateway using **Prisma on a single connection string** while **disabling PostgREST and pg_graphql** to "hide the schema." Three problems:

1. **It bypasses RLS — the one thing you chose Supabase for.** A Prisma connection uses one Postgres role (effectively `service_role`). That role **ignores RLS by default.** So every v8 privacy rule ("`visible_to` includes `auth.uid()`", "show items at home + not on loan") would have to be **re-implemented by hand in Node middleware** — which is exactly the hand-rolled-ACL problem you were escaping by leaving Firestore security rules. See [BACKEND_DATABASE_DECISION.md](../BACKEND_DATABASE_DECISION.md) §"RLS is the load-bearing one."
2. **"Disable PostgREST to hide the schema" is security-by-obscurity.** A consumer closet app's schema is not a secret worth protecting; **RLS + private Storage buckets** is the actual defense. The Tea App breach was *misconfigured public buckets + missing access control* — **not** "the schema was reflectable." pg_graphql/PostgREST run RLS on every request; leaving them on (or proxied) is safe **if RLS is on**.
3. **Some controls are mismatched to this product.** "Partner supplier contacts," AES-256 field encryption, and a private VPC connection describe an enterprise logistics system. This is a personal closet PWA (hundreds of items/user). Keep the *good* hygiene (no hardcoded secrets, gitleaks, private buckets, presigned URLs, query-cost limits); drop the enterprise theater that adds cost and slows you down.

**Net:** keep the gateway idea from Path A (you genuinely want a GraphQL surface + AI middleware), but **make the data path RLS-aware** instead of a service-role tunnel. That's the design below.

---

## Recommended architecture — "Authenticated GraphQL BFF, RLS underneath"

```text
                         [ React PWA ]  (Apollo Client / urql + graphql-codegen types)
                              │
                              │  GraphQL over HTTPS
                              │  Authorization: Bearer <supabase JWT>
                              ▼
        ┌─────────────────────────────────────────────────────────┐
        │            GraphQL BFF  (Node + Fastify + Yoga)           │
        │                                                           │
        │  • verify JWT (jose, Supabase JWKS)                       │
        │  • graphql-armor: depth + cost + rate limit (DoS guard)   │
        │  • Zod validation at the boundary                         │
        │                                                           │
        │  ── Data resolvers ───────────────────────────────────►  │  forwards the USER JWT
        │     supabase-js / postgres.js  (RLS ENFORCED)            │  → Postgres runs RLS as auth.uid()
        │                                                           │
        │  ── Privileged resolvers (service_role, server-only) ──►  │  AI, Stripe, token exchange
        └─────────────────────────────────────────────────────────┘
              │                         │                      │
              ▼                         ▼                      ▼
   [ Supabase Postgres ]      [ Supabase Storage ]    [ Edge Functions / worker ]
    • RLS policies (v8)        • private buckets        • Gmail/Graph OAuth token refresh
    • pg_cron (token purge)    • presigned URLs         • IMAP fetch (Yahoo/iCloud/AOL) ← Node, not Deno
    • pg_stat_statements       • images (no base64)     • Stripe webhook → users.is_premium
                                                         • v2.2 PDP scraper
```

### Request flow — a normal CRUD/social query (RLS does the work)

```text
React ──GraphQL + JWT──► BFF ──verify JWT──► resolver opens a Postgres session AS the user
                                              (SET request.jwt.claims / supabase-js anon+JWT)
                                                   │
                                                   ▼
                                         RLS policy auto-filters rows
                                         (only the caller's + shared-to-caller items)
                                                   │
                                                   ▼
                                         result ──► BFF ──► React
```

### Request flow — a privileged op (AI camera-roll pre-fill, v3.1)

```text
React ──uploadImage()──► Supabase Storage (private bucket, RLS)
React ──GraphQL: enrichItem(imgPath)──► BFF privileged resolver
        • holds the AI vendor key (never sent to client)
        • calls Vision API → structured {category,color,brand}
        • writes via the USER session so RLS still applies
        ──► returns pre-fill payload ──► review screen
```

---

## Decisions, with the trade-offs

### 1. GraphQL layer — three options, and why Yoga BFF wins *for you*

| Option | What it is | Pros | Cons | Verdict |
|---|---|---|---|---|
| **pg_graphql (native, Path B)** | Supabase auto-generates a GraphQL API from the schema; RLS-aware out of the box | Zero resolver boilerplate; RLS enforced automatically; fastest to stand up CRUD | Relay-style schema is clunky; **no clean home for custom AI mutations**; schema shape is coupled to tables | Good for **early CRUD**, but you'll outgrow it at AI/v8 |
| **Custom Apollo/Yoga BFF (refined Path A) ✅** | Your own GraphQL server; data resolvers forward the JWT to Postgres | Unified curated schema; AI/secret logic lives here; **RLS still enforced** (JWT forwarded); typed end-to-end | You write/own resolvers; one more service to run | **Recommended** — matches "GraphQL + custom AI control" |
| **Service-role Prisma gateway (original Path A) ❌** | Node gateway with one privileged DB connection | Great Prisma DX | **Bypasses RLS**; you re-build v8 ACLs by hand; defeats the Supabase rationale | **Avoid** for user data |

- **Pragmatic middle path:** start by exposing **pg_graphql** (proxied through the BFF) for plain CRUD so you ship fast, and add **custom Yoga resolvers** for AI/Stripe/social as those land. One endpoint, RLS throughout, no premature boilerplate.
- **Schema style:** if/when you go code-first, use **Pothos** (TypeScript-first GraphQL schema builder) over **supabase-js** — not service-role Prisma — so RLS is never bypassed.

### 2. Framework — Fastify over Express/NestJS

- **Fastify + GraphQL Yoga (chosen):** fast, tiny, first-class TS, great plugin model; Yoga has the best built-in defaults (CSRF, masked errors, plugins).
- **Express:** fine, but slower and you'd bolt on what Fastify gives free. Apollo Server 4 runs on either if you prefer Apollo's ecosystem.
- **NestJS:** correctly rejected in the E1 plan — boilerplate-heavy for a solo dev.

### 3. Database access — RLS-preserving clients only for user data

- **User data:** `supabase-js` (or `postgres.js` with `SET LOCAL request.jwt.claims`) initialized **per-request with the caller's JWT** → RLS enforced.
- **Privileged tasks only:** a separate `service_role` client, isolated to Edge Functions / privileged resolvers (Stripe webhook, token store, cron). Keep this key server-side, never in a resolver reachable by anon users.
- **Prisma:** optional for **migrations & admin scripts** where service-role is intended — not for serving user queries.

### 4. Auth & the Gmail-token spike (do this first)

- **Supabase Auth** issues the JWT the whole system trusts; verify with **`jose`** against Supabase JWKS.
- **Riskiest unknown (per the DB decision doc): the Gmail access-token flow under Supabase Auth.** Today it rides Firebase Auth + gapi. **Spike this before porting anything else** — prove Supabase Google OAuth yields a usable Gmail API access token (provider token + refresh), store it server-side, refresh in an Edge Function.
- **IMAP providers (Yahoo/iCloud/AOL, v2.3):** run on the **Node BFF/worker (`imapflow`)**, *not* Deno Edge Functions — Node's IMAP libs are mature. This is why a long-running Node host (Render/Fly) beats pure serverless.

---

## Library shortlist

| Concern | Pick | Note |
|---|---|---|
| GraphQL server | **GraphQL Yoga** (or Apollo Server 4) | on Fastify |
| Schema (code-first) | **Pothos** | when you outgrow pg_graphql |
| DB client (user data) | **supabase-js** / **postgres.js** | RLS-preserving, JWT-scoped |
| DB client (admin/migrations) | **Prisma** | service-role, server-only |
| GraphQL hardening | **graphql-armor** | depth + cost limit = the real DoS fix |
| Input validation | **Zod** | validate at every boundary |
| JWT verify | **jose** | Supabase JWKS |
| Frontend client | **Apollo Client** or **urql** + **graphql-codegen** | typed queries end-to-end |
| Payments | **stripe** (node) | verify webhook signatures |
| Email IMAP | **imapflow** | on the Node worker |
| Secret scanning | **gitleaks** (pre-commit) | keep this from the E1 plan |

---

## Deployment topology

```text
 ┌────────────────────────────── Supabase (managed) ──────────────────────────────┐
 │  Postgres + RLS  ·  Auth  ·  Storage (private)  ·  Edge Functions  ·  pg_cron   │
 └────────────────────────────────────────────────────────────────────────────────┘
                ▲                                   ▲
                │ JWT-scoped (RLS)                  │ service_role (server-only)
                │                                   │
        ┌───────┴───────────────────────────────────┴────────┐
        │     GraphQL BFF + IMAP worker  (Render / Fly.io)    │   long-running Node
        └─────────────────────────────────────────────────────┘
                ▲
                │ GraphQL/HTTPS
        ┌───────┴────────┐
        │  React PWA     │   Vercel / Netlify / Cloudflare Pages (static)
        └────────────────┘
```

- **Supabase managed** — DB, Auth, Storage, Edge Functions, cron. No self-hosting.
- **Node BFF → Render or Fly.io** — long-running (needed for IMAP + steady GraphQL). Pick **Render** for simplest DX, **Fly.io** for edge regions/cheaper scale.
- **PWA → Vercel/Netlify/Cloudflare Pages** — static hosting + preview deploys.
- **Secrets** — provider env vars only; gitleaks pre-commit; rotate anything that ever touched a branch.

---

## Observability & monitoring (right-sized for solo → small team)

- **Sentry** — errors + performance tracing across PWA and BFF; generous free tier; OTel-compatible. **This replaces the E1 plan's Datadog APM** — Datadog is enterprise-priced overkill at this stage; revisit only past meaningful paid scale.
- **Supabase Logs + `pg_stat_statements`** — slow-query and DB health, built in.
- **Structured logs → Better Stack (Logtail) or Axiom** — cheap/free log aggregation if you outgrow Supabase log views.
- **graphql-armor metrics** — surface blocked deep/expensive queries.
- **OpenTelemetry** — instrument the BFF with OTel from day one so you can point it at Sentry now and swap to Grafana/Datadog later without re-instrumenting.
- **Privacy:** scrub PII from logs at the logger (redact email bodies, tokens) — a logging-discipline rule, not a managed scanner.

---

## Security posture — keep the good, drop the theater

**Keep (genuinely load-bearing):**

- **RLS on every table** — the v8 privacy + sharing enforcement layer (the whole reason for Supabase).
- **Private Storage buckets + short-lived presigned URLs** — the actual Tea-App lesson.
- **No hardcoded secrets; gitleaks pre-commit; env-var injection.**
- **graphql-armor depth/cost limits** — the correct DoS defense (not "hide the schema").
- **`pg_cron` purge** of expired OAuth/refresh tokens.
- **Service-role key server-only**, never in client-reachable resolvers.

**Drop / defer (mismatched to a personal closet PWA):**

- Disabling PostgREST/pg_graphql to "hide the schema" — obscurity, and it discards RLS-aware auto-CRUD.
- App-layer AES-256 field encryption for "supplier contacts" — there are no suppliers; rely on Postgres at-rest encryption + RLS.
- Private VPC peering — unnecessary infra/cost at this scale; TLS + RLS + scoped keys suffice.

---

## Variant: No AI → Path B (`pg_graphql`-native) becomes the default

> If the roadmap drops the AI features (v3.1 vision pre-fill, any LLM enrichment), the custom GraphQL BFF
> loses its main justification. **Don't build a server you don't need.**

**What changes:** the strongest reason for a custom gateway was "a place to run custom AI logic + hold the
AI vendor key." Remove AI and the gateway's remaining jobs (forward JWT for RLS, curate schema) are either
already done by `pg_graphql` or not worth a whole service.

**What stays (server work that exists AI-or-not — none of it is GraphQL):**

- Gmail / Microsoft Graph **OAuth token refresh** → Edge Function (server-side secret)
- **Stripe webhook** → `users.is_premium` (v11) → Edge Function
- **IMAP fetch** for Yahoo/iCloud/AOL (v2.3) → small **Node** worker (`imapflow`; Deno IMAP libs are weak)
- **v2.2 PDP scraper** → Edge Function

**Revised topology (no AI):**

```text
        [ React PWA ]
             │  GraphQL + JWT
             ▼
   [ Supabase pg_graphql ]  ◄── RLS enforced natively, zero resolvers
             │
             ▼
   [ Postgres + RLS ]
        ▲           ▲
        │           │ service_role (server-only)
        │      ┌────┴───────────────────────────────┐
        │      │ Edge Functions + Node IMAP worker   │
        │      │  • OAuth refresh · Stripe · scraper │
        │      │  • IMAP (Render/Fly)                │
        │      └─────────────────────────────────────┘
```

**Decision table:**

| | With AI | Without AI |
|---|---|---|
| GraphQL surface | Custom **Yoga BFF** (refined Path A) | **`pg_graphql` native** (Path B) |
| Custom GraphQL server to build/deploy/monitor | Yes | **No** |
| Privileged logic host | BFF resolvers + Edge Functions | Edge Functions + Node IMAP worker |
| RLS enforcement | JWT forwarded by BFF | Native in `pg_graphql` |
| Long-running Node host | BFF + IMAP | **Only** the IMAP worker (v2.3) |

**Two things that would bring the BFF back even without AI:**

1. You want **centralized query depth/cost limiting** beyond what Supabase gives on `pg_graphql` (graphql-armor as a chokepoint).
2. You want a **curated/aggregated schema** that doesn't mirror tables 1:1.

If neither applies, **go Path B** — it's strictly less to build, and the right-sizing in the Security section gets *more* true, not less.

**One trade-off to accept:** exposing `pg_graphql` directly to the browser means you lose the BFF as a chokepoint for abusive queries — so lean harder on **RLS + Supabase's built-in rate limits**.

---

## Build order (spike the risky bits first)

1. **Spike Gmail token flow under Supabase Auth** — the one thing that can invalidate the plan. ([DB decision §open questions](../BACKEND_DATABASE_DECISION.md#open-questions-to-resolve-before-acting))
2. **Schema + RLS** for `items`, `users`, and the v8 `shares` / `borrow_requests` relations; verify policies with the JWT-scoped client.
3. **Storage migration** — base64 → private bucket + URL column (kills the ~5 MB Safari ceiling; unblocks camera import).
4. **GraphQL BFF** — stand up Yoga/Fastify, JWT verify, graphql-armor; expose CRUD (pg_graphql proxy or first resolvers).
5. **Port `useCloudCloset`** off localStorage-only to the BFF; keep localStorage as offline cache.
6. **Privileged resolvers / Edge Functions** — Stripe webhook (`is_premium`), AI pre-fill, then the IMAP worker for v2.3.

---

## Open questions

- [ ] Gmail access-token under Supabase Auth — **spike before anything else.**
- [ ] pg_graphql-proxied CRUD first vs. hand-written resolvers from day one? (Lean: proxy first, migrate hot paths.)
- [ ] Render vs. Fly.io for the Node BFF/IMAP worker (Lean: Render for DX).
- [ ] Apollo Client vs. urql on the PWA (Lean: urql — lighter for a PWA; both work with codegen).
