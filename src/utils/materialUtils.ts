import type { MaterialBlend } from "./types";

// ── Color palette for composition bar segments ────────────────────────────────
// Each common material gets a distinct, accessible color. Unknown materials
// fall back to a deterministic hue derived from the material name.

export const MATERIAL_COLORS: Record<string, string> = {
	cotton: "#86efac", // green-300
	silk: "#f9a8d4", // pink-300
	wool: "#fcd34d", // amber-300
	cashmere: "#fbbf24", // amber-400
	linen: "#d4b896", // warm tan
	modal: "#93c5fd", // blue-300
	lace: "#e9d5ff", // purple-200
	chiffon: "#fde68a", // yellow-200
	polyester: "#5eead4", // teal-300
	rayon: "#a5b4fc", // indigo-300
	nylon: "#94a3b8", // slate-400
	spandex: "#f87171", // red-400
	elastane: "#fb923c", // orange-400
	lycra: "#fb923c", // orange-400 (same as elastane — synonym)
	viscose: "#c4b5fd", // violet-300
	acrylic: "#67e8f9", // cyan-300
	fleece: "#a3e635", // lime-400
	denim: "#60a5fa", // blue-400
	leather: "#92400e", // brown-700
	suede: "#b45309", // amber-700
	velvet: "#7c3aed", // violet-600
	satin: "#db2777", // pink-600
	corduroy: "#78350f", // amber-900
	tweed: "#6b7280", // gray-500
	jersey: "#34d399", // emerald-400
	cupro: "#e879f9", // fuchsia-400
	bamboo: "#bef264", // lime-300
};

/** Returns a CSS color string for any material, falling back to a
 *  deterministic hue so unknown fibers still get a consistent color. */
export function getMaterialColor(material: string): string {
	const key = material.trim().toLowerCase();
	if (MATERIAL_COLORS[key]) return MATERIAL_COLORS[key];

	// Deterministic fallback: hash the string to a hue
	let hash = 0;
	for (let i = 0; i < key.length; i++) {
		hash = key.charCodeAt(i) + ((hash << 5) - hash);
	}
	const hue = Math.abs(hash) % 360;
	return `hsl(${hue}, 60%, 70%)`;
}

// ── Blend string parser ───────────────────────────────────────────────────────
// Handles legacy material strings from localStorage and email imports.
//
// Examples it handles:
//   "cotton"                    → [{ material: "cotton", percentage: 100 }]
//   "95% Cotton, 5% Spandex"   → [{ material: "cotton", percentage: 95 }, ...]
//   "61% recycled polyester, 26% viscose, 7% cotton, 6% elastane"
//   Already MaterialBlend[]    → returned as-is

const BLEND_PATTERN = /(\d+(?:\.\d+)?)\s*%\s*([\w\s™®-]+?)(?=\s*[,;]|\s*\d+%|$)/gi;

function parseBlendString(raw: string): MaterialBlend[] {
	const trimmed = raw.trim();
	if (!trimmed) return [];

	const matches = [...trimmed.matchAll(BLEND_PATTERN)];

	if (matches.length > 0) {
		return matches.map((m) => ({
			material: m[2].trim().toLowerCase().replace(/\s+/g, " "),
			percentage: Math.round(parseFloat(m[1])),
		}));
	}

	// No percentages found — treat the whole string as 100% of that material
	return [{ material: trimmed.toLowerCase(), percentage: 100 }];
}

/** Normalize any legacy material value to MaterialBlend[].
 *  Safe to call on values already in the new shape. */
// export function normalizeMaterial(raw: unknown): MaterialBlend[] {
// 	if (Array.isArray(raw)) {
// 		// Already new format — validate each entry has the right shape
// 		const valid = (raw as unknown[]).filter(
// 			(entry): entry is MaterialBlend =>
// 				typeof entry === "object" &&
// 				entry !== null &&
// 				typeof (entry as MaterialBlend).material === "string" &&
// 				typeof (entry as MaterialBlend).percentage === "number",
// 		);
// 		return valid.length > 0 ? valid : [];
// 	}

// 	if (typeof raw === "string") {
// 		return parseBlendString(raw);
// 	}

// 	return [];
// }

export function normalizeMaterial(material: unknown): MaterialBlend[] {
	if (!material) return [];

	if (Array.isArray(material)) {
		return material;
	}

	// legacy string migration
	if (typeof material === "string") {
		return [{ material, percentage: 100 }];
	}

	return [];
}
// ── Display helpers ───────────────────────────────────────────────────────────

/** Human-readable summary: "80% Cotton, 20% Polyester" */
export function blendToDisplayString(blend: MaterialBlend[]): string {
	if (blend.length === 0) return "—";
	return blend.map((b) => `${b.percentage}% ${capitalize(b.material)}`).join(", ");
}

/** Primary material name (highest percentage), capitalized. */
export function primaryMaterial(blend: MaterialBlend[]): string {
	if (blend.length === 0) return "";
	const top = [...blend].sort((a, b) => b.percentage - a.percentage)[0];
	return capitalize(top.material);
}

/** Total of all percentages in the blend. */
export function blendTotal(blend: MaterialBlend[]): number {
	return blend.reduce((sum, b) => sum + b.percentage, 0);
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
