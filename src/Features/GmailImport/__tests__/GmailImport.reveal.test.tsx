/**
 * Day 0 Reveal — short-idle fallback wiring inside GmailImport.
 *
 * The primary trigger (navigate-away-after-import) lives in App.tsx and
 * isn't covered here; this only verifies the `enabled` gate GmailImport
 * passes into useIdleTimer for its own fallback: it must require an import
 * having happened (`hasImported`), no more results to page through
 * (`!hasNextPage`), and at least one email actually found — never a blind
 * "no clicks" timer regardless of those.
 */
import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import GmailImport from "../GmailImport";
import { GmailAuthProvider } from "../../../context/GmailAuthContext";
import { SupabaseAuthProvider } from "../../../context/SupabaseAuthContext";

vi.mock("../../../lib/analytics", () => ({ track: vi.fn() }));

vi.mock("../../../hooks/useGmailAuth", () => ({
	useGmailAuth: () => ({
		accessToken: "mock-token",
		isAuthenticated: true,
		error: null,
		isLoading: false,
		login: vi.fn(),
		logout: vi.fn(),
	}),
}));

const searchState = {
	emails: [] as unknown[],
	isSearching: false,
	isFetchingMore: false,
	isFetchingBody: false,
	progress: null as { fetched: number; total: number } | null,
	error: null as string | null,
	searchEmails: vi.fn(),
	fetchNextPage: vi.fn(),
	hasNextPage: false,
	fetchEmailBody: vi.fn(),
	filterCachedEmails: vi.fn(),
	clearCache: vi.fn(),
	cachedCount: 0,
	searchMode: null as string | null,
};

vi.mock("../../../hooks/useAdvancedSearch", () => ({
	useAdvancedSearch: () => ({ ...searchState }),
}));

const mockUseIdleTimer = vi.fn();
vi.mock("../../../hooks/useIdleTimer", () => ({
	useIdleTimer: (...args: unknown[]) => mockUseIdleTimer(...args),
}));

function renderImport(props: Partial<React.ComponentProps<typeof GmailImport>> = {}) {
	return render(
		<SupabaseAuthProvider>
			<GmailAuthProvider>
				<GmailImport onImport={vi.fn()} onDone={vi.fn()} {...props} />
			</GmailAuthProvider>
		</SupabaseAuthProvider>,
	);
}

const EMAIL = {
	id: "e1",
	threadId: "t1",
	subject: "Your order",
	from: "shop@example.com",
	date: "2026-06-01T00:00:00Z",
	snippet: "",
};

beforeEach(() => {
	vi.clearAllMocks();
	searchState.emails = [];
	searchState.hasNextPage = false;
});

describe("GmailImport — Day 0 Reveal idle fallback wiring", () => {
	it("is disabled with no emails, even if hasImported is true", () => {
		searchState.emails = [];
		renderImport({ hasImported: true });

		const enabled = mockUseIdleTimer.mock.calls[0][2];
		expect(enabled).toBe(false);
	});

	it("is disabled while there's still a next page to load", () => {
		searchState.emails = [EMAIL];
		searchState.hasNextPage = true;
		renderImport({ hasImported: true });

		const enabled = mockUseIdleTimer.mock.calls[0][2];
		expect(enabled).toBe(false);
	});

	it("is disabled until an import has actually happened", () => {
		searchState.emails = [EMAIL];
		searchState.hasNextPage = false;
		renderImport({ hasImported: false });

		const enabled = mockUseIdleTimer.mock.calls[0][2];
		expect(enabled).toBe(false);
	});

	it("is disabled entirely when no onDone callback is provided", () => {
		searchState.emails = [EMAIL];
		searchState.hasNextPage = false;
		renderImport({ hasImported: true, onDone: undefined });

		const enabled = mockUseIdleTimer.mock.calls[0][2];
		expect(enabled).toBe(false);
	});

	it("arms only once results are found, exhausted, imported, and onDone exists", () => {
		searchState.emails = [EMAIL];
		searchState.hasNextPage = false;
		renderImport({ hasImported: true });

		const [timeoutMs, , enabled] = mockUseIdleTimer.mock.calls[0];
		expect(enabled).toBe(true);
		// Short on purpose — this is a fallback for an already-imported,
		// already-exhausted search, not a blind long wait.
		expect(timeoutMs).toBe(10 * 1000);
	});
});
