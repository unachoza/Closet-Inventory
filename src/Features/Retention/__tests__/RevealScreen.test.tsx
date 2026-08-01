import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClothingItem } from "../../../utils/types";
import RevealScreen from "../RevealScreen";

const mockTrack = vi.fn();
vi.mock("../../../lib/analytics", () => ({ track: (...args: unknown[]) => mockTrack(...args) }));

const mockUseCloset = vi.fn();
vi.mock("../../../context/ClosetContext", () => ({
	useCloset: () => mockUseCloset(),
}));

const makeItem = (overrides: Partial<ClothingItem>): ClothingItem => ({
	id: crypto.randomUUID(),
	imageURL: "",
	name: "Test Item",
	category: "tops",
	color: "black",
	size: "M",
	brand: "Nike",
	material: [],
	occasion: "casual",
	age: "new",
	care: "machine wash",
	...overrides,
});

describe("RevealScreen", () => {
	beforeEach(() => {
		mockTrack.mockClear();
	});

	it("shows own-item count, brand count, and value, excluding demo items", () => {
		mockUseCloset.mockReturnValue({
			closet: [
				makeItem({ brand: "Nike", price: 40 }),
				makeItem({ brand: "Zara", price: 60 }),
				makeItem({ brand: "Nike", price: 20 }),
				makeItem({ brand: "Sample Co", price: 999, isDemo: true }),
			],
		});
		render(<RevealScreen onContinue={vi.fn()} />);

		expect(screen.getByText("3")).toBeInTheDocument();
		expect(screen.getByText(/pieces tracked/i)).toBeInTheDocument();
		expect(screen.getByText(/2 brands/i)).toBeInTheDocument();
		expect(screen.getByText(/\$120 in value/i)).toBeInTheDocument();
	});

	it("fires reveal_shown once on mount", () => {
		mockUseCloset.mockReturnValue({ closet: [makeItem({})] });
		render(<RevealScreen onContinue={vi.fn()} />);
		expect(mockTrack).toHaveBeenCalledWith("reveal_shown", expect.objectContaining({ pieceCount: 1 }));
		expect(mockTrack).toHaveBeenCalledTimes(1);
	});

	it("calls onContinue when the CTA is clicked", async () => {
		mockUseCloset.mockReturnValue({ closet: [makeItem({})] });
		const onContinue = vi.fn();
		const user = userEvent.setup();
		render(<RevealScreen onContinue={onContinue} />);

		await user.click(screen.getByRole("button", { name: /see your closet/i }));
		expect(onContinue).toHaveBeenCalled();
	});
});
