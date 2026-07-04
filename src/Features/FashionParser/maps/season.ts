import type { RegexMap } from "../types";

export const SEASON_MAP: RegexMap = [
  [/\bspring\b/i, "spring"],
  [/\bsummer\b/i, "summer"],
  [/\b(fall|autumn)\b/i, "fall"],
  [/\bwinter\b/i, "winter"],
  // Warm wool/insulating fabrics imply cold-weather wear. Listed AFTER the
  // literal season words so an explicit season in the name still wins.
  [/\b(smartwool|merino|wool|cashmere|shearling|fleece|flannel|down|thermal|base\s*layer)\b/i, "winter"],
];
