-- ============================================================================
-- CRITICAL FIX (found 2026-06-29 while building the E1-4.2 RLS isolation test)
--
-- Every table in `public` was created with NO Postgres GRANTs to anon/
-- authenticated/service_role — confirmed via a real signed-in test user
-- getting `permission denied for table X` (Postgres error 42501) on every
-- single table, even service_role. This is a layer BELOW RLS: Postgres
-- checks table-level privileges before RLS policies ever run. No grant ⇒
-- RLS is irrelevant ⇒ the query is rejected outright.
--
-- This means: as of this migration, NO real signed-in user has ever been
-- able to successfully read or write their own data through the anon/
-- authenticated roles. Cloud sync, image-path persistence, and everything
-- else gated on `getSupabase()` table calls has been silently broken in
-- production this whole time — this is almost certainly why no live sync
-- round-trip has ever been confirmed (see launch roadmap Block 0 / G0.3).
--
-- Granting table privileges does NOT bypass RLS — it's a separate, lower
-- layer. RLS policies (already written in 20260626000002_rls.sql) still
-- filter rows after this grant; this just lets the roles attempt the query
-- at all. Re-run `scripts/test-rls-isolation.mjs` after applying this to
-- confirm isolation still holds once queries can actually execute.
-- ============================================================================

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant all on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to anon, authenticated, service_role;

grant execute on all functions in schema public to anon, authenticated, service_role;

-- Make this durable: any table/sequence/function created by a FUTURE migration
-- (without an explicit GRANT) inherits these same baseline privileges, so this
-- class of bug can't silently recur.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant execute on functions to anon, authenticated, service_role;
