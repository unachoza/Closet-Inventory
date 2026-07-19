// Groups the (usually three) emails belonging to one order — confirmation,
// shipped, delivered — so a shopper doesn't scroll past the same purchase three
// times and import it three times.
//
// The three emails are almost always separate Gmail threads, so threadId can't
// tie them together. The shared signal we lean on is the order number in the
// subject line, paired with the retailer (sender domain).
//
// Safety note: a loose order-number match is worse than no grouping — if the
// extractor returns a non-number token, unrelated orders collapse into one group
// and get hidden. extractOrderNumber is therefore digit-guarded and biased toward
// false-negatives (leave ungrouped) over false-positives (wrongly merge).

import type { GmailEmailMeta } from "../../hooks/useAdvancedSearch";
import { classifyStage, type OrderStage } from "./orderStage";

export interface OrderGroup {
	// The email surfaced as the representative to import (richest data): the
	// confirmation when present, otherwise the earliest stage available.
	readonly primary: GmailEmailMeta;
	// Other emails for the same order, collapsed under the primary but still
	// reachable — never a one-way hide.
	readonly others: readonly GmailEmailMeta[];
	// Distinct stages present across the whole group, in lifecycle order.
	readonly stages: readonly OrderStage[];
	readonly retailer: string;
	readonly orderNumber: string | null;
}

// Lifecycle order — also the representative-selection priority (lower = kept).
const STAGE_ORDER: readonly OrderStage[] = ["confirmed", "shipped", "delivered"];

function stageRank(stage: OrderStage | null): number {
	if (stage === null) return STAGE_ORDER.length; // unclassified sorts last
	return STAGE_ORDER.indexOf(stage);
}

/**
 * Pull an order number out of a subject line, or null if none is confidently
 * present. Digit-guarded: the token must carry at least MIN_DIGITS digits and
 * must not be a bare calendar year, so "Order Confirmation" or "Save 20%" never
 * yield a grouping key.
 */
const MIN_DIGITS = 5;

export function extractOrderNumber(subject: string): string | null {
	if (!subject) return null;

	// Candidate patterns, each requiring a digit inside the captured token so
	// pure-alpha words (e.g. "Confirmation") can't be captured.
	const patterns: readonly RegExp[] = [
		/#\s?([a-z]?\d[a-z0-9-]{2,})/i, // "#1042965288"
		/order\b[:\s#]*([a-z]?\d[a-z0-9-]{2,})/i, // "Order I538721", "order #1043129433"
	];

	for (const pattern of patterns) {
		const match = subject.match(pattern);
		if (!match) continue;
		const normalized = match[1].toUpperCase().replace(/[^A-Z0-9]/g, "");
		const digitCount = (normalized.match(/\d/g) ?? []).length;
		if (digitCount < MIN_DIGITS) continue; // too short to trust
		if (/^(19|20)\d{2}$/.test(normalized)) continue; // bare year, not an order #
		return normalized;
	}

	return null;
}

/**
 * Reduce a "From" header to a retailer key: the registrable domain of the
 * sender, lowercased (e.g. `"NORDSTROM RACK" <x@eml.nordstromrack.com>` →
 * `nordstromrack.com`). Empty string when no address is present.
 */
export function extractRetailer(from: string): string {
	if (!from) return "";
	const addressMatch = from.match(/<([^>]+)>/);
	const address = (addressMatch ? addressMatch[1] : from).trim();
	const at = address.lastIndexOf("@");
	if (at === -1) return "";
	const domain = address.slice(at + 1).toLowerCase();
	const labels = domain.split(".").filter(Boolean);
	if (labels.length < 2) return domain;
	// Registrable domain = last two labels. Good enough for retailer .com hosts;
	// collapses subdomains like eml.nordstromrack.com and orders.nordstromrack.com.
	return labels.slice(-2).join(".");
}

function distinctStages(emails: readonly GmailEmailMeta[]): OrderStage[] {
	const present = new Set<OrderStage>();
	for (const email of emails) {
		const stage = classifyStage(email.subject);
		if (stage) present.add(stage);
	}
	return STAGE_ORDER.filter((s) => present.has(s));
}

function pickPrimary(emails: readonly GmailEmailMeta[]): GmailEmailMeta {
	// Lowest stage rank wins (confirmed first); tiebreak on earliest date.
	return [...emails].sort((a, b) => {
		const rankDiff = stageRank(classifyStage(a.subject)) - stageRank(classifyStage(b.subject));
		if (rankDiff !== 0) return rankDiff;
		return new Date(a.date).getTime() - new Date(b.date).getTime();
	})[0];
}

/**
 * Group emails by (retailer + order number). Emails without a confident order
 * number stay ungrouped — each becomes a singleton group, preserving the
 * original list order by first appearance.
 */
export function groupOrders(emails: readonly GmailEmailMeta[]): OrderGroup[] {
	const keyOf = new Map<string, GmailEmailMeta[]>();
	const orderOfKey: string[] = []; // first-seen order for stable output

	emails.forEach((email, index) => {
		const orderNumber = extractOrderNumber(email.subject);
		const retailer = extractRetailer(email.from);
		// Only group when we have BOTH a retailer and a trusted order number.
		// Otherwise fall back to a per-email singleton (unique key by index).
		const key = orderNumber && retailer ? `${retailer}|${orderNumber}` : `__single__${index}`;

		const bucket = keyOf.get(key);
		if (bucket) {
			bucket.push(email);
		} else {
			keyOf.set(key, [email]);
			orderOfKey.push(key);
		}
	});

	return orderOfKey.map((key) => {
		const bucket = keyOf.get(key) ?? [];
		const primary = pickPrimary(bucket);
		const others = bucket.filter((e) => e.id !== primary.id);
		return {
			primary,
			others,
			stages: distinctStages(bucket),
			retailer: extractRetailer(primary.from),
			orderNumber: extractOrderNumber(primary.subject),
		};
	});
}
