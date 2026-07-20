/**
 * UX-state tests for GmailImport: friendly errors with recovery actions,
 * search progress, the body-fetch loading indicator, the zero-results state,
 * and funnel analytics (import_started on auto-search, import_results_shown
 * at count 0, import_failed with a coarse reason).
 *
 * useAdvancedSearch is mocked with a mutable object so each test can shape
 * the exact state (searching / errored / empty) it needs.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import GmailImport from "../GmailImport";
import { GmailAuthProvider } from "../../../context/GmailAuthContext";

const mockTrack = vi.fn();
vi.mock("../../../lib/analytics", () => ({
	track: (...args: unknown[]) => mockTrack(...args),
}));

const mockLogin = vi.fn();
const mockLogout = vi.fn();

vi.mock("../../../hooks/useGmailAuth", () => ({
	useGmailAuth: () => ({
		accessToken: "mock-token",
		isAuthenticated: true,
		error: null,
		isLoading: false,
		login: mockLogin,
		logout: mockLogout,
	}),
}));

const mockSearchEmails = vi.fn();
const mockFetchEmailBody = vi.fn();

// Mutable state each test overwrites before rendering.
const searchState = {
	emails: [] as unknown[],
	isSearching: false,
	isFetchingMore: false,
	isFetchingBody: false,
	progress: null as { fetched: number; total: number } | null,
	error: null as string | null,
	searchEmails: mockSearchEmails,
	fetchNextPage: vi.fn(),
	hasNextPage: false,
	fetchEmailBody: mockFetchEmailBody,
	filterCachedEmails: vi.fn(),
	clearCache: vi.fn(),
	cachedCount: 0,
	searchMode: null as string | null,
};

vi.mock("../../../hooks/useAdvancedSearch", () => ({
	useAdvancedSearch: () => ({ ...searchState }),
}));

const EMAIL_META = {
	id: "email-1",
	threadId: "t-1",
	subject: "Your order has shipped",
	from: '"Shop" <orders@shop.com>',
	date: "2026-06-01T12:00:00Z",
	snippet: "Thanks for your order",
	// body deliberately absent — forces the lazy body fetch on select
};

function renderImport() {
	return render(
		<GmailAuthProvider>
			<GmailImport onImport={vi.fn()} />
		</GmailAuthProvider>,
	);
}

beforeEach(() => {
	vi.clearAllMocks();
	window.localStorage.clear();
	window.sessionStorage.clear();
	searchState.emails = [];
	searchState.isSearching = false;
	searchState.isFetchingBody = false;
	searchState.progress = null;
	searchState.error = null;
	searchState.cachedCount = 0;
	searchState.searchMode = null;
});

describe("error states", () => {
	it("shows a friendly expired-connection message with a Reconnect button on 401", () => {
		searchState.error = 'Gmail API error (401): {"error":{"status":"UNAUTHENTICATED"}}';
		renderImport();

		expect(screen.getByRole("alert")).toHaveTextContent(/expired/i);
		expect(screen.queryByText(/401/)).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: /reconnect gmail/i })).toBeInTheDocument();
	});

	it("Reconnect triggers the Google login (notice already seen)", () => {
		window.localStorage.setItem("closetly-google-notice-seen", "true");
		searchState.error = "Gmail API error (401): expired";
		renderImport();

		fireEvent.click(screen.getByRole("button", { name: /reconnect gmail/i }));
		expect(mockLogin).toHaveBeenCalled();
	});

	it("shows a connection message with Try Again on network failure, and retries the search", () => {
		searchState.error = "Failed to fetch";
		renderImport();

		expect(screen.getByRole("alert")).toHaveTextContent(/connection/i);
		const retry = screen.getByRole("button", { name: /try again/i });
		mockSearchEmails.mockClear();
		fireEvent.click(retry);
		expect(mockSearchEmails).toHaveBeenCalledWith("mock-token", undefined, true);
	});

	it("reports import_failed with a coarse reason", () => {
		searchState.error = "Gmail API error (401): expired";
		renderImport();

		expect(mockTrack).toHaveBeenCalledWith("import_failed", { reason: "auth_expired" });
	});
});

describe("loading and progress states", () => {
	it("shows detail-loading progress counts while fetching", () => {
		searchState.isSearching = true;
		searchState.searchMode = "fetch";
		searchState.progress = { fetched: 15, total: 34 };
		renderImport();

		const status = screen.getByRole("status");
		expect(status).toHaveTextContent(/34/);
		expect(status).toHaveTextContent(/15/);
	});

	it("falls back to a generic searching message before the total is known", () => {
		searchState.isSearching = true;
		searchState.searchMode = "fetch";
		renderImport();

		expect(screen.getByRole("status")).toHaveTextContent(/searching your inbox/i);
	});

	it("shows an opening indicator while an email body is being fetched", async () => {
		searchState.emails = [EMAIL_META];
		searchState.cachedCount = 1;
		// Body fetch never resolves within the test — the indicator must show.
		mockFetchEmailBody.mockReturnValue(new Promise(() => {}));
		renderImport();

		fireEvent.click(screen.getByRole("checkbox", { name: /select email/i }));

		await waitFor(() => {
			expect(screen.getByText(/opening email/i)).toBeInTheDocument();
		});
	});
});

describe("empty state", () => {
	it("shows friendly zero-results copy with an Open Advanced Search action", () => {
		renderImport();

		expect(screen.getByText(/no order emails found/i)).toBeInTheDocument();
		const openBtn = screen.getByRole("button", { name: /open advanced search/i });
		fireEvent.click(openBtn);
		// AdvancedSearchUI expands — its toggle flips to "Hide Advanced Search"
		expect(screen.getByText(/hide advanced search/i)).toBeInTheDocument();
	});

	it("does not show the empty state while an error is displayed", () => {
		searchState.error = "Failed to fetch";
		renderImport();

		expect(screen.queryByText(/no order emails found/i)).not.toBeInTheDocument();
	});
});

describe("funnel analytics", () => {
	it("fires import_started {mode: auto} for the on-connect auto-search with an empty cache", () => {
		renderImport();

		expect(mockTrack).toHaveBeenCalledWith("import_started", { mode: "auto" });
	});

	it("does not fire the auto import_started when results are already cached", () => {
		searchState.emails = [EMAIL_META];
		searchState.cachedCount = 1;
		renderImport();

		expect(mockTrack).not.toHaveBeenCalledWith("import_started", { mode: "auto" });
	});

	it("fires import_results_shown with count 0 when a search settles empty", () => {
		searchState.isSearching = true;
		searchState.searchMode = "fetch";
		const { rerender } = renderImport();

		searchState.isSearching = false;
		searchState.searchMode = null;
		rerender(
			<GmailAuthProvider>
				<GmailImport onImport={vi.fn()} />
			</GmailAuthProvider>,
		);

		expect(mockTrack).toHaveBeenCalledWith("import_results_shown", { count: 0 });
	});
});
