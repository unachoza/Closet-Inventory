import type { AdvancedSearchParams } from "./AdvancedSearch/AdvancedSearchUI";
import { DEFAULT_SEARCH_PARAMS } from "./AdvancedSearch/AdvancedSearchUI";

/**
 * Privacy-preserving description of a Gmail search, for analytics.
 *
 * The question this exists to answer: is the advanced-search syntax too hard?
 * The signal for that is people re-running the *same* query without changing
 * anything — searching, getting nothing useful, and trying again unchanged
 * because they don't know which knob to turn. Detecting that needs query
 * identity across runs, not query content.
 *
 * So: always emit a stable hash plus structural facts (how many terms, which
 * operators, what date bounds). Emit the query text **only** when it exactly
 * matches the params this app ships — those strings live in `constants.ts` and
 * are ours, not the user's. The moment someone types their own term, the text
 * is withheld and only the hash survives. A Gmail-scoped app must not ship a
 * user's own search terms to a third-party analytics tool.
 */

export type DateRangeShape = "none" | "after_only" | "before_only" | "both";

export interface SearchQueryShape {
	/** Stable across runs of an identical query; the repeat-detection key. */
	query_hash: string;
	is_default: boolean;
	/**
	 * A readable summary of the shipped default terms, present only when
	 * `is_default`. Deliberately NOT the literal Gmail query sent over the wire
	 * (that also folds in `GMAIL_SEARCH_SUBJECT_WORD_GROUPS` and the excluded
	 * senders) — it exists so a default search is legible in PostHog, not to be
	 * replayed. Never contains user-authored text.
	 */
	default_query_summary?: string;
	subject_count: number;
	body_keyword_count: number;
	excluded_sender_count: number;
	uses_from: boolean;
	date_range: DateRangeShape;
	/** How many Gmail operators the query leans on — the complexity proxy. */
	operator_count: number;
}

/** Order-insensitive canonical form, so a reordered-but-equivalent query matches. */
function canonicalize(params: AdvancedSearchParams): string {
	const sorted = (values: readonly string[]) => [...values].map((v) => v.trim()).sort();
	return JSON.stringify({
		subjects: sorted(params.subjects),
		excludedSenders: sorted(params.excludedSenders),
		bodyKeywords: sorted(params.bodyKeywords),
		from: params.from.trim(),
		after: params.after.trim(),
		before: params.before.trim(),
	});
}

/**
 * FNV-1a, 32-bit, hex-encoded.
 *
 * Not cryptographic and doesn't need to be — this only has to be stable and
 * collision-resistant enough to tell "same query again" from "different query"
 * within one person's session. Synchronous, unlike SubtleCrypto, so it can be
 * called inline on the event path.
 */
function fnv1a(input: string): string {
	let hash = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		// ×16777619 via shifts, kept in 32-bit range.
		hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
	}
	return hash.toString(16).padStart(8, "0");
}

export function hashSearchParams(params: AdvancedSearchParams): string {
	return fnv1a(canonicalize(params));
}

function isDefault(params: AdvancedSearchParams): boolean {
	return canonicalize(params) === canonicalize(DEFAULT_SEARCH_PARAMS);
}

function dateRangeOf(params: AdvancedSearchParams): DateRangeShape {
	const after = params.after.trim() !== "";
	const before = params.before.trim() !== "";
	if (after && before) return "both";
	if (after) return "after_only";
	if (before) return "before_only";
	return "none";
}

/**
 * Describe a search for analytics. Returns a fresh object; `params` is not modified.
 */
export function describeSearchQuery(params: AdvancedSearchParams): SearchQueryShape {
	const usesFrom = params.from.trim() !== "";
	const range = dateRangeOf(params);
	const usingDefaults = isDefault(params);

	const shape: SearchQueryShape = {
		query_hash: hashSearchParams(params),
		is_default: usingDefaults,
		subject_count: params.subjects.length,
		body_keyword_count: params.bodyKeywords.length,
		excluded_sender_count: params.excludedSenders.length,
		uses_from: usesFrom,
		date_range: range,
		operator_count:
			(usesFrom ? 1 : 0) + (range === "both" ? 2 : range === "none" ? 0 : 1),
	};

	// Only ever the strings this repo ships — see the module comment.
	if (usingDefaults) {
		shape.default_query_summary = [
			`subject:(${DEFAULT_SEARCH_PARAMS.subjects.join(" OR ")})`,
			`body:(${DEFAULT_SEARCH_PARAMS.bodyKeywords.join(" OR ")})`,
		].join(" ");
	}

	return shape;
}
