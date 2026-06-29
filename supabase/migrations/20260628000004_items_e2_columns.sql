-- ============================================================================
-- E1 + E2 nullable columns on items (20260628000004)
--
-- Fills two gap categories:
--   1. `status` — promised in E1-1.2 ("include status/location columns so sync
--      needs no later migration") but omitted from the v1 spine.
--   2. E2 Inventory-Truth columns: fit (item-level, not style.fit), measurements,
--      provenance, privacy, lending flags, and the ClothingItem fields that were
--      missing from the spine (care, occasion, qty, style, enrichment).
--
-- All columns are nullable / have defaults so no backfill is required.
-- E11 columns (worn_count, last_worn_at) are reserved here because they live on
-- `items` as cached rollups; E11 owns the write path via wear_events (migration 06).
-- E4 privacy columns (is_private, is_lendable) are seeded here because E2's
-- is_sentimental drives their defaults.
-- ============================================================================

-- ── E1 gap: status (should have been in v1 spine) ───────────────────────────
-- Enum values: E11 owns clean/dirty; E2 extends with the rest.
alter table public.items
  add column if not exists status text
    check (status in (
      'clean', 'dirty',               -- E11 (US-11.1)
      'at_cleaner', 'in_repair',      -- E2 (US-2.1)
      'traveling', 'on_loan'          -- E2 (US-2.1 / US-2.5)
    ));

-- ── E2 US-2.8: item-level fit (does this item fit me right now?) ─────────────
-- Distinct from style.fit (a style descriptor like "relaxed fit").
alter table public.items
  add column if not exists item_fit text
    check (item_fit in ('fits', 'too_big', 'too_small', 'unknown'));

-- measurements: { waist?, chest?, hips?, length? } each { value: number; unit: 'in'|'cm' }
alter table public.items
  add column if not exists measurements jsonb;

-- ── E2 US-2.11: provenance, origin & sentiment ───────────────────────────────
alter table public.items
  add column if not exists acquisition_type text
    check (acquisition_type in (
      'bought', 'gifted', 'inherited', 'hand_me_down',
      'thrifted', 'resale', 'borrowed'
    ));

alter table public.items
  add column if not exists country_of_origin text;

-- is_sentimental defaults is_private=true + is_lendable=false (see trigger below)
alter table public.items
  add column if not exists is_sentimental boolean not null default false;

alter table public.items
  add column if not exists is_high_value boolean not null default false;

-- ── E4 columns seeded early because is_sentimental drives the defaults ───────
alter table public.items
  add column if not exists is_private boolean not null default false;

alter table public.items
  add column if not exists is_lendable boolean not null default true;

-- ── ClothingItem fields missing from the v1 spine ───────────────────────────
alter table public.items
  add column if not exists occasion text;        -- legacy; migrated to item_tags in E2-10.3

alter table public.items
  add column if not exists care text[] not null default '{}';

alter table public.items
  add column if not exists qty int;

-- style: ProductAttributes object from FashionParser / inferProductAttributes
alter table public.items
  add column if not exists style jsonb;

-- enrichment: EnrichResponse.data — kept loose until enrichment-v2.2 stabilises
alter table public.items
  add column if not exists enrichment jsonb;

-- ── E11 cached rollup columns (reserved here; E11 owns the write path) ───────
alter table public.items
  add column if not exists worn_count int not null default 0;

alter table public.items
  add column if not exists last_worn_at date;

-- ── E2 US-2.5: free-text loan (account-based borrow_requests is E4) ──────────
-- Stored as a jsonb object: { borrowerName, since, dueBack? }
alter table public.items
  add column if not exists loan jsonb;

-- ── Trigger: sentimental → private + not lendable (immutable rule) ───────────
create or replace function public.apply_sentimental_defaults()
returns trigger
language plpgsql
as $$
begin
  if new.is_sentimental = true then
    new.is_private  := true;
    new.is_lendable := false;
  end if;
  return new;
end;
$$;

drop trigger if exists items_sentimental_defaults on public.items;
create trigger items_sentimental_defaults
  before insert or update of is_sentimental on public.items
  for each row execute function public.apply_sentimental_defaults();
