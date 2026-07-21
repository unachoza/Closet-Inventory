import type { RegexMap } from "../types";

export const STRETCH_MAP: RegexMap = [
	// "stretch" also as a compound prefix: Stretchtech, stretchy
	[/\bstretch/i, "stretch"],
	// Garments that are stretch by construction even without the word
	[/\bbiker\s+shorts?\b/i, "stretch"],
];
export const POCKET_MAP: RegexMap = [[/\bpockets?\b/i, "pockets"]];
