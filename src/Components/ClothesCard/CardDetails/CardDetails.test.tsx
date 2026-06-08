import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CardDetails } from "./CardDetails";
import type { ClothingItem } from "../../../utils/types";

const item: ClothingItem = {
	id: "1",
	name: "Nike Top",
	brand: "Nike",
	category: "tops",
	color: "black",
	size: "M",
	material: [{ material: "cotton", percentage: 100 }],
	occasion: "casual",
	age: "new",
	price: "$40",
	care: "machine wash",
	imageURL: "https://example.com/img.jpg",
};

describe("CardDetails", () => {
	it("renders the item name and brand", () => {
		render(<CardDetails item={item} />);
		expect(screen.getByText("Nike Top")).toBeInTheDocument();
		expect(screen.getByText("Nike")).toBeInTheDocument();
	});

	it("keeps Edit/Remove hidden until expanded, then fires onEdit", () => {
		const onEdit = vi.fn();
		render(<CardDetails item={item} onEdit={onEdit} />);

		expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: /see all details/i }));
		fireEvent.click(screen.getByRole("button", { name: "Edit" }));

		expect(onEdit).toHaveBeenCalledTimes(1);
	});

	it("requires confirmation before calling onRemove", () => {
		const onRemove = vi.fn();
		render(<CardDetails item={item} onRemove={onRemove} />);

		fireEvent.click(screen.getByRole("button", { name: /see all details/i }));
		fireEvent.click(screen.getByRole("button", { name: "Remove" }));
		// A confirm step appears — onRemove only fires after explicit confirmation.
		expect(onRemove).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: /yes, remove/i }));

		expect(onRemove).toHaveBeenCalledTimes(1);
	});

	it("fires onClose when the close button is clicked", () => {
		const onClose = vi.fn();
		render(<CardDetails item={item} onClose={onClose} />);

		fireEvent.click(screen.getByRole("button", { name: "Close" }));

		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
