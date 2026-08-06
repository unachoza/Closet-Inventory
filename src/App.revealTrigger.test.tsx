/**
 * Day 0 Reveal — primary trigger (navigate away from Gmail after an import).
 *
 * This lives in App.tsx itself (not GmailImport) because GmailImport unmounts
 * the instant an import happens (the app routes to the edit view), so it
 * can't watch for "she came back and then left" on its own. This test drives
 * the real App + the real navigation, stubbing GmailImport/EditItemView/etc.
 * as simple views (same pattern as App.gmailAuth.integration.test.tsx) so the
 * thing under test is the view-transition wiring, not Gmail's own parsing
 * pipeline.
 */
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@react-oauth/google", () => ({
	GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	useGoogleLogin: () => vi.fn(),
}));

vi.mock("./hooks/useSupabaseAuth", () => ({
	useSupabaseAuth: () => ({
		session: {},
		user: { id: "test-user" },
		gmailAccessToken: null,
		isAuthenticated: true,
		isLoading: false,
		error: null,
		signIn: vi.fn(),
		signOut: vi.fn(),
	}),
}));

vi.mock("./Features/Carousel/Carousel", () => ({ default: () => <div data-testid="view-carousel">Carousel</div> }));
vi.mock("./Features/Closet/Closet", () => ({ default: () => <div data-testid="view-closet">Closet</div> }));
vi.mock("./Features/Form/Form", () => ({ default: () => <div data-testid="view-form">Form</div> }));
vi.mock("./Features/FabricCare/InteractiveGuide", () => ({ default: () => <div data-testid="view-fabric">Fabric Guide</div> }));
vi.mock("./Components/GuideComponents/FiberJourney/JourneyC", () => ({ default: () => <div data-testid="view-journey">Journey</div> }));
vi.mock("./Features/SearchCloset/EntireClosetView/EntireClosetView", () => ({
	default: () => <div data-testid="view-entire-closet">Entire Closet</div>,
}));
vi.mock("./Features/Form/EditItemView/EditItemView", () => ({ default: () => <div data-testid="view-edit">Edit Item</div> }));

// Minimal stand-in for GmailImport: a button that calls the real onImport
// prop (so App's actual handleGmailImport / hasImportedThisGmailSession
// wiring runs unmodified), plus the real onDone/hasImported props passed
// through so a future test could exercise the idle fallback too.
vi.mock("./Features/GmailImport/GmailImport", () => ({
	default: ({ onImport }: { onImport: (item: Partial<{ name: string; category: string }>) => void }) => (
		<div data-testid="view-gmail">
			<button type="button" onClick={() => onImport({ name: "Test Item", category: "tops" })}>
				Simulate Import
			</button>
		</div>
	),
}));

import App from "./App";

const openMenu = () => fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
const clickMenuItem = (name: RegExp) => {
	const drawer = document.querySelector(".nav-drawer") as HTMLElement;
	fireEvent.click(within(drawer).getByRole("button", { name }));
};
const clickBottomNav = (name: RegExp) => fireEvent.click(within(screen.getByRole("navigation", { name: /primary/i })).getByRole("button", { name }));

beforeEach(() => {
	vi.clearAllMocks();
	localStorage.clear();
	sessionStorage.clear();
	localStorage.setItem("closetly-onboarding-complete", "true");
	localStorage.setItem("closetly-last-seen-version", __APP_SEMVER__);
});

describe("Day 0 Reveal — navigate-away trigger", () => {
	it("shows the Reveal after importing, then navigating away from Gmail", async () => {
		render(<App />);

		openMenu();
		clickMenuItem(/import gmail/i);
		expect(await screen.findByTestId("view-gmail")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: /simulate import/i }));
		expect(await screen.findByTestId("view-edit")).toBeInTheDocument();

		// The gmail → edit transition above is part of the SAME import action —
		// must not have fired the Reveal yet.
		expect(screen.queryByText(/your closet, imported/i)).not.toBeInTheDocument();

		// Now leave the Gmail flow for a real top-level tab.
		clickBottomNav(/^closet$/i);

		expect(await screen.findByText(/your closet, imported/i)).toBeInTheDocument();
	});

	it("does not show the Reveal when navigating to Closet without ever importing", async () => {
		render(<App />);

		clickBottomNav(/^closet$/i);

		expect(screen.queryByText(/your closet, imported/i)).not.toBeInTheDocument();
	});

	it("only ever shows once, even across repeated gmail visits and navigations", async () => {
		render(<App />);

		openMenu();
		clickMenuItem(/import gmail/i);
		fireEvent.click(await screen.findByRole("button", { name: /simulate import/i }));
		await screen.findByTestId("view-edit");
		clickBottomNav(/^closet$/i);
		await screen.findByText(/your closet, imported/i);

		fireEvent.click(screen.getByRole("button", { name: /see your closet/i }));
		expect(screen.queryByText(/your closet, imported/i)).not.toBeInTheDocument();

		// Import again and leave again — must not re-show.
		openMenu();
		clickMenuItem(/import gmail/i);
		fireEvent.click(await screen.findByRole("button", { name: /simulate import/i }));
		await screen.findByTestId("view-edit");
		clickBottomNav(/^closet$/i);

		expect(screen.queryByText(/your closet, imported/i)).not.toBeInTheDocument();
	});
});
