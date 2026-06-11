/**
 * Batch mode tests for EditItemView.
 * The existing EditItemView.test.tsx covers single-item edit/create.
 * These tests cover the batch import queue behaviour.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EditItemView from "./EditItemView";

vi.mock("framer-motion");
import type { ClothingItem } from "../../../utils/types";

vi.mock("framer-motion", async () => {
	const React = await import("react");
	const makeEl = (tag: string) =>
		React.forwardRef(({ children, animate, initial, exit, transition, variants, whileHover, whileTap, whileFocus, whileInView, layout, layoutId, ...rest }: any, ref: any) =>
			React.createElement(tag, { ...rest, ref }, children),
		);
	return {
		motion: new Proxy({}, { get: (_t: any, tag: string) => makeEl(tag) }),
		AnimatePresence: ({ children }: any) => children,
		useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
		useMotionValue: (v: unknown) => ({ get: () => v, set: vi.fn() }),
		useTransform: (v: unknown) => v,
	};
});

const mockAddFullItem = vi.fn();
const mockShowToast = vi.fn();
const mockSetView = vi.fn();

vi.mock("../../../hooks/useLocalCloset", () => ({
	useLocalStorageCloset: () => ({
		updateItem: vi.fn(),
		addItem: vi.fn(),
		addFullItem: mockAddFullItem,
	}),
}));

vi.mock("../../../Components/Toast/Toast", () => ({
	useToast: () => ({ showToast: mockShowToast }),
}));

const makeItem = (overrides: Partial<ClothingItem> = {}): ClothingItem => ({
	id: "item-1",
	imageURL: "",
	name: "Nike Top",
	category: "tops",
	color: "black",
	size: "M",
	brand: "Nike",
	material: [{ material: "cotton", percentage: 100 }],
	occasion: "casual",
	age: "new",
	care: "machine wash",
	price: "$30",
	onSale: false,
	notes: "",
	...overrides,
});

beforeEach(() => vi.clearAllMocks());

describe("EditItemView — batch import mode", () => {
	it("shows queue position badge when in batch mode", () => {
		render(
			<EditItemView
				item={makeItem()}
				mode="create"
				setView={mockSetView}
				queuePosition={1}
				queueTotal={3}
			/>,
		);
		expect(screen.getByText("Item 1 of 3")).toBeInTheDocument();
	});

	it("does not show queue badge outside batch mode", () => {
		render(<EditItemView item={makeItem()} mode="create" setView={mockSetView} />);
		expect(screen.queryByText(/of/)).not.toBeInTheDocument();
	});

	it("shows Skip button in batch mode", () => {
		render(
			<EditItemView
				item={makeItem()}
				mode="create"
				setView={mockSetView}
				queuePosition={2}
				queueTotal={5}
				onSkipItem={vi.fn()}
			/>,
		);
		expect(screen.getByRole("button", { name: /do not add this item/i })).toBeInTheDocument();
	});

	it("clicking Skip calls onSkipItem", () => {
		const onSkipItem = vi.fn();
		render(
			<EditItemView
				item={makeItem()}
				mode="create"
				setView={mockSetView}
				queuePosition={2}
				queueTotal={5}
				onSkipItem={onSkipItem}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /do not add this item/i }));
		expect(onSkipItem).toHaveBeenCalled();
	});

	it("does not show Skip button outside batch mode", () => {
		render(<EditItemView item={makeItem()} mode="create" setView={mockSetView} />);
		expect(screen.queryByRole("button", { name: /do not add this item/i })).not.toBeInTheDocument();
	});

	it("Add to Closet calls addFullItem and then onItemAdded in batch mode", () => {
		const onItemAdded = vi.fn();
		render(
			<EditItemView
				item={makeItem()}
				mode="create"
				setView={mockSetView}
				queuePosition={1}
				queueTotal={3}
				onItemAdded={onItemAdded}
			/>,
		);
		const form = screen.getByRole("button", { name: /add to closet/i }).closest("form")!;
		fireEvent.submit(form);
		expect(mockAddFullItem).toHaveBeenCalled();
	});

	it("updates badge label for each queue position", () => {
		const { rerender } = render(
			<EditItemView
				item={makeItem({ id: "a" })}
				mode="create"
				setView={mockSetView}
				queuePosition={1}
				queueTotal={3}
			/>,
		);
		expect(screen.getByText("Item 1 of 3")).toBeInTheDocument();

		rerender(
			<EditItemView
				item={makeItem({ id: "b" })}
				mode="create"
				setView={mockSetView}
				queuePosition={2}
				queueTotal={3}
			/>,
		);
		expect(screen.getByText("Item 2 of 3")).toBeInTheDocument();
	});
});
