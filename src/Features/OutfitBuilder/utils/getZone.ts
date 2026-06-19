import { ZONE_GROUPS } from "./data";
import { ItemCategory } from "./types";

export function getZone(category: ItemCategory): number {
  return ZONE_GROUPS.findIndex((g) => g.includes(category));
}