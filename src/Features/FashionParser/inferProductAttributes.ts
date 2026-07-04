import type { ProductAttributes } from "./types";
import { matchFirst, matchAll } from "./utils";
import { SILHOUETTE_MAP } from "./maps/silhouette";
import { FIT_MAP } from "./maps/fit";
import { SHAPING_MAP } from "./maps/shaping";
import { NECKLINE_MAP } from "./maps/neckline";
import { SLEEVE_LENGTH_MAP, SLEEVE_STYLE_MAP } from "./maps/sleeve";
import { HEM_LENGTH_MAP } from "./maps/hem";
import { LEG_SHAPE_MAP } from "./maps/leg";
import { RISE_MAP } from "./maps/rise";
import { WAIST_STYLE_MAP } from "./maps/waist";
import { CLOSURE_MAP } from "./maps/closure";
import { CONSTRUCTION_MAP } from "./maps/construction";
import { ACCENTS_MAP } from "./maps/accents";
import { PATTERN_MAP } from "./maps/pattern";
import { SEASON_MAP } from "./maps/season";
import { MATERIAL_MAP } from "./maps/material";
import { STRETCH_MAP, POCKET_MAP } from "./maps/stretch";

export function inferProductAttributes(name: string): ProductAttributes {
  const attrs: ProductAttributes = {};

  const silhouette = matchFirst(name, SILHOUETTE_MAP);
  if (silhouette) attrs.silhouette = silhouette;

  const fit = matchFirst(name, FIT_MAP);
  if (fit) attrs.fit = fit;

  const neckline = matchFirst(name, NECKLINE_MAP);
  if (neckline) attrs.neckline = neckline;

  const sleeveLength = matchFirst(name, SLEEVE_LENGTH_MAP);
  if (sleeveLength) attrs.sleeveLength = sleeveLength;

  const sleeveStyle = matchFirst(name, SLEEVE_STYLE_MAP);
  if (sleeveStyle) attrs.sleeveStyle = sleeveStyle;

  const hemLength = matchFirst(name, HEM_LENGTH_MAP);
  if (hemLength) attrs.hemLength = hemLength;

  const legShape = matchFirst(name, LEG_SHAPE_MAP);
  if (legShape) attrs.legShape = legShape;

  const rise = matchFirst(name, RISE_MAP);
  if (rise) attrs.rise = rise;

  const waistStyle = matchFirst(name, WAIST_STYLE_MAP);
  if (waistStyle) attrs.waistStyle = waistStyle;

  const pattern = matchFirst(name, PATTERN_MAP);
  if (pattern) attrs.pattern = pattern;

  const season = matchFirst(name, SEASON_MAP);
  if (season) attrs.season = season;

  const material = matchFirst(name, MATERIAL_MAP);
  if (material) attrs.material = material;

  if (matchFirst(name, STRETCH_MAP)) attrs.hasStretch = true;
  if (matchFirst(name, POCKET_MAP)) attrs.hasPockets = true;

  const shaping = matchAll(name, SHAPING_MAP);
  if (shaping.length) attrs.shaping = shaping;

  const closure = matchAll(name, CLOSURE_MAP);
  if (closure.length) attrs.closure = closure;

  const construction = matchAll(name, CONSTRUCTION_MAP);
  if (construction.length) attrs.construction = construction;

  const accents = matchAll(name, ACCENTS_MAP);
  if (accents.length) attrs.accents = accents;

  return attrs;
}
