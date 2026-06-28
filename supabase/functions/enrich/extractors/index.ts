import { extractAritzia } from "./aritzia.ts";
import { extractAnthropologie } from "./anthropologie.ts";
import { extractGeneric } from "./generic.ts";

export interface ExtractedProduct {
  description: string | null;
  features: string[];
  materialsRaw: string | null;
  careRaw: string | null;
  fitInfo: string | null;
  sizeEquiv: string | null;
  jsonLd: Record<string, unknown> | null;
}

const RETAILER_EXTRACTORS: Record<
  string,
  (html: string) => Partial<ExtractedProduct>
> = {
  aritzia: extractAritzia,
  babaton: extractAritzia,
  tna: extractAritzia,
  "wilfred free": extractAritzia,
  wilfred: extractAritzia,
  anthropologie: extractAnthropologie,
};

export function extractProductData(
  html: string,
  retailer: string,
): ExtractedProduct {
  const generic = extractGeneric(html);
  const specific = RETAILER_EXTRACTORS[retailer]?.(html) ?? {};

  return {
    description: specific.description ?? generic.description,
    features: specific.features ?? generic.features ?? [],
    materialsRaw: specific.materialsRaw ?? generic.materialsRaw,
    careRaw: specific.careRaw ?? generic.careRaw,
    fitInfo: specific.fitInfo ?? generic.fitInfo,
    sizeEquiv: specific.sizeEquiv ?? generic.sizeEquiv,
    jsonLd: generic.jsonLd,
  };
}
