// ─────────────────────────────────────────────
//  Shared types for the Complete Textile
//  Compendium. Types only — no runtime value,
//  so importing these costs nothing at runtime.
//
//  The data itself lives in sibling files:
//  fibers, weaveTypes, careGroups, stainGuide,
//  sources. They are deliberately separate so a
//  consumer that only needs FIBERS (the closet's
//  resolveFiber) doesn't drag the care/stain
//  content into the initial bundle with it.
// ─────────────────────────────────────────────

export type FiberCategory = "animal" | "plant" | "semi" | "synth";

export interface FiberProp {
	label: string;
	value: number; // 0–100
	color: string;
}

export interface FiberDetailSection {
	title: string;
	content?: string;
	list?: string[];
}

export interface Fiber {
	id: string;
	name: string;
	category: FiberCategory;
	tagLabel: string;
	source: string; // e.g. "Merino sheep · Australia, NZ"
	description: string;
	imageUrl: string;
	imageAlt: string;
	properties: FiberProp[];
	detail: FiberDetailSection[];
}

export interface WeaveType {
	id: string;
	name: string;
	description: string;
	chips: string[];
	fabrics: string[]; // fabric names produced
	compatibleFibers: string; // plain prose note
}

export interface CareGroup {
	title: string;
	subtitle: string;
	items: {
		icon: string;
		label: string;
		value: string;
		backgroundImageUrl: string;
	}[];
}

export interface Source {
	num: string;
	title: string;
	url: string;
	domain: string;
}

// ─────────── FIBERS ───────────
