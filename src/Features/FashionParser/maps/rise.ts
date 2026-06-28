import type { RegexMap } from "../types";

export const RISE_MAP: RegexMap = [
  [/\bhigh[- ]?(waist(ed)?|rise)\b/i, "high waist"],
  [/\bmid[- ]?(waist|rise)\b/i, "mid rise"],
  [/\blow[- ]?(waist|rise)\b/i, "low rise"],
];
