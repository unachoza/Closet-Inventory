# Supabase — schema & migrations

The relational spine for the cloud port (E1). These migrations map 1:1 onto
[`planning/backend/DATA_MODEL_2026-06-24.md`](../planning/backend/DATA_MODEL_2026-06-24.md) —
treat that doc as the source of truth; this directory is its executable form.

## Migrations (apply in order)

| File | Ticket | What it does |
| --- | --- | --- |
| `20260626000001_v1_spine.sql` | E1-1.2 | Tables: `profiles`, `closets`, `closet_members`, `locations`, `items`, `item_photos`, `item_materials`. Plus `updated_at` trigger + new-user bootstrap (auto-creates a profile, a default "My Closet", and an owner membership on signup). |
| `20260626000002_rls.sql` | E1-1.3 | Enables RLS on every table; owner/member-only policies keyed on `is_closet_member()` (a `SECURITY DEFINER` helper that avoids recursive RLS). |
| `20260626000003_storage.sql` | E1-2.1 | `item-photos` Storage bucket + object RLS (path = `<user_id>/<item_id>/<file>`). |

## What's deliberately NOT here yet

Added by migration as their epics land (see the data-model doc):

- **#4 Inventory (E2):** `items.status`, `fit`, `measurements`, `season`, `country_of_origin`, `acquisition_type`, `is_sentimental`, `is_high_value`; `tag_vocab` + `item_tags`.
- **#6 Laundry (E11):** `items.worn_count`, `last_worn_at`; `wear_events`.
- **#7 Sharing (E4):** `items.is_private`, `is_lendable`; `connections`, `shares`, `borrow_requests`; plus the **read-share RLS extension** (`...OR closet is shared to me AND item not is_private`).

## How to apply

**Option A — Supabase CLI (preferred; tests locally first):**

```bash
supabase db reset          # local stack: re-applies all migrations from scratch
supabase db push           # push pending migrations to the linked remote project
```

**Option B — MCP / dashboard:** apply each file's SQL in order via the Supabase
MCP `apply_migration` tool or the SQL editor. Apply `…001` → `…002` → `…003`.

> ⚠️ These have not been applied to the remote project (`rawuntspvetfdtrqggen`)
> yet. Review first; applying RLS to a project mid-flight is hard to reverse.

## After applying

Regenerate the typed client contract and reconcile against `@ntw/types`:

```bash
supabase gen types typescript --linked > src/lib/database.types.ts
```

Then implement `SupabaseClosetRepository` (E1-1.4) against the
`ClosetRepository` interface and flip the active repo in
[`src/services/index.ts`](../src/services/index.ts).

## Open questions (don't block v1 — resolve before #7 Sharing)

Tracked in the data-model doc: share grain, location scope under stylists,
measurements storage (JSONB vs columns), category enum vs. reference table.
