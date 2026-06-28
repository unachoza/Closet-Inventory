import { describe, it, expect } from "vitest";
import { inferProductAttributes } from "../inferProductAttributes";

describe("FashionParser — silhouette", () => {
  it.each([
    ["Fit and Flare Midi Dress", "fit & flare"],
    ["A-Line Skirt", "a-line"],
    ["Sheath Dress", "sheath"],
    ["Shift Dress", "shift"],
    ["Bodycon Mini Dress", "bodycon"],
    ["Wrap Midi Dress", "wrap"],
    ["Pencil Skirt", "pencil"],
    ["Slip Dress", "slip dress"],
    ["Empire Waist Maxi Dress", "empire"],
    ["Mermaid Gown", "mermaid"],
    ["Trumpet Hem Dress", "trumpet"],
    ["Peplum Blazer", "peplum"],
    ["Shirt Dress", "shirtdress"],
  ] as [string, string][])('"%s" → silhouette="%s"', (name, expected) => {
    expect(inferProductAttributes(name).silhouette).toBe(expected);
  });
});
