import { ClothingItem, Category, ItemCategory } from "./types";

const CATEGORIES: Category[] = ["All", "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];
const ITEM_CATEGORIES: ItemCategory[] = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];

const INITIAL_CLOSET: ClothingItem[] = [
  {
    id: "t1", name: "White Oxford Shirt", category: "Tops", brand: "COS", colorHex: "#F5F5F0",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop&auto=format",
    isFavorite: true,
  },
  {
    id: "t2", name: "Striped Breton Tee", category: "Tops", brand: "Uniqlo", colorHex: "#1a2744",
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop&auto=format",
  },
  {
    id: "b1", name: "Slim Black Jeans", category: "Bottoms", brand: "Acne Studios", colorHex: "#1a1a1a",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop&auto=format",
    isFavorite: true,
  },
  {
    id: "b2", name: "Wide Linen Trousers", category: "Bottoms", brand: "Zara", colorHex: "#C9B89A",
    imageUrl: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=400&h=500&fit=crop&auto=format",
  },
  {
    id: "d1", name: "Sage Midi Slip", category: "Dresses", brand: "Reformation", colorHex: "#8A9F7E",
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop&auto=format",
    isFavorite: true,
  },
  {
    id: "o1", name: "Camel Trench Coat", category: "Outerwear", brand: "Burberry", colorHex: "#C4A26E",
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop&auto=format",
  },
  {
    id: "s1", name: "White Court Sneakers", category: "Shoes", brand: "Common Projects", colorHex: "#F5F5F0",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop&auto=format",
  },
  {
    id: "a1", name: "Structured Leather Tote", category: "Accessories", brand: "Cuyana", colorHex: "#A8865A",
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop&auto=format",
    isFavorite: true,
  },
];

const OVERLAY_STYLE: Record<ItemCategory, React.CSSProperties> = {
  Tops:       { top: "8%",  left: "5%",  right: "5%",  height: "45%", objectFit: "contain", objectPosition: "top center" },
  Bottoms:    { top: "48%", left: "5%",  right: "5%",  bottom: "2%",  objectFit: "contain", objectPosition: "bottom center" },
  Dresses:    { top: "8%",  left: "5%",  right: "5%",  bottom: "2%",  objectFit: "contain", objectPosition: "top center" },
  Outerwear:  { top: "6%",  left: "3%",  right: "3%",  bottom: "2%",  objectFit: "contain", objectPosition: "top center" },
  Shoes:      { bottom: "0%", left: "10%", right: "10%", height: "22%", objectFit: "contain", objectPosition: "bottom center" },
  Accessories:{ top: "12%", left: "0%",  right: "0%",  height: "30%", objectFit: "contain", objectPosition: "top center" },
};

const ZONE_GROUPS: ItemCategory[][] = [
  ["Tops", "Dresses", "Outerwear"],
  ["Bottoms"],
  ["Shoes"],
  ["Accessories"],
];

const OVERLAY_ORDER: ItemCategory[] = ["Bottoms", "Dresses", "Tops", "Shoes", "Accessories", "Outerwear"];

