import { useMemo, useState } from "react";
import { ClothingItem, MaterialBlend } from "../utils/types";
import normalizeColor, { normalizeColorGroups } from "../Features/FashionParser/normalizers/normalizeColor";
import normalizeCategory from "../Features/FashionParser/normalizers/normalizeCategory";
import { parseCareLabels } from "../utils/careUtils";
import { canonicalizeMaterial } from "../utils/materialUtils";
import { getLocation } from "../utils/locations";

const MATERIAL_MIN_PCT = 6;

// Extract canonical material names from a raw material field.
// Skips minor fibers (≤ 6%) so "95% Cotton, 5% Elastane" → ["Cotton"] not ["Cotton", "Elastane"].
const extractMaterialNames = (raw: unknown): string[] => {
	if (typeof raw === "string") {
		return raw.trim() ? [canonicalizeMaterial(raw.trim())] : [];
	}
	if (Array.isArray(raw)) {
		return (raw as MaterialBlend[])
			.filter((b) => b && typeof b === "object" && typeof b.material === "string" && b.percentage > MATERIAL_MIN_PCT)
			.map((b) => canonicalizeMaterial(b.material));
	}
	return [];
};

export type FilterDimension = "category" | "color" | "brand" | "material" | "occasion" | "care" | "status" | "location";
export type FilterState = Record<FilterDimension, string[]>;
export type FilterOption = { value: string; count: number };
export type FilterOptions = Record<FilterDimension, FilterOption[]>;

// Single source of truth for "which dimensions exist" — FilterSidePanel and
// FilterPillsRow import this (not their own copy) specifically to close the
// hardcoded-list gotcha: a dimension added only here used to silently not
// appear in the UI, since tsc can't catch a missing array entry.
export const FILTER_DIMENSIONS: FilterDimension[] = ["category", "color", "brand", "material", "occasion", "care", "status", "location"];

/** Display label per dimension, for filter UI headers/pills. */
export const FILTER_DIMENSION_LABELS: Record<FilterDimension, string> = {
	category: "Category",
	color: "Color",
	brand: "Brand",
	material: "Material",
	occasion: "Occasion",
	care: "Care",
	status: "Status",
	location: "Location",
};

const INITIAL_FILTERS: FilterState = {
	category: [],
	color: [],
	brand: [],
	material: [],
	occasion: [],
	care: [],
	status: [],
	location: [],
};

/** "at_cleaner" → "At cleaner". Absent status defaults to "clean", matching statusTransitions.ts. */
const humanizeStatus = (status?: string): string => {
	const raw = status ?? "clean";
	const spaced = raw.replace(/_/g, " ");
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/** Default location-label resolver: the static starter registry. A live per-user
 *  locations context (E12-3.2) can pass its own resolver for custom locations. */
const defaultResolveLocationLabel = (id?: string): string => getLocation(id).label;

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
// Material is handled separately via extractMaterialNames so this path is only hit
// for non-material dimensions.
const displayValues = (dim: FilterDimension, raw: string): string[] => (dim === "color" ? normalizeColorGroups(raw) : [normalizeForDim(dim, raw)]);

/**
 * @param resolveLocationLabel Resolves a `locationId` to a display label. Defaults
 * to the static starter registry (`utils/locations.ts`). A live per-user locations
 * context (E12-3.2) can pass its own resolver so custom/multi-home locations show
 * their real names instead of falling back to "Home".
 */
export const useClosetFilters = (closet: ClothingItem[], resolveLocationLabel: (id?: string) => string = defaultResolveLocationLabel) => {
	const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

	// Compute available options with counts from the full closet
	const filterOptions = useMemo<FilterOptions>(() => {
		const result = {} as FilterOptions;

		for (const dim of FILTER_DIMENSIONS) {
			const counts = new Map<string, { value: string; count: number }>();
			for (const item of closet) {
				// Material/care/status/location use their own extractors; other dims use the generic path.
				const displayList =
					dim === "material"
						? extractMaterialNames(item[dim])
						: dim === "care"
							? parseCareLabels(item.care)
							: dim === "status"
								? [humanizeStatus(item.status)]
								: dim === "location"
									? [resolveLocationLabel(item.locationId)]
									: extractValues(item[dim]).flatMap((trimmed) => displayValues(dim, trimmed));

				for (const display of displayList) {
					const key = display.toLowerCase();
					const existing = counts.get(key);
					if (existing) {
						existing.count += 1;
					} else {
						counts.set(key, { value: display, count: 1 });
					}
				}
			}

			result[dim] = Array.from(counts.values()).sort((a, b) => a.value.localeCompare(b.value));
		}
		return result;
	}, [closet, resolveLocationLabel]);

	// OR within a dimension, AND across dimensions
	const filteredItems = useMemo<ClothingItem[]>(() => {
		return closet.filter((item) => {
			for (const dim of FILTER_DIMENSIONS) {
				const selected = filters[dim];
				if (selected.length === 0) continue;

				// Material/care/status/location use their own extractors; other dims use the generic path.
				const itemKeys =
					dim === "material"
						? extractMaterialNames(item[dim]).map((n) => n.toLowerCase())
						: dim === "status"
							? [humanizeStatus(item.status).toLowerCase()]
							: dim === "location"
								? [resolveLocationLabel(item.locationId).toLowerCase()]
								: dim === "care"
									? parseCareLabels(item.care).map((l) => l.toLowerCase())
									: extractValues(item[dim]).flatMap((v) => displayValues(dim, v).map((d) => d.toLowerCase()));
				const matches = selected.some((term) => itemKeys.includes(canonicalValue(dim, term)));
				if (!matches) return false;
			}
			return true;
		});
	}, [closet, filters, resolveLocationLabel]);

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
