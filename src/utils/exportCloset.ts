import type { ClothingItem } from "./types";

const CSV_COLUMNS = [
	"name",
	"brand",
	"category",
	"color",
	"size",
	"price",
	"material",
	"occasion",
	"age",
	"purchaseDate",
	"care",
	"onSale",
	"notes",
] as const;

const HEADERS: Record<(typeof CSV_COLUMNS)[number], string> = {
	name: "Name",
	brand: "Brand",
	category: "Category",
	color: "Color",
	size: "Size",
	price: "Price",
	material: "Material",
	occasion: "Occasion",
	age: "Condition",
	purchaseDate: "Purchase Date",
	care: "Care",
	onSale: "On Sale",
	notes: "Notes",
};

/** Escape a single cell value: wrap in quotes if it contains a comma, quote, or newline. */
function escapeCell(raw: unknown): string {
	const str = Array.isArray(raw)
		? raw.join("; ")
		: raw == null
			? ""
			: typeof raw === "object"
				? JSON.stringify(raw)
				: String(raw);

	const needsQuoting = str.includes(",") || str.includes('"') || str.includes("\n");
	return needsQuoting ? `"${str.replace(/"/g, '""')}"` : str;
}

function itemToRow(item: ClothingItem): string {
	return CSV_COLUMNS.map((col) => escapeCell(item[col])).join(",");
}

function buildCSV(items: ClothingItem[]): string {
	const header = CSV_COLUMNS.map((col) => HEADERS[col]).join(",");
	const rows = items.map(itemToRow);
	return [header, ...rows].join("\n");
}

/** Trigger a browser download of the closet as a .csv file. */
export function exportClosetToCSV(items: ClothingItem[]): void {
	if (items.length === 0) return;

	const csv = buildCSV(items);
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);

	const timestamp = new Date().toISOString().slice(0, 10);
	const filename = `my-closet-${timestamp}.csv`;

	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.style.display = "none";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
