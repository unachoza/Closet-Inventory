import { getSupabase } from '../lib/supabaseClient';

export interface EnrichmentResult {
  description: string | null;
  features: string[];
  materialsRaw: string | null;
  careRaw: string | null;
  fitInfo: string | null;
  sizeEquiv: string | null;
  pdpUrl: string | null;
  source: string;
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

export async function enrichFromRetailer(
  brand: string,
  name: string,
  itemNumber?: string,
  retailer?: string,
): Promise<EnrichmentResult> {
  const supabase = getSupabase();

  const { data, error } = await supabase.functions.invoke<EnrichResponse>(
    'enrich',
    {
      body: { brand, name, itemNumber, retailer },
    },
  );

  if (error || !data?.success || !data.data) {
    throw new Error(data?.error ?? error?.message ?? 'Enrichment failed');
  }

  return {
    ...data.data,
    source: data.source ?? 'unknown',
  };
}
