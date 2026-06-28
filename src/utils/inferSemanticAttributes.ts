import type { ClothingItem } from "./types";
import { inferOccasion } from "../Features/FashionParser";

export function inferSemanticAttributes(text: string): Partial<ClothingItem> {
  const result: Partial<ClothingItem> = {};
  const occasions = inferOccasion(text);
  if (occasions.length > 0) result.occasion = occasions[0];
  return result;
}
