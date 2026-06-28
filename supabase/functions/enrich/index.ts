import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { extractProductData } from "./extractors/index.ts";
import { resolveProductUrl, resolveSearchUrl, extractProductUrlFromSearch } from "./url-resolver.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SCRAPINGBEE_API_KEY = Deno.env.get("SCRAPINGBEE_API_KEY")!;

const CACHE_TTL_DAYS = 90;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

interface EnrichRequest {
  brand: string;
  name: string;
  itemNumber?: string;
  retailer?: string;
  size?: string;
}

interface EnrichResponse {
  success: boolean;
  source?: string;
  data?: {
    description: string | null;
    features: string[];
    materialsRaw: string | null;
    careRaw: string | null;
    fitInfo: string | null;
    sizeEquiv: string | null;
    pdpUrl: string | null;
  };
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "POST only" }, 405);
  }

  let body: EnrichRequest;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON" }, 400);
  }

  if (!body.brand || !body.name) {
    return jsonResponse(
      { success: false, error: "brand and name are required" },
      400,
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const retailer = (body.retailer ?? body.brand).toLowerCase().trim();
  const itemKey = body.itemNumber ?? slugify(body.name);

  // Check cache
  const { data: cached } = await supabase
    .from("product_enrichment_cache")
    .select("*")
    .eq("retailer", retailer)
    .eq("item_key", itemKey)
    .single();

  if (cached && !isExpired(cached.fetched_at)) {
    return jsonResponse({
      success: true,
      source: "cache",
      data: {
        description: cached.description,
        features: cached.features ?? [],
        materialsRaw: cached.materials_raw,
        careRaw: cached.care_raw,
        fitInfo: cached.fit_info,
        sizeEquiv: cached.size_equiv,
        pdpUrl: cached.pdp_url,
      },
    });
  }

  // Resolve product URL (direct template, or search fallback)
  let pdpUrl = resolveProductUrl(retailer, body.name, body.itemNumber);

  let html: string;

  if (!pdpUrl) {
    const searchUrl = resolveSearchUrl(retailer, body.name, body.itemNumber);
    if (!searchUrl) {
      return jsonResponse({
        success: false,
        error: "Could not resolve product URL",
      });
    }

    let searchHtml: string;
    try {
      searchHtml = await fetchWithScrapingBee(searchUrl);
    } catch (err) {
      return jsonResponse({
        success: false,
        error: `Search scrape failed: ${String(err)}`,
      });
    }

    pdpUrl = extractProductUrlFromSearch(searchHtml, retailer);
    if (!pdpUrl) {
      return jsonResponse({
        success: false,
        error: "Product not found in search results",
      });
    }
  }

  // Fetch product page via ScrapingBee (HTML-only, no JS rendering)
  try {
    html = await fetchWithScrapingBee(pdpUrl);
  } catch (err) {
    return jsonResponse({
      success: false,
      error: `Scraping failed: ${String(err)}`,
    });
  }

  // Extract product data
  const extracted = extractProductData(html, retailer);

  // Cache the result
  await supabase.from("product_enrichment_cache").upsert(
    {
      retailer,
      item_key: itemKey,
      pdp_url: pdpUrl,
      description: extracted.description,
      features: extracted.features,
      materials_raw: extracted.materialsRaw,
      care_raw: extracted.careRaw,
      fit_info: extracted.fitInfo,
      size_equiv: extracted.sizeEquiv,
      json_ld: extracted.jsonLd,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "retailer,item_key" },
  );

  return jsonResponse({
    success: true,
    source: pdpUrl,
    data: {
      description: extracted.description,
      features: extracted.features,
      materialsRaw: extracted.materialsRaw,
      careRaw: extracted.careRaw,
      fitInfo: extracted.fitInfo,
      sizeEquiv: extracted.sizeEquiv,
      pdpUrl,
    },
  });
});

async function fetchWithScrapingBee(url: string): Promise<string> {
  const params = new URLSearchParams({
    api_key: SCRAPINGBEE_API_KEY,
    url,
    render_js: "false",
    premium_proxy: "true",
  });

  const response = await fetch(
    `https://app.scrapingbee.com/api/v1?${params}`,
  );

  if (!response.ok) {
    throw new Error(`ScrapingBee returned ${response.status}`);
  }

  return response.text();
}

function isExpired(fetchedAt: string): boolean {
  const fetched = new Date(fetchedAt).getTime();
  const ttl = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - fetched > ttl;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function jsonResponse(body: EnrichResponse, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
