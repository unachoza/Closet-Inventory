-- ============================================================================
-- Product enrichment cache (v2.2)
--
-- Stores scraped product details from retailer sites to avoid re-fetching.
-- Independent of the main item schema — references items by retailer + item_key,
-- not by item UUID. Multiple items can share the same cached product data.
--
-- Missing columns that will be added by later migrations (Epic #4 Inventory):
--   - items.fit           (text)   — e.g. "Tight", "Oversized"
--   - items.measurements  (jsonb)  — body measurements keyed by size
--   - items.season        (text[]) — e.g. '{spring, summer}'
--   - items.hem_length    (text)   — e.g. "Mini", "Midi", "Maxi"
--   - items.neckline      (text)   — e.g. "Crew", "V-neck"
--   - items.sleeve_length (text)   — e.g. "Sleeveless", "Long"
-- When those columns exist, enrichment results will write directly to them.
-- Until then, enriched attributes are inferred client-side from the cached text.
-- ============================================================================

create table if not exists public.product_enrichment_cache (
    id             uuid primary key default gen_random_uuid(),
    retailer       text        not null,
    item_key       text        not null,
    pdp_url        text,
    description    text,
    features       text[]      not null default '{}',
    materials_raw  text,
    care_raw       text,
    fit_info       text,
    size_equiv     text,
    json_ld        jsonb,
    fetched_at     timestamptz not null default now(),
    unique(retailer, item_key)
);

create index if not exists enrichment_cache_retailer_idx
    on public.product_enrichment_cache (retailer);

-- No RLS on the cache — it's product data, not user data.
-- The Edge Function accesses it with the service_role key.
