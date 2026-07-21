import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ViewProvider, useView, useSetNavGuard } from "./ViewContext";

vi.mock("../lib/analytics", () => ({ track: vi.fn() }));

/** Minimal consumer: registers a guard and exposes nav buttons like BottomNav. */
function Harness({ guard }: { guard: (() => boolean) | null }) {
	const { view, setView } = useView();
	const setNavGuard = useSetNavGuard();
	setNavGuard(guard);
	return (
		<div>
			<span data-testid="current-view">{view}</span>
			<button type="button" onClick={() => setView("gmail")}>
				go-email
			</button>
		</div>
	);
}

describe("ViewContext — nav guard", () => {
	it("navigates freely when no guard is registered", () => {
		render(
			<ViewProvider>
				<Harness guard={null} />
			</ViewProvider>,
		);
		fireEvent.click(screen.getByText("go-email"));
		expect(screen.getByTestId("current-view")).toHaveTextContent("gmail");
	});

	it("navigates freely when the guard reports clean state", () => {
		render(
			<ViewProvider>
				<Harness guard={() => false} />
			</ViewProvider>,
		);
		fireEvent.click(screen.getByText("go-email"));
		expect(screen.getByTestId("current-view")).toHaveTextContent("gmail");
	});

	it("intercepts navigation with a discard prompt when dirty", () => {
		render(
			<ViewProvider>
				<Harness guard={() => true} />
			</ViewProvider>,
		);
		fireEvent.click(screen.getByText("go-email"));
		expect(screen.getByTestId("current-view")).toHaveTextContent("carousel"); // stayed put
		expect(screen.getByText(/discard this item\?/i)).toBeInTheDocument();

		// Keep editing → stays, modal closes.
		fireEvent.click(screen.getByRole("button", { name: /keep editing/i }));
		expect(screen.getByTestId("current-view")).toHaveTextContent("carousel");
		expect(screen.queryByText(/discard this item\?/i)).not.toBeInTheDocument();

		// Retry and confirm Discard → navigates.
		fireEvent.click(screen.getByText("go-email"));
		fireEvent.click(screen.getByRole("button", { name: /^discard$/i }));
		expect(screen.getByTestId("current-view")).toHaveTextContent("gmail");
	});
});
