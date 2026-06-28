import { describe, it, expect } from "vitest";
import { inferProductAttributes } from "../inferProductAttributes";

describe("FashionParser — inferProductAttributes", () => {
  it("parses a complex product name end-to-end", () => {
    const result = inferProductAttributes(
      "Princess Seam Corset Midi Dress with Button Front, Hidden Zipper, Side Slit and Rhinestone Trim"
    );
    expect(result.hemLength).toBe("midi");
    expect(result.shaping).toContain("princess seams");
    expect(result.shaping).toContain("corset");
    expect(result.closure).toContain("button front");
    expect(result.closure).toContain("hidden zipper");
    expect(result.construction).toEqual(expect.arrayContaining(["side slit"]));
    expect(result.accents).toContain("rhinestones");
  });

  it("infers silhouette separately from fit", () => {
    const result = inferProductAttributes("Bodycon Long Sleeve Mini Dress");
    expect(result.silhouette).toBe("bodycon");
    expect(result.hemLength).toBe("mini");
    expect(result.sleeveLength).toBe("long sleeve");
  });

  it("infers leg shape separately from fit", () => {
    const result = inferProductAttributes("High Waist Wide Leg Trousers");
    expect(result.rise).toBe("high waist");
    expect(result.legShape).toBe("wide leg");
  });

  it("captures multiple shaping details", () => {
    const result = inferProductAttributes("Boned Corset Gathered Midi Dress");
    expect(result.shaping).toContain("boned");
    expect(result.shaping).toContain("corset");
    expect(result.shaping).toContain("gathered");
  });

  it("captures multiple closures", () => {
    const result = inferProductAttributes("Button Front Hidden Zip Blazer");
    expect(result.closure).toContain("button front");
    expect(result.closure).toContain("hidden zipper");
  });
});
