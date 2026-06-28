const normalizeColor = (color: string): string => {
  const c = color.trim().toLowerCase();
  if (c.includes("black") || c.includes("charcoal") || c.includes("caviar")) return "Black";
  if (c.includes("white") || c.includes("ivory") || c.includes("ecru") || c.includes("cream") || c.includes("pearl")) return "White";
  if (c.includes("grey") || c.includes("gray") || c.includes("heather")) return "Grey";
  if (c.includes("brown") || c.includes("taupe") || c.includes("chocolate") || c.includes("beige") || c.includes("tan") || c.includes("khaki")) return "Brown";
  if (c.includes("pink") || c.includes("raspberry") || c.includes("fuchsia") || c.includes("lollipop") || c.includes("dusty pink")) return "Pink";
  if (c.includes("red") || c.includes("burgundy")) return "Red";
  if (c.includes("green") || c.includes("olive") || c.includes("oil")) return "Green";
  if (c.includes("blue") || c.includes("navy") || c.includes("ocean") || c.includes("midnight") || c.includes("teal") || c.includes("cyan") || c.includes("cobalt")) return "Blue";
  if (c.includes("purple") || c.includes("dewberry")) return "Purple";
  if (c.includes("orange")) return "Orange";
  if (c.includes("floral") || c.includes("print")) return "Pattern";
  return color.trim();
};

const COLOR_SPLIT = /\s*\/\s*|\s*,\s*|\s*&\s*|\s*\+\s*|\s+and\s+/i;

export const normalizeColorGroups = (color: string): string[] => {
  const parts = color.split(COLOR_SPLIT).map((p) => p.trim()).filter(Boolean);
  const source = parts.length > 0 ? parts : [color];
  return Array.from(new Set(source.map(normalizeColor)));
};

export default normalizeColor;
