# E1 · Cloud Backend — Implementation Plan

> **Date:** 2026-06-22 · **Status:** draft · **Implements:** [E1-cloud-backend.md](../launch/epics/E1-cloud-backend.md) (goals/tickets) ·
> **Architecture:** [E1-cloud-backend_ARCHITECTURE.md](./E1-cloud-backend_ARCHITECTURE.md) · **DB decision:** [BACKEND_DATABASE_DECISION.md](../BACKEND_DATABASE_DECISION.md)
> **Goal:** Per-user closet in Supabase Postgres, images off base64, offline-first sync — RLS as the enforcement layer.
> **Est:** ~7–11 dev-days · **Spike first:** Gmail access-token under Supabase Auth.

---

## Guiding decisions (from the architecture doc)

- **Direct `supabase-js` client for the MVP — no GraphQL gateway yet.** US-1.1–1.3 are owner-scoped CRUD + sync; `supabase-js` + RLS is the shortest correct path and matches the epic's `useCloudCloset` ticket.
- **RLS is the enforcement layer**, not app middleware. Every query runs as the signed-in user; policies—not Node—decide row access.
- **Defer GraphQL** (`pg_graphql` or a BFF) until AI logic or v8 social arrives. See [architecture §Variant: No AI](./E1-cloud-backend_ARCHITECTURE.md).
- **No service-role key in the client, ever.** Privileged work (Stripe webhook, Gmail token refresh later) goes to Edge Functions.
- **Repository pattern:** both `useLocalCloset` and the new `useCloudCloset` implement one `ClosetRepository` interface, so the app swaps storage without touching feature code.

---

## Current state (grounding)

- `main` is **localStorage-only** — `useLocalStorageCloset` ([src/hooks/useLocalCloset.tsx](../../src/hooks/useLocalCloset.tsx)) owns all closet mutations (`addItem`, `updateItem`, `removeItem`, `importItems`, `clearCloset`).
- `ClothingItem` ([src/utils/types.ts](../../src/utils/types.ts)) is the shape to mirror in Postgres. Note: `material` is `MaterialBlend[]` (→ `jsonb`), `care`/`notes` are `string | string[]`, `style` is a nested object (→ `jsonb`).
- Images are **base64 strings in `imageURL`** ([ImageUploader](../../src/Features/Form/ImageUploader/ImageUploader.tsx)) — the ~5 MB Safari ceiling this epic fixes.
- Gmail auth is **client-side `@react-oauth/google`** (`useGoogleLogin`, `gmail.readonly` scope, token in localStorage) — *not* Firebase. The spike is whether Supabase Auth's Google OAuth can carry the same scope and yield a usable `provider_token`.

---

## Phase 0 — Spike: Gmail token under Supabase Auth `E1-1.1` _(1–1.5d)_

> The one thing that can invalidate the plan. Do it on a throwaway branch before any schema work.

- [ ] Create Supabase project; enable Google provider; add `gmail.readonly` to the OAuth scopes
- [ ] `supabase.auth.signInWithOAuth({ provider: 'google', options: { scopes: 'gmail.readonly', queryParams: { access_type: 'offline', prompt: 'consent' } } })`
- [ ] On callback, read `session.provider_token` (Google access token) + `provider_refresh_token`
- [ ] Call the Gmail API (`users.messages.list`) with `provider_token` — **prove a real fetch succeeds**
- [ ] Decide refresh strategy: Supabase does **not** auto-refresh `provider_token` → plan an Edge Function that exchanges `provider_refresh_token` (deferred to E3, but decide the shape now)

**Exit criteria:** a Gmail list call returns real messages using a token obtained via Supabase Auth. If it can't, escalate before committing — fallback is keeping `@react-oauth/google` for Gmail and Supabase Auth only for the DB session.

---

## Phase 1 — Schema, RLS & client `E1-1.2` `E1-1.3` _(1.5d)_

### Data flow (target)

```text
[ React ] ──supabase-js (anon key + user JWT)──► [ Supabase Postgres ]
     │                                                  │  RLS: auth.uid() = user_id
     └── localStorage (offline cache) ◄────────────────┘  owner-only read/write
```

### `items` table — mirror `ClothingItem` + E2 status/location (avoid a later migration)

```sql
create table public.items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  category      text not null,
  color         text,
  size          text,
  brand         text,
  price         text,
  material      jsonb default '[]',        -- MaterialBlend[]
  occasion      text,
  condition     text,
  purchase_date timestamptz,
  care          jsonb,                      -- string | string[]
  on_sale       boolean default false,
  original_price text,                      -- from PR #73
  qty           int,                        -- from PR #73
  notes         jsonb,
  style         jsonb,                      -- ProductAttributes
  image_url     text,                       -- Storage URL (Phase 2), not base64
  -- E2 inventory spine, included now per epic dependency note:
  status        text default 'clean',       -- clean | dirty | needs-repair
  location      text,
  on_loan       boolean default false,
  updated_at    timestamptz default now(),  -- last-write-wins key
  created_at    timestamptz default now()
);
alter table public.items enable row level security;
```

### RLS policies — owner-only

```sql
create policy "owner read"   on public.items for select using (auth.uid() = user_id);
create policy "owner insert" on public.items for insert with check (auth.uid() = user_id);
create policy "owner update" on public.items for update using (auth.uid() = user_id);
create policy "owner delete" on public.items for delete using (auth.uid() = user_id);
```

- [ ] `E1-1.2` Provision project, run schema migration (Supabase CLI, committed under `supabase/migrations/`)
- [ ] `E1-1.2` Map `ClothingItem` ↔ row in one place: `src/utils/closetMappers.ts` (camelCase ↔ snake_case, jsonb encode/decode) — pure functions, unit-tested
- [ ] `E1-1.3` RLS policies + a **negative test**: user B cannot read user A's rows
- [ ] Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` via env vars; **anon key only** client-side; gitleaks pre-commit

---

## Phase 2 — Auth session + `useCloudCloset` `E1-1.4` _(2–3d)_

### Repository interface (both implementations satisfy it)

```ts
interface ClosetRepository {
  list(): Promise<ClothingItem[]>;
  add(item: ItemFormData): Promise<ClothingItem>;
  update(id: string, patch: Partial<ClothingItem>): Promise<ClothingItem>;
  remove(id: string): Promise<void>;
  importMany(items: ClothingItem[], mode: "replace" | "merge"): Promise<void>;
}
```

- [ ] `AuthProvider` wrapping `supabase.auth` session; expose `user`, `signIn`, `signOut`
- [ ] `useCloudCloset` implementing `ClosetRepository` over `supabase-js`, using `closetMappers`
- [ ] Refactor `useLocalStorageCloset` to the same interface (keep behavior identical)
- [ ] `useCloset()` selector: returns cloud repo when signed-in, local repo otherwise
- [ ] All writes immutable (spread, no mutation — matches coding-style rules)
- [ ] Errors surfaced via the existing toast system; never swallow

---

## Phase 3 — First-sign-in seed + offline reconcile `E1-1.5` `E1-1.6` _(2–2.5d)_

### Sync state machine

```text
        sign in
  local ───────────► seed? ──yes──► upload local closet ──► cloud authoritative
                       │ no (cloud already has rows)
                       ▼
                  reconcile: per-id last-write-wins on updated_at
                       │
        offline write ─┴─► queue in localStorage ──reconnect──► flush ──► cloud
```

- [ ] `E1-1.5` First sign-in with empty cloud → bulk-insert local closet; mark seeded (flag on a `profiles` row, not localStorage, so it's per-account)
- [ ] `E1-1.6` Reconcile: merge by `id`, resolve conflicts by newer `updated_at` (every write bumps `updated_at`)
- [ ] Offline queue: pending writes persist locally, flush on `online` event / reconnect
- [ ] Guard double-seed (don't re-upload on second device sign-in)

---

## Phase 4 — Image storage `E1-2.1` `E1-2.2` _(2–2.5d)_

```text
ImageUploader ──file──► Supabase Storage (private bucket `closet-images/{user_id}/{uuid}`)
                              │
                              ▼  returns path → signed URL
                        items.image_url = signed/public URL  (no base64)
```

- [ ] `E1-2.1` Private bucket + RLS (path prefixed by `user_id`); replace base64 path in `ImageUploader` with upload → URL
- [ ] Upload failure → user-facing message + retain local preview (no silent fail)
- [ ] `E1-2.2` One-time migration: existing base64 `imageURL` → upload to Storage, swap to URL (idempotent, resumable)
- [ ] Decide public-read vs. signed URLs (signed = private; lean signed for closet privacy)

---

## Phase 5 — Sync indicator `E1-3.1` _(0.5d)_

- [ ] NavBar chip: `synced` / `syncing` / `offline`, driven by the reconcile/queue state
- [ ] Pending-writes count flushes visibly on reconnect

---

## Testing strategy (TDD, 80%+ per house rules)

- **Unit:** `closetMappers` round-trip (`ClothingItem` ↔ row), reconcile/last-write-wins resolver, offline-queue flush — pure functions, fast
- **Integration:** RLS policies (owner read/write, cross-user denial) against a local Supabase stack; seed + reconcile against a seeded DB
- **E2E (Playwright):** sign in → add item → reload → item persists; offline add → reconnect → syncs; image upload renders from URL
- **Migration test:** base64 → Storage migration is idempotent (re-run is a no-op)

---

## Risks & mitigations

- 🔴 **Gmail token under Supabase Auth** — Phase 0 spike gates everything; fallback keeps `@react-oauth/google` for Gmail only.
- 🟠 **`provider_token` not auto-refreshed** — plan the refresh Edge Function early (lands with E3 multi-provider, but design now).
- 🟠 **Offline reconcile correctness** — last-write-wins can drop a concurrent edit; acceptable for a single-user-multi-device closet, document the limitation.
- 🟠 **Base64 migration on large closets** — batch + resumable; never block the UI.
- 🟡 **`CategoryType`/category values** — keep DB `category` as free `text` (don't enum it) so the PR #72/#73 taxonomy work isn't coupled to a migration.

---

## Explicitly out of scope (deferred)

- **GraphQL / `pg_graphql` / BFF** — revisit when AI logic or v8 social lands ([architecture doc](./E1-cloud-backend_ARCHITECTURE.md)).
- **v8 social RLS** (shares, borrow graph) — E4; schema here stays owner-only.
- **Realtime multi-device push** — polling/reconnect reconcile is enough for E1; Supabase Realtime is a later enhancement.
- **Stripe `is_premium` gating** — E10.

---

## Sequenced checklist (merge order)

1. Phase 0 spike (throwaway branch) → go/no-go
2. Phase 1 schema + RLS + mappers
3. Phase 2 auth + `useCloudCloset` behind the repository interface
4. Phase 3 seed + reconcile
5. Phase 4 image storage + migration
6. Phase 5 sync indicator
7. Decommission Firestore PR #44 (reference only — do **not** merge)

**Epic DoD:** signed-in users have a private, synced, offline-capable closet on Supabase; images in Storage; sync state visible; Gmail import still works under Supabase Auth.
