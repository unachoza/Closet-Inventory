/**
 * The two nav guards are deliberately independent slots (see the doc
 * comment on RevealGuard in ViewContext.tsx) — this verifies they actually
 * behave that way: each can hold a navigation on its own, without the other
 * registered, and one being cleared doesn't affect the other.
 */
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ViewProvider, useView, useSetNavGuard, useSetRevealGuard } from "../ViewContext";

vi.mock("../../lib/analytics", () => ({ track: vi.fn() }));

function Consumer({ discardGuard, revealGuard }: { discardGuard?: boolean; revealGuard?: boolean }) {
	const { view, setView } = useView();
	const setNavGuard = useSetNavGuard();
	const setRevealGuard = useSetRevealGuard();

	if (discardGuard !== undefined) setNavGuard(() => discardGuard);
	if (revealGuard !== undefined) setRevealGuard(() => revealGuard);

	return (
		<div>
			<p>view: {view}</p>
			<button type="button" onClick={() => setView("gmail")}>
				Go to gmail
			</button>
		</div>
	);
}

describe("ViewContext — nav guards", () => {
	it("navigates freely with no guard registered", () => {
		render(
			<ViewProvider>
				<Consumer />
			</ViewProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: /go to gmail/i }));
		expect(screen.getByText("view: gmail")).toBeInTheDocument();
	});

	it("the reveal guard alone holds navigation, with no discard modal shown", () => {
		render(
			<ViewProvider>
				<Consumer revealGuard={true} />
			</ViewProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: /go to gmail/i }));

		// Held — view never changed.
		expect(screen.getByText("view: carousel")).toBeInTheDocument();
		// And critically: NOT the discard-confirm modal (a different guard's
		// consequence) — the reveal guard's own caller is responsible for
		// showing whatever UI it wants as a side effect.
		expect(screen.queryByText("Discard this item?")).not.toBeInTheDocument();
	});

	it("the discard guard alone holds navigation and shows its own modal", () => {
		render(
			<ViewProvider>
				<Consumer discardGuard={true} />
			</ViewProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: /go to gmail/i }));

		expect(screen.getByText("view: carousel")).toBeInTheDocument();
		expect(screen.getByText("Discard this item?")).toBeInTheDocument();
	});

	it("clearing one guard does not affect the other", () => {
		const { rerender } = render(
			<ViewProvider>
				<Consumer discardGuard={true} revealGuard={true} />
			</ViewProvider>,
		);
		fireEvent.click(screen.getByRole("button", { name: /go to gmail/i }));
		expect(screen.getByText("view: carousel")).toBeInTheDocument();

		// Clear only the discard guard — reveal guard should still hold.
		rerender(
			<ViewProvider>
				<Consumer discardGuard={false} revealGuard={true} />
			</ViewProvider>,
		);
		act(() => fireEvent.click(screen.getByRole("button", { name: /go to gmail/i })));
		expect(screen.getByText("view: carousel")).toBeInTheDocument();
	});

	it("a reveal guard returning false lets navigation proceed normally", () => {
		render(
			<ViewProvider>
				<Consumer revealGuard={false} />
			</ViewProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: /go to gmail/i }));
		expect(screen.getByText("view: gmail")).toBeInTheDocument();
	});
});
