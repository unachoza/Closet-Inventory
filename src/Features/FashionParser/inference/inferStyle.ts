import type { ProductAttributes } from "../types";

// Each rule scores the style family +1 if the condition is met.
type StyleRule = (attrs: ProductAttributes, name: string) => boolean;

const STYLE_RULES: Record<string, StyleRule[]> = {
  romantic: [
    (a) => !!a.sleeveStyle && ["puff sleeve", "bishop sleeve", "bell sleeve", "balloon sleeve", "flutter sleeve"].includes(a.sleeveStyle),
    (a) => !!a.neckline && ["sweetheart", "off-shoulder", "one shoulder"].includes(a.neckline),
    (a) => !!a.accents?.some((x) => ["ruffles", "bows", "lace trim", "embroidered", "pearls", "feathers"].includes(x)),
    (a) => a.pattern === "floral",
    (a) => !!a.shaping?.includes("smocked") || !!a.shaping?.includes("gathered"),
    (a) => a.silhouette === "fit & flare" || a.silhouette === "a-line",
  ],
  classic: [
    (a) => a.silhouette === "sheath" || a.silhouette === "pencil" || a.silhouette === "shift",
    (a) => a.fit === "tailored",
    (a) => !!a.neckline && ["crew neck", "collared", "lapel", "notch"].includes(a.neckline),
    (a) => !!a.closure?.includes("button front") || !!a.closure?.includes("button-down"),
    (_, name) => /\b(blazer|trench|oxford|loafer|chinos?)\b/i.test(name),
    (a) => a.pattern === "stripes" || a.pattern === "houndstooth" || a.pattern === "plaid",
  ],
  edgy: [
    (_, name) => /\b(leather|moto|biker|studded|chain|combat)\b/i.test(name),
    (a) => !!a.accents?.some((x) => ["studded", "chains", "cut outs", "rhinestones"].includes(x)),
    (a) => !!a.construction?.some((x) => ["distressed", "ripped", "asymmetrical"].includes(x)),
    (a) => !!a.closure?.includes("lace-up"),
    (a) => a.pattern === "animal print" || a.pattern === "camo",
    (a) => !!a.shaping?.includes("corset"),
  ],
  minimal: [
    (a) => a.fit === "relaxed" || a.fit === "loose" || a.fit === "boxy",
    (a) => a.pattern === "solid",
    (a) => !a.accents || a.accents.length === 0,
    (a) => a.silhouette === "slip dress" || a.silhouette === "shift",
    (a) => !!a.neckline && ["crew neck", "v-neck", "scoop neck"].includes(a.neckline),
    (_, name) => /\b(minimalist|clean|simple|basic|essential)\b/i.test(name),
  ],
  bohemian: [
    (a) => a.pattern === "floral" || a.pattern === "paisley" || a.pattern === "tie-dye" || a.pattern === "tropical",
    (a) => a.silhouette === "wrap" || a.hemLength === "maxi",
    (a) => !!a.accents?.some((x) => ["fringe", "embroidered", "beaded"].includes(x)),
    (_, name) => /\b(boho|bohemian|folk|ethnic|free\s*spirit)\b/i.test(name),
    (a) => !!a.shaping?.includes("smocked"),
    (a) => !!a.sleeveStyle && ["bell sleeve", "flutter sleeve"].includes(a.sleeveStyle),
  ],
  casual: [
    (a) => a.fit === "relaxed" || a.fit === "oversized",
    (_, name) => /\b(hoodie|sweatshirt|jogger|t[- ]?shirt|denim|jeans)\b/i.test(name),
    (a) => !!a.closure?.includes("pull-on") || !!a.closure?.includes("drawstring"),
    (a) => !!a.hasPockets,
  ],
};

/** Returns the dominant style family, or undefined when no family scores ≥ 2. */
export function inferStyle(attrs: ProductAttributes, name: string): string | undefined {
  const scores: Record<string, number> = {};

  for (const [family, rules] of Object.entries(STYLE_RULES)) {
    scores[family] = rules.filter((rule) => rule(attrs, name)).length;
  }

  const [top, second] = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);

  // Require at least 2 signals and a clear lead over the next best.
  if (!top || top[1] < 2) return undefined;
  if (second && top[1] === second[1]) return undefined; // tie — don't guess

  return top[0];
}
