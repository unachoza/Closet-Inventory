import type { MaterialBlend, RegexMap } from "../types";
import { matchFirst } from "../utils";

// Materials that strongly suggest a season.
const WARM_MATERIALS = new Set(["wool", "cashmere", "mohair", "alpaca", "flannel", "fleece", "sherpa", "tweed", "corduroy"]);
const COOL_MATERIALS = new Set(["linen", "chiffon", "organza", "seersucker"]);

// Name keywords that override material signals. Explicit seasons first, then structural indicators.
const SEASON_KEYWORD_MAP: RegexMap = [
  [/\b(fall|autumn)\b/i, "fall"],
  [/\bspring\b/i, "spring"],
  [/\bsummer\b/i, "summer"],
  [/\bwinter\b/i, "winter"],
  [/\b(puffer|parka|anorak|ski|snow|thermal|turtleneck)\b/i, "winter"],
  [/\b(trench|rain|transitional)\b/i, "fall"],
  [/\b(swim|bikini|coverup|cover[- ]?up|sarong|caftan)\b/i, "summer"],
];

/**
 * Infers the primary season from a product name and optional material blend.
 * Explicit keywords ("Summer Linen Dress") take priority over material signals.
 */
export function inferSeason(name: string, materials?: MaterialBlend[]): string | undefined {
  // Keyword match first (explicit season or structural indicators).
  const keywordSeason = matchFirst(name, SEASON_KEYWORD_MAP);
  if (keywordSeason) return keywordSeason;

  // Material-based inference.
  if (!materials || materials.length === 0) return undefined;
  const primary = [...materials].sort((a, b) => b.percentage - a.percentage)[0];
  const mat = primary.material.toLowerCase();

  if (WARM_MATERIALS.has(mat)) return "fall";
  if (COOL_MATERIALS.has(mat)) return "summer";

  return undefined;
}
