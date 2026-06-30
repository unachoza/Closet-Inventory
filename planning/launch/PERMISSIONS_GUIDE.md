# Supabase & Postgres Permissions — How It Works

> A quick reference for how data access works in Nothing To Wear.

---

## The Two Security Layers

Postgres checks access in **two layers, in order**. Both must pass for a query to succeed.

```
Client request
     │
     ▼
┌─────────────────────────┐
│  Layer 1: TABLE GRANTs  │  "Can this role attempt this operation on this table at all?"
│  (GRANT SELECT, INSERT, │   If NO → error 42501 (permission denied), query stops here.
│   UPDATE, DELETE)       │   If YES → proceed to Layer 2.
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│  Layer 2: RLS Policies  │  "Which specific rows can this role see/modify?"
│  (Row Level Security)   │   Filters rows based on conditions you define (e.g. user_id = auth.uid()).
│                         │   If no rows match → empty result (not an error).
└─────────────────────────┘
```

**Key insight:** GRANTs are the gate, RLS is the filter. Without GRANTs, RLS never runs. Without RLS, GRANTs alone would let any authenticated user see *everyone's* data.

---

## Postgres Roles in Supabase

| Role | Who uses it | What it means |
|------|------------|---------------|
| `anon` | Any request **without** a valid JWT (signed-out visitors) | Lowest privilege. Our app grants it `SELECT` only — enough to read public data if any existed, but RLS blocks even that for user-owned tables. |
| `authenticated` | Any request **with** a valid JWT (signed-in user) | The main role. Gets `SELECT`, `INSERT`, `UPDATE`, `DELETE` — but RLS filters every query to only rows belonging to `auth.uid()`. |
| `service_role` | Server-side only (admin scripts, edge functions) | **Bypasses RLS entirely.** Full access to everything. Never used in client code — only in `scripts/` with `SUPABASE_SECRET_KEY`. |

---

## What Can Each User State Access?

| | **Signed out** (no account) | **Signed in** (Google OAuth) |
|---|---|---|
| **localStorage** | Full read/write to own browser's closet data | Full read/write (offline cache) |
| **Supabase tables** (profiles, closets, items, etc.) | Nothing — `anon` role + RLS = zero rows | Own data only — `authenticated` role + RLS filters by `auth.uid()` |
| **Supabase Storage** (item-photos) | Nothing | Upload/download/delete only within own `<userId>/` path |
| **Other users' data** | N/A | Blocked by RLS — queries return empty, not errors |

---

## Per-Table Permission Matrix

| Table | `anon` (signed out) | `authenticated` (signed in) | RLS rule |
|-------|---|---|---|
| `profiles` | SELECT (but RLS → own row only → effectively nothing) | CRUD own row | `id = auth.uid()` |
| `closets` | SELECT → nothing | CRUD own closets | `id IN (user's closet_members)` |
| `closet_members` | SELECT → nothing | CRUD own memberships | `user_id = auth.uid()` |
| `items` | SELECT → nothing | CRUD own items | `closet_id` owned by user |
| `item_materials` | SELECT → nothing | CRUD own | via item → closet ownership |
| `item_photos` | SELECT → nothing | CRUD own | via item → closet ownership |
| `wear_events` | SELECT → nothing | CRUD own | via item → closet ownership |
| `tags` | SELECT → nothing | CRUD own | via closet ownership |
| `item_tags` | SELECT → nothing | CRUD own | via item → closet ownership |
| `borrow_requests` | SELECT → nothing | CRUD own | borrower or item owner |

**Storage (`item-photos` bucket):** RLS policies enforce that uploads go to `<userId>/` prefix and only the owner can read/modify files at that path.

---

## CRUD Quick Reference

| Operation | SQL | What RLS does |
|-----------|-----|---------------|
| **C**reate | `INSERT` | Checks you're inserting into your own closet |
| **R**ead | `SELECT` | Filters to only your rows — other users' rows are invisible |
| **U**pdate | `UPDATE` | Only matches your rows — updating someone else's row affects 0 rows |
| **D**elete | `DELETE` | Only matches your rows — deleting someone else's row affects 0 rows |

No errors are thrown for cross-user attempts — the query simply returns empty. This is by design (information hiding).

---

## localStorage vs. Supabase

| Dimension | localStorage | Supabase |
|-----------|-------------|----------|
| **Where** | Browser only, per-device | Cloud (Postgres + Storage) |
| **Auth required** | No | Yes (Google OAuth) |
| **Multi-device sync** | No | Yes |
| **Security model** | Anyone with physical device access can read it | RLS + GRANTs, encrypted at rest, TLS in transit |
| **Data survives** | Browser cache clear = gone | Account deletion or manual delete |
| **Role** in our app | Offline cache (always available) | Source of truth (when signed in) |

When signed in, both are active — localStorage is the offline cache, Supabase is the authority. Conflicts resolve via last-write-wins on `updatedAt`.
