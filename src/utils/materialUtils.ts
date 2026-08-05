import type { MaterialBlend } from "./types";
import { FIBERS } from "../Content/Fabrics&Fibers/fibers";

// ── Color palette for composition bar segments ────────────────────────────────
// Each common material gets a distinct, accessible color. Unknown materials
// fall back to a deterministic hue derived from the material name.

/** Canonical vocabulary for the Material Composition dropdown — every material
 *  the app already knows how to color/swatch. Sorted for a scannable list.
 *  MaterialCombobox force-matches typed input to the closest entry here (no
 *  free-text fallback), so this list must cover every term the email parser
 *  actually produces — see Features/FashionParser/maps/material.ts, which is
 *  the source of truth this was last reconciled against. Adding a fiber to
 *  that parser map without adding it here means an imported item's material
 *  gets silently coerced to an unrelated canonical entry the first time
 *  someone opens the field. */
export function canonicalMaterialList(): string[] {
	return Object.keys(MATERIAL_COLORS).sort();
}

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
	elastine: "#fb923c", // orange-400 (common misspelling of elastane in retailer copy)
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
	// Below: added to close the gap with FashionParser's MATERIAL_MAP, which
	// produced these from real retailer emails but had no canonical home.
	"merino wool": "#fcd34d", // amber-300 (same as wool — synonym, like lycra/elastane)
	"faux leather": "#a8a29e", // stone-400 — distinct from leather's brown
	flannel: "#cbd5e1", // slate-300
	crochet: "#fda4af", // rose-300
	organza: "#fef3c7", // amber-100 — sheer, pale
	scuba: "#38bdf8", // sky-400
	terry: "#fdba74", // orange-300
	tulle: "#f0abfc", // fuchsia-300
	twill: "#ca8a04", // yellow-600
	crepe: "#fbcfe8", // pink-200
	mesh: "#7dd3fc", // sky-300
	knit: "#84cc16", // lime-500
};

export const BRAND_MATERIAL_COLORS: Record<string, string> = {
	// Natural plant fibers — sage & linen greens
	cotton: "#c8d4c0", // sage-light — natural, breathable
	linen: "#d4c4b0", // warm linen — raw, organic
	bamboo: "#a3b89e", // sage-mid — eco, fresh

	// Protein / luxury fibers — blush & terracotta
	silk: "#e8d5cc", // pale blush — smooth, delicate
	wool: "#ba9259", // ochre — warm, cozy (primitive-status-warning-ochre)
	cashmere: "#9e7840", // deep gold — sumptuous, rare
	lace: "#eeddd8", // faintest blush — airy, delicate

	// Cellulosic semi-synthetics — taupe & rosy-neutral
	modal: "#c4b8aa", // warm taupe — soft drape
	rayon: "#9e8b78", // mid taupe — semi-natural
	viscose: "#b09088", // rosy taupe — flowing
	cupro: "#d4a8a0", // dusty rose — silk-like hand
	lyocell: "#bdb0a2", // greige — sustainable cellulosic

	// Synthetics — blue-slate family
	polyester: "#5a6b7c", // info slate (primitive-status-info-slate)
	nylon: "#4a5a6c", // deep slate — technical, durable
	acrylic: "#7a8a8c", // cool slate-taupe — synthetic

	// Stretch fibers — muted crimson (same hue family, same synonyms)
	spandex: "#b86b63", // muted crimson — stretch, energy
	elastane: "#b86b63", // muted crimson — synonym for spandex
	lycra: "#b86b63", // muted crimson — brand name for elastane

	// Structured / heavy fabrics — deep umber & espresso
	denim: "#4a5e72", // deep blue-slate — structured, workhorse
	leather: "#492f28", // espresso (primitive-neutral-dark-espresso)
	suede: "#675647", // walnut (primitive-neutral-dark-walnut)
	corduroy: "#3d2822", // roasted brown (primitive-neutral-dark-roasted-brown)
	tweed: "#847057", // taupe (primitive-neutral-dark-taupe)
	velvet: "#8f6256", // deep umber (primitive-brand-deep-umber) — rich, plush

	// Surface / drape fabrics — terracotta family
	chiffon: "#f5f0ea", // near-alabaster — sheer, weightless
	satin: "#c9a090", // polished terracotta — gleaming surface
	jersey: "#8a7060", // warm mid-brown — casual, lived-in
	fleece: "#8a9e84", // sage — soft, cozy
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
export function normalizeMaterial(raw: unknown): MaterialBlend[] {
	if (Array.isArray(raw)) {
		const valid = (raw as unknown[]).filter(
			(entry): entry is MaterialBlend =>
				typeof entry === "object" &&
				entry !== null &&
				typeof (entry as MaterialBlend).material === "string" &&
				typeof (entry as MaterialBlend).percentage === "number",
		);
		return valid.length > 0 ? valid : [];
	}

	if (typeof raw === "string") {
		return parseBlendString(raw);
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

// ── Canonicalization ──────────────────────────────────────────────────────────
// Collapse synonymous / branded fiber names onto a single canonical label so the
// material filter and the material-percentage sort agree on identity
// (e.g. "elastane"/"lycra" → "Spandex", "lyocell" → "Tencel"). Shared by
// useClosetFilters (filter grouping) and useClosetSort (blend-% ranking).

// Exact-key overrides — checked first.
const MATERIAL_EXACT: Record<string, string> = {
	lycra: "Spandex",
	elastane: "Spandex",
	// Real retailer copy misspells "elastane" as "elastine" often enough that
	// it shows up verbatim in imported blend strings (extractBlendString
	// grabs the raw token, no keyword matching involved) — collapse it onto
	// the same canonical label as its correctly-spelled synonyms.
	elastine: "Spandex",
	lyocell: "Tencel",
	"cupro rayon": "Cupro",
};

// Substring rules — applied in order when no exact match found.
// A material name that *contains* the keyword maps to the canonical value.
const MATERIAL_CONTAINS: [substring: string, canonical: string][] = [
	["tencel", "Tencel"],
	["viscose", "Viscose"],
	["polyester", "Polyester"],
	["cupro", "Cupro"],
	["spandex", "Spandex"],
];

/** Map a raw fiber name onto its canonical, capitalized label. */
export function canonicalizeMaterial(name: string): string {
	const key = name.trim().toLowerCase();
	if (MATERIAL_EXACT[key]) return MATERIAL_EXACT[key];
	for (const [sub, canonical] of MATERIAL_CONTAINS) {
		if (key.includes(sub)) return canonical;
	}
	return capitalize(name.trim());
}

// ── Fiber lookup ─────────────────────────────────────────────────────────────
// Resolve a raw material name to a FIBERS entry, returning null for materials
// that have no fiber (leather, denim, velvet, jersey, etc.).

const FIBER_SYNONYMS: Record<string, string> = {
	elastane: "spandex",
	lycra: "spandex",
	rayon: "viscose",
	lyocell: "tencel",
	// "Wool" alone (no breed) has no dedicated fibers.ts entry — merino is the
	// closest generic wool page, and MATERIAL_COLORS already treats
	// "merino wool" as a synonym of plain "wool" for the same reason.
	wool: "merino",
	// "Polyamide" is nylon's generic/chemical name — inferMaterialFromName
	// keeps them as distinct keyword matches (some retailers use one term or
	// the other), but they share one fiber entry.
	polyamide: "nylon",
};

export function resolveFiber(material: string) {
	const key = canonicalizeMaterial(material).toLowerCase();
	const resolved = FIBER_SYNONYMS[key] ?? key;
	return FIBERS.find((f) => f.id === resolved) ?? null;
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
