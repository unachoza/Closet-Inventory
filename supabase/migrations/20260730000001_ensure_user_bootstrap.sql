-- Self-heal for accounts missing their bootstrap rows, + one-time backfill.
--
-- Why: `handle_new_user()` (20260626000001_v1_spine.sql) seeds three rows on
-- signup — profiles, closets, closet_members. Any auth.users row created when
-- that trigger was absent or failing is stranded: `getProfile()` uses
-- `.single()`, which errors PGRST116 on zero rows, and there is no closet to
-- load. The known case is the 2026-06-25 signup, which predates the June 26
-- v1_spine migration by one day — the trigger did not exist yet, so it never
-- ran. That account has profiles=0, closets=0, closet_members=0.
--
-- A one-off backfill fixes today's orphan but nothing stops the next one, so
-- this ships both: an idempotent RPC the client can call after sign-in, and a
-- backfill that replays the trigger for every existing user.
--
-- Security: the RPC takes NO user-id argument — it acts only on `auth.uid()`,
-- so a caller can never bootstrap (or overwrite) somebody else's rows. EXECUTE
-- is granted to `authenticated` only; `anon` is explicitly revoked, unlike the
-- pre-existing SECURITY DEFINER functions flagged by the security advisor.

create or replace function public.ensure_user_bootstrap()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	uid           uuid := auth.uid();
	u             record;
	new_closet_id uuid;
begin
	if uid is null then
		raise exception 'ensure_user_bootstrap: no authenticated user';
	end if;

	select id, email, raw_user_meta_data into u from auth.users where id = uid;

	-- Same precedence as handle_new_user(): full_name → name → email.
	insert into public.profiles (id, display_name, photo_url)
	values (
		u.id,
		coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', u.email),
		u.raw_user_meta_data ->> 'avatar_url'
	)
	on conflict (id) do nothing;

	-- Membership is the guard, not closet ownership: a user invited to someone
	-- else's closet already has a usable workspace and must not get a second
	-- "My Closet" minted on every call.
	if not exists (select 1 from public.closet_members where user_id = u.id) then
		insert into public.closets (name, created_by)
		values ('My Closet', u.id)
		returning id into new_closet_id;

		insert into public.closet_members (closet_id, user_id, role)
		values (new_closet_id, u.id, 'owner');
	end if;
end;
$$;

revoke all on function public.ensure_user_bootstrap() from public;
revoke all on function public.ensure_user_bootstrap() from anon;
grant execute on function public.ensure_user_bootstrap() to authenticated;

-- ── One-time backfill ───────────────────────────────────────────────────────
-- Replays the same logic for every existing auth.users row. Idempotent: users
-- who already have their rows are untouched, so this is safe to re-run.
do $$
declare
	u             record;
	new_closet_id uuid;
begin
	for u in select id, email, raw_user_meta_data from auth.users loop
		insert into public.profiles (id, display_name, photo_url)
		values (
			u.id,
			coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', u.email),
			u.raw_user_meta_data ->> 'avatar_url'
		)
		on conflict (id) do nothing;

		if not exists (select 1 from public.closet_members where user_id = u.id) then
			insert into public.closets (name, created_by)
			values ('My Closet', u.id)
			returning id into new_closet_id;

			insert into public.closet_members (closet_id, user_id, role)
			values (new_closet_id, u.id, 'owner');
		end if;
	end loop;
end;
$$;
