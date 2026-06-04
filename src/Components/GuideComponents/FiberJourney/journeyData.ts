// Extended data for Journey B (mini-flow icons) and Journey C (step previews)
// Keyed by phase id for easy lookup

export interface MiniFlowItem {
	emoji: string;
	label: string;
}

export interface StepPreview {
	preview: string;
}

export const MINI_FLOWS: Record<string, MiniFlowItem[]> = {
	sourcing: [
		{ emoji: "🌿", label: "Cotton\nBoll" },
		{ emoji: "🐑", label: "Shear\nSheep" },
		{ emoji: "🐛", label: "Silk\nCocoon" },
		{ emoji: "⚗️", label: "Polymer\nMelt" },
		{ emoji: "🌲", label: "Wood\nPulp" },
	],
	spinning: [
		{ emoji: "🌀", label: "Open\n& Clean" },
		{ emoji: "🪮", label: "Card\n& Draw" },
		{ emoji: "🌪️", label: "Draft\n& Twist" },
		{ emoji: "🧶", label: "Finished\nYarn" },
	],
	construction: [
		{ emoji: "⬛", label: "Greige\nCloth" },
		{ emoji: "🕸️", label: "Weave\n(Loom)" },
		{ emoji: "🔄", label: "Knit\n(Loops)" },
		{ emoji: "🔲", label: "Non-\nWoven" },
	],
	wetprocessing: [
		{ emoji: "🫧", label: "Scour\n& Clean" },
		{ emoji: "⬜", label: "Bleach" },
		{ emoji: "🎨", label: "Dye\n& Print" },
		{ emoji: "✨", label: "Finish\n& Coat" },
	],
	assembly: [
		{ emoji: "📐", label: "Grade\nPattern" },
		{ emoji: "✂️", label: "Cut\nFabric" },
		{ emoji: "🪡", label: "Sew\nPieces" },
		{ emoji: "🏷️", label: "QC &\nPackage" },
	],
};

export const STEP_PREVIEWS: Record<string, string[]> = {
	sourcing: [
		"Cotton bolls, flax retting, hemp stripping",
		"Shear sheep · unravel silk cocoons · comb goat undercoats",
		"Petroleum polymers extruded through a spinneret",
		"Wood pulp dissolved and re-extruded as fiber",
	],
	spinning: [
		"Loosen bales, remove seeds, dust, and debris",
		"Align fibers into a continuous sliver rope",
		"Thin, twist, and bind fibers into strong yarn",
		"Synthetic filaments: smooth or texturized",
	],
	construction: [
		"Warp + weft interlaced on a loom",
		"Interlooped yarn on needles — naturally stretchy",
		"Fibers bonded — no spinning or weaving",
	],
	wetprocessing: [
		"Remove starch, wax, and processing oils",
		"Hydrogen peroxide removes natural pigmentation",
		"Piece dye, screen print, or yarn-dye",
		"DWR, wrinkle-resist, mercerize, soften",
	],
	assembly: [
		"Scale patterns across all sizes, optimize cut layout",
		"CNC or hand knives through layered fabric",
		"20–100+ individual stitch operations per garment",
		"Inspect, press, tag, and prepare for distribution",
	],
};

// Dark theme accent colors for Journey C
export const DARK_ACCENTS: Record<string, string> = {
	sourcing: "#7AB882",
	spinning: "#D4A843",
	construction: "#6B9FBF",
	wetprocessing: "#D4724A",
	assembly: "#B87AAA",
};
