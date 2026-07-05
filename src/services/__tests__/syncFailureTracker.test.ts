import { describe, it, expect, beforeEach, vi } from "vitest";
import { getSyncFailureState, recordSyncFailure, clearSyncFailures, subscribeSyncFailures } from "../syncFailureTracker";

describe("syncFailureTracker", () => {
	beforeEach(() => {
		clearSyncFailures();
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("starts clear", () => {
		expect(getSyncFailureState().failedWriteCount).toBe(0);
		expect(getSyncFailureState().lastError).toBeNull();
	});

	it("increments the count and captures the error message on failure", () => {
		recordSyncFailure("add", new Error("network down"));
		expect(getSyncFailureState().failedWriteCount).toBe(1);
		expect(getSyncFailureState().lastError).toBe("network down");
		expect(getSyncFailureState().lastFailedAt).not.toBeNull();
	});

	it("accumulates multiple failures", () => {
		recordSyncFailure("add", new Error("a"));
		recordSyncFailure("update", new Error("b"));
		expect(getSyncFailureState().failedWriteCount).toBe(2);
		expect(getSyncFailureState().lastError).toBe("b");
	});

	it("logs the real error instead of swallowing it", () => {
		recordSyncFailure("remove", new Error("boom"));
		expect(console.error).toHaveBeenCalled();
	});

	it("clearSyncFailures resets to the initial snapshot", () => {
		recordSyncFailure("add", new Error("x"));
		clearSyncFailures();
		expect(getSyncFailureState().failedWriteCount).toBe(0);
		expect(getSyncFailureState().lastError).toBeNull();
	});

	it("notifies subscribers on change and stops after unsubscribe", () => {
		const listener = vi.fn();
		const unsubscribe = subscribeSyncFailures(listener);
		recordSyncFailure("add", new Error("x"));
		expect(listener).toHaveBeenCalledTimes(1);
		unsubscribe();
		recordSyncFailure("update", new Error("y"));
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("clearSyncFailures is a no-op (no notify) when already clear", () => {
		const listener = vi.fn();
		subscribeSyncFailures(listener);
		clearSyncFailures();
		expect(listener).not.toHaveBeenCalled();
	});
});
