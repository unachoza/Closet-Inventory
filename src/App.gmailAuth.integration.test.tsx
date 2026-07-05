/**
 * E3-bug.2 regression — Gmail auth must survive leaving and returning to the
 * Gmail view (the "Back to email" flow).
 *
 * This test renders the REAL <App /> with the REAL GmailImport + REAL
 * useGmailAuth. Only the Google SDK (useGoogleLogin) and the email-fetch hook
 * (useAdvancedSearch) are mocked, so the thing under test is the actual wiring:
 * the GmailAuthProvider must sit ABOVE the view switch so the in-memory token
 * is not destroyed when GmailImport unmounts on navigation.
 *
 * Navigating gmail → form → gmail unmounts and remounts GmailImport exactly the
 * way gmail → edit → "Back to email" does. With the provider lifted above the
 * switch the token persists (email list shown). If the provider lived below the
 * switch (the bug), the token would die on unmount and the user would be dumped
 * back to the "Connect Gmail Account" screen — this test would go red.
 */
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Google SDK: capture onSuccess so we can drive the REAL useGmailAuth ────────
let capturedOnSuccess: ((resp: { access_token: string; expires_in: number }) => void) | undefined;
vi.mock("@react-oauth/google", () => ({
	GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	useGoogleLogin: (config: { onSuccess: (resp: { access_token: string; expires_in: number }) => void }) => {
		capturedOnSuccess = config.onSuccess;
		return vi.fn();
	},
}));

// ── Email source: a static cached list so the authenticated view shows results ─
vi.mock("./hooks/useAdvancedSearch", () => ({
	useAdvancedSearch: () => ({
		emails: [
			{
				id: "e1",
				threadId: "t1",
				subject: "Your ZARA order has been received",
				from: '"ZARA" <no-reply@zara.com>',
				date: "2018-06-21T12:00:00Z",
				snippet: "Thank you for your purchase",
				body: "",
			},
		],
		isSearching: false,
		isFetchingMore: false,
		error: null,
		searchEmails: vi.fn(),
		fetchNextPage: vi.fn(),
		hasNextPage: false,
		fetchEmailBody: vi.fn(),
		filterCachedEmails: vi.fn(),
		clearCache: vi.fn(),
		cachedCount: 1,
		searchMode: null,
	}),
}));

// ── Stub sibling views (NOT GmailImport — that's the component under test) ─────
vi.mock("./Features/Carousel/Carousel", () => ({ default: () => <div data-testid="view-carousel">Carousel</div> }));
vi.mock("./Features/Closet/Closet", () => ({ default: () => <div data-testid="view-closet">Closet</div> }));
vi.mock("./Features/Form/Form", () => ({ default: () => <div data-testid="view-form">Form</div> }));
vi.mock("./Features/FabricCare/InteractiveGuide", () => ({ default: () => <div data-testid="view-fabric">Fabric Guide</div> }));
vi.mock("./Components/GuideComponents/FiberJourney/JourneyC", () => ({ default: () => <div data-testid="view-journey">Journey</div> }));
vi.mock("./Features/SearchCloset/EntireClosetView", () => ({ default: () => <div data-testid="view-entire-closet">Entire Closet</div> }));
vi.mock("./Features/Form/EditItemView/EditItemView", () => ({ default: () => <div data-testid="view-edit">Edit Item</div> }));

import App from "./App";

const openMenu = () => fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
const clickMenuItem = (name: RegExp) => fireEvent.click(screen.getByRole("button", { name }));

beforeEach(() => {
	vi.clearAllMocks();
	localStorage.clear();
	sessionStorage.clear();
	localStorage.setItem("closetly-onboarding-complete", "true");
	capturedOnSuccess = undefined;
});

describe("E3-bug.2 — Gmail auth survives leaving and returning to the Gmail view", () => {
	it("stays authenticated after gmail → another view → back to gmail (no re-auth)", () => {
		render(<App />);

		// Navigate to the Gmail view — starts unauthenticated (Connect screen).
		openMenu();
		clickMenuItem(/import gmail/i);
		expect(screen.getByRole("button", { name: /connect gmail account/i })).toBeInTheDocument();

		// Authenticate through the REAL useGmailAuth via the captured Google onSuccess.
		act(() => capturedOnSuccess?.({ access_token: "tok-xyz", expires_in: 3600 }));
		expect(screen.getByTestId("email-count")).toHaveTextContent(/found 1 email/i);
		expect(screen.queryByRole("button", { name: /connect gmail account/i })).not.toBeInTheDocument();

		// Leave the Gmail view → this UNMOUNTS GmailImport (same as importing an item).
		openMenu();
		clickMenuItem(/add item/i);
		expect(screen.getByTestId("view-form")).toBeInTheDocument();

		// Return to Gmail ("Back to email") → GmailImport REMOUNTS.
		openMenu();
		clickMenuItem(/import gmail/i);

		// THE GUARD: the session-scoped provider kept the token alive, so the user
		// lands back on their email list — NOT the re-auth screen.
		// expect(screen.getByText(/Found 1 email/i)).toBeInTheDocument();
		expect(screen.getByTestId('email-count')).toHaveTextContent(/found 1 email/i);
		expect(screen.queryByRole("button", { name: /connect gmail account/i })).not.toBeInTheDocument();
	});
});
