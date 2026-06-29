-- ============================================================================
-- NTW v1 relational spine (E1-1.2)
-- Maps 1:1 onto planning/backend/DATA_MODEL_2026-06-24.md "v1 tables".
--
-- Locked decisions honored here:
--   1. Closet owns items; user owns closets (via closet_members).
--   2. closet (whose) and location (where) are independent axes on items.
--   3. Closets are co-owned (closet_members, many-to-many, with role).
--   4. Photos are a 1:* table (item_photos), NOT a single image_url column.
--   5. Materials are normalized (item_materials) for "filter by fiber, sort by %".
--
-- Feature columns (status, fit, measurements, worn_count, is_private, tags,
-- wear_events, sharing/borrow tables) are added by LATER migrations as their
-- epics land (#4/#5/#6/#7) — see the data-model doc. This file is the spine only.
-- ============================================================================

-- ── profiles (1:1 with auth.users) ──────────────────────────────────────────
create table if not exists public.profiles (
	id            uuid primary key references auth.users (id) on delete cascade,
	display_name  text,
	photo_url     text,
	settings      jsonb       not null default '{}'::jsonb,  -- functional/private (E12)
	created_at    timestamptz not null default now()
);

-- ── closets ─────────────────────────────────────────────────────────────────
create table if not exists public.closets (
	id          uuid primary key default gen_random_uuid(),
	name        text        not null,
	created_by  uuid        not null references public.profiles (id) on delete cascade,
	created_at  timestamptz not null default now()
);

-- ── closet_members (user ↔ closet, many-to-many, with role) ─────────────────
create table if not exists public.closet_members (
	closet_id  uuid        not null references public.closets (id) on delete cascade,
	user_id    uuid        not null references public.profiles (id) on delete cascade,
	role       text        not null check (role in ('owner', 'editor', 'stylist', 'viewer')),
	joined_at  timestamptz not null default now(),
	primary key (closet_id, user_id)
);
create index if not exists closet_members_user_idx on public.closet_members (user_id);

-- ── locations (physical place; per user/household) ──────────────────────────
create table if not exists public.locations (
	id             uuid primary key default gen_random_uuid(),
	owner_user_id  uuid        not null references public.profiles (id) on delete cascade,
	label          text        not null,
	kind           text        check (kind in ('primary_residence', 'secondary_residence', 'storage_unit', 'traveling', 'other')),
	created_at     timestamptz not null default now()
);
create index if not exists locations_owner_idx on public.locations (owner_user_id);

-- ── items ───────────────────────────────────────────────────────────────────
create table if not exists public.items (
	id                uuid primary key default gen_random_uuid(),
	closet_id         uuid        not null references public.closets (id) on delete cascade,    -- WHOSE
	location_id       uuid        references public.locations (id) on delete set null,          -- WHERE (nullable)
	name              text        not null,
	category          text        not null,   -- open Q#4: reference table vs. text; text for v1
	brand             text,
	color             text,
	size              text,
	purchase_price    numeric,
	original_price    numeric,
	purchase_date     date,
	retailer          text,
	source            text        check (source in ('manual', 'gmail_import', 'hotmail_import', 'yahoo_import', 'camera', 'chrome_ext')),
	condition         text,
	on_sale           boolean     not null default false,
	notes             text[]      not null default '{}',
	primary_photo_url text,                    -- denormalized cache of the default item_photos row
	created_at        timestamptz not null default now(),
	updated_at        timestamptz not null default now()
);
create index if not exists items_closet_idx on public.items (closet_id);
create index if not exists items_location_idx on public.items (location_id);

-- ── item_photos (item 1:*, replaces image_url; url → Storage, not base64) ────
create table if not exists public.item_photos (
	id          uuid primary key default gen_random_uuid(),
	item_id     uuid        not null references public.items (id) on delete cascade,
	url         text        not null,
	kind        text        check (kind in ('retailer', 'worn', 'detail')),
	is_default  boolean     not null default false,
	created_at  timestamptz not null default now()
);
create index if not exists item_photos_item_idx on public.item_photos (item_id);

-- ── item_materials (item 1:*, normalized fiber blend) ───────────────────────
create table if not exists public.item_materials (
	item_id     uuid not null references public.items (id) on delete cascade,
	fiber       text not null,
	percentage  int  check (percentage between 0 and 100),
	primary key (item_id, fiber)
);

-- ── updated_at trigger for items ────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
	before update on public.items
	for each row execute function public.set_updated_at();

-- ── new-user bootstrap: profile + a default personal closet + owner membership ─
-- Gives every signup a closet to seed into (E1-1.5 first-sign-in seed writes here).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
	new_closet_id uuid;
begin
	insert into public.profiles (id, display_name, photo_url)
	values (
		new.id,
		coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email),
		new.raw_user_meta_data ->> 'avatar_url'
	)
	on conflict (id) do nothing;

	insert into public.closets (name, created_by)
	values ('My Closet', new.id)
	returning id into new_closet_id;

	insert into public.closet_members (closet_id, user_id, role)
	values (new_closet_id, new.id, 'owner');

	return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
	after insert on auth.users
	for each row execute function public.handle_new_user();
