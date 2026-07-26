import { describe, it, expect } from "vitest";
import { parseCareItems, parseCareLabels, CARE_MAP } from "../careUtils";
import { WashingMachine, Tag } from "lucide-react";

describe("careUtils", () => {
	describe("parseCareItems (display)", () => {
		it("maps a known instruction to its icon + label", () => {
			expect(parseCareItems("machine wash")).toEqual([{ icon: WashingMachine, label: "Machine wash" }]);
		});

		it("first keyword wins per entry and order is preserved", () => {
			const result = parseCareItems(["dry clean", "hang dry"]);
			expect(result.map((c) => c.label)).toEqual(["Dry clean", "Hang dry"]);
		});

		it("falls back to a generic tag icon for unknown instructions", () => {
			expect(parseCareItems("steam only")).toEqual([{ icon: Tag, label: "steam only" }]);
		});

		it("handles empty / missing care", () => {
			expect(parseCareItems("")).toEqual([]);
			expect(parseCareItems([])).toEqual([]);
		});

		it("uses a Lucide icon component, not an emoji string, for every mapped entry", () => {
			CARE_MAP.forEach(([, icon]) => {
				expect(typeof icon).not.toBe("string");
			});
		});
	});

	describe("parseCareLabels (filter)", () => {
		it("collects EVERY matching label from a compound entry", () => {
			expect(parseCareLabels("machine wash cold, tumble dry low")).toEqual(["Machine wash", "Tumble dry"]);
		});

		it("dedupes repeated labels (cold water / cold wash → one)", () => {
			// Labels are inserted in CARE_MAP order: hand wash, then cold water/cold wash (deduped).
			expect(parseCareLabels("cold water hand wash, cold wash")).toEqual(["Hand wash", "Cold wash"]);
		});

		it("keeps unmatched entries as raw text", () => {
			expect(parseCareLabels(["steam only"])).toEqual(["steam only"]);
		});
	});
});
