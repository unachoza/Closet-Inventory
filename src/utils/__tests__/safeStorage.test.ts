import { describe, it, expect, vi, afterEach } from "vitest";
import { safeSetItem } from "../safeStorage";

afterEach(() => vi.restoreAllMocks());

describe("safeSetItem", () => {
	it("persists the value and returns true on success", () => {
		const ok = safeSetItem("k", "v");
		expect(ok).toBe(true);
		expect(localStorage.getItem("k")).toBe("v");
	});

	it("returns false and does NOT throw when storage rejects the write", () => {
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
		});

		let result: boolean | undefined;
		expect(() => {
			result = safeSetItem("k", "v");
		}).not.toThrow();
		expect(result).toBe(false);
	});
});
