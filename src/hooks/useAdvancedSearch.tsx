import { useState, useCallback } from "react";
import { useLocalStorage } from "./uselocalStorage";
import {
	GMAIL_API_BASE,
	GMAIL_SEARCH_SUBJECTS,
	MAX_EMAIL_RESULTS,
	GMAIL_CACHE_KEY,
	GMAIL_CACHE_BODIES_KEY,
	GMAIL_CACHE_TTL_MS,
} from "../Features/GmailImport/constants";
import type { AdvancedSearchParams } from "../Features/GmailImport/AdvnacedSearch/AdvancedSearchUI";
import { DEFAULT_SEARCH_PARAMS } from "../Features/GmailImport/AdvnacedSearch/AdvancedSearchUI";

// Lightweight email metadata (no body — saves API calls)
export interface GmailEmailMeta {
	readonly id: string;
	readonly threadId: string;
	readonly subject: string;
	readonly from: string;
	readonly date: string;
	readonly snippet: string;
	readonly body?: string;
}

// Full email with body (fetched lazily on select)
export interface GmailEmail extends GmailEmailMeta {
	readonly body: string;
}

interface CacheEnvelope {
	readonly timestamp: number;
	readonly emails: GmailEmailMeta[];
	readonly nextPageToken: string | null;
}

interface GmailHeader {
	readonly name: string;
	readonly value: string;
}

interface GmailMessageResponse {
	readonly id: string;
	readonly threadId: string;
	readonly snippet: string;
	readonly payload: {
		readonly headers: GmailHeader[];
		readonly mimeType: string;
		readonly body: { readonly data?: string; readonly size: number };
		readonly parts?: GmailMessagePart[];
	};
}

interface GmailMessagePart {
	readonly mimeType: string;
	readonly body: { readonly data?: string; readonly size: number };
	readonly parts?: GmailMessagePart[];
}

// ── Helpers ──────────────────────────────────────────────

function getHeader(headers: GmailHeader[], name: string): string {
	const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
	return header?.value ?? "";
}

function decodeBase64Url(data: string): string {
	const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
	const padding = "=".repeat((4 - (base64.length % 4)) % 4);
	return decodeURIComponent(
		atob(base64 + padding)
			.split("")
			.map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
			.join(""),
	);
}

function extractBody(payload: GmailMessageResponse["payload"]): string {
	if (payload.body.data) {
		return decodeBase64Url(payload.body.data);
	}
	if (payload.parts) {
		const htmlPart = findPart(payload.parts, "text/html");
		if (htmlPart?.body.data) {
			return decodeBase64Url(htmlPart.body.data);
		}
		const textPart = findPart(payload.parts, "text/plain");
		if (textPart?.body.data) {
			return decodeBase64Url(textPart.body.data);
		}
	}
	return "";
}

function findPart(parts: GmailMessagePart[], mimeType: string): GmailMessagePart | undefined {
	for (const part of parts) {
		if (part.mimeType === mimeType) return part;
		if (part.parts) {
			const nested = findPart(part.parts, mimeType);
			if (nested) return nested;
		}
	}
	return undefined;
}

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 300;
const MAX_RETRIES = 3;

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string, accessToken: string, retries = MAX_RETRIES): Promise<T> {
	const response = await fetch(url, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (response.status === 429 && retries > 0) {
		const backoff = (MAX_RETRIES - retries + 1) * 1000;
		await delay(backoff);
		return fetchJson<T>(url, accessToken, retries - 1);
	}

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Gmail API error (${response.status}): ${errorText}`);
	}
	return response.json() as Promise<T>;
}

async function fetchInBatches<TInput, TOutput>(items: TInput[], processFn: (item: TInput) => Promise<TOutput>): Promise<TOutput[]> {
	const results: TOutput[] = [];

	for (let i = 0; i < items.length; i += BATCH_SIZE) {
		const batch = items.slice(i, i + BATCH_SIZE);
		const batchResults = await Promise.all(batch.map(processFn));
		results.push(...batchResults);

		// Pause between batches to avoid rate limits
		if (i + BATCH_SIZE < items.length) {
			await delay(BATCH_DELAY_MS);
		}
	}

	return results;
}

function buildSubjectQuery(): string {
	return GMAIL_SEARCH_SUBJECTS.map((s) => `subject:"${s}"`).join(" OR ");
}

function isCacheValid(envelope: CacheEnvelope | null): boolean {
	if (!envelope) return false;
	return Date.now() - envelope.timestamp < GMAIL_CACHE_TTL_MS;
}

// ── Client-side filtering ────────────────────────────────

function filterEmails(emails: GmailEmailMeta[], params: AdvancedSearchParams): GmailEmailMeta[] {
	return emails.filter((email) => {
		// Subject filter
		if (params.subjects.length > 0) {
			const lowerSubject = email.subject.toLowerCase();
			const matchesSubject = params.subjects.some((s) => lowerSubject.includes(s.toLowerCase()));
			if (!matchesSubject) return false;
		}

		// Excluded senders
		if (params.excludedSenders.length > 0) {
			const lowerFrom = email.from.toLowerCase();
			const isExcluded = params.excludedSenders.some((s) => lowerFrom.includes(s.toLowerCase()));
			if (isExcluded) return false;
		}

		// Specific sender
		if (params.from.trim()) {
			const lowerFrom = email.from.toLowerCase();
			if (!lowerFrom.includes(params.from.trim().toLowerCase())) return false;
		}

		// Date range
		if (params.after.trim()) {
			const afterDate = new Date(params.after);
			const emailDate = new Date(email.date);
			if (emailDate < afterDate) return false;
		}
		if (params.before.trim()) {
			const beforeDate = new Date(params.before);
			const emailDate = new Date(email.date);
			if (emailDate > beforeDate) return false;
		}

		// Body keywords filter against snippet (body is lazy-loaded)
		if (params.bodyKeywords.length > 0) {
			const lowerSnippet = email.snippet.toLowerCase();
			const matchesKeyword = params.bodyKeywords.some((kw) => lowerSnippet.includes(kw.toLowerCase()));
			if (!matchesKeyword) return false;
		}

		return true;
	});
}

// ── Hook ─────────────────────────────────────────────────

const EMPTY_CACHE: CacheEnvelope = {
	timestamp: 0,
	emails: [],
	nextPageToken: null,
};

export function useAdvancedSearch() {
	const [cache, setCache] = useLocalStorage<CacheEnvelope>(GMAIL_CACHE_KEY, EMPTY_CACHE);
	const [bodiesCache, setBodiesCache] = useLocalStorage<Record<string, string>>(GMAIL_CACHE_BODIES_KEY, {});

	const [filteredEmails, setFilteredEmails] = useState<GmailEmailMeta[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [isFetchingBody, setIsFetchingBody] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasNextPage, setHasNextPage] = useState(false);

	// Fetch email metadata list from API (headers + snippets, no bodies)
	const fetchEmailList = useCallback(async (accessToken: string, pageToken?: string) => {
		const query = `(${buildSubjectQuery()})`;
		let url = `${GMAIL_API_BASE}/messages?q=${encodeURIComponent(query)}&maxResults=${MAX_EMAIL_RESULTS}`;
		if (pageToken) {
			url += `&pageToken=${pageToken}`;
		}

		const listResponse = await fetchJson<{
			messages?: { id: string; threadId: string }[];
			nextPageToken?: string;
		}>(url, accessToken);

		const nextToken = listResponse.nextPageToken ?? null;

		if (!listResponse.messages?.length) {
			return { emails: [] as GmailEmailMeta[], nextToken };
		}

		// Fetch metadata in batches of 5 to avoid 429 rate limits
		const emailMetas = await fetchInBatches(listResponse.messages, async (msg) => {
			const detail = await fetchJson<GmailMessageResponse>(
				`${GMAIL_API_BASE}/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
				accessToken,
			);
			return {
				id: detail.id,
				threadId: detail.threadId,
				subject: getHeader(detail.payload.headers, "Subject"),
				from: getHeader(detail.payload.headers, "From"),
				date: getHeader(detail.payload.headers, "Date"),
				snippet: detail.snippet,
			};
		});

		return { emails: emailMetas, nextToken };
	}, []);

	// Main search: check cache first, fetch from API if expired
	const searchEmails = useCallback(
		async (accessToken: string, params?: AdvancedSearchParams, forceRefresh = false) => {
			const searchParams = params ?? DEFAULT_SEARCH_PARAMS;
			setIsSearching(true);
			setError(null);

			try {
				// Use cache if valid and not forcing refresh
				if (isCacheValid(cache) && !forceRefresh) {
					const filtered = filterEmails(cache.emails, searchParams);
					setFilteredEmails(filtered);
					setHasNextPage(cache.nextPageToken !== null);
					return;
				}

				// Cache miss or force refresh — fetch from API
				const { emails: newEmails, nextToken } = await fetchEmailList(accessToken);

				const updatedCache: CacheEnvelope = {
					timestamp: Date.now(),
					emails: newEmails,
					nextPageToken: nextToken,
				};
				setCache(updatedCache);

				const filtered = filterEmails(newEmails, searchParams);
				setFilteredEmails(filtered);
				setHasNextPage(nextToken !== null);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to search emails";
				setError(message);
			} finally {
				setIsSearching(false);
			}
		},
		[cache, fetchEmailList, setCache],
	);

	// Load more: appends to cache, doesn't replace
	const fetchNextPage = useCallback(
		async (accessToken: string) => {
			if (!cache.nextPageToken) return;

			setIsSearching(true);
			setError(null);

			try {
				const { emails: newEmails, nextToken } = await fetchEmailList(accessToken, cache.nextPageToken);

				// Append to cache (immutable update)
				const updatedCache: CacheEnvelope = {
					timestamp: cache.timestamp,
					emails: [...cache.emails, ...newEmails],
					nextPageToken: nextToken,
				};
				setCache(updatedCache);

				// Re-filter with appended data — React reconciles with stable keys
				setFilteredEmails((prev) => {
					const existingIds = new Set(prev.map((e) => e.id));
					const newFiltered = newEmails.filter((e) => !existingIds.has(e.id));
					return [...prev, ...newFiltered];
				});
				setHasNextPage(nextToken !== null);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to load more emails";
				setError(message);
			} finally {
				setIsSearching(false);
			}
		},
		[cache, fetchEmailList, setCache],
	);

	// Lazy fetch a single email body (cached in localStorage)
	const fetchEmailBody = useCallback(
		async (accessToken: string, emailId: string): Promise<string> => {
			// Check body cache first
			if (bodiesCache[emailId]) {
				return bodiesCache[emailId];
			}

			setIsFetchingBody(true);
			try {
				const detail = await fetchJson<GmailMessageResponse>(`${GMAIL_API_BASE}/messages/${emailId}?format=full`, accessToken);
				const body = extractBody(detail.payload);

				// Cache the body (immutable update)
				setBodiesCache((prev) => ({ ...prev, [emailId]: body }));
				return body;
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to fetch email body";
				setError(message);
				return "";
			} finally {
				setIsFetchingBody(false);
			}
		},
		[bodiesCache, setBodiesCache],
	);

	// Re-filter cached emails with new params (zero API calls)
	const filterCachedEmails = useCallback(
		(params: AdvancedSearchParams) => {
			const filtered = filterEmails(cache.emails, params);
			setFilteredEmails(filtered);
		},
		[cache.emails],
	);

	return {
		emails: filteredEmails,
		isSearching,
		isFetchingBody,
		error,
		searchEmails,
		fetchNextPage,
		fetchEmailBody,
		filterCachedEmails,
		hasNextPage,
		cacheAge: cache.timestamp > 0 ? Date.now() - cache.timestamp : null,
	};
}
