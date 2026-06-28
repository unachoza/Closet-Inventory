import type { RegexMap } from "../types";

export const HEM_LENGTH_MAP: RegexMap = [
  [/\bmini\b/i, "mini"],
  [/\bmidi\b/i, "midi"],
  [/\bmaxi\b/i, "maxi"],
  [/\bcrop(ped)?\b/i, "crop"],
  [/\btunic\b/i, "tunic"],
  [/\blongline\b/i, "longline"],
];
