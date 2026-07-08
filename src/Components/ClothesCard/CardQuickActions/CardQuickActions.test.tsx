import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ClothingItem } from "../../../utils/types";
import { CardQuickActions } from "./CardQuickActions";

const mockUpdateItem = vi.fn();
vi.mock("../../../context/ClosetContext", () => ({
	useCloset: () => ({ updateItem: mockUpdateItem }),
}));

const item = (overrides: Partial<ClothingItem> = {}): ClothingItem =>
	({
		id: "i1",
		imageURL: "",
		name: "Black Dress",
		category: "dresses",
		color: "black",
		size: "M",
		brand: "X",
		material: [],
		occasion: "casual",
		care: "wash",
		...overrides,
	}) as ClothingItem;

describe("CardQuickActions", () => {
	beforeEach(() => vi.clearAllMocks());

	it("shows the current status", () => {
		render(<CardQuickActions item={item({ status: "at_cleaner" })} onClose={vi.fn()} />);
		expect(screen.getByText("at cleaner")).toBeInTheDocument();
	});

	it("offers the legal actions for a dirty item and runs one", () => {
		const onClose = vi.fn();
		render(<CardQuickActions item={item({ status: "dirty" })} onClose={onClose} />);

		fireEvent.click(screen.getByRole("menuitem", { name: /send to cleaner/i }));

		expect(mockUpdateItem).toHaveBeenCalledWith("i1", { status: "at_cleaner" });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("excludes 'Lend…' from the one-tap menu (needs the borrower modal)", () => {
		render(<CardQuickActions item={item({ status: "clean" })} onClose={vi.fn()} />);
		expect(screen.queryByRole("menuitem", { name: /lend/i })).not.toBeInTheDocument();
		// but a legit one-tap action is present
		expect(screen.getByRole("menuitem", { name: /wear it/i })).toBeInTheDocument();
	});

	it("returning home from traveling marks dirty + resets location, then closes", () => {
		const onClose = vi.fn();
		render(<CardQuickActions item={item({ status: "traveling", locationId: "suitcase" })} onClose={onClose} />);

		fireEvent.click(screen.getByRole("menuitem", { name: /back home/i }));

		expect(mockUpdateItem).toHaveBeenCalledWith("i1", { status: "dirty", locationId: "home" });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("closes on backdrop click without mutating", () => {
		const onClose = vi.fn();
		render(<CardQuickActions item={item({ status: "clean" })} onClose={onClose} />);
		fireEvent.click(screen.getByTestId("quick-actions-backdrop"));
		expect(onClose).toHaveBeenCalledTimes(1);
		expect(mockUpdateItem).not.toHaveBeenCalled();
	});

	it("closes on Escape", () => {
		const onClose = vi.fn();
		render(<CardQuickActions item={item({ status: "clean" })} onClose={onClose} />);
		fireEvent.keyDown(window, { key: "Escape" });
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
