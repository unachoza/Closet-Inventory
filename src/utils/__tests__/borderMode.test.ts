import { describe, it, expect } from "vitest";
import { nextBorderMode, BORDER_MODE_LABELS } from "../borderMode";

describe("borderMode", () => {
	it("cycles off → location → location_status → off", () => {
		expect(nextBorderMode("off")).toBe("location");
		expect(nextBorderMode("location")).toBe("location_status");
		expect(nextBorderMode("location_status")).toBe("off");
	});

	it("has a human label for every mode", () => {
		expect(BORDER_MODE_LABELS.off).toMatch(/off/i);
		expect(BORDER_MODE_LABELS.location).toBe("Location");
		expect(BORDER_MODE_LABELS.location_status).toBe("Location + Status");
	});
});
