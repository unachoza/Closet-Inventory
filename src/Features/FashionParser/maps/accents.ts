import type { RegexMap } from "../types";

export const ACCENTS_MAP: RegexMap = [
  [/\bbeaded\b/i, "beaded"],
  [/\bbows?\b/i, "bows"],
  [/\bchains?\b/i, "chains"],
  [/\bcut[- ]?outs?\b/i, "cut outs"],
  [/\bembroider(ed|y)?\b/i, "embroidered"],
  [/\bfeathers?\b/i, "feathers"],
  [/\bfringe\b/i, "fringe"],
  [/\bglitter\b/i, "glitter"],
  // "hoody" (REI/Smartwool spelling) and "hoodie" both carry a hood.
  [/\bhood(ie|y)?\b/i, "hood"],
  [/\bpearls?\b/i, "pearls"],
  [/\bruched\b/i, "ruched"],
  [/\bruffles?\b/i, "ruffles"],
  [/\bsequins?\b/i, "sequins"],
  [/\brhinestones?\b/i, "rhinestones"],
  [/\bstudded\b/i, "studded"],
  [/\blace[- ]?trim\b/i, "lace trim"],
  [/\bappliqu[eé]\b/i, "appliqué"],
];
