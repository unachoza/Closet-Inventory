import type { RegexMap } from "../types";

export const SILHOUETTE_MAP: RegexMap = [
  [/\bfit[- ]?(and|&)[- ]?flare\b/i, "fit & flare"],
  [/\ba[- ]?line\b/i, "a-line"],
  [/\bsheath\b/i, "sheath"],
  [/\bshift\b/i, "shift"],
  [/\bbodycon\b/i, "bodycon"],
  [/\bwrap\b/i, "wrap"],
  [/\bslip[- ]?dress\b/i, "slip dress"],
  [/\bshirt[- ]?dress\b/i, "shirtdress"],
  [/\bempire\b/i, "empire"],
  [/\bdrop[- ]?waist\b/i, "drop waist"],
  [/\bpeplum\b/i, "peplum"],
  [/\bpencil\b/i, "pencil"],
  [/\btulip\b/i, "tulip"],
  [/\bball[- ]?gown\b/i, "ball gown"],
  [/\bmermaid\b/i, "mermaid"],
  [/\btrumpet\b/i, "trumpet"],
  [/\bhigh[- /]?low\b/i, "high-low"],
  [/\bpopover\b/i, "popover"],
];
