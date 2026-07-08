-- ============================================================================
-- E2-sync.1 — align `locations.kind` with the client registry (20260707000002)
--
-- The v1 spine shipped kind IN ('primary_residence','secondary_residence',
-- 'storage_unit','traveling','other'), but the shipped client vocabulary
-- (src/utils/locations.ts, per WardrobeStatusAndLocation spec) is
-- 'home' | 'storage' | 'suitcase' | 'other'. The client now seeds its starter
-- locations into this table on first sync (locationSync.ts), so the CHECK must
-- accept the client kinds. Table is empty on prod + dev (verified 2026-07-06:
-- 0 rows) — no backfill needed.
--
-- Also adds a per-user label uniqueness guard so concurrent first-sync seeding
-- from two devices can't create duplicate starter rows.
-- ============================================================================

alter table public.locations
	drop constraint if exists locations_kind_check;

alter table public.locations
	add constraint locations_kind_check
	check (kind in ('home', 'storage', 'suitcase', 'other'));

-- One label per user (case-insensitive): guards duplicate starter seeds and
-- doubles as the natural constraint for user-defined locations (P1-6).
create unique index if not exists locations_owner_label_uniq
	on public.locations (owner_user_id, lower(label));
