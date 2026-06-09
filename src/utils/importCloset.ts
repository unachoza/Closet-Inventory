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

/** Coerce the loosely-typed "On Sale" CSV cell into a real boolean. */
function coerceOnSale(raw: unknown): boolean {
	if (typeof raw === "boolean") return raw;
	if (typeof raw !== "string") return false;
	const normalized = raw.trim().toLowerCase();
	return normalized === "true" || normalized === "yes" || normalized === "1";
}

/**
 * Normalize a parsed record into a persistable ClothingItem.
 * Guarantees a stable `id` (so later edit/delete-by-id works) and coerces
 * the fields that CSV would otherwise leave as raw strings.
 */
function normalizeImportedItem(raw: Record<string, unknown>): ClothingItem {
	const existingId = typeof raw.id === "string" && raw.id.trim() ? raw.id : crypto.randomUUID();

	return {
		...(raw as ClothingItem),
		id: existingId,
		imageURL: typeof raw.imageURL === "string" ? raw.imageURL : "",
		onSale: coerceOnSale(raw.onSale),
	};
}

/** Reject anything that isn't a non-empty array of object records. */
function assertItemArray(parsed: unknown): Record<string, unknown>[] {
	if (!Array.isArray(parsed)) {
		throw new Error("File does not contain a list of closet items.");
	}

	const records = parsed.filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null && !Array.isArray(entry));

	if (records.length === 0) {
		throw new Error("No valid closet items found in this file.");
	}

	return records;
}

export async function importClosetFromCSV(file: File): Promise<ClothingItem[]> {
	const text = await file.text();

	const lines = text.split(/\r?\n/).filter(Boolean);

	if (lines.length < 2) {
		throw new Error("CSV is empty or has no data rows.");
	}

	const headers = parseCSVLine(lines[0]);

	const records = lines.slice(1).map((line) => {
		const values = parseCSVLine(line);

		const record: Record<string, unknown> = {};

		headers.forEach((header, index) => {
			const field = HEADER_TO_FIELD[header as keyof typeof HEADER_TO_FIELD];
			if (!field) return;
			record[field] = values[index];
		});

		return record;
	});

	return assertItemArray(records).map(normalizeImportedItem);
}

export async function importClosetFromJSON(file: File): Promise<ClothingItem[]> {
	const text = await file.text();

	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		throw new Error("File is not valid JSON.");
	}

	return assertItemArray(parsed).map(normalizeImportedItem);
}

/** Dispatch to the right parser based on file extension. */
export async function importClosetFromFile(file: File): Promise<ClothingItem[]> {
	const name = file.name.toLowerCase();

	if (name.endsWith(".json")) return importClosetFromJSON(file);
	if (name.endsWith(".csv")) return importClosetFromCSV(file);

	throw new Error("Unsupported file type. Please upload a .csv or .json file.");
}
