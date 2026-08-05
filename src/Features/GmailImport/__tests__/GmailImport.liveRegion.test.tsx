/**
 * Screen-reader status announcements during search.
 *
 * `.gmail-loading[role="status"]` (the visible spinner+text block) is only
 * mounted while `isSearching` is true — the whole subtree, text included,
 * appears in one React commit. Live-region reliability across screen readers
 * generally requires the region to already exist in the DOM *before* its
 * content changes; inserting the node and its content together is
 * inconsistently announced. `.gr-live-status` is a second, permanently
 * mounted, visually-hidden `aria-live="polite"` region whose *text* changes
 * as state changes, which is the reliable pattern — these tests pin that it
 * exists at every render and always carries the current status in words.
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("framer-motion", () => ({
	motion: new Proxy({}, { get: () => "div" }),
	AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../../../context/GmailAuthContext", () => ({
	useGmailAuthContext: () => ({
		accessToken: "mock-token",
		isAuthenticated: true,
		error: null,
		isLoading: false,
		login: vi.fn(),
		logout: vi.fn(),
	}),
}));

vi.mock("../../Onboarding/useGoogleUnverifiedNotice", () => ({
	useGoogleUnverifiedNotice: () => ({
		isOpen: false,
		requestGoogleSignIn: (proceed: () => void) => proceed(),
		confirm: vi.fn(),
		dismiss: vi.fn(),
	}),
}));

vi.mock("../../../hooks/useProfile", () => ({
	useProfile: () => ({ profile: null, isLoading: false, error: null, updateDisplayName: vi.fn() }),
}));

const searchState = {
	emails: [] as unknown[],
	isSearching: false,
	isFetchingMore: false,
	isFetchingBody: false,
	progress: null as { fetched: number; total: number } | null,
	error: null,
	searchEmails: vi.fn(),
	fetchNextPage: vi.fn(),
	hasNextPage: false,
	fetchEmailBody: vi.fn(),
	filterCachedEmails: vi.fn(),
	clearCache: vi.fn(),
	cachedCount: 0,
	searchMode: null as "filter" | null,
};

vi.mock("../../../hooks/useAdvancedSearch", () => ({
	useAdvancedSearch: () => searchState,
}));

import GmailImport from "../GmailImport";

describe("GmailImport screen-reader status", () => {
	it("has a persistent live region present even before a search starts", () => {
		render(<GmailImport onImport={vi.fn()} />);
		const region = screen.getByTestId("gmail-live-status");
		expect(region).toBeInTheDocument();
		expect(region).toHaveAttribute("aria-live", "polite");
	});

	it("announces the initial search in words", () => {
		searchState.isSearching = true;
		searchState.progress = null;
		render(<GmailImport onImport={vi.fn()} />);
		expect(screen.getByTestId("gmail-live-status")).toHaveTextContent(/searching your inbox/i);
	});

	it("announces fetch progress by count as it updates", () => {
		searchState.isSearching = true;
		searchState.progress = { fetched: 3, total: 12 };
		render(<GmailImport onImport={vi.fn()} />);
		expect(screen.getByTestId("gmail-live-status")).toHaveTextContent(/found 12 emails.*3\/12/i);
	});

	it("clears the announcement once the search finishes", () => {
		searchState.isSearching = false;
		searchState.progress = null;
		render(<GmailImport onImport={vi.fn()} />);
		expect(screen.getByTestId("gmail-live-status")).toHaveTextContent("");
	});
});
