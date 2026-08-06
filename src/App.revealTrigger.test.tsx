/**
 * Day 0 Reveal — primary trigger (intercepting an attempt to leave Gmail
 * after an import).
 *
 * As of 2026-08-06 this is guard-based, not a reactive "watch the view
 * change" effect: every one of the 6 ways to leave Gmail (hamburger drawer
 * items, profile button, Closet/Care/Search bottom-nav tabs, manual Add)
 * routes through the same setView() in ViewContext, so the reveal-guard
 * registered there intercepts the attempt itself and PREVENTS the
 * navigation — it doesn't let it complete and then react. This test drives
 * the real App + real navigation, stubbing GmailImport/EditItemView/etc. as
 * simple views (same pattern as App.gmailAuth.integration.test.tsx) so the
 * thing under test is the interception wiring, not Gmail's own parsing
 * pipeline or the edit form's own fields.
 *
 * The mocked EditItemView's "Simulate Add To Closet" button calls setView
 * directly, mirroring the real EditItemView's now-normalized behavior
 * (single-item Gmail imports return to "gmail", same as batch — see
 * EditItemView.tsx's handleSubmit) — this is deliberately NOT re-testing
 * that normalization itself (EditItemView.test.tsx owns that), just
 * standing in for it so the reveal-guard has a realistic view to intercept
 * a departure from.
 */
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Dispatch, SetStateAction } from "react";
import type { ViewType } from "./utils/types";

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

// Mimics EditItemView's real, now-normalized post-submit destination
// (setView("gmail")) via a button, instead of driving the real form fields.
// Also fires `onGmailItemAdded` — the real component's add-time signal that
// the reveal-guard's `hasImportedThisGmailSession` flag now depends on
// (moved off the click-time trigger to fix Bug B).
vi.mock("./Features/Form/EditItemView/EditItemView", () => ({
	default: ({ setView, onGmailItemAdded }: { setView: Dispatch<SetStateAction<ViewType>>; onGmailItemAdded?: () => void }) => (
		<div data-testid="view-edit">
			<button
				type="button"
				onClick={() => {
					onGmailItemAdded?.();
					setView("gmail");
				}}
			>
				Simulate Add To Closet
			</button>
		</div>
	),
}));

// Minimal stand-in for GmailImport: a button that calls the real onImport
// prop (so App's actual handleGmailImport / hasImportedThisGmailSession
// wiring runs unmodified).
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

// Full round trip: open Gmail, import one item, "save" it (returns to gmail).
async function importOneItem() {
	openMenu();
	clickMenuItem(/import gmail/i);
	fireEvent.click(await screen.findByRole("button", { name: /simulate import/i }));
	fireEvent.click(await screen.findByRole("button", { name: /simulate add to closet/i }));
	await screen.findByTestId("view-gmail");
}

beforeEach(() => {
	vi.clearAllMocks();
	localStorage.clear();
	sessionStorage.clear();
	localStorage.setItem("closetly-onboarding-complete", "true");
	localStorage.setItem("closetly-last-seen-version", __APP_SEMVER__);
});

describe("Day 0 Reveal — reveal-guard interception", () => {
	it("intercepts leaving Gmail after an import: the attempted navigation does not complete", async () => {
		render(<App />);
		await importOneItem();

		clickBottomNav(/^closet$/i);

		// The Reveal shows INSTEAD of Closet — the click never lands there.
		expect(await screen.findByText(/your closet, imported/i)).toBeInTheDocument();
		expect(screen.queryByTestId("view-carousel")).not.toBeInTheDocument();
	});

	it("'See your closet' completes the navigation the Reveal held", async () => {
		render(<App />);
		await importOneItem();
		clickBottomNav(/^closet$/i);
		await screen.findByText(/your closet, imported/i);

		fireEvent.click(screen.getByRole("button", { name: /see your closet/i }));

		expect(await screen.findByTestId("view-carousel")).toBeInTheDocument();
		expect(screen.queryByText(/your closet, imported/i)).not.toBeInTheDocument();
	});

	it("'Continue hunting' drops the navigation and leaves her on the email list", async () => {
		render(<App />);
		await importOneItem();
		clickBottomNav(/^closet$/i);
		await screen.findByText(/your closet, imported/i);

		fireEvent.click(screen.getByRole("button", { name: /keep searching emails/i }));

		expect(screen.queryByText(/your closet, imported/i)).not.toBeInTheDocument();
		expect(await screen.findByTestId("view-gmail")).toBeInTheDocument();
	});

	it("does not intercept navigating to Closet without ever importing", async () => {
		render(<App />);

		clickBottomNav(/^closet$/i);

		expect(await screen.findByTestId("view-carousel")).toBeInTheDocument();
		expect(screen.queryByText(/your closet, imported/i)).not.toBeInTheDocument();
	});

	it("only ever intercepts once — a later exit attempt navigates normally", async () => {
		render(<App />);
		await importOneItem();
		clickBottomNav(/^closet$/i);
		await screen.findByText(/your closet, imported/i);
		fireEvent.click(screen.getByRole("button", { name: /see your closet/i }));
		await screen.findByTestId("view-carousel");

		// Import again, then try to leave again — must navigate normally now.
		await importOneItem();
		clickBottomNav(/^closet$/i);

		expect(await screen.findByTestId("view-carousel")).toBeInTheDocument();
		expect(screen.queryByText(/your closet, imported/i)).not.toBeInTheDocument();
	});

	it("does not intercept manual Add before any import has happened", async () => {
		render(<App />);

		fireEvent.click(screen.getByRole("button", { name: /^add item$/i }));

		expect(await screen.findByTestId("view-form")).toBeInTheDocument();
	});

	it("intercepts manual Add too, once she's imported something from Gmail", async () => {
		render(<App />);
		await importOneItem();

		fireEvent.click(screen.getByRole("button", { name: /^add item$/i }));

		expect(await screen.findByText(/your closet, imported/i)).toBeInTheDocument();
		expect(screen.queryByTestId("view-form")).not.toBeInTheDocument();
	});

	// Bug A regression: a second import started while still on the email list
	// must land on the edit screen, not be swallowed by the reveal-guard —
	// "edit" is deliberately absent from the destination allowlist.
	it("does not swallow a second import's navigation to edit after the first import", async () => {
		render(<App />);
		await importOneItem();

		fireEvent.click(await screen.findByRole("button", { name: /simulate import/i }));

		expect(await screen.findByTestId("view-edit")).toBeInTheDocument();
		expect(screen.queryByText(/your closet, imported/i)).not.toBeInTheDocument();
	});
});
