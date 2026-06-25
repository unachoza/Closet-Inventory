/**
 * EmailPreview — unskip / include-skipped-item behaviour.
 *
 * Skipped products are those where categoryFromName() returns "".
 * The "Include" button moves a skipped item into the importable list
 * without a page transition.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ExtractedProduct } from "../../../../utils/parseProductsFromEmail";

// Uses the shared manual mock at __mocks__/framer-motion.tsx
vi.mock("framer-motion");

// ── Module mocks ───────────────────────────────────────────────────────────
// Control which products the parser returns so tests are deterministic.
const mockParseProducts = vi.fn<() => ExtractedProduct[]>();
vi.mock("../../../../utils/parseProductsFromEmail", () => ({
	parseProductsFromEmail: (...args: unknown[]) => mockParseProducts(...(args as [])),
	detectImageBasedRetailer: () => null,
}));

// categoryFromName drives the clothing/skipped partition.
// Return "" for anything containing "accessory" so we can control skip status.
vi.mock("../../../../utils/parseEmailToFormData", () => ({
	categoryFromName: (name: string) => (name.toLowerCase().includes("accessory") ? "" : "tops"),
}));

// detectDominantColor is async; stub it out so tests don't hang on canvas ops.
vi.mock("../../../../utils/detectColorFromImage", () => ({
	detectDominantColor: () => Promise.resolve(null),
}));

// ProductCardList just needs to render import buttons per product.
vi.mock("../../ProductCard/ProductCard", () => ({
	default: ({ products, onImportProduct }: { products: ExtractedProduct[]; onImportProduct: (p: ExtractedProduct) => void }) => (
		<ul>
			{products.map((p) => (
				<li key={p.name}>
					<span>{p.name}</span>
					<button type="button" onClick={() => onImportProduct(p)}>
						Import {p.name}
					</button>
				</li>
			))}
		</ul>
	),
}));

import EmailPreview from "../EmailPreview";

// ── Helpers ────────────────────────────────────────────────────────────────
const SHIRT: ExtractedProduct = { name: "Blue Shirt", price: 30, color: "Blue", size: "M", brand: "Gap", imageUrl: "", onSale: false, material: "", itemNumber: "" };
const ACCESSORY: ExtractedProduct = { name: "Leather Accessory", price: 15, color: "", size: "", brand: "Gap", imageUrl: "", onSale: false, material: "", itemNumber: "" };
const BELT: ExtractedProduct = { name: "Canvas Accessory Belt", price: 20, color: "Tan", size: "S", brand: "Gap", imageUrl: "", onSale: false, material: "", itemNumber: "" };

const MOCK_EMAIL = {
	id: "e1", threadId: "t1",
	subject: "Your order", from: "gap@gap.com", date: "2024-01-01", body: "<html></html>",
};

function renderPreview(onImportProduct = vi.fn(), onImportAllProducts = vi.fn()) {
	return render(
		<EmailPreview
			email={MOCK_EMAIL}
			onImportProduct={onImportProduct}
			onImportAllProducts={onImportAllProducts}
		/>,
	);
}

function openSkippedDrawer() {
	// The wrapper div has role="button" and its text includes "skipped"
	const toggle = screen.getByRole("button", { name: /skipped/i });
	fireEvent.click(toggle);
}

function getIncludeButtons() {
	// Scope to the skipped list to avoid matching the wrapper role="button"
	const list = document.querySelector(".gmail-skipped-list");
	if (!list) return [];
	return Array.from(list.querySelectorAll(".gmail-skipped-include-btn"));
}

/** Per-item Include buttons only (excludes the batch "Include all"). */
function getItemIncludeButtons() {
	const list = document.querySelector(".gmail-skipped-list");
	if (!list) return [];
	return Array.from(list.querySelectorAll(".gmail-skipped-include-btn:not(.gmail-skipped-include-btn--all)"));
}

function getSkippedItemNames() {
	return Array.from(document.querySelectorAll(".gmail-skipped-item-name")).map((el) => el.textContent);
}

/** The batch "Include all" button (scoped by class to avoid matching the
 *  drawer wrapper, whose accessible name now contains the same text). */
function getIncludeAllButton(): HTMLElement {
	const btn = document.querySelector(".gmail-skipped-include-btn--all");
	if (!btn) throw new Error("Include-all button not found");
	return btn as HTMLElement;
}

// ── Tests ──────────────────────────────────────────────────────────────────
describe("EmailPreview — skipped items drawer", () => {
	beforeEach(() => {
		mockParseProducts.mockReturnValue([SHIRT, ACCESSORY]);
	});

	it("shows a skipped-items toggle when there are skipped products", () => {
		renderPreview();
		expect(screen.getByRole("button", { name: /skipped/i })).toBeInTheDocument();
	});

	it("does not show the toggle when all products have a category", () => {
		mockParseProducts.mockReturnValue([SHIRT]);
		renderPreview();
		expect(screen.queryByRole("button", { name: /skipped/i })).not.toBeInTheDocument();
	});

	it("keeps the skipped list hidden until the toggle is clicked", () => {
		renderPreview();
		expect(screen.queryByText(ACCESSORY.name)).not.toBeInTheDocument();
		openSkippedDrawer();
		expect(screen.getByText(ACCESSORY.name)).toBeInTheDocument();
	});

	it("shows an Include button for each skipped item", () => {
		renderPreview();
		openSkippedDrawer();
		expect(getIncludeButtons()).toHaveLength(1);
	});
});

describe("EmailPreview — unskip (Include button)", () => {
	beforeEach(() => {
		mockParseProducts.mockReturnValue([SHIRT, ACCESSORY]);
	});

	it("moves the item into the importable list after Include is clicked", async () => {
		renderPreview();
		openSkippedDrawer();

		fireEvent.click(getIncludeButtons()[0]);

		await waitFor(() => {
			expect(screen.getByText(`Import ${ACCESSORY.name}`)).toBeInTheDocument();
		});
	});

	it("removes the item from the skipped list after Include is clicked", async () => {
		renderPreview();
		openSkippedDrawer();

		fireEvent.click(getIncludeButtons()[0]);

		await waitFor(() => {
			expect(screen.queryByText(ACCESSORY.name, { selector: ".gmail-skipped-item-name" })).not.toBeInTheDocument();
		});
	});

	it("hides the skipped toggle once all skipped items are included", async () => {
		renderPreview();
		openSkippedDrawer();

		fireEvent.click(getIncludeButtons()[0]);

		await waitFor(() => {
			expect(screen.queryByRole("button", { name: /skipped/i })).not.toBeInTheDocument();
		});
	});

	it("calls onImportProduct with the unskipped item when Import is clicked", async () => {
		const onImportProduct = vi.fn();
		renderPreview(onImportProduct);
		openSkippedDrawer();

		fireEvent.click(getIncludeButtons()[0]);

		await waitFor(() => screen.getByText(`Import ${ACCESSORY.name}`));
		fireEvent.click(screen.getByText(`Import ${ACCESSORY.name}`));

		expect(onImportProduct).toHaveBeenCalledWith(ACCESSORY);
	});

	it("keeps other skipped items in the drawer after one is included", async () => {
		mockParseProducts.mockReturnValue([SHIRT, ACCESSORY, BELT]);
		renderPreview();
		openSkippedDrawer();

		fireEvent.click(getIncludeButtons()[0]);

		await waitFor(() => {
			expect(screen.getByText(BELT.name)).toBeInTheDocument();
		});
	});

	it("includes multiple skipped items independently", async () => {
		mockParseProducts.mockReturnValue([SHIRT, ACCESSORY, BELT]);
		renderPreview();
		openSkippedDrawer();

		for (const btn of getIncludeButtons()) {
			fireEvent.click(btn);
		}

		await waitFor(() => {
			expect(screen.getByText(`Import ${ACCESSORY.name}`)).toBeInTheDocument();
			expect(screen.getByText(`Import ${BELT.name}`)).toBeInTheDocument();
			expect(screen.queryByRole("button", { name: /skipped/i })).not.toBeInTheDocument();
		});
	});

	it("unskipped items are included in Import All", async () => {
		const onImportAllProducts = vi.fn();
		renderPreview(vi.fn(), onImportAllProducts);
		openSkippedDrawer();

		fireEvent.click(getIncludeButtons()[0]);

		await waitFor(() => screen.getByRole("button", { name: /import all/i }));
		fireEvent.click(screen.getByRole("button", { name: /import all/i }));

		const imported: ExtractedProduct[] = onImportAllProducts.mock.calls[0][0];
		expect(imported.some((p) => p.name === ACCESSORY.name)).toBe(true);
		expect(imported.some((p) => p.name === SHIRT.name)).toBe(true);
	});
});

// ── Regression: duplicate-named skipped items must be unskipped independently ──
// A single email can skip several items sharing a name (e.g. four "The
// Highwaist"). Identity was by name, so including one dropped ALL same-named
// items from the drawer while only one reached the importable list; the rest
// leaked into the next email. Identity is now the per-email index.
describe("EmailPreview — duplicate-named skipped items", () => {
	// Three skipped accessories sharing the SAME name.
	const DUP = (i: number): ExtractedProduct => ({
		name: "Highwaist Accessory",
		price: 10 + i,
		color: "",
		size: "",
		brand: "CUUP",
		imageUrl: "",
		onSale: false,
		material: "",
		itemNumber: `${i}`,
	});

	beforeEach(() => {
		mockParseProducts.mockReturnValue([SHIRT, DUP(0), DUP(1), DUP(2)]);
	});

	it("including ONE duplicate leaves the other duplicates in the drawer", async () => {
		renderPreview();
		openSkippedDrawer();

		expect(getSkippedItemNames()).toHaveLength(3);

		fireEvent.click(getItemIncludeButtons()[0]);

		// The bug dropped all three to zero; exactly two must remain.
		await waitFor(() => {
			expect(getSkippedItemNames()).toHaveLength(2);
		});
	});

	it("'Include all' moves every duplicate and closes the drawer", async () => {
		const onImportAllProducts = vi.fn();
		renderPreview(vi.fn(), onImportAllProducts);
		openSkippedDrawer();

		fireEvent.click(getIncludeAllButton());

		await waitFor(() => {
			expect(screen.queryByRole("button", { name: /skipped/i })).not.toBeInTheDocument();
		});

		// All three duplicates + the shirt flow into Import All.
		fireEvent.click(screen.getByRole("button", { name: /import all/i }));
		const imported: ExtractedProduct[] = onImportAllProducts.mock.calls[0][0];
		expect(imported.filter((p) => p.name === "Highwaist Accessory")).toHaveLength(3);
		expect(imported.some((p) => p.name === SHIRT.name)).toBe(true);
	});

	it("shows the batch 'Include all' button only when more than one item is skipped", () => {
		mockParseProducts.mockReturnValue([SHIRT, ACCESSORY]); // 1 skipped
		renderPreview();
		openSkippedDrawer();
		expect(screen.queryByRole("button", { name: /include all/i })).not.toBeInTheDocument();
	});
});

// ── Regression: unskip selections must not leak across emails ──────────────────
describe("EmailPreview — selections reset when the email changes", () => {
	it("does not carry an unskipped item into the next email's detected list", async () => {
		// Parser returns the accessory only for the first email's body.
		mockParseProducts.mockImplementation((body: string) =>
			body === "BODY2" ? [SHIRT] : [SHIRT, ACCESSORY],
		);

		const { rerender } = render(
			<EmailPreview email={{ ...MOCK_EMAIL, id: "e1", body: "BODY1" }} onImportProduct={vi.fn()} onImportAllProducts={vi.fn()} />,
		);
		openSkippedDrawer();
		fireEvent.click(getItemIncludeButtons()[0]);
		await waitFor(() => expect(screen.getByText(`Import ${ACCESSORY.name}`)).toBeInTheDocument());

		// Switch to a different email — the previously unskipped accessory must NOT
		// appear among the new email's detected items.
		rerender(
			<EmailPreview email={{ ...MOCK_EMAIL, id: "e2", body: "BODY2" }} onImportProduct={vi.fn()} onImportAllProducts={vi.fn()} />,
		);

		await waitFor(() => {
			expect(screen.queryByText(`Import ${ACCESSORY.name}`)).not.toBeInTheDocument();
		});
	});
});
