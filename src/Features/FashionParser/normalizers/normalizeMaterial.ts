import type { MaterialBlend } from "../types";

const BLEND_PATTERN = /(\d+(?:\.\d+)?)\s*%\s*([\w\s™®-]+?)(?=\s*[,;]|\s*\d+%|$)/gi;

function parseBlendString(raw: string): MaterialBlend[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const matches = [...trimmed.matchAll(BLEND_PATTERN)];
  if (matches.length > 0) {
    return matches.map((m) => ({
      material: m[2].trim().toLowerCase().replace(/\s+/g, " "),
      percentage: Math.round(parseFloat(m[1])),
    }));
  }
  return [{ material: trimmed.toLowerCase(), percentage: 100 }];
}

export function normalizeMaterial(raw: unknown): MaterialBlend[] {
  if (Array.isArray(raw)) {
    const valid = (raw as unknown[]).filter(
      (e): e is MaterialBlend =>
        typeof e === "object" && e !== null &&
        typeof (e as MaterialBlend).material === "string" &&
        typeof (e as MaterialBlend).percentage === "number",
    );
    return valid.length > 0 ? valid : [];
  }
  if (typeof raw === "string") return parseBlendString(raw);
  return [];
}
