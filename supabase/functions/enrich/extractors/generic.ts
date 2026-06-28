import type { ExtractedProduct } from "./index.ts";

export function extractGeneric(html: string): ExtractedProduct {
  return {
    description: extractDescription(html),
    features: [],
    materialsRaw: extractMaterials(html),
    careRaw: extractCare(html),
    fitInfo: null,
    sizeEquiv: null,
    jsonLd: extractJsonLd(html),
  };
}

function extractJsonLd(html: string): Record<string, unknown> | null {
  const matches = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  );
  if (!matches) return null;

  for (const block of matches) {
    const content = block.replace(/<\/?script[^>]*>/gi, "");
    try {
      const data = JSON.parse(content);
      const items = Array.isArray(data) ? data : [data];
      const product = items.find(
        (d: Record<string, unknown>) => d["@type"] === "Product",
      );
      if (product) return product as Record<string, unknown>;
    } catch {
      // skip malformed JSON-LD
    }
  }
  return null;
}

function extractDescription(html: string): string | null {
  // Try JSON-LD first
  const jsonLd = extractJsonLd(html);
  if (jsonLd?.description) return String(jsonLd.description);

  // Meta description fallback
  const metaMatch = html.match(
    /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
  );
  if (metaMatch) return metaMatch[1];

  const ogMatch = html.match(
    /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i,
  );
  if (ogMatch) return ogMatch[1];

  return null;
}

function extractMaterials(html: string): string | null {
  const patterns = [
    /Content:\s*([\d]+%\s*[\w\s,/]+(?:[\d]+%\s*[\w\s]+)*)/i,
    /Composition:\s*([\d]+%\s*[\w\s,/]+(?:[\d]+%\s*[\w\s]+)*)/i,
    /Material:\s*([\d]+%\s*[\w\s,/]+(?:[\d]+%\s*[\w\s]+)*)/i,
    /Fabric:\s*([\d]+%\s*[\w\s,/]+(?:[\d]+%\s*[\w\s]+)*)/i,
  ];

  for (const pat of patterns) {
    const m = html.match(pat);
    if (m) return m[1].trim();
  }

  // Broad fallback: "XX% fiber" anywhere
  const broadMatch = html.match(
    /(\d+%\s*(?:cotton|polyester|nylon|elastane|spandex|wool|silk|linen|rayon|viscose|acrylic|cashmere|modal|lyocell|tencel)[\w\s,%-]*)/i,
  );
  if (broadMatch) return broadMatch[1].trim();

  return null;
}

function extractCare(html: string): string | null {
  const patterns = [
    /Care:\s*([^<\n]+)/i,
    /Care Instructions:\s*([^<\n]+)/i,
  ];

  for (const pat of patterns) {
    const m = html.match(pat);
    if (m) return m[1].trim();
  }

  // Common care phrases
  const careMatch = html.match(
    /(?:Hand wash|Machine wash cold|Dry clean only|Machine wash|Wash cold)[^<\n]*/i,
  );
  if (careMatch) return careMatch[0].trim();

  return null;
}
