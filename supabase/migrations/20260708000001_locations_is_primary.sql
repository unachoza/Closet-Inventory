-- ============================================================================
-- E12-3.1 — `locations.is_primary` for custom / multi-home locations (20260708000001)
--
-- Today "home" is inferred client-side from `kind = 'home'` (see
-- src/utils/locations.ts PRIMARY_LOCATION). That breaks the moment a user has
-- TWO locations of kind 'home' (Sloane's Nolita apartment AND a second home
-- she also calls "home") — kind can't disambiguate which one is primary.
--
-- This is the one schema change E12/E2 custom-location work needs; everything
-- else (manager UI, onboarding capture, card picker, filters) is client-side
-- on top of the already-per-user, RLS-scoped `locations` table.
--
-- Invariant: at most one is_primary=true row per owner_user_id, enforced by a
-- partial unique index (not a CHECK — CHECK can't reference other rows).
-- ============================================================================

alter table public.locations
	add column if not exists is_primary boolean not null default false;

-- Backfill: promote each user's existing 'home' row (the locationSync.ts
-- starter seed) to primary. Table verified near-empty on prod+dev as of
-- 2026-07-08, so this is a small, safe backfill — not a data migration risk.
update public.locations
set is_primary = true
where kind = 'home'
	and id in (
		select distinct on (owner_user_id) id
		from public.locations
		where kind = 'home'
		order by owner_user_id, created_at asc
	);

-- At most one primary per user. Partial (only true rows) so it's a no-op cost
-- for the common false case and doesn't block a user with zero locations yet.
create unique index if not exists locations_owner_primary_uniq
	on public.locations (owner_user_id)
	where is_primary;
