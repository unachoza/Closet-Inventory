import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseAuthContext } from "../../../context/SupabaseAuthContext";
import type { SupabaseAuthState } from "../../../hooks/useSupabaseAuth";
import ImportAccountGate from "../ImportAccountGate";

const { track } = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("../../../lib/analytics", () => ({ track }));

function renderGate(auth: Partial<SupabaseAuthState>) {
	const value = {
		session: null,
		user: null,
		gmailAccessToken: null,
		isAuthenticated: false,
		isLoading: false,
		error: null,
		signIn: vi.fn(),
		signOut: vi.fn(),
		...auth,
	} as SupabaseAuthState;

	render(
		<SupabaseAuthContext.Provider value={value}>
			<ImportAccountGate>
				<div data-testid="gmail-import">Gmail Import</div>
			</ImportAccountGate>
		</SupabaseAuthContext.Provider>,
	);
	return value;
}

describe("ImportAccountGate", () => {
	beforeEach(() => track.mockClear());

	it("renders the import UI for a signed-in user", () => {
		renderGate({ isAuthenticated: true });
		expect(screen.getByTestId("gmail-import")).toBeInTheDocument();
	});

	it("blocks import and explains why when signed out", () => {
		renderGate({ isAuthenticated: false });
		expect(screen.queryByTestId("gmail-import")).not.toBeInTheDocument();
		expect(screen.getByRole("heading", { name: /create an account to import/i })).toBeInTheDocument();
	});

	it("reassures the user that existing items are kept", () => {
		renderGate({ isAuthenticated: false });
		// Local-only work must not read as something they're about to lose.
		expect(screen.getByText(/stays exactly where it is/i)).toBeInTheDocument();
	});

	it("still offers manual adds, so the gate is not a dead end", () => {
		renderGate({ isAuthenticated: false });
		expect(screen.getByText(/adding items by hand/i)).toBeInTheDocument();
	});

	it("renders nothing while auth is still resolving, so the gate never flashes", () => {
		renderGate({ isAuthenticated: false, isLoading: true });
		expect(screen.queryByTestId("gmail-import")).not.toBeInTheDocument();
		expect(screen.queryByRole("heading")).not.toBeInTheDocument();
		expect(track).not.toHaveBeenCalled();
	});

	it("reports the bounce so signed-out drop-off is visible in the funnel", () => {
		renderGate({ isAuthenticated: false });
		expect(track).toHaveBeenCalledWith("import_gate_shown");
	});

	it("does not report a gate view for a signed-in user", () => {
		renderGate({ isAuthenticated: true });
		expect(track).not.toHaveBeenCalledWith("import_gate_shown");
	});

	it("starts sign-in and tracks the intent when the CTA is clicked", () => {
		const value = renderGate({ isAuthenticated: false });
		fireEvent.click(screen.getByRole("button", { name: /create account or sign in/i }));
		expect(value.signIn).toHaveBeenCalled();
		expect(track).toHaveBeenCalledWith("import_gate_signin_clicked");
	});

	it("surfaces an auth error rather than failing silently", () => {
		renderGate({ isAuthenticated: false, error: "Google said no" });
		expect(screen.getByRole("alert")).toHaveTextContent("Google said no");
	});
});
