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
  [/\bhood(ie|y)?\b/i, "hood"],
  [/\bpearls?\b/i, "pearls"],
  [/\bruched\b/i, "ruched"],
  [/\bruffles?\b/i, "ruffles"],
  [/\bsequins?\b/i, "sequins"],
  [/\brhinestones?\b/i, "rhinestones"],
  [/\bstudded\b/i, "studded"],
  [/\blace[- ]?trim\b/i, "lace trim"],
  // Plain "lace" is an embellishment ("Textured Lace Scoop-Neck Top");
  // lookahead keeps "lace trim" mapping to its own entry above.
  [/\blace\b(?![- ]?trim)/i, "lace"],
  [/\bappliqu[eé]\b/i, "appliqué"],
];
