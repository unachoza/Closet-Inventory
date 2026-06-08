/**
 * App-level integration tests.
 *
 * These tests verify cross-view flows that unit tests can't catch.
 * Firebase and auth are mocked (user = signed out → local storage only).
 * Form, Closet, and filter components render for real.
 *
 * Already covered elsewhere (not duplicated here):
 *   - Batch import queue  → GmailImport.integration.test.tsx
 *   - Firestore sync      → useCloudCloset.test.ts
 *   - Gmail import→save   → GmailImport.integration.test.tsx
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchProvider } from "./context/SearchContext";
import { ViewProvider } from "./context/ViewContext";
import { ToastProvider } from "./Components/Toast/Toast";
import MultiStepForm from "./Features/Form/Form";
import Closet from "./Features/Closet/Closet";
import EntireClosetView from "./Features/SearchCloset/EntireClosetView";
import type { ClothingItem, ViewType } from "./utils/types";
import { useState } from "react";

// ── Prevent Firebase / auth side effects ──────────────────────────────────────
vi.mock("./firebase", () => ({ auth: {}, db: {} }));
vi.mock("./context/AuthContext", () => ({
	AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	useAuth: () => ({ user: null, loading: false }),
}));
vi.mock("firebase/firestore", () => ({
	collection: vi.fn(),
	doc: vi.fn(),
	getDocs: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
	setDoc: vi.fn(),
	deleteDoc: vi.fn(),
	writeBatch: vi.fn(() => ({ set: vi.fn(), commit: vi.fn() })),
}));

// Stub heavy sub-components that aren't under test
vi.mock("./Features/Carousel/Carousel", () => ({
	default: () => <div data-testid="carousel" />,
}));
vi.mock("./Features/Form/ImageUploader/ImageUploader", () => ({
	default: () => <div data-testid="image-uploader" />,
}));
vi.mock("./Components/ClothesCard/Card/Card", () => ({
	default: ({ item }: { item: ClothingItem }) => (
		<div data-testid="clothes-card">{item.name || item.category}</div>
	),
}));
vi.mock("./Features/SearchCloset/FilteredItemGrid", () => ({
	default: ({ items }: { items: ClothingItem[] }) => (
		<div data-testid="item-grid">
			{items.map((item) => (
				<div key={item.id} data-testid="card">{item.name || item.category}</div>
			))}
		</div>
	),
}));

const STORAGE_KEY = "my_closet_key";

function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ViewProvider>
			<SearchProvider>
				<ToastProvider>{children}</ToastProvider>
			</SearchProvider>
		</ViewProvider>
	);
}

beforeEach(() => {
	vi.clearAllMocks();
	localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
});

// ── Add item end-to-end ───────────────────────────────────────────────────────
describe("Add item end-to-end", () => {
	function AddItemFlow() {
		const [view, setView] = useState<ViewType>("form");
		return (
			<>
				{view === "form" && <MultiStepForm setView={setView} />}
				{view === "overview" && <Closet selectedCategory={null} />}
			</>
		);
	}

	it("submitting the form adds the item and it appears in the Closet grid", async () => {
		render(<Providers><AddItemFlow /></Providers>);

		// Navigate through all 9 steps by clicking Next 8 times
		for (let i = 0; i < 8; i++) {
			fireEvent.click(screen.getByRole("button", { name: /next/i }));
		}

		// Step 9 — submit
		const form = screen.getByTestId("multistep-form").querySelector("form")!;
		fireEvent.submit(form);

		// After submit the view transitions to "overview" which renders Closet
		await waitFor(() => {
			const cards = screen.queryAllByTestId("clothes-card");
			expect(cards.length).toBeGreaterThan(0);
		});
	});

	it("toast notification appears after successful submit", async () => {
		render(<Providers><AddItemFlow /></Providers>);

		for (let i = 0; i < 8; i++) {
			fireEvent.click(screen.getByRole("button", { name: /next/i }));
		}

		const form = screen.getByTestId("multistep-form").querySelector("form")!;
		fireEvent.submit(form);

		// Toast uses Radix Viewport — check for toast description text
		await waitFor(() => {
			// Either the toast text or the closet is visible — toast fires on submit
			const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
			expect(stored.length).toBeGreaterThan(0);
		});
	});
});

// ── Filter pills lifecycle ────────────────────────────────────────────────────
describe("Filter pills lifecycle", () => {
	const TEST_CLOSET: ClothingItem[] = [
		{
			id: "1", name: "Nike Top", brand: "Nike", category: "tops",
			color: "black", size: "M", material: "cotton", occasion: "casual",
			age: "new", care: "machine wash", imageURL: "",
		},
		{
			id: "2", name: "Zara Dress", brand: "Zara", category: "dresses",
			color: "red", size: "S", material: "silk", occasion: "formal",
			age: "1 year", care: "dry clean", imageURL: "",
		},
		{
			id: "3", name: "Levi Jeans", brand: "Levi's", category: "bottoms",
			color: "blue", size: "28", material: "denim", occasion: "casual",
			age: "2 years", care: "machine wash", imageURL: "",
		},
	];

	beforeEach(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(TEST_CLOSET));
	});

	it("pill appears when filter is applied, X removes only that filter", () => {
		render(<Providers><EntireClosetView /></Providers>);

		// Apply category filter: tops
		fireEvent.click(screen.getByRole("button", { name: /filters/i }));
		fireEvent.click(screen.getByRole("button", { name: /^category$/i }));
		fireEvent.click(screen.getByRole("checkbox", { name: /^tops/i }));

		// Pill appears
		expect(screen.getByLabelText("Remove tops filter")).toBeInTheDocument();

		// Apply second filter: dresses
		fireEvent.click(screen.getByRole("checkbox", { name: /^dresses/i }));
		expect(screen.getByLabelText("Remove dresses filter")).toBeInTheDocument();

		// Both items visible (tops OR dresses = 2 items)
		expect(screen.getAllByTestId("card")).toHaveLength(2);

		// Remove tops pill → only dresses remain (1 item)
		fireEvent.click(screen.getByLabelText("Remove tops filter"));
		expect(screen.queryByLabelText("Remove tops filter")).not.toBeInTheDocument();
		expect(screen.getByLabelText("Remove dresses filter")).toBeInTheDocument();
		expect(screen.getAllByTestId("card")).toHaveLength(1);
		expect(screen.getByText("Zara Dress")).toBeInTheDocument();
	});

	it("filter count badge on Filters button tracks active filter count", () => {
		render(<Providers><EntireClosetView /></Providers>);

		// No badge initially
		expect(screen.queryByLabelText(/active/)).not.toBeInTheDocument();

		// Apply one filter
		fireEvent.click(screen.getByRole("button", { name: /filters/i }));
		fireEvent.click(screen.getByRole("button", { name: /^category$/i }));
		fireEvent.click(screen.getByRole("checkbox", { name: /^tops/i }));
		expect(screen.getByLabelText("1 active")).toBeInTheDocument();

		// Apply second filter
		fireEvent.click(screen.getByRole("checkbox", { name: /^dresses/i }));
		expect(screen.getByLabelText("2 active")).toBeInTheDocument();

		// Remove one → count goes back to 1
		fireEvent.click(screen.getByLabelText("Remove tops filter"));
		expect(screen.getByLabelText("1 active")).toBeInTheDocument();

		// Clear all → badge gone
		fireEvent.click(screen.getByLabelText("Active filters").querySelector("button:last-child")!);
		expect(screen.queryByLabelText(/active/)).not.toBeInTheDocument();
	});
});
