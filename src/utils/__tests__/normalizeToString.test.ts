import { describe, it, expect } from "vitest";
import { normalizeToString } from "../normalizeToString";

describe("normalizeToString", () => {
	it("returns a string unchanged", () => {
		expect(normalizeToString("cotton")).toBe("cotton");
	});

	it("converts a number to string", () => {
		expect(normalizeToString(42)).toBe("42");
	});

	it("joins a string array with spaces", () => {
		expect(normalizeToString(["hand wash", "cold water"])).toBe("hand wash cold water");
	});

	it("returns empty string for an empty array", () => {
		expect(normalizeToString([])).toBe("");
	});

	it("returns empty string for a mixed array (not all strings)", () => {
		expect(normalizeToString(["cotton", 50])).toBe("");
	});

	it("converts true to 'True'", () => {
		expect(normalizeToString(true)).toBe("True");
	});

	it("converts false to 'False'", () => {
		expect(normalizeToString(false)).toBe("False");
	});

	it("returns empty string for null", () => {
		expect(normalizeToString(null)).toBe("");
	});

	it("returns empty string for undefined", () => {
		expect(normalizeToString(undefined)).toBe("");
	});
});
