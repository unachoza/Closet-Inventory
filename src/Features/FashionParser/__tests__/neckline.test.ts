import { describe, it, expect } from "vitest";
import { inferProductAttributes } from "../inferProductAttributes";

describe("FashionParser — neckline", () => {
  it.each([
    ["Square Neck Midi Dress", "square neck"],
    ["V-Neck Wrap Blouse", "v-neck"],
    ["Crew Neck Sweater", "crew neck"],
    ["Sphere Ls Low Crewe", "crew neck"], // Icebreaker/REI alt spelling
    ["Sweetheart Strapless Gown", "sweetheart"],
    ["Off-the-Shoulder Midi Dress", "off-shoulder"],
    ["Cowl Neck Draped Top", "cowl neck"],
    ["Halter Neck Maxi Dress", "halter"],
    ["Turtleneck Knit Sweater", "turtleneck"],
    ["Mock Neck Bodysuit", "mock neck"],
    ["Keyhole Back Blouse", "keyhole"],
    ["Mandarin Collar Shirt", "mandarin collar"],
    ["Peter Pan Collar Dress", "peter pan collar"],
  ] as [string, string][])('"%s" → neckline="%s"', (name, expected) => {
    expect(inferProductAttributes(name).neckline).toBe(expected);
  });
});
