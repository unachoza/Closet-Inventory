# NTW Relational Data Model

> **Date:** 2026-06-24 · **Status:** design (pre-migration) · **DB:** Supabase Postgres + RLS
> **Purpose:** Lock the **relational spine** (the expensive-to-change FK graph) before the #2 cloud-database
> sprint. Columns/attributes are added in waves via migration as features land (#4 Inventory, #5 Profile,
> #6 Laundry, #7 Sharing). This doc is the map those migrations must not contradict.

---

## Locked decisions (2026-06-24)

1. **Closet owns items; user owns closets.** `items.closet_id → closets.id`. A closet is a real entity, not a label.
2. **Closet (whose) and location (where) are independent axes.** An item has both a `closet_id` (whose stuff) and a `location_id` (which physical place). Husband's closet can hold items at the summer home *and* at the primary residence simultaneously — location is per-item, closet spans locations.
3. **Closets are co-owned (many-to-many).** `closet_members` join table with a **role**. Proves the "Our Closet" origin thesis (the NTW differentiator) *and* opens the **stylist / pro** use case (a stylist is a member of a client's closet with an editor role).
4. **Borrowing requires an app account.** `borrow_requests.borrower_user_id` is a real FK to a user — maximizes the install/viral loop. No free-text borrower fallback (deprecates the old E2 free-text loan).

---

## Entity-relationship overview

```
auth.users (Supabase)
   │ 1:1
profiles ──────────────┐
   │                   │ functional (private): machine, lifestyle
   │                   └ social (shareable): display_name, photo
   │
   │  *:*  (closet_members: role = owner|editor|stylist|viewer)
   ├──────────────► closets ◄────────── locations (per user/household)
   │                   │ 1:*                 ▲
   │                   ▼                     │ *:1 (optional)
   │                 items ──────────────────┘
   │                   │ 1:*
   │                   ├──► item_materials   (fiber + percentage — normalized)
   │                   │
   │  connections (*:*  user↔user, friendship graph)
   ├──────────────►  shares      (closet shared → user; refined by item privacy)
   └──────────────►  borrow_requests (borrower_user_id → owner, item)
```

**The load-bearing boundary (RLS):** every item/closet policy keys on **"is the requesting user a row in `closet_members` for this item's `closet_id`?"** Read-sharing adds: *"…OR this closet is in `shares` to me AND the item is not `is_private`."*

---

## v1 tables — build in the #2 cloud-database sprint

These are the spine. Ship them first; they rarely change.

### `profiles` (1:1 with `auth.users`)
```
id              uuid  PK  → auth.users.id
display_name    text                    -- social (shareable)
photo_url       text                    -- social
settings        jsonb default '{}'      -- functional (private): machine_size, lifestyle — see E12
created_at      timestamptz default now()
```
> Functional vs. social split is enforced in the API/RLS, not separate tables (cheap to split later if needed).

### `closets`
```
id              uuid PK default gen_random_uuid()
name            text not null           -- "My Closet", "Kid's Closet", "Husband's"
created_by      uuid → profiles.id
created_at      timestamptz default now()
```
> No single `owner_id` — ownership lives in `closet_members` (co-ownership).

### `closet_members` (user ↔ closet, many-to-many)
```
closet_id       uuid → closets.id
user_id         uuid → profiles.id
role            text not null           -- 'owner' | 'editor' | 'stylist' | 'viewer'
joined_at       timestamptz default now()
PRIMARY KEY (closet_id, user_id)
```

### `locations`
```
id              uuid PK
owner_user_id   uuid → profiles.id      -- household/account scope (see open Q on stylists)
label           text not null           -- "Summer home", "Primary residence", "Storage unit"
kind            text                    -- 'home' | 'storage' | 'suitcase' | 'other'
created_at      timestamptz default now()
```

### `items`
```
id              uuid PK default gen_random_uuid()
closet_id       uuid not null → closets.id      -- WHOSE (axis 1)
location_id     uuid          → locations.id    -- WHERE (axis 2, nullable)
name            text not null
category        text not null                   -- consider a reference table (swim, etc.)
brand           text
color           text
size            text
purchase_price  numeric
purchase_date   date
retailer        text
source          text                            -- 'manual' | 'gmail_import' | 'camera'
condition       text
on_sale         boolean default false
image_url       text                            -- → Storage, not base64 (E1-2.x)
notes           text
created_at      timestamptz default now()
updated_at      timestamptz default now()
-- feature columns added by migration in later waves (all nullable):
-- E4(#4 Inventory): status, fit, measurements
-- E11(#6 Laundry):  worn_count, last_worn_at, weight, volume
-- E4(#7 Sharing):   is_private, is_lendable
```

### `item_materials` (item 1:* — **normalized on purpose**)
```
item_id         uuid → items.id
fiber           text not null           -- 'cotton', 'viscose', ...
percentage      int                     -- 0–100
PRIMARY KEY (item_id, fiber)
```
> Normalizing the `MaterialBlend[]` enables **"filter by cotton, sort by blend % desc"** as native SQL (`E0-2.3`), and feeds the E11 weight/volume density calc.

---

## Deferred tables — design now, build by migration when the feature lands

Reserve the shape so v1 `items`/`closets` don't paint into a corner. **Do not build yet.**

### `connections` (friendship graph — #7 Sharing)
```
id, user_a → profiles.id, user_b → profiles.id,
status text ('pending'|'connected'), created_at
```

### `shares` (closet shared with a connection — #7 Sharing)
```
id, closet_id → closets.id, shared_with_user_id → profiles.id,
scope text (default 'read'), created_at
```
> Grain = **closet-level share, refined by per-item `is_private` + category defaults** (intimates/underwear private by default). See open question.

### `borrow_requests` (#7 Sharing — account-required borrower)
```
id, item_id → items.id,
borrower_user_id uuid not null → profiles.id,   -- account REQUIRED
owner_user_id    uuid not null → profiles.id,
status text ('pending'|'accepted'|'declined'|'returned'),
message text, requested_at, responded_at, returned_at, due_back
```

---

## What's cheap vs. expensive (the v2-services answer)

- **Version the services freely.** The `ClosetRepository` seam means API methods are added incrementally; you do **not** need every method or column now.
- **Cheap (add anytime via migration):** nullable columns (measurements, fit, weight, status), new enum values (swim category, new statuses), new lookup tables, splitting JSONB into columns later.
- **Expensive (locked above, change now or pay later):** the FK graph — item→closet, closet↔user membership, the two-axis location, and the sharing/borrow join tables.

---

## Open questions (don't block v1 — resolve before #7 Sharing)

1. **Share grain confirm.** Proposed: share a *whole closet* (read), refined by per-item `is_private` + category defaults. Alternative: per-item or per-category shares. Closet-level is simpler and matches "Our Closet." Confirm?
2. **Location scope under stylists.** `locations.owner_user_id` assumes a household/account. A stylist managing many clients' closets complicates "whose locations." Acceptable to scope locations to the closet's creating user for v1 and revisit for pro/stylist tier?
3. **Measurements storage.** Proposed: `measurements jsonb` = `{ waist, chest, hips, length }` as numbers in a canonical unit (cm), display-converted to in/cm. Sparse + non-relational → JSONB fits. Alternative: discrete nullable columns. JSONB unless you'll query/sort by a measurement.
4. **Category as enum vs. reference table.** Adding `swim` was a hardcoded-list chore. A `categories` reference table makes future additions data, not code. Worth it?
