import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import SyncStatusIndicator from "./SyncStatusIndicator";
import { recordSyncFailure, clearSyncFailures } from "../../services/syncFailureTracker";

describe("SyncStatusIndicator", () => {
	beforeEach(() => {
		clearSyncFailures();
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("renders nothing while everything is synced", () => {
		render(<SyncStatusIndicator />);
		expect(screen.queryByTestId("sync-status-indicator")).toBeNull();
	});

	it("shows a singular label after one failed write", () => {
		render(<SyncStatusIndicator />);
		act(() => recordSyncFailure("add", new Error("offline")));
		expect(screen.getByTestId("sync-status-indicator")).toBeInTheDocument();
		expect(screen.getByText("1 change not synced")).toBeInTheDocument();
	});

	it("pluralizes and updates the count as more writes fail", () => {
		render(<SyncStatusIndicator />);
		act(() => recordSyncFailure("add", new Error("a")));
		act(() => recordSyncFailure("update", new Error("b")));
		expect(screen.getByText("2 changes not synced")).toBeInTheDocument();
	});

	it("disappears once failures are cleared (e.g. after a successful reconcile)", () => {
		render(<SyncStatusIndicator />);
		act(() => recordSyncFailure("add", new Error("a")));
		expect(screen.getByTestId("sync-status-indicator")).toBeInTheDocument();
		act(() => clearSyncFailures());
		expect(screen.queryByTestId("sync-status-indicator")).toBeNull();
	});
});
