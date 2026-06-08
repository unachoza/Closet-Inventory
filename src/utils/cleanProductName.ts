// Ordered: multi-word phrases before single-word ones, so partial matches don't survive
const SEO_JUNK: RegExp[] = [
	// Named junk phrases — run BEFORE inline suffix so "New In ..." is stripped cleanly
	/\bnew\s+arrivals?\b/gi,
	/\bnew\s+in\b/gi,
	/\bjust\s+in\b/gi,
	/\bbest\s+sellers?\b/gi,
	/\bhot\s+sale\b/gi,
	/\bflash\s+sale\b/gi,
	/\blimited\s+time\b/gi,
	/\bbuy\s+now\b/gi,
	/\bshop\s+now\b/gi,
	/\bfree\s+shipping\b/gi,
	/\b(spring|summer|fall|winter|autumn)\s+collection\b/gi,
	/\b(spring|summer|fall|winter|autumn)\s+cloth(?:es)?\b/gi,

	// SHEIN / fast-fashion SEO suffixes and qualifiers
	/\bcloth(?:es)?\s+for\s+(women|men)\b/gi,  // "Clothes For Women"
	/\bfor\s+(women|men)\b/gi,                  // residual "For Women" after above
	/\bsolid\s+color\b/gi,
	/\bPETITE\b/g,                              // size qualifier used as SEO prefix

	// Gender prefixes — use lookahead to handle trailing apostrophe in "Ladies'"
	/\bwomen'?s?(?=\s|$)/gi,
	/\bmen'?s?(?=\s|$)/gi,
	/\bladies'?(?=\s|$)/gi,

	// Year tokens
	/\b20[12]\d\b/g,

	// Trailing inline color/size — color capped at 2 words to avoid matching product words.
	// Runs AFTER the named phrases above so "New In" won't be treated as "in <color>".
	/\s+in\s+[a-z][a-z]*(?:\s+[a-z][a-z]*)?(?:\s+size\s+\S+)?\s*$/i,
	/\s+size\s+\S+\s*$/i,
];

export function cleanProductName(name: string): string {
	let result = name;

	for (const pattern of SEO_JUNK) {
		result = result.replace(pattern, " ");
	}

	return result
		.replace(/\s*[,|•·]\s*$/g, "")   // trailing separators
		.replace(/^\s*[,|•·]\s*/g, "")   // leading separators
		.replace(/\s{2,}/g, " ")          // collapse whitespace
		.trim();
}
