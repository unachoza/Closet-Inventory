export type Category = "All" | "Tops" | "Bottoms" | "Dresses" | "Outerwear" | "Shoes" | "Accessories";
export type ItemCategory = Exclude<Category, "All">;
export type MobileView = "look" | "closet";

export interface ClothingItem {
  id: string;
  name: string;
  category: ItemCategory;
  imageUrl: string;
  colorHex: string;
  brand?: string;
  isFavorite?: boolean;
}