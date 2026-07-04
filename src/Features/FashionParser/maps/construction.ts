import type { RegexMap } from "../types";

export const CONSTRUCTION_MAP: RegexMap = [
  [/\braw[- ]?hem\b/i, "raw hem"],
  [/\bfrayed[- ]?hem\b/i, "frayed hem"],
  [/\bdistressed\b/i, "distressed"],
  [/\brolled[- ]?cuff\b/i, "rolled cuff"],
  [/\bcuff(ed)?\b/i, "cuffed"],
  [/\bsplit[- ]?hem\b/i, "split hem"],
  [/\bside[- ]?slit\b/i, "side slit"],
  [/\bslit\b/i, "slit"],
  [/\bvent(ed)?\b/i, "vented"],
  [/\basymmetrical\b/i, "asymmetrical"],
  [/\bscalloped\b/i, "scalloped hem"],
  [/\bripped\b/i, "ripped"],
  [/\bpointelle\b/i, "pointelle"],
];
