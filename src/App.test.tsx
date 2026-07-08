/**
 * App-level tests.
 *
 * All view components are stubbed so navigation tests stay isolated. We test that:
 *   - The correct view stub is visible after each navigation action.
 *   - NavBar actions trigger the right view transitions.
 */
import { render, screen, fireEvent } from "@testing-library/react";
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
});

describe("App — view transitions", () => {
	it("starts in carousel view with the page heading visible", () => {
		render(<App />);
		expect(screen.getByRole("heading", { name: /nothing to wear/i })).toBeInTheDocument();
		expect(screen.getByTestId("view-carousel")).toBeInTheDocument();
		expect(screen.getByTestId("view-closet")).toBeInTheDocument();
	});

	it("Add Item navigates to form view", () => {
		render(<App />);
		fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
		fireEvent.click(screen.getByRole("button", { name: /add item/i }));
		expect(screen.getByTestId("view-form")).toBeInTheDocument();
		expect(screen.queryByTestId("view-carousel")).not.toBeInTheDocument();
	});

	it("from form view, Back to Carousel returns to carousel", () => {
		render(<App />);
		fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
		fireEvent.click(screen.getByRole("button", { name: /add item/i }));
		expect(screen.getByTestId("view-form")).toBeInTheDocument();
		// The form stub has a "Back to Carousel" button — click it by test id
		fireEvent.click(screen.getByTestId("view-form").querySelector("button")!);
		expect(screen.getByTestId("view-carousel")).toBeInTheDocument();
		expect(screen.queryByTestId("view-form")).not.toBeInTheDocument();
	});

	it("Import Gmail navigates to gmail view", () => {
		render(<App />);
		fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
		fireEvent.click(screen.getByRole("button", { name: /import gmail/i }));
		expect(screen.getByTestId("view-gmail")).toBeInTheDocument();
		expect(screen.queryByTestId("view-carousel")).not.toBeInTheDocument();
	});

	it("Back to Carousel from gmail returns to carousel", () => {
		render(<App />);
		fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
		fireEvent.click(screen.getByRole("button", { name: /import gmail/i }));
		fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
		fireEvent.click(screen.getByRole("button", { name: /back to carousel/i }));
		expect(screen.getByTestId("view-carousel")).toBeInTheDocument();
	});

	it("Fabric Guide navigates to fabric view", () => {
		render(<App />);
		fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
		fireEvent.click(screen.getByRole("button", { name: /fabric guide/i }));
		expect(screen.getByTestId("view-fabric")).toBeInTheDocument();
	});

	it("View All navigates to entire closet view", () => {
		render(<App />);
		fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
		fireEvent.click(screen.getByRole("button", { name: /view all/i }));
		expect(screen.getByTestId("view-entire-closet")).toBeInTheDocument();
	});
});
