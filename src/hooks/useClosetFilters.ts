import { useMemo, useState } from "react";
import { ClothingItem } from "../utils/types";
import normalizeColor, { normalizeColorGroups } from "../utils/normalizeColors";
import normalizeCategory from "../utils/normalizeCategories";

export type FilterDimension = "category" | "color" | "brand" | "material" | "occasion";
export type FilterState = Record<FilterDimension, string[]>;
export type FilterOption = { value: string; count: number };
export type FilterOptions = Record<FilterDimension, FilterOption[]>;

const FILTER_DIMENSIONS: FilterDimension[] = ["category", "color", "brand", "material", "occasion"];

const INITIAL_FILTERS: FilterState = {
	category: [],
	color: [],
	brand: [],
	material: [],
	occasion: [],
};

// Flatten a raw field (string | array | object) into a list of trimmed string values.
const extractValues = (raw: unknown): string[] => {
	const values: string[] = [];

	if (typeof raw === "string") {
		values.push(raw);
	} else if (Array.isArray(raw)) {
		raw.forEach((entry) => {
			if (typeof entry === "string") {
				values.push(entry);
			} else if (entry && typeof entry === "object") {
				values.push(Object.values(entry).join(" "));
			}
		});
	} else if (raw && typeof raw === "object") {
		values.push(Object.values(raw).join(" "));
	}

	return values.map((v) => v.trim()).filter(Boolean);
};

// Collapse a single value onto its canonical form for a dimension: colors group
// via normalizeColor ("brown"/"Brown" → "Brown"), categories via normalizeCategory
// ("dress"/"dresses" → "dresses"); other dimensions pass through unchanged.
const normalizeForDim = (dim: FilterDimension, value: string): string => {
	if (dim === "color") return normalizeColor(value);
	if (dim === "category") return normalizeCategory(value);
	return value;
};

// Canonical comparison key for a single selected filter term.
const canonicalValue = (dim: FilterDimension, value: string): string => normalizeForDim(dim, value).toLowerCase();

// Display value(s) a raw field contributes to its dimension. Colors expand into
// their distinct groups (primary + secondary), e.g. "blue / white" → ["Blue", "White"].
const displayValues = (dim: FilterDimension, raw: string): string[] =>
	dim === "color" ? normalizeColorGroups(raw) : [normalizeForDim(dim, raw)];

export const useClosetFilters = (closet: ClothingItem[]) => {
	const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

	// Compute available options with counts from the full closet
	const filterOptions = useMemo<FilterOptions>(() => {
		const result = {} as FilterOptions;

		for (const dim of FILTER_DIMENSIONS) {
			const counts = new Map<string, { value: string; count: number }>();

			for (const item of closet) {
				for (const trimmed of extractValues(item[dim])) {
					// Colors expand into their groups ("brown / taupe" → "Brown",
					// "blue / white" → "Blue" + "White"); other dims keep their raw value.
					for (const display of displayValues(dim, trimmed)) {
						const key = display.toLowerCase();
						const existing = counts.get(key);

						if (existing) {
							existing.count += 1;
						} else {
							counts.set(key, { value: display, count: 1 });
						}
					}
				}
			}

			result[dim] = Array.from(counts.values()).sort((a, b) => a.value.localeCompare(b.value));
		}

		return result;
	}, [closet]);

	// OR within a dimension, AND across dimensions
	const filteredItems = useMemo<ClothingItem[]>(() => {
		return closet.filter((item) => {
			for (const dim of FILTER_DIMENSIONS) {
				const selected = filters[dim];
				if (selected.length === 0) continue;

				// Canonicalize both the item's value(s) and the selected terms so that
				// case differences and color groupings match. A multi-color item
				// ("blue / white") contributes a key per group, so it matches either filter.
				const itemKeys = extractValues(item[dim]).flatMap((v) => displayValues(dim, v).map((d) => d.toLowerCase()));
				const matches = selected.some((term) => itemKeys.includes(canonicalValue(dim, term)));

				if (!matches) return false;
			}
			return true;
		});
	}, [closet, filters]);

	const activeFilterCount = useMemo(() => FILTER_DIMENSIONS.reduce((sum, dim) => sum + filters[dim].length, 0), [filters]);

	const toggleFilter = (dim: FilterDimension, value: string) => {
		setFilters((prev) => {
			const current = prev[dim];
			const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
			return { ...prev, [dim]: next };
		});
	};

	const clearDimension = (dim: FilterDimension) => {
		setFilters((prev) => ({ ...prev, [dim]: [] }));
	};

	const clearAll = () => {
		setFilters({ ...INITIAL_FILTERS });
	};

	return {
		filters,
		filterOptions,
		filteredItems,
		activeFilterCount,
		toggleFilter,
		clearDimension,
		clearAll,
	};
};

//TODO
// color pills per category
// fix filter thing on according
// combine colors
