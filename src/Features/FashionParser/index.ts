// ── Core ─────────────────────────────────────────────────────────────────────
export type { ProductAttributes, MaterialBlend, RegexMap } from "./types";
export { inferProductAttributes } from "./inferProductAttributes";
export { matchFirst, matchAll } from "./utils";

// ── Maps ─────────────────────────────────────────────────────────────────────
export { SILHOUETTE_MAP } from "./maps/silhouette";
export { FIT_MAP } from "./maps/fit";
export { SHAPING_MAP } from "./maps/shaping";
export { NECKLINE_MAP } from "./maps/neckline";
export { SLEEVE_LENGTH_MAP, SLEEVE_STYLE_MAP } from "./maps/sleeve";
export { HEM_LENGTH_MAP } from "./maps/hem";
export { LEG_SHAPE_MAP } from "./maps/leg";
export { RISE_MAP } from "./maps/rise";
export { WAIST_STYLE_MAP } from "./maps/waist";
export { CLOSURE_MAP } from "./maps/closure";
export { CONSTRUCTION_MAP } from "./maps/construction";
export { ACCENTS_MAP } from "./maps/accents";
export { PATTERN_MAP } from "./maps/pattern";
export { SEASON_MAP } from "./maps/season";
export { STRETCH_MAP, POCKET_MAP } from "./maps/stretch";
export { COLOR_MAP } from "./maps/color";
export { MATERIAL_MAP } from "./maps/material";

// ── Normalizers ───────────────────────────────────────────────────────────────
export { default as normalizeColor, normalizeColorGroups } from "./normalizers/normalizeColor";
export { default as normalizeCategory } from "./normalizers/normalizeCategory";
export { normalizeMaterial } from "./normalizers/normalizeMaterial";

// ── Inference ─────────────────────────────────────────────────────────────────
export { inferOccasion } from "./inference/inferOccasion";
export { inferCategory } from "./inference/inferCategory";
export { inferSeason } from "./inference/inferSeason";
export { inferStyle } from "./inference/inferStyle";
export { inferMaterialFromName } from "./inference/inferMaterial";
export {
  inferCare,
  inferCareFromAttributes,
  inferCareFromMaterial,
} from "./inference/inferCare";
