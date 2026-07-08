import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { useLongPress } from "../useLongPress";

/**
 * P1-4 — long-press gesture. The tricky web behaviors are what these tests lock in:
 * hold fires onLongPress and swallows the trailing click; movement cancels; a short
 * tap is a normal click.
 */

function Harness({ onLongPress, onClick }: { onLongPress: () => void; onClick: () => void }) {
	const handlers = useLongPress({ onLongPress, onClick, delay: 500, moveTolerance: 10 });
	return (
		<button data-testid="target" {...handlers}>
			card
		</button>
	);
}

describe("useLongPress", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it("fires onLongPress after the hold delay", () => {
		const onLongPress = vi.fn();
		const onClick = vi.fn();
		render(<Harness onLongPress={onLongPress} onClick={onClick} />);
		const el = screen.getByTestId("target");

		fireEvent.pointerDown(el, { clientX: 0, clientY: 0 });
		expect(onLongPress).not.toHaveBeenCalled();
		vi.advanceTimersByTime(500);
		expect(onLongPress).toHaveBeenCalledTimes(1);
	});

	it("a long-press swallows the trailing click (card must not also open)", () => {
		const onLongPress = vi.fn();
		const onClick = vi.fn();
		render(<Harness onLongPress={onLongPress} onClick={onClick} />);
		const el = screen.getByTestId("target");

		fireEvent.pointerDown(el, { clientX: 0, clientY: 0 });
		vi.advanceTimersByTime(500);
		fireEvent.pointerUp(el);
		fireEvent.click(el);

		expect(onLongPress).toHaveBeenCalledTimes(1);
		expect(onClick).not.toHaveBeenCalled();
	});

	it("a short tap is a normal click, not a long-press", () => {
		const onLongPress = vi.fn();
		const onClick = vi.fn();
		render(<Harness onLongPress={onLongPress} onClick={onClick} />);
		const el = screen.getByTestId("target");

		fireEvent.pointerDown(el, { clientX: 0, clientY: 0 });
		vi.advanceTimersByTime(200); // released before the threshold
		fireEvent.pointerUp(el);
		fireEvent.click(el);

		expect(onLongPress).not.toHaveBeenCalled();
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("movement beyond tolerance cancels the hold (it's a scroll)", () => {
		const onLongPress = vi.fn();
		const onClick = vi.fn();
		render(<Harness onLongPress={onLongPress} onClick={onClick} />);
		const el = screen.getByTestId("target");

		fireEvent.pointerDown(el, { clientX: 0, clientY: 0 });
		fireEvent.pointerMove(el, { clientX: 0, clientY: 40 }); // scrolled
		vi.advanceTimersByTime(500);

		expect(onLongPress).not.toHaveBeenCalled();
	});

	it("prevents the native context menu (touch callout)", () => {
		render(<Harness onLongPress={vi.fn()} onClick={vi.fn()} />);
		const el = screen.getByTestId("target");
		const prevented = !fireEvent.contextMenu(el);
		expect(prevented).toBe(true);
	});
});
