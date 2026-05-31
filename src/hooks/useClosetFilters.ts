import { useMemo, useState } from "react";
import { ClothingItem } from "../utils/types";

export type FilterDimension = "category" | "color" | "brand" | "material" | "occasion";
export type FilterState = Record<FilterDimension, string[]>;
export type FilterOption = { value: string; count: number };
export type FilterOptions = Record<FilterDimension, FilterOption[]>;

const FILTER_DIMENSIONS: FilterDimension[] = [
	"category",
	"color",
	"brand",
	"material",
	"occasion",
];

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
			const counts = new Map<string, number>();
			for (const item of closet) {
				const val = (item[dim] as string) ?? "";
				if (val.trim()) {
					counts.set(val, (counts.get(val) ?? 0) + 1);
				}
			}
			result[dim] = Array.from(counts.entries())
				.map(([value, count]) => ({ value, count }))
				.sort((a, b) => a.value.localeCompare(b.value));
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

	const activeFilterCount = useMemo(
		() => FILTER_DIMENSIONS.reduce((sum, dim) => sum + filters[dim].length, 0),
		[filters]
	);

	const toggleFilter = (dim: FilterDimension, value: string) => {
		setFilters((prev) => {
			const current = prev[dim];
			const next = current.includes(value)
				? current.filter((v) => v !== value)
				: [...current, value];
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
