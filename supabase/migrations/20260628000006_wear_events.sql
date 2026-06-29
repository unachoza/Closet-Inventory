-- ============================================================================
-- E11 / E2 wear_events table (20260628000006)
--
-- E11 owns the write path ("Log a Wear" UI).
-- E2 references it for the taxonomy (occasion_tag_id) and for worn-photo linking.
-- The shape is reserved now so neither epic paints the schema into a corner.
--
-- items.worn_count + items.last_worn_at are cached rollups of this table;
-- the trigger below keeps them current.
-- ============================================================================

create table if not exists public.wear_events (
  id               uuid primary key default gen_random_uuid(),
  item_id          uuid        not null references public.items (id) on delete cascade,
  worn_at          date        not null default current_date,
  occasion_tag_id  uuid        references public.tag_vocab (id) on delete set null,
  photo_id         uuid        references public.item_photos (id) on delete set null,
  note             text,
  created_at       timestamptz not null default now()
);

create index if not exists wear_events_item_idx    on public.wear_events (item_id);
create index if not exists wear_events_worn_at_idx on public.wear_events (item_id, worn_at desc);

-- ── RLS: inherit parent item's closet membership ─────────────────────────────
alter table public.wear_events enable row level security;

create policy wear_events_all_member on public.wear_events
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

-- ── Trigger: keep items.worn_count + last_worn_at in sync ───────────────────
create or replace function public.refresh_wear_rollup()
returns trigger
language plpgsql
as $$
declare
  _item_id uuid;
begin
  _item_id := coalesce(new.item_id, old.item_id);

  update public.items
  set
    worn_count   = (select count(*)    from public.wear_events where item_id = _item_id),
    last_worn_at = (select max(worn_at) from public.wear_events where item_id = _item_id),
    updated_at   = now()
  where id = _item_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists wear_events_refresh_rollup on public.wear_events;
create trigger wear_events_refresh_rollup
  after insert or update or delete on public.wear_events
  for each row execute function public.refresh_wear_rollup();
