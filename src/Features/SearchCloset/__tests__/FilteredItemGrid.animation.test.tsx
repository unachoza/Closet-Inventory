/**
 * Regression tests for the entire-closet grid ENTRANCE STAGGER + in-place removal.
 *
 * Background (the bug these guard against): a previous "fix" for the remove-from-
 * overview bug replaced the per-card stagger with parent `staggerChildren`
 * orchestration wrapped in an inner AnimatePresence. That combination silently
 * broke variant propagation — the cards rendered but never animated in, so the
 * initial / filter / sort / search entrance stagger disappeared entirely
 * (verified in-browser: card wrappers had no inline style and opacity stayed
 * pinned at 1 the whole time).
 *
 * The working contract these tests lock in:
 *   1. Each card owns its OWN entrance animation (initial="hidden" → animate="show"
 *      → exit="exit") rather than relying on parent orchestration through
 *      AnimatePresence.
 *   2. The stagger is driven by a per-index `custom` delay (0, 1, 2, …).
 *   3. The grid container is keyed by `gridKey`, so a filter/search/sort change
 *      REMOUNTS it (replays the entrance), while a plain removal (same gridKey,
 *      fewer items) keeps the SAME container node so cards animate out in place
 *      instead of the whole grid blanking and re-staggering.
 *
 * jsdom can't run real animations, so we assert the props that DRIVE the
 * animation instead — mocking framer-motion to surface them as data-attributes.
 */
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createElement, type ReactNode } from "react";
import FilteredItemGrid from "../FilteredItemGrid";
import type { ClothingItem } from "../../../utils/types";

// Lightweight framer-motion mock: render motion.* as the plain tag and surface
// the animation-driving props as data-attributes so we can assert on them.
// AnimatePresence is a passthrough fragment.
vi.mock("framer-motion", () => {
	const mk =
		(tag: string) =>
		({
			children,
			initial,
			animate,
			exit,
			custom,
			variants,
			layout,
			...rest
		}: {
			children?: ReactNode;
			initial?: unknown;
			animate?: unknown;
			exit?: unknown;
			custom?: number;
			variants?: unknown;
			layout?: boolean;
			[key: string]: unknown;
		}) => {
			const dataProps: Record<string, string> = {};
			if (typeof initial === "string") dataProps["data-initial"] = initial;
			if (typeof animate === "string") dataProps["data-animate"] = animate;
			if (typeof exit === "string") dataProps["data-exit"] = exit;
			if (custom !== undefined) dataProps["data-custom"] = String(custom);
			if (variants) dataProps["data-has-variants"] = "true";
			if (layout) dataProps["data-layout"] = "true";
			return createElement(tag, { ...rest, ...dataProps }, children);
		};
	// Memoize one component per tag — returning a fresh function each access would
	// make React treat every render as a new component type and remount endlessly,
	// defeating the key-based remount assertions below.
	const cache: Record<string, ReturnType<typeof mk>> = {};
	return {
		motion: new Proxy(
			{},
			{ get: (_t, tag) => (cache[tag as string] ??= mk(tag as string)) },
		),
		AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
	};
});

// Stub the heavy card (pulls in the full ClothingCard) — we only care about wiring.
vi.mock("../FilteredCard", () => ({
	default: ({ item }: { item: ClothingItem }) => <div data-testid="card-inner">{item.name}</div>,
}));

function makeItem(id: string, name: string): ClothingItem {
	return {
		id,
		name,
		brand: "Brand",
		category: "tops",
		color: "black",
		size: "M",
		material: [{ material: "cotton", percentage: 100 }],
		occasion: "casual",
		age: "new",
		care: "machine wash",
		imageURL: "",
		price: 10,
	};
}

const ITEMS = [makeItem("1", "Alpha"), makeItem("2", "Bravo"), makeItem("3", "Charlie")];
const EMPTY_MATCHES = new Map<string, string[]>();

function renderGrid(props: Partial<Parameters<typeof FilteredItemGrid>[0]> = {}) {
	return render(
		<FilteredItemGrid
			items={ITEMS}
			matchKeysById={EMPTY_MATCHES}
			totalCount={ITEMS.length}
			gridKey="filters|query|sort"
			{...props}
		/>,
	);
}

describe("FilteredItemGrid — entrance stagger contract", () => {
	it("every card carries its own initial/animate/exit so it animates in (regression: lost stagger)", () => {
		const { container } = renderGrid();
		const cards = container.querySelectorAll('[role="listitem"]');
		expect(cards).toHaveLength(3);

		cards.forEach((card) => {
			expect(card.getAttribute("data-initial")).toBe("hidden");
			expect(card.getAttribute("data-animate")).toBe("show");
			expect(card.getAttribute("data-exit")).toBe("exit");
			expect(card.getAttribute("data-has-variants")).toBe("true");
		});
	});

	it("cards get an incrementing `custom` index to drive the per-item stagger delay", () => {
		const { container } = renderGrid();
		const customs = Array.from(container.querySelectorAll('[role="listitem"]')).map((c) =>
			c.getAttribute("data-custom"),
		);
		expect(customs).toEqual(["0", "1", "2"]);
	});

	it("cards animate layout so siblings reflow when one is removed", () => {
		const { container } = renderGrid();
		container.querySelectorAll('[role="listitem"]').forEach((card) => {
			expect(card.getAttribute("data-layout")).toBe("true");
		});
	});
});

describe("FilteredItemGrid — remount keying (re-stagger vs in-place removal)", () => {
	it("REMOUNTS the grid container when gridKey changes (filter/search/sort replays the entrance)", () => {
		const { container, rerender } = renderGrid({ gridKey: "a" });
		// Hold the actual DOM node reference — a remount produces a new object.
		const before = container.querySelector(".items-grid");

		rerender(
			<FilteredItemGrid items={ITEMS} matchKeysById={EMPTY_MATCHES} totalCount={ITEMS.length} gridKey="b" />,
		);

		const after = container.querySelector(".items-grid");
		// Changed key → fresh node → entrance stagger replays.
		expect(after).not.toBe(before);
	});

	it("does NOT remount the grid when only the item list shrinks (removal animates in place)", () => {
		const { container, rerender } = renderGrid({ gridKey: "stable", items: ITEMS });
		const before = container.querySelector(".items-grid");

		// Same gridKey, one fewer item — mirrors a single delete.
		rerender(
			<FilteredItemGrid
				items={ITEMS.slice(0, 2)}
				matchKeysById={EMPTY_MATCHES}
				totalCount={ITEMS.length}
				gridKey="stable"
			/>,
		);

		const after = container.querySelector(".items-grid");
		// Same key → same node → no full-grid re-stagger; the removed card exits in place.
		expect(after).toBe(before);
		expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(2);
	});
});
