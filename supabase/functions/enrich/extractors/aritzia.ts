import type { ExtractedProduct } from "./index.ts";

export function extractAritzia(html: string): Partial<ExtractedProduct> {
  const result: Partial<ExtractedProduct> = {};

  // __PRELOADED_STATE__ has the richest data (SSR'd, no JS needed)
  const preloadedMaterials = extractFromPreloadedState(html);
  if (preloadedMaterials.materialsRaw) {
    result.materialsRaw = preloadedMaterials.materialsRaw;
  }
  if (preloadedMaterials.careRaw) {
    result.careRaw = preloadedMaterials.careRaw;
  }
  if (preloadedMaterials.features) {
    result.features = preloadedMaterials.features;
  }

  // data-testid selectors (also SSR'd)
  // Grab all <p> tags inside the product description container for the full description
  const descContainerMatch = html.match(
    /data-testid="product-description"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
  );
  if (descContainerMatch) {
    const paragraphs = descContainerMatch[1].match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    if (paragraphs) {
      const texts = paragraphs.map((p) => stripHtml(p)).filter((t) => t.length > 10);
      const fullDesc = texts.join(" ").replace(/DetailsSize & Fit.*$/, "");
      if (fullDesc.length > (result.description?.length ?? 0)) {
        result.description = fullDesc;
      }
    }
  }

  if (!result.features?.length) {
    const featMatch = html.match(
      /data-testid="features-copy"[^>]*>([\s\S]*?)<\/(?:div|ul|p)>/i,
    );
    if (featMatch) {
      result.features = splitListItems(featMatch[1]);
    }
  }

  if (!result.materialsRaw) {
    const matMatch = html.match(
      /data-testid="materials-and-care-copy"[^>]*>([\s\S]*?)<\/(?:div|ul)>/i,
    );
    if (matMatch) {
      const text = stripHtml(matMatch[1]);
      const contentMatch = text.match(/Content:\s*(.+?)(?:Care:|$)/i);
      if (contentMatch) result.materialsRaw = contentMatch[1].trim();
      const careMatch = text.match(/Care:\s*(.+?)(?:Imported|$)/i);
      if (careMatch) result.careRaw = careMatch[1].trim();
    }
  }

  // Fit info (SSR'd) — data-testid="size-and-fit-copy" contains <li> items
  const fitMatch = html.match(
    /data-testid="size-and-fit-copy"[^>]*>([\s\S]*?)<\/ul>/i,
  );
  if (fitMatch) {
    const fitItems = fitMatch[1].match(/<li[^>]*>[\s\S]*?<\/li>/gi);
    if (fitItems) {
      result.fitInfo = fitItems.map((li) => stripHtml(li).trim()).filter(Boolean).join("; ");
    } else {
      result.fitInfo = stripHtml(fitMatch[1]);
    }
  }

  return result;
}

function extractFromPreloadedState(html: string): Partial<ExtractedProduct> {
  const result: Partial<ExtractedProduct> = {};

  const tabDetailsMatch = html.match(/"tabDetails"\s*:\s*"([^"]+)"/);
  if (tabDetailsMatch) {
    const decoded = decodeUnicodeEscapes(tabDetailsMatch[1]);
    const text = stripHtml(decoded);

    const contentMatch = text.match(/Content:\s*(.+?)(?:Care:|Imported|$)/i);
    if (contentMatch) result.materialsRaw = contentMatch[1].trim().replace(/[,\s]+$/, "");

    const careMatch = text.match(/Care:\s*(.+?)(?:Imported|$)/i);
    if (careMatch) result.careRaw = careMatch[1].trim().replace(/\s+$/, "");
  }

  // Description from preloaded state
  for (const key of ["longDescription", "shortDescription"]) {
    const m = html.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`));
    if (m) {
      const desc = stripHtml(decodeUnicodeEscapes(m[1]));
      if (desc.length > (result.description?.length ?? 0)) {
        result.description = desc;
      }
    }
  }

  const tabFeaturesMatch = html.match(/"tabFeatures"\s*:\s*"([^"]+)"/);
  if (tabFeaturesMatch) {
    const decoded = decodeUnicodeEscapes(tabFeaturesMatch[1]);
    const items = decoded.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (items) {
      result.features = items.map((li) => stripHtml(li).trim()).filter(Boolean);
    }
  }

  return result;
}

function decodeUnicodeEscapes(s: string): string {
  return s
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\n/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&deg;/g, "°")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitListItems(html: string): string[] {
  const items = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  if (items) {
    return items.map((li) => stripHtml(li)).filter(Boolean);
  }
  return [stripHtml(html)].filter(Boolean);
}
