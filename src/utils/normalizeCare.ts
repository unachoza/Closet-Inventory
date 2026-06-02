// Collapse messy free-text care instructions onto one of three canonical
// buckets. Values that describe only drying/water (e.g. "hang dry") and have
// no wash verb return "" so they don't create stray filter options.
//
//   "dry clean only"     → "Dry Clean"
//   "hand wash cold"     → "Hand Wash"
//   "machine wash cold"  → "Machine Wash"
//   "wash like colors"   → "Machine Wash"
//   "cold water"         → "Machine Wash"
//   "hang dry"           → ""

const CARE_BUCKETS: ReadonlyArray<{ label: string; pattern: RegExp }> = [
	{ label: "Dry Clean", pattern: /dry\s*clean/ },
	{ label: "Hand Wash", pattern: /hand\s*wash/ },
	{ label: "Machine Wash", pattern: /machine\s*wash|wash like colors|cold water|warm water|hot water|gentle cycle|wash/ },
];

export default function normalizeCare(raw: string): string {
	const text = raw.trim().toLowerCase();
	if (!text) return "";

	for (const { label, pattern } of CARE_BUCKETS) {
		if (pattern.test(text)) return label;
	}

	return "";
}
