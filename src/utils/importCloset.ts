import type { ClothingItem } from "./types";

export interface SkippedImportRow {
	/** 1-based position of the row in the source file (JSON array index / CSV line number). */
	index: number;
	id?: string;
	reason: string;
	/** The raw parsed row, kept so it can be re-normalized once the user supplies a name. */
	record: Record<string, unknown>;
}

export interface ImportResult {
	items: ClothingItem[];
	skipped: SkippedImportRow[];
}

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
 * Validate a parsed record before it's cast to a ClothingItem.
 * `name` is the one field the app can't sanely default (it's the item's identity
 * and display key everywhere), so a row without it is reported rather than
 * silently producing a nameless, un-editable item. Structural fields that would
 * otherwise crash rendering (`material`, `notes` — iterated with `.map`) are
 * coerced to safe arrays below.
 */
function validateImportedItem(raw: Record<string, unknown>): string | null {
	if (typeof raw.name !== "string" || !raw.name.trim()) {
		return "missing a required 'name' field";
	}
	return null;
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
		// Guard the fields the UI iterates with `.map` — a non-array here would crash
		// the card on render.
		material: Array.isArray(raw.material) ? (raw.material as ClothingItem["material"]) : [],
		notes: Array.isArray(raw.notes) ? (raw.notes as string[]) : (typeof raw.notes === "string" ? [raw.notes] : undefined),
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

const NON_EMPTY_STRING_ID_FIELDS = ["color", "size", "brand", "imageURL"] as const;

/**
 * Whether a record missing `name` still has enough on it for a human to
 * recognize the item and give it a name in the UI. `category` alone isn't
 * enough (too generic — "tops" could be anything); it needs at least one
 * more identifying field. `id`, `condition`/`age`, and `purchaseDate` don't
 * count — they identify nothing about what the item actually is.
 */
function isIdentifiable(record: Record<string, unknown>): boolean {
	const hasCategory = typeof record.category === "string" && record.category.trim().length > 0;
	if (!hasCategory) return false;

	const hasIdentifyingString = NON_EMPTY_STRING_ID_FIELDS.some(
		(field) => typeof record[field] === "string" && (record[field] as string).trim().length > 0,
	);
	const hasMaterial = Array.isArray(record.material) && record.material.length > 0;

	return hasIdentifyingString || hasMaterial;
}

/**
 * Split parsed records into normalized items and skipped rows, instead of
 * failing the whole import over a handful of bad rows. `index` is 1-based
 * and matches the row's position among the data rows (so it lines up with
 * what the user sees when they open the source file). Rows that fail
 * validation but have nothing identifying about them (no category + one
 * more clue) are dropped without a trace — surfacing "Row 79, no info" in
 * the UI would only confuse the user, not help them.
 */
function buildImportResult(records: Record<string, unknown>[]): ImportResult {
	const items: ClothingItem[] = [];
	const skipped: SkippedImportRow[] = [];

	records.forEach((record, i) => {
		const reason = validateImportedItem(record);
		if (reason) {
			if (isIdentifiable(record)) {
				const id = typeof record.id === "string" && record.id.trim() ? record.id : undefined;
				skipped.push({ index: i + 1, id, reason, record });
			}
			return;
		}
		items.push(normalizeImportedItem(record));
	});

	if (items.length === 0) {
		throw new Error("No valid closet items found in this file.");
	}

	return { items, skipped };
}

/**
 * Re-normalize a skipped row once the user has supplied a name for it in the
 * UI. Returns `null` if the name is still blank (row stays skipped/excluded).
 * Reuses `normalizeImportedItem` so the fixed row gets the same coercion
 * (material/notes arrays, onSale, id) as every other imported item.
 */
export function finalizeSkippedRow(row: SkippedImportRow, name: string): ClothingItem | null {
	const trimmed = name.trim();
	if (!trimmed) return null;
	return normalizeImportedItem({ ...row.record, name: trimmed });
}

export async function importClosetFromCSV(file: File): Promise<ImportResult> {
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

	return buildImportResult(assertItemArray(records));
}

export async function importClosetFromJSON(file: File): Promise<ImportResult> {
	const text = await file.text();

	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		throw new Error("File is not valid JSON.");
	}

	return buildImportResult(assertItemArray(parsed));
}

/** Dispatch to the right parser based on file extension. */
export async function importClosetFromFile(file: File): Promise<ImportResult> {
	const name = file.name.toLowerCase();

	if (name.endsWith(".json")) return importClosetFromJSON(file);
	if (name.endsWith(".csv")) return importClosetFromCSV(file);

	throw new Error("Unsupported file type. Please upload a .csv or .json file.");
}
