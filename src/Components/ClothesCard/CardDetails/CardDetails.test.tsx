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

	it("compact variant shows 'See all details' and calls onExpand instead of Edit/Remove", () => {
		const onExpand = vi.fn();
		render(<CardDetails item={item} variant="compact" onExpand={onExpand} />);

		// Compact: no inline action buttons, just the expand affordance.
		expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: /see all details/i }));
		expect(onExpand).toHaveBeenCalledTimes(1);
	});

	it("full variant shows Edit/Remove directly and fires onEdit", () => {
		const onEdit = vi.fn();
		render(<CardDetails item={item} variant="full" onEdit={onEdit} />);

		// Full view replaces the "See all details" affordance with the actions.
		expect(screen.queryByRole("button", { name: /see all details/i })).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Edit" }));

		expect(onEdit).toHaveBeenCalledTimes(1);
	});

	it("full variant requires confirmation before calling onRemove", () => {
		const onRemove = vi.fn();
		render(<CardDetails item={item} variant="full" onRemove={onRemove} />);

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

	// ── Inferred style attributes (populated during email import) ──
	const styledItem: ClothingItem = {
		...item,
		// Inferred attributes live on the nested `style` object (matches the
		// import path: inferProductAttributes(...) → item.style).
		style: {
			neckline: "crew neck",
			sleeveLength: "long sleeve",
			fit: "relaxed",
			pattern: "ribbed",
			hasStretch: true,
			hasPockets: true,
			season: "fall",
		},
		condition: "like new",
	};

	it("full variant renders inferred Style attributes", () => {
		render(<CardDetails item={styledItem} variant="full" />);
		expect(screen.getByText("Style")).toBeInTheDocument();
		// neckline · sleeve on one line, construction descriptors on another
		expect(screen.getByText(/crew neck/i)).toBeInTheDocument();
		expect(screen.getByText(/long sleeve/i)).toBeInTheDocument();
		expect(screen.getByText(/relaxed/i)).toBeInTheDocument();
	});

	it("full variant renders Features pills for boolean attributes", () => {
		render(<CardDetails item={styledItem} variant="full" />);

		expect(screen.getByText("Features")).toBeInTheDocument();
		expect(screen.getByText("Stretch")).toBeInTheDocument();
		expect(screen.getByText("Pockets")).toBeInTheDocument();
	});

	it("renders each accent as its own pill (regression: CardDetailsFeaturesPill)", () => {
		const multiAccent: ClothingItem = {
			...item,
			style: { accents: ["buttons", "zipper"] },
		};
		render(<CardDetails item={multiAccent} variant="full" />);

		expect(screen.getByText("buttons")).toBeInTheDocument();
		expect(screen.getByText("zipper")).toBeInTheDocument();
		// The bug rendered both joined into a single "buttonszipper" pill.
		expect(screen.queryByText("buttonszipper")).not.toBeInTheDocument();
	});

	it("hides Features section when accents is an empty array (regression: NoFeaturesGetsEmptyPill)", () => {
		const emptyAccents: ClothingItem = {
			...item,
			style: { accents: [] },
		};
		render(<CardDetails item={emptyAccents} variant="full" />);

		expect(screen.queryByText("Features")).not.toBeInTheDocument();
	});

	it("full variant renders Identity with condition + price, no leaked template text", () => {
		render(<CardDetails item={styledItem} variant="full" />);

		expect(screen.getByText(/condition: like new/i)).toBeInTheDocument();
		expect(screen.getByText(/price: \$40/i)).toBeInTheDocument();
		// Regression guard: the old buggy block leaked a raw backtick + "$".
		expect(screen.queryByText(/purchaseDate/)).not.toBeInTheDocument();
		expect(screen.queryByText(/formatItemAge/)).not.toBeInTheDocument();
	});

	it("hides Style and Features sections when no attributes were inferred", () => {
		render(<CardDetails item={item} variant="full" />);

		expect(screen.queryByText("Style")).not.toBeInTheDocument();
		expect(screen.queryByText("Features")).not.toBeInTheDocument();
	});

	it("hides the Style section when only season/pattern are set (regression: ghost Style header)", () => {
		// season renders in Identity, pattern renders nowhere — neither should
		// make the Style section appear with no content beneath it.
		const seasonPatternOnly: ClothingItem = {
			...item,
			style: { season: "fall", pattern: "ribbed" },
		};
		render(<CardDetails item={seasonPatternOnly} variant="full" />);

		expect(screen.queryByText("Style")).not.toBeInTheDocument();
	});

	it("shows the Style section when a rendered attribute is present", () => {
		const withFit: ClothingItem = { ...item, style: { fit: "relaxed", season: "fall" } };
		render(<CardDetails item={withFit} variant="full" />);

		expect(screen.getByText("Style")).toBeInTheDocument();
		expect(screen.getByText(/relaxed/i)).toBeInTheDocument();
	});
});
