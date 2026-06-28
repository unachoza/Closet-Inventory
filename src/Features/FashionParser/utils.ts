import type { RegexMap } from "./types";

export function matchFirst(text: string, map: RegexMap): string | undefined {
  for (const [pattern, value] of map) {
    if (pattern.test(text)) return value;
  }
  return undefined;
}

export function matchAll(text: string, map: RegexMap): string[] {
  const seen = new Set<string>();
  const results: string[] = [];
  for (const [regex, value] of map) {
    if (!seen.has(value) && regex.test(text)) {
      seen.add(value);
      results.push(value);
    }
  }
  return results;
}
