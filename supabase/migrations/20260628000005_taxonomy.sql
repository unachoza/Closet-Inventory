-- ============================================================================
-- E2 US-2.10 Taxonomy: season · occasion · vibe (20260628000005)
--
-- tag_vocab  — controlled vocabulary (editable content, not hard-coded enums)
-- item_tags  — many-to-many: item ↔ tag (an item can carry multiple tags of each kind)
--
-- Seeded with the initial vocab from the E2 epic + data-model doc. New entries
-- are inserted via migration (or admin UI) as the vocab grows — never hard-coded
-- in application code (see [[closet-hardcoded-ui-lists]] memory).
-- ============================================================================

-- ── tag_vocab ────────────────────────────────────────────────────────────────
create table if not exists public.tag_vocab (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('season', 'occasion', 'vibe')),
  label      text not null,
  sort_order int  not null default 0,
  unique (kind, label)
);

-- ── item_tags ─────────────────────────────────────────────────────────────────
create table if not exists public.item_tags (
  item_id  uuid not null references public.items (id) on delete cascade,
  tag_id   uuid not null references public.tag_vocab (id) on delete cascade,
  primary key (item_id, tag_id)
);

create index if not exists item_tags_tag_idx on public.item_tags (tag_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.tag_vocab enable row level security;
alter table public.item_tags  enable row level security;

-- tag_vocab is read-only for all authenticated users (shared controlled list)
create policy tag_vocab_select_authed on public.tag_vocab
  for select to authenticated using (true);

-- item_tags: same membership gate as items
create policy item_tags_all_member on public.item_tags
  for all
  using (exists (
    select 1 from public.items i
    where i.id = item_id
      and public.is_closet_member(i.closet_id)
  ))
  with check (exists (
    select 1 from public.items i
    where i.id = item_id
      and public.is_closet_member(i.closet_id)
  ));

-- ── Seed vocab ───────────────────────────────────────────────────────────────

-- season
insert into public.tag_vocab (kind, label, sort_order) values
  ('season', 'spring', 1),
  ('season', 'summer', 2),
  ('season', 'fall',   3),
  ('season', 'winter', 4)
on conflict (kind, label) do nothing;

-- occasion
insert into public.tag_vocab (kind, label, sort_order) values
  ('occasion', 'everyday',    1),
  ('occasion', 'work',        2),
  ('occasion', 'workout',     3),
  ('occasion', 'date night',  4),
  ('occasion', 'cocktail',    5),
  ('occasion', 'formal',      6),
  ('occasion', 'vacation',    7),
  ('occasion', 'beach',       8),
  ('occasion', 'brunch',      9),
  ('occasion', 'wedding',     10)
on conflict (kind, label) do nothing;

-- vibe
insert into public.tag_vocab (kind, label, sort_order) values
  ('vibe', 'casual',     1),
  ('vibe', 'elevated',   2),
  ('vibe', 'fancy',      3),
  ('vibe', 'sexy',       4),
  ('vibe', 'sporty',     5),
  ('vibe', 'preppy',     6),
  ('vibe', 'boho',       7),
  ('vibe', 'minimalist', 8),
  ('vibe', 'edgy',       9)
on conflict (kind, label) do nothing;
