export const SLEEVE_LENGTH_MAP: [RegExp, string][] = [
	[/\b(long[- ]?sleeve|longsleeve)\b/i, "long sleeve"],
	// Outdoor/base-layer shorthand: "L/S" and standalone "LS" mean long sleeve
	// (e.g. REI "Silk L/S V-Neck", Icebreaker "Sphere LS Low Crewe").
	[/\bl\/s\b|\bls\b/i, "long sleeve"],
	[/\b3\/4[- ]?sleeve\b/i, "3/4 sleeve"],
	[/\bshort[- ]?sleeve\b/i, "short sleeve"],
	[/\b(sleeveless|strapless|tank)\b/i, "sleeveless"],
	[/\bcap[- ]?sleeve\b/i, "cap sleeve"],
	[/\bflutter[- ]?sleeve\b/i, "flutter sleeve"],
];

export const SLEEVE_STYLE_MAP: [RegExp, string][] = [
	[/\bpuff\b/i, "puff sleeve"],
	[/\bbishop\b/i, "bishop sleeve"],
	[/\blantern\b/i, "lantern sleeve"],
	[/\bbell\b/i, "bell sleeve"],
	[/\bdolman\b/i, "dolman sleeve"],
	[/\braglan\b/i, "raglan sleeve"],
	[/\bbatwing\b/i, "batwing sleeve"],
	[/\bkimono\b/i, "kimono sleeve"],
	[/\bballoon\b/i, "balloon sleeve"],
	[/\bflutter\b/i, "flutter sleeve"],
	[/\bcap\b/i, "cap sleeve"],
];
