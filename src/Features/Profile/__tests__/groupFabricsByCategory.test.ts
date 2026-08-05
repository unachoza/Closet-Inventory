import { describe, it, expect } from "vitest";
import { groupFabricsByCategory } from "../groupFabricsByCategory";
import type { FabricSummary } from "../../../hooks/useClosetFabrics";
import type { Fiber, FiberCategory } from "../../../Content/Fabrics&Fibers/textileTypes";

function makeFiber(category: FiberCategory, name: string = category): Fiber {
	return {
		id: name,
		name,
		category,
		tagLabel: name,
		source: "",
		description: "",
		imageUrl: "",
		imageAlt: "",
		properties: [],
		detail: [],
	};
}

function makeFabric(overrides: Partial<FabricSummary>): FabricSummary {
	return {
		name: "Cotton",
		fiber: makeFiber("plant", "Cotton"),
		count: 1,
		pctOfCloset: 100,
		careLabel: "Machine safe",
		careTone: "ok",
		tip: "",
		...overrides,
	};
}

describe("groupFabricsByCategory", () => {
	it("collapses fabrics into their fiber category, summing counts", () => {
		const fabrics = [
			makeFabric({ name: "Cotton", fiber: makeFiber("plant", "Cotton"), count: 3 }),
			makeFabric({ name: "Linen", fiber: makeFiber("plant", "Linen"), count: 2 }),
			makeFabric({ name: "Wool", fiber: makeFiber("animal", "Wool"), count: 1 }),
		];

		const groups = groupFabricsByCategory(fabrics);

		expect(groups.find((g) => g.group === "plant")?.count).toBe(5);
		expect(groups.find((g) => g.group === "animal")?.count).toBe(1);
	});

	it("buckets materials with no resolved fiber into 'other'", () => {
		const fabrics = [makeFabric({ name: "Mystery blend", fiber: null, count: 2 })];

		const groups = groupFabricsByCategory(fabrics);

		expect(groups).toEqual([expect.objectContaining({ group: "other", count: 2, fabricNames: ["Mystery blend"] })]);
	});

	it("omits groups with zero items and keeps a fixed display order", () => {
		const fabrics = [
			makeFabric({ name: "Polyester", fiber: makeFiber("synth", "Polyester"), count: 1 }),
			makeFabric({ name: "Cotton", fiber: makeFiber("plant", "Cotton"), count: 1 }),
		];

		const groups = groupFabricsByCategory(fabrics);

		expect(groups.map((g) => g.group)).toEqual(["plant", "synth"]);
	});

	it("lists constituent fabric names per group", () => {
		const fabrics = [
			makeFabric({ name: "Cotton", fiber: makeFiber("plant", "Cotton"), count: 1 }),
			makeFabric({ name: "Linen", fiber: makeFiber("plant", "Linen"), count: 1 }),
		];

		const groups = groupFabricsByCategory(fabrics);

		expect(groups.find((g) => g.group === "plant")?.fabricNames).toEqual(["Cotton", "Linen"]);
	});
});
