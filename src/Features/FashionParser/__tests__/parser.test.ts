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

  it('captures "hoody" (REI/Smartwool spelling) as a hood accent, same as "hoodie"', () => {
    expect(inferProductAttributes("Merino 250 1/2 Zip Hoody").accents).toContain("hood");
    expect(inferProductAttributes("Fleece Pullover Hoodie").accents).toContain("hood");
  });

  it("infers wool material and winter season from Smartwool/Merino branding", () => {
    const quarterZip = inferProductAttributes("Smartwool Intraknit 200 Pattern Quarter-Zip Base Layer Top");
    expect(quarterZip.material).toBe("wool");
    expect(quarterZip.season).toBe("winter");

    const merino = inferProductAttributes("REI Co-op Merino Midweight Base Layer Top");
    expect(merino.material).toBe("merino wool");
    expect(merino.season).toBe("winter");
  });

  it('treats "L/S" and "LS" as long sleeve shorthand', () => {
    expect(inferProductAttributes("Silk L/S V-Neck").sleeveLength).toBe("long sleeve");
    expect(inferProductAttributes("Sphere Ls Low Crewe").sleeveLength).toBe("long sleeve");
  });

  it("infers stretch from Stretchtech compound and biker shorts", () => {
    expect(inferProductAttributes("Extra High-Waisted Stretchtech Micro-Pleated Skort").hasStretch).toBe(true);
    expect(inferProductAttributes("Ribbed Lettuce-Edge Biker Shorts").hasStretch).toBe(true);
  });

  it("captures plain lace as an accent (not only lace trim)", () => {
    expect(inferProductAttributes("Textured Lace Scoop-Neck Top").accents).toContain("lace");
    expect(inferProductAttributes("Lace-Trim Cami").accents).toContain("lace trim");
  });

  it("maps strappy and spaghetti to sleeveless", () => {
    expect(inferProductAttributes("Strappy Cami Top").sleeveLength).toBe("sleeveless");
    expect(inferProductAttributes("Spaghetti Strap Midi Dress").sleeveLength).toBe("sleeveless");
  });
});
