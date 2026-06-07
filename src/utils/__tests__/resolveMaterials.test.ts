import { describe, it, expect } from "vitest";
import { resolveMaterial } from "../resolveMaterials";

describe("resolveMaterial", () => {
	it("uses inferred material when product material is empty", () => {
		expect(resolveMaterial("", [{ material: "polyamide", percentage: 100 }])).toEqual([{ material: "polyamide", percentage: 100 }]);
	});

	it("uses product material when available", () => {
		expect(resolveMaterial([{ material: "cotton", percentage: 100 }], [{ material: "polyamide", percentage: 100 }])).toEqual([
			{ material: "cotton", percentage: 100 },
		]);
	});

	it("uses inferred material when product material is an empty array", () => {
		expect(resolveMaterial([], [{ material: "modal", percentage: 100 }])).toEqual([{ material: "modal", percentage: 100 }]);
	});
});
