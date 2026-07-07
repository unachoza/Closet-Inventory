import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { mockAuth, svc } = vi.hoisted(() => ({
	mockAuth: { isAuthenticated: true, user: { id: "u1", email: "maya@example.com" } as { id: string; email?: string } | null, signOut: vi.fn() },
	svc: { exportAccountData: vi.fn(), downloadAccountExport: vi.fn(), deleteAccount: vi.fn() },
}));
vi.mock("../../../context/SupabaseAuthContext", () => ({ useSupabaseAuthContext: () => mockAuth }));
vi.mock("../../../services/accountDataService", () => svc);

import AccountDataModal from "./AccountDataModal";

describe("AccountDataModal", () => {
	beforeEach(() => {
		mockAuth.isAuthenticated = true;
		mockAuth.user = { id: "u1", email: "maya@example.com" };
		mockAuth.signOut.mockReset();
		svc.exportAccountData.mockReset().mockResolvedValue({ userId: "u1" });
		svc.downloadAccountExport.mockReset();
		svc.deleteAccount.mockReset().mockResolvedValue(undefined);
		vi.restoreAllMocks();
	});

	it("signed out: prompts to sign in, no delete button", () => {
		mockAuth.isAuthenticated = false;
		mockAuth.user = null;
		render(<AccountDataModal isOpen onClose={() => {}} />);
		expect(screen.getByText(/sign in/i)).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /delete my account/i })).not.toBeInTheDocument();
	});

	it("download: exports then triggers a file download", async () => {
		render(<AccountDataModal isOpen onClose={() => {}} />);
		fireEvent.click(screen.getByRole("button", { name: /download my data/i }));
		await waitFor(() => expect(svc.exportAccountData).toHaveBeenCalledWith("u1"));
		expect(svc.downloadAccountExport).toHaveBeenCalledWith({ userId: "u1" });
	});

	it("delete: on confirm, deletes account and signs out", async () => {
		vi.spyOn(window, "confirm").mockReturnValue(true);
		render(<AccountDataModal isOpen onClose={() => {}} />);
		fireEvent.click(screen.getByRole("button", { name: /delete my account/i }));
		await waitFor(() => expect(svc.deleteAccount).toHaveBeenCalledWith("u1"));
		await waitFor(() => expect(mockAuth.signOut).toHaveBeenCalled());
	});

	it("delete: on cancel, does nothing", () => {
		vi.spyOn(window, "confirm").mockReturnValue(false);
		render(<AccountDataModal isOpen onClose={() => {}} />);
		fireEvent.click(screen.getByRole("button", { name: /delete my account/i }));
		expect(svc.deleteAccount).not.toHaveBeenCalled();
		expect(mockAuth.signOut).not.toHaveBeenCalled();
	});
});
