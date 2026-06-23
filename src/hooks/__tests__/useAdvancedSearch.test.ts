import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useAdvancedSearch } from "../useAdvancedSearch";
import { GMAIL_CACHE_KEY, GMAIL_CACHE_BODIES_KEY } from "../../Features/GmailImport/constants";
import type { GmailEmailMeta } from "../useAdvancedSearch";

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeEmail = (overrides: Partial<GmailEmailMeta> = {}): GmailEmailMeta => ({
	id: "email-1",
	threadId: "thread-1",
	subject: "Order Confirmation",
	from: "noreply@aritzia.com",
	date: "2024-03-15",
	snippet: "thank you for your purchase",
	...overrides,
});

const emptyParams = {
	subjects: [],
	from: "",
	after: "",
	before: "",
	excludedSenders: [],
	bodyKeywords: [],
};

function seedCache(emails: GmailEmailMeta[]) {
	sessionStorage.setItem(
		GMAIL_CACHE_KEY,
		JSON.stringify({ timestamp: Date.now(), emails, nextPageToken: null }),
	);
}

beforeEach(() => {
	localStorage.clear();
	sessionStorage.clear();
});

// ── filterCachedEmails ────────────────────────────────────────────────────────
// These tests exercise the client-side filtering logic without any API calls.

describe("useAdvancedSearch — filterCachedEmails", () => {
	it("returns all emails when no filters are active", () => {
		const emails = [makeEmail({ id: "a" }), makeEmail({ id: "b" })];
		seedCache(emails);

		const { result } = renderHook(() => useAdvancedSearch());
		act(() => result.current.filterCachedEmails(emptyParams));

		expect(result.current.emails).toHaveLength(2);
	});

	it("filters by subject keyword (case insensitive)", () => {
		const emails = [
			makeEmail({ id: "match", subject: "Order Confirmation from Zara" }),
			makeEmail({ id: "no-match", subject: "Your shipping update" }),
		];
		seedCache(emails);

		const { result } = renderHook(() => useAdvancedSearch());
		act(() => result.current.filterCachedEmails({ ...emptyParams, subjects: ["order confirmation"] }));

		expect(result.current.emails).toHaveLength(1);
		expect(result.current.emails[0].id).toBe("match");
	});

	it("excludes emails from excluded senders", () => {
		const emails = [
			makeEmail({ id: "keep", from: "noreply@aritzia.com" }),
			makeEmail({ id: "exclude", from: "noreply@spam.com" }),
		];
		seedCache(emails);

		const { result } = renderHook(() => useAdvancedSearch());
		act(() => result.current.filterCachedEmails({ ...emptyParams, excludedSenders: ["spam.com"] }));

		expect(result.current.emails).toHaveLength(1);
		expect(result.current.emails[0].id).toBe("keep");
	});

	it("filters by specific sender", () => {
		const emails = [
			makeEmail({ id: "a", from: "noreply@aritzia.com" }),
			makeEmail({ id: "b", from: "orders@zara.com" }),
		];
		seedCache(emails);

		const { result } = renderHook(() => useAdvancedSearch());
		act(() => result.current.filterCachedEmails({ ...emptyParams, from: "aritzia.com" }));

		expect(result.current.emails).toHaveLength(1);
		expect(result.current.emails[0].id).toBe("a");
	});

	it("filters by date range — excludes emails outside the window", () => {
		const emails = [
			makeEmail({ id: "in-range", date: "2024-03-15" }),
			makeEmail({ id: "too-old", date: "2023-01-01" }),
			makeEmail({ id: "too-new", date: "2025-01-01" }),
		];
		seedCache(emails);

		const { result } = renderHook(() => useAdvancedSearch());
		act(() =>
			result.current.filterCachedEmails({
				...emptyParams,
				after: "2024-01-01",
				before: "2024-12-31",
			}),
		);

		expect(result.current.emails).toHaveLength(1);
		expect(result.current.emails[0].id).toBe("in-range");
	});

	it("filters by body keyword against the snippet", () => {
		const emails = [
			makeEmail({ id: "match", snippet: "your receipt is attached" }),
			makeEmail({ id: "no-match", snippet: "your package has shipped" }),
		];
		seedCache(emails);

		const { result } = renderHook(() => useAdvancedSearch());
		act(() => result.current.filterCachedEmails({ ...emptyParams, bodyKeywords: ["receipt"] }));

		expect(result.current.emails).toHaveLength(1);
		expect(result.current.emails[0].id).toBe("match");
	});

	it("combines multiple filters (AND logic across dimensions)", () => {
		const emails = [
			makeEmail({ id: "all-match", from: "noreply@aritzia.com", subject: "Order Confirmation", snippet: "receipt" }),
			makeEmail({ id: "wrong-sender", from: "noreply@zara.com", subject: "Order Confirmation", snippet: "receipt" }),
			makeEmail({ id: "wrong-keyword", from: "noreply@aritzia.com", subject: "Order Confirmation", snippet: "shipping" }),
		];
		seedCache(emails);

		const { result } = renderHook(() => useAdvancedSearch());
		act(() =>
			result.current.filterCachedEmails({
				...emptyParams,
				from: "aritzia.com",
				bodyKeywords: ["receipt"],
			}),
		);

		expect(result.current.emails).toHaveLength(1);
		expect(result.current.emails[0].id).toBe("all-match");
	});

	it("returns empty array when no emails match", () => {
		seedCache([makeEmail({ subject: "Order Confirmation" })]);

		const { result } = renderHook(() => useAdvancedSearch());
		act(() => result.current.filterCachedEmails({ ...emptyParams, subjects: ["no match possible xyz"] }));

		expect(result.current.emails).toHaveLength(0);
	});
});

describe("useAdvancedSearch — initial state", () => {
	it("starts with empty emails, not searching, no error", () => {
		const { result } = renderHook(() => useAdvancedSearch());
		expect(result.current.emails).toHaveLength(0);
		expect(result.current.isSearching).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it("reports cachedCount from pre-existing sessionStorage cache", () => {
		seedCache([makeEmail({ id: "a" }), makeEmail({ id: "b" })]);
		const { result } = renderHook(() => useAdvancedSearch());
		expect(result.current.cachedCount).toBe(2);
	});

	it("keeps cached inbox content out of localStorage (sessionStorage only)", () => {
		seedCache([makeEmail({ id: "a" })]);
		renderHook(() => useAdvancedSearch());
		expect(localStorage.getItem(GMAIL_CACHE_KEY)).toBeNull();
		expect(localStorage.getItem(GMAIL_CACHE_BODIES_KEY)).toBeNull();
	});

	it("purges legacy caches that older builds left in localStorage", () => {
		localStorage.setItem(GMAIL_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), emails: [], nextPageToken: null }));
		localStorage.setItem(GMAIL_CACHE_BODIES_KEY, JSON.stringify({ a: "<p>leaked body</p>" }));

		renderHook(() => useAdvancedSearch());

		expect(localStorage.getItem(GMAIL_CACHE_KEY)).toBeNull();
		expect(localStorage.getItem(GMAIL_CACHE_BODIES_KEY)).toBeNull();
	});

	it("clearCache wipes cached emails", () => {
		seedCache([makeEmail({ id: "a" }), makeEmail({ id: "b" })]);
		const { result } = renderHook(() => useAdvancedSearch());
		expect(result.current.cachedCount).toBe(2);

		act(() => result.current.clearCache());

		expect(result.current.cachedCount).toBe(0);
		expect(result.current.emails).toHaveLength(0);
	});
});
