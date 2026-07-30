import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { hasEverSynced, markSynced } from "../cloudSyncFlag";

describe("cloudSyncFlag", () => {
	beforeEach(() => localStorage.clear());
	afterEach(() => vi.restoreAllMocks());

	it("reports not-synced for a closet that has never reached the server", () => {
		expect(hasEverSynced()).toBe(false);
	});

	it("reports synced once marked", () => {
		markSynced();
		expect(hasEverSynced()).toBe(true);
	});

	it("is idempotent", () => {
		markSynced();
		markSynced();
		expect(hasEverSynced()).toBe(true);
	});

	it("stays true across reads — a signed-out session must not look unbacked", () => {
		markSynced();
		expect(hasEverSynced()).toBe(true);
		expect(hasEverSynced()).toBe(true);
	});

	it("treats unreadable storage as not-synced rather than throwing", () => {
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new Error("SecurityError");
		});
		expect(() => hasEverSynced()).not.toThrow();
		expect(hasEverSynced()).toBe(false);
	});

	it("does not treat an unrelated value as synced", () => {
		localStorage.setItem("closetly-has-synced", "false");
		expect(hasEverSynced()).toBe(false);
	});
});
