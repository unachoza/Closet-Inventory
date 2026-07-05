import { describe, it, expect } from "vitest";
import { getLocation, isPrimaryLocation, LOCATIONS, PRIMARY_LOCATION } from "../locations";

describe("locations", () => {
	it("exposes a primary (home) location", () => {
		expect(PRIMARY_LOCATION.kind).toBe("home");
		expect(PRIMARY_LOCATION.isPrimary).toBe(true);
	});

	it("resolves a known id to its record", () => {
		expect(getLocation("storage").kind).toBe("storage");
		expect(getLocation("suitcase").label).toBe("Suitcase");
	});

	it("falls back to the primary location for absent or unknown ids", () => {
		expect(getLocation(undefined)).toBe(PRIMARY_LOCATION);
		expect(getLocation("")).toBe(PRIMARY_LOCATION);
		expect(getLocation("does-not-exist")).toBe(PRIMARY_LOCATION);
	});

	it("treats absent / home ids as primary and away ids as not-primary", () => {
		expect(isPrimaryLocation(undefined)).toBe(true);
		expect(isPrimaryLocation("home")).toBe(true);
		expect(isPrimaryLocation("storage")).toBe(false);
		expect(isPrimaryLocation("suitcase")).toBe(false);
		expect(isPrimaryLocation("other")).toBe(false);
	});

	it("has unique ids in the starter set", () => {
		const ids = LOCATIONS.map((l) => l.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});
