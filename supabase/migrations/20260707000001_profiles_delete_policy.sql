-- E1-4.8 — allow a user to delete their OWN profile row.
--
-- The RLS baseline (20260626000002_rls.sql) gave profiles select/update/insert
-- but no DELETE policy, so a client-side account wipe could not remove the
-- profile (name + avatar). Because `closets.created_by → profiles(id) ON DELETE
-- CASCADE`, deleting the profile cascades the entire owned graph
-- (closets → items → item_photos/materials/tags/wear_events/locations/members).
--
-- This is the RLS-scoped path for self-serve account deletion. Full identity
-- erasure (the auth.users row) still requires the service_role Edge Function
-- `delete-user-account`; deleting auth.users cascades this profile too, so the
-- two paths are compatible and idempotent.
create policy profiles_delete_own on public.profiles
	for delete using (id = auth.uid());
