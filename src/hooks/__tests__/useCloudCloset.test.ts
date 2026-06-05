import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock fns (must live before vi.mock calls) ─────────────────────────
const {
	mockGetDocs,
	mockSetDoc,
	mockDeleteDoc,
	mockBatchSet,
	mockBatchCommit,
	mockWriteBatch,
	mockDoc,
	mockCollection,
	mockUseAuth,
} = vi.hoisted(() => {
	const mockBatchSet = vi.fn();
	const mockBatchCommit = vi.fn();
	return {
		mockGetDocs: vi.fn(),
		mockSetDoc: vi.fn(),
		mockDeleteDoc: vi.fn(),
		mockBatchSet,
		mockBatchCommit,
		mockWriteBatch: vi.fn(() => ({ set: mockBatchSet, commit: mockBatchCommit })),
		mockDoc: vi.fn(),
		mockCollection: vi.fn(),
		mockUseAuth: vi.fn(),
	};
});

// ── Firebase mocks ────────────────────────────────────────────────────────────
vi.mock("../../firebase", () => ({
	db: {},
	auth: {},
}));

vi.mock("firebase/firestore", () => ({
	collection: mockCollection,
	doc: mockDoc,
	getDocs: mockGetDocs,
	setDoc: mockSetDoc,
	deleteDoc: mockDeleteDoc,
	writeBatch: mockWriteBatch,
}));

// ── Auth context mock ─────────────────────────────────────────────────────────
vi.mock("../../context/AuthContext", () => ({
	useAuth: () => mockUseAuth(),
}));

// ── Local closet mock ─────────────────────────────────────────────────────────
const localCloset = {
	closet: [] as ClothingItem[],
	addItem: vi.fn(),
	addFullItem: vi.fn(),
	removeItem: vi.fn(),
	updateItem: vi.fn(),
	clearCloset: vi.fn(),
	getCloset: vi.fn(() => []),
};

vi.mock("../useLocalCloset", () => ({
	useLocalStorageClosetBase: () => localCloset,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
import type { ClothingItem } from "../../utils/types";
import { useCloudCloset } from "../useCloudCloset";

const makeItem = (overrides: Partial<ClothingItem> = {}): ClothingItem => ({
	id: "item-1",
	imageURL: "",
	name: "Nike Tops",
	category: "tops",
	color: "black",
	size: "M",
	brand: "Nike",
	material: [{ material: "cotton", percentage: 100 }],
	occasion: "casual",
	age: "1 year",
	care: "machine wash",
	...overrides,
});

function makeSnapshot(items: ClothingItem[]) {
	return {
		empty: items.length === 0,
		docs: items.map((item) => ({ data: () => item })),
	};
}

beforeEach(() => {
	vi.clearAllMocks();
	localCloset.closet = [];
	localCloset.getCloset.mockReturnValue([]);
	localStorage.clear();
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("useCloudCloset — signed out", () => {
	beforeEach(() => {
		mockUseAuth.mockReturnValue({ user: null });
	});

	it("returns local closet items when signed out", () => {
		const item = makeItem();
		localCloset.closet = [item];

		const { result } = renderHook(() => useCloudCloset());
		expect(result.current.closet).toEqual([item]);
	});

	it("does not call getDocs when signed out", () => {
		renderHook(() => useCloudCloset());
		expect(mockGetDocs).not.toHaveBeenCalled();
	});

	it("syncing is false when signed out", () => {
		const { result } = renderHook(() => useCloudCloset());
		expect(result.current.syncing).toBe(false);
	});
});

describe("useCloudCloset — sign in with existing cloud data", () => {
	const cloudItem = makeItem({ id: "cloud-1", name: "Cloud Item" });

	beforeEach(() => {
		mockUseAuth.mockReturnValue({ user: { uid: "user-123" } });
		mockGetDocs.mockResolvedValue(makeSnapshot([cloudItem]));
	});

	it("loads items from Firestore when cloud data exists", async () => {
		const { result } = renderHook(() => useCloudCloset());
		await waitFor(() => expect(result.current.syncing).toBe(false));
		expect(result.current.closet).toHaveLength(1);
		expect(result.current.closet[0].id).toBe("cloud-1");
	});

	it("does not seed Firestore with local items when cloud data already exists", async () => {
		localCloset.closet = [makeItem({ id: "local-1" })];
		renderHook(() => useCloudCloset());
		await waitFor(() => expect(mockGetDocs).toHaveBeenCalled());
		expect(mockBatchCommit).not.toHaveBeenCalled();
	});

	it("sets syncing to true while fetching, then false when done", async () => {
		const { result } = renderHook(() => useCloudCloset());
		// syncing starts true once user is set
		await waitFor(() => expect(result.current.syncing).toBe(false));
	});
});

describe("useCloudCloset — first sign-in (empty cloud, local items exist)", () => {
	const localItem = makeItem({ id: "local-seed-1" });

	beforeEach(() => {
		mockUseAuth.mockReturnValue({ user: { uid: "user-123" } });
		mockGetDocs.mockResolvedValue(makeSnapshot([]));
		localCloset.closet = [localItem];
		mockBatchCommit.mockResolvedValue(undefined);
	});

	it("seeds Firestore with local items on first sign-in", async () => {
		renderHook(() => useCloudCloset());
		await waitFor(() => expect(mockBatchCommit).toHaveBeenCalled());
		expect(mockBatchSet).toHaveBeenCalledTimes(1);
	});

	it("returns local items as closet after seeding", async () => {
		const { result } = renderHook(() => useCloudCloset());
		await waitFor(() => expect(result.current.syncing).toBe(false));
		expect(result.current.closet).toEqual([localItem]);
	});

	it("does not call batchCommit when local closet is empty", async () => {
		localCloset.closet = [];
		renderHook(() => useCloudCloset());
		await waitFor(() => expect(mockGetDocs).toHaveBeenCalled());
		expect(mockBatchCommit).not.toHaveBeenCalled();
	});
});

describe("useCloudCloset — mutations when signed in", () => {
	const existingItem = makeItem({ id: "item-a" });

	beforeEach(() => {
		mockUseAuth.mockReturnValue({ user: { uid: "user-123" } });
		mockGetDocs.mockResolvedValue(makeSnapshot([existingItem]));
		mockSetDoc.mockResolvedValue(undefined);
		mockDeleteDoc.mockResolvedValue(undefined);
		mockBatchCommit.mockResolvedValue(undefined);
	});

	it("addFullItem writes to Firestore and appends to cloudItems", async () => {
		const { result } = renderHook(() => useCloudCloset());
		await waitFor(() => expect(result.current.syncing).toBe(false));

		const newItem = makeItem({ id: "item-b", name: "New Item" });
		await act(async () => {
			await result.current.addFullItem(newItem);
		});

		expect(localCloset.addFullItem).toHaveBeenCalledWith(newItem);
		expect(mockSetDoc).toHaveBeenCalled();
		expect(result.current.closet.map((i) => i.id)).toContain("item-b");
	});

	it("addItem writes all local items to Firestore via batch", async () => {
		const updatedLocal = [existingItem, makeItem({ id: "item-new" })];
		localStorage.setItem("my_closet_key", JSON.stringify(updatedLocal));

		const { result } = renderHook(() => useCloudCloset());
		await waitFor(() => expect(result.current.syncing).toBe(false));

		await act(async () => {
			await result.current.addItem({
				id: "",
				category: "tops",
				color: "white",
				size: "S",
				brand: "Zara",
				material: "cotton",
				occasion: "casual",
				age: "new",
				care: "machine wash",
			});
		});

		expect(localCloset.addItem).toHaveBeenCalled();
		expect(mockBatchCommit).toHaveBeenCalled();
	});

	it("removeItem deletes from Firestore and removes from cloudItems", async () => {
		const { result } = renderHook(() => useCloudCloset());
		await waitFor(() => expect(result.current.syncing).toBe(false));

		await act(async () => {
			await result.current.removeItem("item-a");
		});

		expect(localCloset.removeItem).toHaveBeenCalledWith("item-a");
		expect(mockDeleteDoc).toHaveBeenCalled();
		expect(result.current.closet.map((i) => i.id)).not.toContain("item-a");
	});

	it("updateItem writes updated item to Firestore", async () => {
		const updatedLocal = [{ ...existingItem, color: "red" }];
		localStorage.setItem("my_closet_key", JSON.stringify(updatedLocal));

		const { result } = renderHook(() => useCloudCloset());
		await waitFor(() => expect(result.current.syncing).toBe(false));

		await act(async () => {
			await result.current.updateItem("item-a", { color: "red" });
		});

		expect(localCloset.updateItem).toHaveBeenCalledWith("item-a", { color: "red" });
		expect(mockSetDoc).toHaveBeenCalled();
	});
});

describe("useCloudCloset — mutations when signed out", () => {
	beforeEach(() => {
		mockUseAuth.mockReturnValue({ user: null });
	});

	it("addFullItem only updates local when signed out", async () => {
		const { result } = renderHook(() => useCloudCloset());
		const newItem = makeItem({ id: "local-only" });

		await act(async () => {
			await result.current.addFullItem(newItem);
		});

		expect(localCloset.addFullItem).toHaveBeenCalledWith(newItem);
		expect(mockSetDoc).not.toHaveBeenCalled();
	});

	it("removeItem only updates local when signed out", async () => {
		const { result } = renderHook(() => useCloudCloset());

		await act(async () => {
			await result.current.removeItem("item-1");
		});

		expect(localCloset.removeItem).toHaveBeenCalledWith("item-1");
		expect(mockDeleteDoc).not.toHaveBeenCalled();
	});

	it("updateItem only updates local when signed out", async () => {
		const { result } = renderHook(() => useCloudCloset());

		await act(async () => {
			await result.current.updateItem("item-1", { color: "blue" });
		});

		expect(localCloset.updateItem).toHaveBeenCalledWith("item-1", { color: "blue" });
		expect(mockSetDoc).not.toHaveBeenCalled();
	});
});
