import { useState, useCallback, useRef } from "react";
import {
	GMAIL_API_BASE,
	GMAIL_SEARCH_SUBJECTS,
	MAX_EMAIL_RESULTS,
} from "../Features/GmailImport/constants";
import type { AdvancedSearchParams } from "../Features/GmailImport/AdvnacedSearch/AdvancedSearchUI";
import { DEFAULT_SEARCH_PARAMS } from "../Features/GmailImport/AdvnacedSearch/AdvancedSearchUI";

export interface GmailEmail {
	readonly id: string;
	readonly threadId: string;
	readonly subject: string;
	readonly from: string;
	readonly date: string;
	readonly snippet: string;
	readonly body: string;
}

interface GmailHeader {
	readonly name: string;
	readonly value: string;
}

interface GmailMessagePart {
	readonly mimeType: string;
	readonly body: { readonly data?: string; readonly size: number };
	readonly parts?: GmailMessagePart[];
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

function buildSearchQuery(params: AdvancedSearchParams): string {
	const clauses: string[] = [];

	// Subject patterns
	const subjects = params.subjects.length > 0 ? params.subjects : GMAIL_SEARCH_SUBJECTS;
	const subjectClause = subjects.map((s) => `subject:"${s}"`).join(" OR ");
	clauses.push(`(${subjectClause})`);

	// Excluded senders
	params.excludedSenders.forEach((sender) => {
		clauses.push(`-from:${sender}`);
	});

	// Specific sender filter
	if (params.from.trim()) {
		clauses.push(`from:${params.from.trim()}`);
	}

	// Date range
	if (params.after.trim()) {
		clauses.push(`after:${params.after.trim()}`);
	}
	if (params.before.trim()) {
		clauses.push(`before:${params.before.trim()}`);
	}

	return clauses.join(" ");
}

function getHeader(headers: GmailHeader[], name: string): string {
	const header = headers.find(
		(h) => h.name.toLowerCase() === name.toLowerCase()
	);
	return header?.value ?? "";
}

function decodeBase64Url(data: string): string {
	const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
	const padding = "=".repeat((4 - (base64.length % 4)) % 4);
	return decodeURIComponent(
		atob(base64 + padding)
			.split("")
			.map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
			.join("")
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

function findPart(
	parts: GmailMessagePart[],
	mimeType: string
): GmailMessagePart | undefined {
	for (const part of parts) {
		if (part.mimeType === mimeType) {
			return part;
		}
		if (part.parts) {
			const nested = findPart(part.parts, mimeType);
			if (nested) return nested;
		}
	}
	return undefined;
}

async function fetchJson<T>(url: string, accessToken: string): Promise<T> {
	const response = await fetch(url, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Gmail API error (${response.status}): ${errorText}`);
	}

	return response.json() as Promise<T>;
}

function bodyMatchesKeywords(body: string, keywords: readonly string[]): boolean {
	if (keywords.length === 0) return true;
	const lowerBody = body.toLowerCase();
	return keywords.some((kw) => lowerBody.includes(kw.toLowerCase()));
}

export function useAdvancedSearch() {
	const [emails, setEmails] = useState<GmailEmail[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [nextPageToken, setNextPageToken] = useState<string | null>(null);
	const lastParamsRef = useRef<AdvancedSearchParams>(DEFAULT_SEARCH_PARAMS);
	const lastTokenRef = useRef<string | null>(null);

	const searchEmails = useCallback(
		async (
			accessToken: string,
			params?: AdvancedSearchParams,
			pageToken?: string
		) => {
			const searchParams = params ?? DEFAULT_SEARCH_PARAMS;
			lastParamsRef.current = searchParams;
			lastTokenRef.current = accessToken;

			setIsSearching(true);
			setError(null);
			if (!pageToken) {
				setEmails([]);
			}

			try {
				const query = buildSearchQuery(searchParams);
				let listUrl = `${GMAIL_API_BASE}/messages?q=${encodeURIComponent(query)}&maxResults=${MAX_EMAIL_RESULTS}`;
				if (pageToken) {
					listUrl += `&pageToken=${pageToken}`;
				}

				const listResponse = await fetchJson<{
					messages?: { id: string; threadId: string }[];
					nextPageToken?: string;
				}>(listUrl, accessToken);

				setNextPageToken(listResponse.nextPageToken ?? null);

				if (!listResponse.messages?.length) {
					if (!pageToken) {
						setEmails([]);
					}
					return;
				}

				const emailDetails = await Promise.all(
					listResponse.messages.map(async (msg) => {
						const detail = await fetchJson<GmailMessageResponse>(
							`${GMAIL_API_BASE}/messages/${msg.id}?format=full`,
							accessToken
						);

						const headers = detail.payload.headers;

						return {
							id: detail.id,
							threadId: detail.threadId,
							subject: getHeader(headers, "Subject"),
							from: getHeader(headers, "From"),
							date: getHeader(headers, "Date"),
							snippet: detail.snippet,
							body: extractBody(detail.payload),
						};
					})
				);

				// Client-side body keyword filtering
				const filtered = searchParams.bodyKeywords.length > 0
					? emailDetails.filter((e) =>
							bodyMatchesKeywords(e.body, searchParams.bodyKeywords)
						)
					: emailDetails;

				setEmails((prev) => (pageToken ? [...prev, ...filtered] : filtered));
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Failed to search emails";
				setError(message);
			} finally {
				setIsSearching(false);
			}
		},
		[]
	);

	const fetchNextPage = useCallback(async () => {
		if (nextPageToken && lastTokenRef.current) {
			await searchEmails(
				lastTokenRef.current,
				lastParamsRef.current,
				nextPageToken
			);
		}
	}, [nextPageToken, searchEmails]);

	return {
		emails,
		isSearching,
		error,
		searchEmails,
		fetchNextPage,
		hasNextPage: nextPageToken !== null,
	};
}
