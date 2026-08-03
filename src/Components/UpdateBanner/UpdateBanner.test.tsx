import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { useAppUpdate } = vi.hoisted(() => ({ useAppUpdate: vi.fn() }));
vi.mock("../../hooks/useAppUpdate", () => ({ useAppUpdate }));

import UpdateBanner from "./UpdateBanner";

describe("UpdateBanner", () => {
	it("renders nothing when no update is ready", () => {
		useAppUpdate.mockReturnValue({ updateReady: false, applyUpdate: vi.fn() });
		const { container } = render(<UpdateBanner />);

		expect(container).toBeEmptyDOMElement();
	});

	it("shows a refresh prompt when an update is ready", () => {
		useAppUpdate.mockReturnValue({ updateReady: true, applyUpdate: vi.fn() });
		render(<UpdateBanner />);

		expect(screen.getByText(/new version/i)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
	});

	it("calls applyUpdate when Refresh is clicked", () => {
		const applyUpdate = vi.fn();
		useAppUpdate.mockReturnValue({ updateReady: true, applyUpdate });
		render(<UpdateBanner />);

		fireEvent.click(screen.getByRole("button", { name: /refresh/i }));

		expect(applyUpdate).toHaveBeenCalled();
	});

	it("dismissing hides the banner without reloading", () => {
		const applyUpdate = vi.fn();
		useAppUpdate.mockReturnValue({ updateReady: true, applyUpdate });
		render(<UpdateBanner />);

		fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));

		expect(screen.queryByText(/new version/i)).not.toBeInTheDocument();
		expect(applyUpdate).not.toHaveBeenCalled();
	});
});
