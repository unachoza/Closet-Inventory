import { useMemo, useState } from "react";
import { ClothingItem } from "../utils/types";

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

export const useClosetFilters = (closet: ClothingItem[]) => {
	const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

	// Compute available options with counts from the full closet
	const filterOptions = useMemo<FilterOptions>(() => {
		const result = {} as FilterOptions;

		for (const dim of FILTER_DIMENSIONS) {
			const counts = new Map<string, { value: string; count: number }>();

			for (const item of closet) {
				const raw = item[dim];

				const values: string[] = [];

				// string
				if (typeof raw === "string") {
					values.push(raw);
				}

				// array
				else if (Array.isArray(raw)) {
					raw.forEach((entry) => {
						if (typeof entry === "string") {
							values.push(entry);
						} else if (entry && typeof entry === "object") {
							values.push(Object.values(entry).join(" "));
						}
					});
				}

				// object
				else if (raw && typeof raw === "object") {
					values.push(Object.values(raw).join(" "));
				}

				for (const val of values) {
					const trimmed = val.trim();
					if (!trimmed) continue;

					// normalize for counting
					const key = trimmed.toLowerCase();

					const existing = counts.get(key);

					if (existing) {
						existing.count += 1;
					} else {
						// save display version (Title Case)
						counts.set(key, {
							value: trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase(),
							count: 1,
						});
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
				const itemVal = (item[dim] as string) ?? "";
				if (!selected.includes(itemVal)) return false;
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
