import { describe, it, expect, afterEach, vi } from "vitest";
import { visibleFilterDimensions, FILTER_DIMENSIONS } from "../useClosetFilters";

// Status & Location are E2 features, dark for the beta. The filter UI renders
// only visibleFilterDimensions(); the full FILTER_DIMENSIONS list is unchanged.
describe("visibleFilterDimensions (beta status/location gate)", () => {
	afterEach(() => vi.unstubAllEnvs());

	it("hides status and location when the flag is off (default)", () => {
		vi.stubEnv("VITE_SHOW_STATUS_LOCATION", "");
		const dims = visibleFilterDimensions();
		expect(dims).not.toContain("status");
		expect(dims).not.toContain("location");
		// Everything else still shows.
		expect(dims).toContain("category");
		expect(dims).toContain("color");
	});

	it("shows status and location when the flag is on", () => {
		vi.stubEnv("VITE_SHOW_STATUS_LOCATION", "true");
		expect(visibleFilterDimensions()).toEqual(FILTER_DIMENSIONS);
	});
});
