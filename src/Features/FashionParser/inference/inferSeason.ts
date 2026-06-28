import type { MaterialBlend } from "../types";

// Materials that strongly suggest a season.
const WARM_MATERIALS = new Set(["wool", "cashmere", "mohair", "alpaca", "flannel", "fleece", "sherpa", "tweed", "corduroy"]);
const COOL_MATERIALS = new Set(["linen", "chiffon", "organza", "seersucker"]);

// Name keywords that override material signals.
const NAME_SEASON_RULES: [RegExp, string][] = [
  [/\b(puffer|parka|anorak|ski|snow|thermal|turtleneck)\b/i, "winter"],
  [/\b(trench|rain|transitional)\b/i, "fall"],
  [/\b(swim|bikini|coverup|cover[- ]?up|sarong|caftan)\b/i, "summer"],
  [/\b(spring|summer|fall|autumn|winter)\b/i, ""],  // handled inline below
];

/**
 * Infers the primary season from a product name and optional material blend.
 * Explicit keywords ("Summer Linen Dress") take priority over material signals.
 */
export function inferSeason(name: string, materials?: MaterialBlend[]): string | undefined {
  const lower = name.toLowerCase();

  // Explicit season keywords first.
  if (/\bwinter\b/i.test(lower)) return "winter";
  if (/\b(fall|autumn)\b/i.test(lower)) return "fall";
  if (/\bspring\b/i.test(lower)) return "spring";
  if (/\bsummer\b/i.test(lower)) return "summer";

  // Structural keyword overrides.
  if (/\b(puffer|parka|anorak|ski|snow|thermal)\b/i.test(lower)) return "winter";
  if (/\btrench\b/i.test(lower)) return "fall";
  if (/\b(swim|bikini|cover[- ]?up|sarong|caftan)\b/i.test(lower)) return "summer";

  // Material-based inference.
  if (!materials || materials.length === 0) return undefined;
  const primary = [...materials].sort((a, b) => b.percentage - a.percentage)[0];
  const mat = primary.material.toLowerCase();

  if (WARM_MATERIALS.has(mat)) return "fall";
  if (COOL_MATERIALS.has(mat)) return "summer";

  return undefined;
}
