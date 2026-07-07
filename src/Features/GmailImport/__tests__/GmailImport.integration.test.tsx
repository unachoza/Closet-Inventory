/**
 * Integration test: Gmail Import → Zara email → preview → import → EditItemView.
 *
 * Tests the full user flow using a real Zara order confirmation email:
 *   1. Authenticated user sees email list
 *   2. Clicking a Zara email opens the preview panel
 *   3. Parser detects 5 products with correct names, prices, colors, sizes
 *   4. "Import" on a single product transitions to EditItemView with fields pre-populated
 *   5. "Import All 5 Items" transitions to EditItemView with batch queue
 */
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("framer-motion");
import { useState, useCallback } from "react";
import GmailImport from "../GmailImport";
import EditItemView from "../../Form/EditItemView/EditItemView";

// Uses the shared manual mock at __mocks__/framer-motion.tsx (declared above).
import { EditProvider } from "../../Form/EditContext";
import { ToastProvider } from "../../../Components/Toast/Toast";
import { GmailAuthProvider } from "../../../context/GmailAuthContext";
import type { ClothingItem, ViewType } from "../../../utils/types";
import { ZARA_EMAIL_BODY } from "./__mocks__/emailDataMocks";

const ZARA_EMAIL = {
	id: "zara-001",
	threadId: "t-001",
	subject: "Your ZARA order has been received",
	from: '"ZARA" <no-reply@zara.com>',
	date: "2018-06-21T12:00:00Z",
	snippet: "Thank you for your purchase",
	body: ZARA_EMAIL_BODY,
} as const;

// ---------------------------------------------------------------------------
// Mocks — external hooks only; the real parser + form components run unmocked
// ---------------------------------------------------------------------------

const mockSearchEmails = vi.fn();
const mockFetchEmailBody = vi.fn();
const mockFilterCachedEmails = vi.fn();
const mockFetchNextPage = vi.fn();
const mockLogin = vi.fn();
const mockLogout = vi.fn();

vi.mock("../../../hooks/useGmailAuth", () => ({
	useGmailAuth: () => ({
		accessToken: "mock-token",
		isAuthenticated: true,
		error: null,
		isLoading: false,
		login: mockLogin,
		logout: mockLogout,
	}),
}));

vi.mock("../../../hooks/useAdvancedSearch", () => ({
	useAdvancedSearch: () => ({
		emails: [ZARA_EMAIL],
		isSearching: false,
		error: null,
		searchEmails: mockSearchEmails,
		fetchNextPage: mockFetchNextPage,
		hasNextPage: false,
		fetchEmailBody: mockFetchEmailBody,
		filterCachedEmails: mockFilterCachedEmails,
		cachedCount: 1,
		searchMode: null,
	}),
}));

// useCloset — used by EditItemView to save items
const mockUpdateItem = vi.fn();
const mockAddItem = vi.fn();
const mockAddFullItem = vi.fn();

vi.mock("../../../context/ClosetContext", () => ({
	useCloset: () => ({
		updateItem: mockUpdateItem,
		addItem: mockAddItem,
		addFullItem: mockAddFullItem,
	}),
}));

// detectDominantColor uses canvas — not available in jsdom
vi.mock("../../utils/detectColorFromImage", () => ({
	detectDominantColor: vi.fn().mockResolvedValue(null),
}));

// getStockPhoto — returns placeholder URL in test
vi.mock("../../utils/getStockPhoto", () => ({
	default: () => "https://placeholder.test/stock.jpg",
}));

// ---------------------------------------------------------------------------
// Test harness — mirrors App.tsx view management (gmail ↔ edit)
// ---------------------------------------------------------------------------

function buildClothingItem(prefilled: Partial<ClothingItem>): ClothingItem {
	return {
		id: prefilled.id || crypto.randomUUID(),
		imageURL: prefilled.imageURL ?? "",
		name: prefilled.name ?? "",
		category: prefilled.category ?? "",
		color: prefilled.color ?? "",
		size: prefilled.size ?? "",
		brand: prefilled.brand ?? "",
		price: prefilled.price,
		material: prefilled.material ?? [],
		occasion: prefilled.occasion ?? "",
		age: prefilled.age ?? "",
		condition: prefilled.condition ?? "new",
		// Mirrors App.tsx — must carry the email's purchase date through, or
		// imported items lose their factual age (the original "shows as new" bug).
		purchaseDate: prefilled.purchaseDate,
		care: prefilled.care ?? "",
		onSale: prefilled.onSale ?? false,
		notes: prefilled.notes ?? [],
	};
}

function TestHarness() {
	const [view, setView] = useState<ViewType>("gmail");
	const [editItem, setEditItem] = useState<ClothingItem | null>(null);
	const [importQueue, setImportQueue] = useState<ClothingItem[]>([]);
	const [importQueueIndex, setImportQueueIndex] = useState(0);
	const [gmailSourceEmailId, setGmailSourceEmailId] = useState<string | null>(null);

	const handleGmailImport = useCallback((prefilled: Partial<ClothingItem>) => {
		const newItem = buildClothingItem(prefilled);
		setEditItem(newItem);
		setImportQueue([]);
		setImportQueueIndex(0);
		setView("edit");
	}, []);

	const handleGmailImportAll = useCallback((items: Partial<ClothingItem>[]) => {
		if (items.length === 0) return;
		const clothingItems = items.map(buildClothingItem);
		setImportQueue(clothingItems);
		setImportQueueIndex(0);
		setEditItem(clothingItems[0]);
		setView("edit");
	}, []);

	const handleQueueAdvance = useCallback(() => {
		const nextIndex = importQueueIndex + 1;
		if (nextIndex < importQueue.length) {
			setImportQueueIndex(nextIndex);
			setEditItem(importQueue[nextIndex]);
		} else {
			setImportQueue([]);
			setImportQueueIndex(0);
			setView("gmail");
		}
	}, [importQueue, importQueueIndex]);

	const handleReturnToEmail = useCallback(() => {
		setImportQueue([]);
		setImportQueueIndex(0);
		setView("gmail");
	}, []);

	const isInBatchMode = importQueue.length > 1;

	return (
		<GmailAuthProvider>
			<EditProvider>
				<ToastProvider>
					{view === "gmail" && (
						<GmailImport
							onImport={handleGmailImport}
							onImportAll={handleGmailImportAll}
							initialSelectedEmailId={gmailSourceEmailId}
							onSourceEmailChange={setGmailSourceEmailId}
						/>
					)}
					{view === "edit" && editItem && (
						<EditItemView
							key={(isInBatchMode ? importQueue[importQueueIndex] : editItem).id}
							item={isInBatchMode ? importQueue[importQueueIndex] : editItem}
							mode="create"
							setView={setView}
							onReturnToEmail={handleReturnToEmail}
							onSkipItem={isInBatchMode ? handleQueueAdvance : undefined}
							onItemAdded={isInBatchMode ? handleQueueAdvance : undefined}
							queuePosition={isInBatchMode ? importQueueIndex + 1 : undefined}
							queueTotal={isInBatchMode ? importQueue.length : undefined}
						/>
					)}
				</ToastProvider>
			</EditProvider>
		</GmailAuthProvider>
	);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Gmail Import → Zara email → EditItemView integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("displays the email list with the Zara email", () => {
		render(<TestHarness />);
		expect(screen.getByText("Your ZARA order has been received")).toBeInTheDocument();
		expect(screen.getByText("ZARA")).toBeInTheDocument();
		expect(screen.getByTestId('email-count')).toHaveTextContent(/found 1 email/i);
	});

	it("opens the preview panel when a Zara email is clicked", () => {
		render(<TestHarness />);

		// Click the email checkbox to select it
		const checkbox = screen.getByRole("checkbox", {
			name: /Select email: Your ZARA order has been received/,
		});
		fireEvent.click(checkbox);

		// Subject appears in both the email list and the preview header
		const subjectEls = screen.getAllByText("Your ZARA order has been received");
		expect(subjectEls.length).toBeGreaterThanOrEqual(2);

		// Preview-specific metadata
		expect(screen.getByText(/From:.*no-reply@zara.com/)).toBeInTheDocument();
	});

	it("detects 5 products from the Zara email", async () => {
		render(<TestHarness />);

		// Select the Zara email
		const checkbox = screen.getByRole("checkbox", {
			name: /Select email/,
		});
		fireEvent.click(checkbox);

		// The parser should detect 5 items
		await waitFor(() => {
			expect(screen.getByText(/Detected 5 items/)).toBeInTheDocument();
		});
	});

	it("shows correct product details on detected product cards", async () => {
		render(<TestHarness />);

		const checkbox = screen.getByRole("checkbox", { name: /Select email/ });
		fireEvent.click(checkbox);

		await waitFor(() => {
			expect(screen.getByText(/Detected 5 items/)).toBeInTheDocument();
		});

		// Scope queries to the product card list to avoid matching the rendered email body
		const cardList = screen.getByText(/Detected 5 items/).closest(".product-card-list")!;
		const cards = within(cardList as HTMLElement);

		// Verify product names on cards (rendered title-cased; raw names are ALL CAPS in the email HTML)
		expect(cards.getByText("Short Jacquard Jumpsuit")).toBeInTheDocument();
		expect(cards.getByText("Knotted Top")).toBeInTheDocument();
		expect(cards.getByText("Lace Lapel Jumpsuit")).toBeInTheDocument();
		expect(cards.getByText("Wide-Leg Pants With Contrasting Topstitching")).toBeInTheDocument();
		expect(cards.getByText("Platform Slingback Shoes")).toBeInTheDocument();

		// Verify prices on product cards ($29.99 appears twice: jumpsuit + pants)
		expect(cards.getAllByText("$29.99")).toHaveLength(2);
		expect(cards.getByText("$19.99")).toBeInTheDocument();
		expect(cards.getByText("$69.90")).toBeInTheDocument();
		expect(cards.getByText("$39.99")).toBeInTheDocument();

		// Verify colors ("Color: X" tags on cards)
		expect(cards.getByText("Color: Bluish")).toBeInTheDocument();
		expect(cards.getByText("Color: Red")).toBeInTheDocument();
		expect(cards.getByText("Color: Navy blue")).toBeInTheDocument();
		// Two items are Black — use getAllByText
		expect(cards.getAllByText("Color: Black")).toHaveLength(2);

		// Verify sizes (3 items are size M)
		expect(cards.getAllByText("Size: M")).toHaveLength(3);
		expect(cards.getByText("Size: L")).toBeInTheDocument();
		expect(cards.getByText("Size: 8")).toBeInTheDocument();
	});

	it("shows 'Import All 5 Items' button when multiple products detected", async () => {
		render(<TestHarness />);

		const checkbox = screen.getByRole("checkbox", { name: /Select email/ });
		fireEvent.click(checkbox);

		await waitFor(() => {
			expect(screen.getByText(/Import All 5 Items/)).toBeInTheDocument();
		});
	});

	it("each product card has an individual Import button", async () => {
		render(<TestHarness />);

		const checkbox = screen.getByRole("checkbox", { name: /Select email/ });
		fireEvent.click(checkbox);

		await waitFor(() => {
			expect(screen.getByText(/Detected 5 items/)).toBeInTheDocument();
		});

		// Each ProductCard renders an "Import" button
		const importButtons = screen.getAllByRole("button", { name: "Import" });
		expect(importButtons).toHaveLength(5);
	});

	it("clicking Import on a single product navigates to EditItemView with correct data", async () => {
		render(<TestHarness />);

		// Select Zara email
		const checkbox = screen.getByRole("checkbox", { name: /Select email/ });
		fireEvent.click(checkbox);

		await waitFor(() => {
			expect(screen.getByText(/Detected 5 items/)).toBeInTheDocument();
		});

		// Click Import on the first product (SHORT JACQUARD JUMPSUIT)
		const importButtons = screen.getAllByRole("button", { name: "Import" });
		fireEvent.click(importButtons[0]);

		// Should navigate to EditItemView in create mode
		await waitFor(() => {
			expect(screen.getByText("Import Item")).toBeInTheDocument();
		});

		// Verify form fields are pre-populated with parsed product data
		expect(screen.getByLabelText("name")).toHaveValue("Short Jacquard Jumpsuit");
		expect(screen.getByLabelText("color")).toHaveValue("Bluish");
		expect(screen.getByLabelText("size")).toHaveValue("M");
		expect(screen.getByLabelText("price")).toHaveValue("29.99");
		expect(screen.getByLabelText("brand")).toHaveValue("zara");
		// "SHORT" matches "short" → "bottoms" before "jumpsuit" → "body" in keyword order
		expect(screen.getByLabelText("category")).toHaveValue("bottoms");
		// Default condition is seeded from the order's age (editable during review).
		// This Zara email is dated 2018 — over 3 years old — so it defaults to "good"
		// rather than "new". Factual age is derived from the captured purchase date.
		expect(screen.getByLabelText("condition")).toHaveValue("good");

		// End-to-end guard for the original "imported items show as new" bug:
		// the email's date (2018-06-21) must survive parse → buildClothingItem →
		// EditItemView and appear in the read-only purchase-date display.
		const purchaseDate = screen.getByLabelText("purchase date") as HTMLInputElement;
		expect(purchaseDate).toBeDisabled();
		expect(purchaseDate.value).toMatch(/2018/);

		// "Back to Email" button should be visible in create mode
		expect(screen.getAllByText(/Back to Email/).length).toBeGreaterThanOrEqual(1);
	});

	it("clicking Import on the second product pre-populates correct data", async () => {
		render(<TestHarness />);

		const checkbox = screen.getByRole("checkbox", { name: /Select email/ });
		fireEvent.click(checkbox);

		await waitFor(() => {
			expect(screen.getByText(/Detected 5 items/)).toBeInTheDocument();
		});

		// Click Import on the second product (KNOTTED TOP)
		const importButtons = screen.getAllByRole("button", { name: "Import" });
		fireEvent.click(importButtons[1]);

		await waitFor(() => {
			expect(screen.getByText("Import Item")).toBeInTheDocument();
		});

		expect(screen.getByLabelText("name")).toHaveValue("Knotted Top");
		expect(screen.getByLabelText("color")).toHaveValue("Red");
		expect(screen.getByLabelText("size")).toHaveValue("L");
		expect(screen.getByLabelText("price")).toHaveValue("19.99");
		expect(screen.getByLabelText("brand")).toHaveValue("zara");
		expect(screen.getByLabelText("category")).toHaveValue("tops"); // top → tops
	});

	it("Import All navigates to EditItemView with batch queue for first item", async () => {
		render(<TestHarness />);

		const checkbox = screen.getByRole("checkbox", { name: /Select email/ });
		fireEvent.click(checkbox);

		await waitFor(() => {
			expect(screen.getByText(/Import All 5 Items/)).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText(/Import All 5 Items/));

		// Should show EditItemView with batch queue indicator
		await waitFor(() => {
			expect(screen.getByText("Import Item")).toBeInTheDocument();
		});

		// Queue progress badge: "Item 1 of 5"
		expect(screen.getByText(/Item 1 of 5/)).toBeInTheDocument();

		// First item in queue should be pre-populated
		expect(screen.getByLabelText("name")).toHaveValue("Short Jacquard Jumpsuit");
		expect(screen.getByLabelText("color")).toHaveValue("Bluish");
		expect(screen.getByLabelText("size")).toHaveValue("M");
		expect(screen.getByLabelText("price")).toHaveValue("29.99");
	});

	it("Import All batch queue advances to next item after Add to Closet", async () => {
		render(<TestHarness />);

		const checkbox = screen.getByRole("checkbox", { name: /Select email/ });
		fireEvent.click(checkbox);

		await waitFor(() => {
			expect(screen.getByText(/Import All 5 Items/)).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText(/Import All 5 Items/));

		// Confirm first item
		await waitFor(() => {
			expect(screen.getByText(/Item 1 of 5/)).toBeInTheDocument();
		});

		// Submit the form directly (motion.form creates nested <form> elements in jsdom,
		// so fireEvent.click on the submit button doesn't reliably trigger onSubmit)
		const submitBtn = screen.getByText("Add to Closet");
		const form = submitBtn.closest("form")!;
		fireEvent.submit(form);

		// Should advance to item 2 (KNOTTED TOP)
		await waitFor(() => {
			expect(screen.getByText(/Item 2 of 5/)).toBeInTheDocument();
		});

		expect(screen.getByLabelText("name")).toHaveValue("Knotted Top");
		expect(screen.getByLabelText("color")).toHaveValue("Red");
		expect(screen.getByLabelText("size")).toHaveValue("L");
		expect(screen.getByLabelText("price")).toHaveValue("19.99");
	});

	it("Import All batch queue shows Skip button and advances on skip", async () => {
		render(<TestHarness />);

		const checkbox = screen.getByRole("checkbox", { name: /Select email/ });
		fireEvent.click(checkbox);

		await waitFor(() => {
			expect(screen.getByText(/Import All 5 Items/)).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText(/Import All 5 Items/));

		await waitFor(() => {
			expect(screen.getByText(/Item 1 of 5/)).toBeInTheDocument();
		});

		// Skip button should be present in batch mode
		const skipBtn = screen.getByText("Skip This Item");
		expect(skipBtn).toBeInTheDocument();

		// Skip first item
		fireEvent.click(skipBtn);

		// Should advance to item 2
		await waitFor(() => {
			expect(screen.getByText(/Item 2 of 5/)).toBeInTheDocument();
		});

		expect(screen.getByLabelText("name")).toHaveValue("Knotted Top");
	});

	it("Return to Email Preview navigates back to gmail view", async () => {
		render(<TestHarness />);

		const checkbox = screen.getByRole("checkbox", { name: /Select email/ });
		fireEvent.click(checkbox);

		await waitFor(() => {
			expect(screen.getByText(/Detected 5 items/)).toBeInTheDocument();
		});

		// Import single item
		const importButtons = screen.getAllByRole("button", { name: "Import" });
		fireEvent.click(importButtons[0]);

		await waitFor(() => {
			expect(screen.getByText("Import Item")).toBeInTheDocument();
		});

		// Click "Back to Email" to return to the gmail preview
		fireEvent.click(screen.getAllByText(/Back to Email/)[0]);

		// Should be back on the gmail view with email list
		await waitFor(() => {
			expect(screen.getByTestId('email-count')).toHaveTextContent(/found 1 email/i);

		});
	});

	it("Import All button imports all products with brand pre-filled", async () => {
		render(<TestHarness />);

		const checkbox = screen.getByRole("checkbox", { name: /Select email/ });
		fireEvent.click(checkbox);

		await waitFor(() => {
			expect(screen.getByText(/Detected 5 items/)).toBeInTheDocument();
		});

		// Click "Import All 5 Items" button when multiple products are detected
		fireEvent.click(screen.getByRole("button", { name: /Import All/ }));

		await waitFor(() => {
			expect(screen.getByText("Import Item")).toBeInTheDocument();
		});

		// Brand should be detected from the sender email address
		expect(screen.getByLabelText("brand")).toHaveValue("zara");
	});
});
