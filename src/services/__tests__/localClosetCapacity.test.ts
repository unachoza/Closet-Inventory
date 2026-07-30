import { describe, it, expect } from "vitest";
import type { ClothingItem } from "../../utils/types";
import {
	measureLocalCloset,
	LOCAL_ITEM_LIMIT,
	LOCAL_BYTE_BUDGET,
} from "../localClosetCapacity";

/** Minimal item; `imageURL` is where the real weight lives (base64 photos). */
function makeItem(id: string, imageURL = ""): ClothingItem {
	return { id, name: `Item ${id}`, imageURL } as ClothingItem;
}

function makeItems(count: number, imageURL = ""): ClothingItem[] {
	return Array.from({ length: count }, (_, i) => makeItem(String(i), imageURL));
}

/** A base64-ish payload of roughly `kb` kilobytes. */
function fakePhoto(kb: number): string {
	return `data:image/jpeg;base64,${"A".repeat(kb * 1024)}`;
}

describe("measureLocalCloset", () => {
	it("reports an empty closet as ok with nothing used", () => {
		const result = measureLocalCloset([]);
		expect(result.tier).toBe("ok");
		expect(result.itemCount).toBe(0);
		expect(result.isBlocked).toBe(false);
		expect(result.blockedReason).toBeNull();
	});

	it("does not mutate the array it is given", () => {
		const items = makeItems(3);
		const snapshot = JSON.stringify(items);
		measureLocalCloset(items);
		expect(JSON.stringify(items)).toBe(snapshot);
	});

	describe("count-based tiers", () => {
		it.each([
			[5, "ok"],
			[10, "gentle"],
			[29, "gentle"],
			[30, "firm"],
			[49, "firm"],
			[50, "urgent"],
			[59, "urgent"],
		])("escalates to %s items → %s", (count, tier) => {
			expect(measureLocalCloset(makeItems(count as number)).tier).toBe(tier);
		});

		it("blocks at the item limit", () => {
			const result = measureLocalCloset(makeItems(LOCAL_ITEM_LIMIT));
			expect(result.tier).toBe("blocked");
			expect(result.isBlocked).toBe(true);
			expect(result.blockedReason).toBe("count");
		});

		it("stays blocked past the limit rather than wrapping around", () => {
			expect(measureLocalCloset(makeItems(LOCAL_ITEM_LIMIT + 20)).isBlocked).toBe(true);
		});
	});

	describe("size-based tiers", () => {
		it("blocks on bytes well before the item count would trip", () => {
			// A handful of photo-bearing items can exhaust the quota long before 60,
			// which is the whole reason the cap is not count-only.
			const heavy = makeItems(6, fakePhoto(500));
			const result = measureLocalCloset(heavy);
			expect(result.itemCount).toBeLessThan(LOCAL_ITEM_LIMIT);
			expect(result.isBlocked).toBe(true);
			expect(result.blockedReason).toBe("size");
		});

		it("escalates on bytes even while the item count is still comfortable", () => {
			const result = measureLocalCloset(makeItems(3, fakePhoto(400)));
			expect(result.itemCount).toBeLessThan(10);
			expect(result.tier).not.toBe("ok");
		});

		it("counts photo payloads toward bytesUsed", () => {
			const light = measureLocalCloset(makeItems(3));
			const heavy = measureLocalCloset(makeItems(3, fakePhoto(100)));
			expect(heavy.bytesUsed).toBeGreaterThan(light.bytesUsed);
		});
	});

	it("takes whichever limit trips first", () => {
		// Many small items → count is the binding constraint.
		expect(measureLocalCloset(makeItems(LOCAL_ITEM_LIMIT)).blockedReason).toBe("count");
		// Few huge items → size is.
		expect(measureLocalCloset(makeItems(6, fakePhoto(500))).blockedReason).toBe("size");
	});

	it("reports percentUsed as the worse of the two ratios, clamped to 100", () => {
		const empty = measureLocalCloset([]);
		expect(empty.percentUsed).toBe(0);

		const over = measureLocalCloset(makeItems(LOCAL_ITEM_LIMIT * 2));
		expect(over.percentUsed).toBe(100);
	});

	it("exposes the limits it measured against, so the UI need not re-derive them", () => {
		const result = measureLocalCloset(makeItems(1));
		expect(result.itemLimit).toBe(LOCAL_ITEM_LIMIT);
		expect(result.byteBudget).toBe(LOCAL_BYTE_BUDGET);
	});
});
