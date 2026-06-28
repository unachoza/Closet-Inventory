import type { RegexMap } from "../types";

export const SEASON_MAP: RegexMap = [
  [/\bspring\b/i, "spring"],
  [/\bsummer\b/i, "summer"],
  [/\b(fall|autumn)\b/i, "fall"],
  [/\bwinter\b/i, "winter"],
];
