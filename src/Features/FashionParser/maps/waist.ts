import type { RegexMap } from "../types";

export const WAIST_STYLE_MAP: RegexMap = [
  [/\bpaperbag[- ]?waist\b/i, "paperbag waist"],
  [/\belastic[- ]?waist\b/i, "elastic waist"],
  [/\bdrawstring[- ]?waist\b/i, "drawstring waist"],
  [/\bdrop[- ]?waist\b/i, "drop waist"],
  [/\bempire[- ]?waist\b/i, "empire waist"],
  [/\bbelted\b/i, "belted"],
];
