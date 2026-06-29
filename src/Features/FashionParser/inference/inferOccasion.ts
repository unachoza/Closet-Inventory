// Maps name+category text to canonical occasion tags.
// More-specific patterns come before broader ones they overlap with.
const OCCASION_RULES: [RegExp, string][] = [
  [/\b(formal|gala|black\s*tie|prom|evening\s*gown|ball\s*gown)\b/i, "formal"],
  [/\b(wedding|bridal|bride|bridesmaid|maid\s*of\s*honor)\b/i, "wedding"],
  [/\b(cocktail|semi[- ]?formal)\b/i, "cocktail"],
  [/\b(going[- ]?out|night[- ]?out|club|bodycon|animal\s*print|corset|bustier|leather|faux\s*leather|mesh|cut[- ]?out|plunge|lace[- ]?up|sequin|sequins|sparkle|sparkly|mini\s*dress|mini\s*skirt)\b/i, "going-out"],
  [/\b(work\s*wear|office|professional|business\s*casual|blazer|tailored|suiting|button[- ]?down|pleated|pleat|oxford|trouser|trousers|pencil\s*skirt)\b/i, "work wear"],
  [/\b(gym|yoga|athletic|sport|sports|workout|running|cycling|activewear|training|legging|leggings|soccer|football|basketball|hockey|baseball|jersey|rugby|tennis)\b/i, "athleisure"],
  [/\b(vacation|vacay|beach|resort|tropical|swim|bikini|one[- ]?piece|sarong|caftan|cover[- ]?up)\b/i, "vacation"],
  [/\b(christmas|festive|holiday\s*party|nye|new\s*year|thanksgiving|velvet|metallic|rhinestone)\b/i, "holiday"],
  [/\b(church|sunday\s*best|sunday\s*mass)\b/i, "church"],
  [/\b(picnic|garden\s*party)\b/i, "picnic"],
  [/\bbasics?\b/i, "basics"],
  [/\b(casual|everyday|lounge|weekend|tank|t[- ]?shirt|midi\s*dress|midi\s*skirt|maxi\s*dress|maxi\s*skirt)\b/i, "casual"],
];

const EVERYDAY_CATEGORIES = new Set(["underwear", "intimates", "socks"]);

/** Returns up to 2 occasion tags inferred from a product name and optional category. */
export function inferOccasion(name: string, category?: string): string[] {
  const combined = `${name} ${category ?? ""}`;
  const tags: string[] = [];

  for (const [pattern, tag] of OCCASION_RULES) {
    if (!pattern.test(combined)) continue;
    if (tags.includes(tag)) continue;
    tags.push(tag);
    if (tags.length >= 2) break;
  }

  if (tags.length === 0 && category && EVERYDAY_CATEGORIES.has(category)) {
    tags.push("everyday");
  }

  return tags;
}
