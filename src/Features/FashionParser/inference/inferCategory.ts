// Each entry: [pattern, canonical category].
// Longer/more-specific phrases come before single-word overlaps.
const CATEGORY_RULES: [RegExp, string][] = [
  [/\b(ball\s*gown|evening\s*gown)\b/i, "dresses"],
  [/\b(maxi\s*dress|midi\s*dress|mini\s*dress|shirt\s*dress|slip\s*dress|wrap\s*dress|sun\s*dress|sundress)\b/i, "dresses"],
  [/\bdress(es)?\b/i, "dresses"],
  [/\b(maxi\s*skirt|midi\s*skirt|mini\s*skirt|pencil\s*skirt|a[- ]?line\s*skirt)\b/i, "bottoms"],
  [/\bskirt(s)?\b/i, "bottoms"],
  [/\b(straight[- ]?leg|wide[- ]?leg|skinny|slim[- ]?fit|bootcut|flare[d]?)\s*(jeans?|pants?|trousers?)\b/i, "bottoms"],
  [/\b(jeans?|denim)\b/i, "bottoms"],
  [/\b(trousers?|chinos?|slacks|shorts?|leggings?|joggers?|sweatpants?|cargo\s*pants?)\b/i, "bottoms"],
  [/\b(blouse|tank\s*top|crop\s*top|tube\s*top|halter\s*top|cami|camisole|bodysuit|henley)\b/i, "tops"],
  [/\b(t[- ]?shirt|tee|sweatshirt|hoodie|pullover)\b/i, "tops"],
  [/\btop(s)?\b/i, "tops"],
  [/\b(blazer|sport\s*coat|suit\s*jacket)\b/i, "coats"],
  [/\b(trench|puffer|parka|anorak|windbreaker|raincoat|overcoat)\b/i, "coats"],
  [/\b(coat|jacket|cardigan|wrap)\b/i, "coats"],
  [/\b(sweater|jumper|pullover|crewneck|turtleneck\s*sweater|v[- ]?neck\s*sweater|knitwear)\b/i, "sweaters"],
  [/\b(sneakers?|boots?|heels?|flats?|loafers?|pumps?|sandals?|mules?|clogs?|oxfords?|derby)\b/i, "shoes"],
  [/\b(bra|bralette|underwear|panties?|briefs?|thong|lingerie|teddy|bodysuit)\b/i, "intimates"],
  [/\b(socks?|tights?|hosiery|stockings?)\b/i, "socks"],
  [/\b(leggings?|sports?\s*bra|athletic|activewear|yoga\s*pants?|bike\s*shorts?)\b/i, "athleisure"],
];

/** Infers a canonical category from a product name. Returns undefined when no match. */
export function inferCategory(name: string): string | undefined {
  for (const [pattern, category] of CATEGORY_RULES) {
    if (pattern.test(name)) return category;
  }
  return undefined;
}
