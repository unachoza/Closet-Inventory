import type { RegexMap } from "../types";

export const SHAPING_MAP: RegexMap = [
  [/\bprincess[- ]?seams?\b/i, "princess seams"],
  [/\b(darts?|darted)\b/i, "darts"],
  [/\bpanel(ed|ing)?\b/i, "paneled"],
  [/\bseamed\b/i, "seamed"],
  [/\byoke\b/i, "yoke"],
  [/\bgodets?\b/i, "godets"],
  [/\bgussets?\b/i, "gussets"],
  [/\btucks?\b/i, "tucks"],
  [/\bpleats?\b/i, "pleats"],
  [/\bshirred\b/i, "shirred"],
  [/\bsmock(ed|ing)?\b/i, "smocked"],
  [/\bgather(ed|ing)?\b/i, "gathered"],
  [/\bboned\b/i, "boned"],
  [/\bcorset(ed)?\b/i, "corset"],
  [/\bcontour(ed)?\b/i, "contoured"],
];
