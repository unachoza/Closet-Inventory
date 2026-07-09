import { describe, it, expect, beforeEach } from "vitest";
import { getConsent, setConsent } from "../consent";

describe("consent", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("defaults to undecided when nothing is stored", () => {
		expect(getConsent()).toBe("undecided");
	});

	it("persists granted", () => {
		setConsent("granted");
		expect(getConsent()).toBe("granted");
	});

	it("persists declined", () => {
		setConsent("declined");
		expect(getConsent()).toBe("declined");
	});

	it("treats a garbage stored value as undecided", () => {
		localStorage.setItem("closetly-analytics-consent", "yes-please");
		expect(getConsent()).toBe("undecided");
	});
});
