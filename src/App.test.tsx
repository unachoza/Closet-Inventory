/**
 * App-level tests.
 *
 * All view components are stubbed so navigation tests stay isolated. We test that:
 *   - The correct view stub is visible after each navigation action.
 *   - NavBar actions trigger the right view transitions.
 */
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// GmailAuthProvider (mounted in App) calls useGmailAuth → useGoogleLogin, which
// requires GoogleOAuthProvider. These navigation tests deliberately avoid real
// auth, so mock the hook — the provider then mounts harmlessly.
vi.mock("./hooks/useGmailAuth", () => ({
	useGmailAuth: () => ({
		accessToken: null,
		isAuthenticated: false,
		error: null,
		isLoading: false,
		login: vi.fn(),
		logout: vi.fn(),
	}),
}));

// Gmail import sits behind ImportAccountGate, which requires a Supabase account.
// These are navigation tests, so treat the user as signed in — the gate's own
// behaviour is covered in ImportAccountGate.test.tsx.
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

// ── Stub all view components ──────────────────────────────────────────────────
vi.mock("./Features/Carousel/Carousel", () => ({
	default: () => <div data-testid="view-carousel">Carousel</div>,
}));
vi.mock("./Features/Closet/Closet", () => ({
	default: () => <div data-testid="view-closet">Closet</div>,
}));
vi.mock("./Features/Form/Form", () => ({
	default: ({ setView }: { setView: (v: string) => void }) => (
		<div data-testid="view-form">
			Form
			<button onClick={() => setView("carousel")}>Back to Carousel</button>
		</div>
	),
}));
vi.mock("./Features/GmailImport/GmailImport", () => ({
	default: () => <div data-testid="view-gmail">Gmail Import</div>,
}));
vi.mock("./Features/FabricCare/InteractiveGuide", () => ({
	default: () => <div data-testid="view-fabric">Fabric Guide</div>,
}));
vi.mock("./Components/GuideComponents/FiberJourney/JourneyC", () => ({
	default: () => <div data-testid="view-journey">Fiber Journey</div>,
}));
vi.mock("./Features/SearchCloset/EntireClosetView/EntireClosetView", () => ({
	default: () => <div data-testid="view-entire-closet">Entire Closet</div>,
}));
vi.mock("./Features/Form/EditItemView/EditItemView", () => ({
	default: () => <div data-testid="view-edit">Edit Item</div>,
}));

import App from "./App";

beforeEach(() => {
	vi.clearAllMocks();
	localStorage.clear();
	// Skip the first-launch onboarding so these tests exercise the app views.
	localStorage.setItem("closetly-onboarding-complete", "true");
	// Skip the "what's changed" card too — otherwise a returning user (set
	// above) with no last-seen-version reads as due for it, per useWhatsChanged.
	localStorage.setItem("closetly-last-seen-version", __APP_SEMVER__);
});

describe("App — view transitions", () => {
	it("starts in carousel view with the page heading visible", () => {
		render(<App />);
		expect(screen.getByRole("heading", { name: /nothing to wear/i })).toBeInTheDocument();
		expect(screen.getByTestId("view-carousel")).toBeInTheDocument();
		expect(screen.getByTestId("view-closet")).toBeInTheDocument();
	});

	// "Add Item" exists in BOTH the drawer and the mobile BottomNav FAB
	// (E5-1.3), so drawer clicks must be scoped to the drawer element.
	const clickDrawerAddItem = () => {
		const drawer = document.querySelector(".nav-drawer") as HTMLElement;
		fireEvent.click(within(drawer).getByRole("button", { name: /add item/i }));
	};

	it("Add Item navigates to form view", async () => {
		render(<App />);
		fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
		clickDrawerAddItem();
		expect(await screen.findByTestId("view-form")).toBeInTheDocument();
		expect(screen.queryByTestId("view-carousel")).not.toBeInTheDocument();
	});

	it("from form view, Back to Carousel returns to carousel", async () => {
		render(<App />);
		fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
		clickDrawerAddItem();
		expect(await screen.findByTestId("view-form")).toBeInTheDocument();
		// The form stub has a "Back to Carousel" button — click it by test id
		fireEvent.click(screen.getByTestId("view-form").querySelector("button")!);
		expect(await screen.findByTestId("view-carousel")).toBeInTheDocument();
		expect(screen.queryByTestId("view-form")).not.toBeInTheDocument();
	});

	it("Import Gmail navigates to gmail view", async () => {
		render(<App />);
		fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
		fireEvent.click(screen.getByRole("button", { name: /import gmail/i }));
		expect(await screen.findByTestId("view-gmail")).toBeInTheDocument();
		expect(screen.queryByTestId("view-carousel")).not.toBeInTheDocument();
	});

	it("Back to Carousel from gmail returns to carousel", async () => {
		render(<App />);
		fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
		fireEvent.click(screen.getByRole("button", { name: /import gmail/i }));
		await screen.findByTestId("view-gmail");
		fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
		fireEvent.click(screen.getByRole("button", { name: /back to carousel/i }));
		expect(await screen.findByTestId("view-carousel")).toBeInTheDocument();
	});

	it("Care Guide navigates to fabric view", async () => {
		render(<App />);
		fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
		fireEvent.click(screen.getByRole("button", { name: /care guide/i }));
		expect(await screen.findByTestId("view-fabric")).toBeInTheDocument();
	});

	it("Search navigates to entire closet view", async () => {
		render(<App />);
		fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
		// The drawer's own "Search" button, not the bottom-nav tab of the same
		// name — jsdom renders both regardless of the CSS breakpoint that hides
		// the tab on desktop, so an unscoped query is ambiguous here.
		const drawer = screen.getByRole("navigation", { name: /navigation menu/i });
		fireEvent.click(within(drawer).getByRole("button", { name: /^search$/i }));
		expect(await screen.findByTestId("view-entire-closet")).toBeInTheDocument();
	});
});
