import type { RegexMap } from "../types";

export const LEG_SHAPE_MAP: RegexMap = [
  [/\bkick[- ]?flare\b/i, "kick flare"],
  [/\bwide[- ]?leg\b/i, "wide leg"],
  [/\bstraight[- ]?leg\b/i, "straight leg"],
  [/\bbootcut\b/i, "bootcut"],
  [/\bflare[d]?\b/i, "flare"],
  [/\bbarrel\b/i, "barrel"],
  [/\btaper(ed)?\b/i, "tapered"],
  [/\bcigarette\b/i, "cigarette"],
  [/\bpeg\b/i, "peg"],
  [/\bskinny\b/i, "skinny"],
  // Bare cut words denim listings use without the "-leg" suffix
  // (e.g. "Bella Stretch Relaxed Straight Jeans", "Wide Leg" → "wide leg" above,
  // bare "Wide" here). Ordered last so the "-leg" variants win first.
  [/\bstraight\b/i, "straight"],
  [/\bwide\b/i, "wide leg"],
];
