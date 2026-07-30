import { describe, it, expect } from "vitest";
import { DEFAULT_SEARCH_PARAMS } from "../AdvancedSearch/AdvancedSearchUI";
import type { AdvancedSearchParams } from "../AdvancedSearch/AdvancedSearchUI";
import { describeSearchQuery, hashSearchParams } from "../searchQueryShape";

const custom = (over: Partial<AdvancedSearchParams>): AdvancedSearchParams => ({
	...DEFAULT_SEARCH_PARAMS,
	...over,
});

describe("hashSearchParams", () => {
	it("is stable for identical params", () => {
		expect(hashSearchParams(DEFAULT_SEARCH_PARAMS)).toBe(hashSearchParams({ ...DEFAULT_SEARCH_PARAMS }));
	});

	it("differs when any field changes", () => {
		const base = hashSearchParams(DEFAULT_SEARCH_PARAMS);
		expect(hashSearchParams(custom({ from: "nordstrom.com" }))).not.toBe(base);
		expect(hashSearchParams(custom({ after: "2026/01/01" }))).not.toBe(base);
		expect(hashSearchParams(custom({ subjects: ["Order Confirmation"] }))).not.toBe(base);
	});

	it("ignores field order so an equivalent query hashes the same", () => {
		const a = custom({ subjects: ["a", "b"] });
		const b = custom({ subjects: ["b", "a"] });
		expect(hashSearchParams(a)).toBe(hashSearchParams(b));
	});
});

describe("describeSearchQuery", () => {
	it("marks the shipped defaults as such and records them verbatim", () => {
		const shape = describeSearchQuery(DEFAULT_SEARCH_PARAMS);
		expect(shape.is_default).toBe(true);
		// Safe to log verbatim: these strings ship in the repo, they aren't the
		// user's own words.
		expect(shape.default_query_summary).toBeDefined();
		expect(shape.default_query_summary).toContain("Order Confirmation");
	});

	it("withholds verbatim text once the user has typed their own terms", () => {
		const shape = describeSearchQuery(custom({ from: "someone@example.com" }));
		expect(shape.is_default).toBe(false);
		expect(shape.default_query_summary).toBeUndefined();
		// The hash still allows repeat-detection without exposing the text.
		expect(shape.query_hash).toBeTruthy();
	});

	it("reports structural facts regardless of whether text is withheld", () => {
		const shape = describeSearchQuery(
			custom({ subjects: ["a", "b"], bodyKeywords: ["c"], excludedSenders: [], from: "x@y.com" }),
		);
		expect(shape.subject_count).toBe(2);
		expect(shape.body_keyword_count).toBe(1);
		expect(shape.excluded_sender_count).toBe(0);
		expect(shape.uses_from).toBe(true);
	});

	it("distinguishes which date bounds are in play", () => {
		expect(describeSearchQuery(custom({ after: "2026/01/01" })).date_range).toBe("after_only");
		expect(describeSearchQuery(custom({ before: "2026/06/01" })).date_range).toBe("before_only");
		expect(describeSearchQuery(custom({ after: "2026/01/01", before: "2026/06/01" })).date_range).toBe("both");
		expect(describeSearchQuery(DEFAULT_SEARCH_PARAMS).date_range).toBe("none");
	});

	it("counts the operators a user had to understand — the difficulty signal", () => {
		expect(describeSearchQuery(DEFAULT_SEARCH_PARAMS).operator_count).toBe(0);
		const shape = describeSearchQuery(custom({ from: "x@y.com", after: "2026/01/01", before: "2026/02/01" }));
		expect(shape.operator_count).toBe(3);
	});

	it("treats a params object equal to the defaults as default even if rebuilt", () => {
		const rebuilt = custom({});
		expect(describeSearchQuery(rebuilt).is_default).toBe(true);
	});

	it("never returns raw user text anywhere in the payload when non-default", () => {
		const secret = "divorce-lawyer@example.com";
		const shape = describeSearchQuery(custom({ from: secret }));
		expect(JSON.stringify(shape)).not.toContain(secret);
	});
});
