import type { RegexMap } from "../types";

export const FIT_MAP: RegexMap = [
  [/\boversized\b/i, "oversized"],
  [/\brelaxed\b/i, "relaxed"],
  [/\bloose\b/i, "loose"],
  [/\bboxy\b/i, "boxy"],
  [/\bfitted\b/i, "fitted"],
  [/\bslim\b/i, "slim"],
  [/\bskinny\b/i, "skinny"],
  [/\btailored\b/i, "tailored"],
  [/\bclassic[- ]?fit\b/i, "classic"],
  [/\bregular[- ]?fit\b/i, "regular"],
  [/\beasy[- ]?fit\b/i, "easy fit"],
  [/\bboyfriend\b/i, "boyfriend"],
  [/\bgirlfriend\b/i, "girlfriend"],
  [/\bmom\b/i, "mom fit"],
];
