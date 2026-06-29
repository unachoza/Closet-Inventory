import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportClosetToCSV } from "../exportCloset";
import type { ClothingItem } from "../types";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const baseItem: ClothingItem = {
	id: "abc-123",
	imageURL: "https://example.com/img.jpg",
	name: "Silk Blouse",
	brand: "Aritzia",
	category: "tops",
	color: "cream",
	size: "XS",
	price: "$89.00",
	material: [{ material: "Silk", percentage: 100 }],
	occasion: "work",
	age: "new",
	purchaseDate: "2024-03-15T00:00:00.000Z",
	care: ["hand wash", "lay flat"],
	onSale: false,
	notes: [],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Spy on the Blob constructor to capture the CSV string passed in, and mock
 * the DOM/URL APIs used by exportClosetToCSV. Returns the captured CSV text.
 */
function captureCSV(item: ClothingItem | ClothingItem[]): string {
	const items = Array.isArray(item) ? item : [item];
	let capturedCSV = "";

	const OriginalBlob = globalThis.Blob;
	vi.spyOn(globalThis, "Blob").mockImplementation((parts, opts) => {
		capturedCSV = (parts as string[]).join("");
		return new OriginalBlob(parts, opts);
	});

	global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock");
	global.URL.revokeObjectURL = vi.fn();
	vi.spyOn(document.body, "appendChild").mockImplementation((el) => el);
	vi.spyOn(document.body, "removeChild").mockImplementation((el) => el);
	vi.spyOn(document, "createElement").mockImplementation((tag) => {
		if (tag === "a") {
			return { href: "", download: "", style: { display: "" }, click: vi.fn() } as unknown as HTMLAnchorElement;
		}
		return document.createElement(tag);
	});

	exportClosetToCSV(items);
	return capturedCSV;
}

function setupDownloadMocks() {
	const clickSpy = vi.fn();
	const appendSpy = vi.spyOn(document.body, "appendChild").mockImplementation((el) => el);
	const removeSpy = vi.spyOn(document.body, "removeChild").mockImplementation((el) => el);

	global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
	global.URL.revokeObjectURL = vi.fn();

	vi.spyOn(document, "createElement").mockImplementation((tag) => {
		if (tag === "a") {
			const el = {
				href: "",
				download: "",
				style: { display: "" },
				click: clickSpy,
			} as unknown as HTMLAnchorElement;
			return el;
		}
		return document.createElement(tag);
	});

	return { clickSpy, appendSpy, removeSpy };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("exportClosetToCSV", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("empty closet", () => {
		it("does nothing when given an empty array", () => {
			const clickSpy = vi.fn();
			vi.spyOn(document, "createElement").mockImplementation((tag) => {
				if (tag === "a") {
					return { href: "", download: "", style: { display: "" }, click: clickSpy } as unknown as HTMLAnchorElement;
				}
				return document.createElement(tag);
			});
			exportClosetToCSV([]);
			expect(clickSpy).not.toHaveBeenCalled();
		});
	});

	describe("CSV structure", () => {
		it("produces a file with the correct header row", () => {
			const csv = captureCSV(baseItem);
			const [headerRow] = csv.split("\n");
			expect(headerRow).toBe(
				"Name,Brand,Category,Color,Size,Price,Material,Occasion,Condition,Purchase Date,Care,On Sale,Notes",
			);
		});

		it("includes one data row per item", () => {
			const items: ClothingItem[] = [baseItem, { ...baseItem, id: "xyz", name: "Linen Pants" }];
			const csv = captureCSV(items);
			const rows = csv.split("\n");
			expect(rows).toHaveLength(3); // header + 2 data rows
			expect(rows[1]).toContain("Silk Blouse");
			expect(rows[2]).toContain("Linen Pants");
		});

		it("joins array fields with '; '", () => {
			const csv = captureCSV({ ...baseItem, care: ["hand wash", "lay flat"] });
			expect(csv).toContain("hand wash; lay flat");
		});

		it("renders boolean fields as true/false strings", () => {
			const csv = captureCSV({ ...baseItem, onSale: true });
			expect(csv).toContain("true");
		});
	});

	describe("cell escaping", () => {
		it("wraps cells containing commas in double-quotes", () => {
			const csv = captureCSV({ ...baseItem, name: "Top, Blouse" });
			expect(csv).toContain('"Top, Blouse"');
		});

		it("escapes double-quotes inside cell values by doubling them", () => {
			const csv = captureCSV({ ...baseItem, notes: ['Fits "true to size"'] });
			expect(csv).toContain('"Fits ""true to size"""');
		});

		it("wraps cells containing newlines in double-quotes", () => {
			const csv = captureCSV({ ...baseItem, notes: ["Line one\nLine two"] });
			expect(csv).toContain('"Line one\nLine two"');
		});

		it("renders null/undefined fields as empty strings", () => {
			const csv = captureCSV({ ...baseItem, notes: undefined });
			// notes column should be empty, not "undefined"
			expect(csv).not.toContain("undefined");
		});
	});

	describe("download trigger", () => {
		it("triggers a link click to start the download", () => {
			const { clickSpy } = setupDownloadMocks();
			exportClosetToCSV([baseItem]);
			expect(clickSpy).toHaveBeenCalledTimes(1);
		});

		it("sets the download filename to include today's date", () => {
			setupDownloadMocks();
			const today = new Date().toISOString().slice(0, 10);
			let capturedDownload = "";

			vi.spyOn(document, "createElement").mockImplementation((tag) => {
				if (tag === "a") {
					const el = {
						href: "",
						set download(v: string) {
							capturedDownload = v;
						},
						get download() {
							return capturedDownload;
						},
						style: { display: "" },
						click: vi.fn(),
					} as unknown as HTMLAnchorElement;
					return el;
				}
				return document.createElement(tag);
			});

			exportClosetToCSV([baseItem]);
			expect(capturedDownload).toBe(`my-closet-${today}.csv`);
		});

		it("revokes the object URL after the click", () => {
			setupDownloadMocks();
			exportClosetToCSV([baseItem]);
			expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
		});

		it("appends and removes the link from the document body", () => {
			const { appendSpy, removeSpy } = setupDownloadMocks();
			exportClosetToCSV([baseItem]);
			expect(appendSpy).toHaveBeenCalledTimes(1);
			expect(removeSpy).toHaveBeenCalledTimes(1);
		});
	});
});
