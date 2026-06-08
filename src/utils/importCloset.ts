import type { ClothingItem } from "./types";

const HEADER_TO_FIELD = {
	Name: "name",
	Brand: "brand",
	Category: "category",
	Color: "color",
	Size: "size",
	Price: "price",
	Material: "material",
	Occasion: "occasion",
	Condition: "age",
	"Purchase Date": "purchaseDate",
	Care: "care",
	"On Sale": "onSale",
	Notes: "notes",
} as const;

function parseCSVLine(line: string): string[] {
	const result: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		const next = line[i + 1];

		if (char === '"') {
			if (inQuotes && next === '"') {
				current += '"';
				i++;
			} else {
				inQuotes = !inQuotes;
			}
			continue;
		}

		if (char === "," && !inQuotes) {
			result.push(current);
			current = "";
			continue;
		}

		current += char;
	}

	result.push(current);

	return result;
}

export async function importClosetFromCSV(file: File): Promise<ClothingItem[]> {
	const text = await file.text();

	const lines = text.split(/\r?\n/).filter(Boolean);

	if (lines.length < 2) {
		throw new Error("CSV is empty");
	}

	const headers = parseCSVLine(lines[0]);

	const items = lines.slice(1).map((line) => {
		const values = parseCSVLine(line);

		const item: Partial<ClothingItem> = {};

		headers.forEach((header, index) => {
			const field = HEADER_TO_FIELD[header as keyof typeof HEADER_TO_FIELD];

			if (!field) return;

			item[field as keyof ClothingItem] = values[index];
		});

		return item as ClothingItem;
	});

	return items;
}
