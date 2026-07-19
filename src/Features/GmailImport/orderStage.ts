// Classifies a purchase email into one of the three stages a single order
// typically moves through: order confirmation → shipped → delivered. Retailers
// almost always send these as three separate emails (and separate Gmail
// threads), so a shopper scanning their inbox sees the same order three times.
// Tagging each email with its stage lets them tell the copies apart and avoid
// importing the same item three times.
//
// Detection is subject-line keyword matching only — the subject is always
// available on the email metadata (no body fetch needed) and is where retailers
// put the stage signal.

export type OrderStage = "confirmed" | "shipped" | "delivered";

// Order matters: the most-advanced stage is tested first. A shipped email often
// still contains the word "order" (e.g. "Your order #123 has shipped"), so if we
// tested "confirmed" first it would win incorrectly. Testing shipped/delivered
// ahead of confirmed resolves that. "out for delivery" is treated as shipped
// (it contains "delivery", not the past-tense "delivered").
const STAGE_PATTERNS: readonly (readonly [OrderStage, RegExp])[] = [
	[
		"delivered",
		/\bdelivered\b|\bhas arrived\b|\bwas delivered\b|package.*(arrived|delivered)|order.*(has )?arrived/i,
	],
	[
		"shipped",
		/\bshipp(ed|ing)\b|\bshipment\b|on (its|the) way|has been sent|out for delivery|\btracking\b|is on the move/i,
	],
	[
		"confirmed",
		/order confirm|confirmation|\bconfirmed\b|thank(s| you) for your (order|purchase)|order received|we('ve| have) received your order|\breceipt\b|your order|order #|\bpurchase\b/i,
	],
];

/**
 * Classify an email subject into an order stage, or null if it matches none.
 * Pure — safe to call on every render.
 */
export function classifyStage(subject: string): OrderStage | null {
	if (!subject) return null;
	for (const [stage, pattern] of STAGE_PATTERNS) {
		if (pattern.test(subject)) return stage;
	}
	return null;
}

/** Display metadata for a stage badge (label + CSS modifier class). */
export const STAGE_META: Record<OrderStage, { readonly label: string; readonly className: string }> = {
	confirmed: { label: "Confirmed", className: "gmail-stage-badge--confirmed" },
	shipped: { label: "Shipped", className: "gmail-stage-badge--shipped" },
	delivered: { label: "Delivered", className: "gmail-stage-badge--delivered" },
};
