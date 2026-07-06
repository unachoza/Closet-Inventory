const CATEGORY_GROUPS: Record<string, string> = {
  top: "tops", tops: "tops",
  bottom: "bottoms", bottoms: "bottoms",
  dress: "dresses", dresses: "dresses",
  coat: "coats", coats: "coats",
  sweater: "sweaters", sweaters: "sweaters",
  intimates: "intimates",
  active: "athleisure", athleisure: "athleisure",
  sock: "socks", socks: "socks",
  underwear: "intimates",
  swim: "swim", swimwear: "swim", swimsuit: "swim",
  shoe: "shoes", shoes: "shoes",
  jacket: "coats", jackets: "coats",
  blazer: "coats", blazers: "coats",
  jeans: "bottoms", pants: "bottoms", trousers: "bottoms",
  skirt: "bottoms", skirts: "bottoms",
  shorts: "bottoms",
};

const normalizeCategory = (category: string): string => {
  const c = category.trim().toLowerCase();
  if (!c) return category.trim();
  return CATEGORY_GROUPS[c] ?? c;
};

export default normalizeCategory;
