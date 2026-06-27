-- ============================================================================
-- NTW v1 Row-Level Security (E1-1.3) — owner/member only
--
-- The load-bearing boundary (per the data-model doc): every closet/item policy
-- keys on "is the requesting user a row in closet_members for this closet?".
--
-- Read-sharing ("...OR this closet is in `shares` to me AND item not is_private")
-- is deliberately NOT here — `shares` and `items.is_private` arrive with the #7
-- Sharing epic. v1 is strictly member-only.
--
-- Recursion note: closet/item policies must check membership WITHOUT triggering
-- RLS on closet_members (which would recurse). The is_closet_member() helper is
-- SECURITY DEFINER, so it reads closet_members with RLS bypassed.
-- ============================================================================

-- ── membership helper (RLS-safe) ────────────────────────────────────────────
create or replace function public.is_closet_member(_closet_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
	select exists (
		select 1
		from public.closet_members m
		where m.closet_id = _closet_id
		  and m.user_id = auth.uid()
	);
$$;

-- ── enable RLS on every spine table ─────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.closets        enable row level security;
alter table public.closet_members enable row level security;
alter table public.locations      enable row level security;
alter table public.items          enable row level security;
alter table public.item_photos    enable row level security;
alter table public.item_materials enable row level security;

-- ── profiles: a user reads/writes only their own profile (v1) ───────────────
-- (Connection-based reads of other profiles arrive with #7 Sharing.)
create policy profiles_select_own on public.profiles
	for select using (id = auth.uid());
create policy profiles_update_own on public.profiles
	for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_insert_own on public.profiles
	for insert with check (id = auth.uid());

-- ── closets: visible to members; creatable by self; mutable by members ──────
create policy closets_select_member on public.closets
	for select using (public.is_closet_member(id));
create policy closets_insert_creator on public.closets
	for insert with check (created_by = auth.uid());
create policy closets_update_member on public.closets
	for update using (public.is_closet_member(id)) with check (public.is_closet_member(id));
create policy closets_delete_member on public.closets
	for delete using (public.is_closet_member(id));

-- ── closet_members: a user sees membership rows for closets they belong to ──
create policy closet_members_select on public.closet_members
	for select using (public.is_closet_member(closet_id));
-- Self-join (accept invite) or existing member adds others. Invite/role flows
-- are refined in #7; v1 allows a member to manage membership of their closet.
create policy closet_members_insert on public.closet_members
	for insert with check (user_id = auth.uid() or public.is_closet_member(closet_id));
create policy closet_members_delete on public.closet_members
	for delete using (public.is_closet_member(closet_id));

-- ── locations: owner-scoped (v1; stylist scope is open Q#2) ──────────────────
create policy locations_all_own on public.locations
	for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

-- ── items: gated by membership of the item's closet ─────────────────────────
create policy items_select_member on public.items
	for select using (public.is_closet_member(closet_id));
create policy items_insert_member on public.items
	for insert with check (public.is_closet_member(closet_id));
create policy items_update_member on public.items
	for update using (public.is_closet_member(closet_id)) with check (public.is_closet_member(closet_id));
create policy items_delete_member on public.items
	for delete using (public.is_closet_member(closet_id));

-- ── item_photos: inherit the parent item's closet membership ────────────────
create policy item_photos_all_member on public.item_photos
	for all
	using (exists (select 1 from public.items i where i.id = item_id and public.is_closet_member(i.closet_id)))
	with check (exists (select 1 from public.items i where i.id = item_id and public.is_closet_member(i.closet_id)));

-- ── item_materials: inherit the parent item's closet membership ─────────────
create policy item_materials_all_member on public.item_materials
	for all
	using (exists (select 1 from public.items i where i.id = item_id and public.is_closet_member(i.closet_id)))
	with check (exists (select 1 from public.items i where i.id = item_id and public.is_closet_member(i.closet_id)));
