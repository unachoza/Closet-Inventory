import type { ExtractedProduct } from "./index.ts";

export function extractAnthropologie(html: string): Partial<ExtractedProduct> {
  const result: Partial<ExtractedProduct> = {};

  // Anthropologie uses standard patterns extractable by generic,
  // but has some specific selectors we can leverage

  // Description from meta or structured content
  const descMatch = html.match(
    /class="[^"]*product__description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  );
  if (descMatch) {
    result.description = stripHtml(descMatch[1]);
  }

  // Materials — Anthropologie often uses "CONTENT:" or "Material:" labels
  const materialsPatterns = [
    /Content:\s*([\d]+%[\w\s,]+(?:[\d]+%[\w\s]+)*)/i,
    /Material:\s*([\d]+%[\w\s,]+(?:[\d]+%[\w\s]+)*)/i,
    /Fabric:\s*([\d]+%[\w\s,]+(?:[\d]+%[\w\s]+)*)/i,
  ];
  for (const pat of materialsPatterns) {
    const m = html.match(pat);
    if (m) {
      result.materialsRaw = m[1].trim();
      break;
    }
  }

  // Care instructions
  const carePatterns = [
    /Care:\s*([^<\n]+)/i,
    /Care Instructions:\s*([^<\n]+)/i,
  ];
  for (const pat of carePatterns) {
    const m = html.match(pat);
    if (m) {
      result.careRaw = m[1].trim();
      break;
    }
  }

  return result;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
