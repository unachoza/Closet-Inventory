import { useState, useCallback } from "react";
import { GMAIL_API_BASE, GMAIL_SEARCH_SUBJECTS, MAX_EMAIL_RESULTS } from "../Features/GmailImport/constants";
import { useLocalStorage } from "./uselocalStorage";

export interface GmailEmail {
	id: string;
	threadId: string;
	subject: string;
	from: string;
	date: string;
	snippet: string;
	body: string;
}

interface GmailHeader {
	name: string;
	value: string;
}

interface GmailMessagePart {
	mimeType: string;
	body: { data?: string; size: number };
	parts?: GmailMessagePart[];
}

interface GmailMessageResponse {
	id: string;
	threadId: string;
	snippet: string;
	payload: {
		headers: GmailHeader[];
		mimeType: string;
		body: { data?: string; size: number };
		parts?: GmailMessagePart[];
	};
}

function buildSearchQuery(): string {
	const subjectClauses = GMAIL_SEARCH_SUBJECTS.map((s) => `subject:"${s}"`).join(" OR ");
	return `{${subjectClauses}}`;
}

//TODO: Add pagination support to fetch more than 60 emails if needed
//TODO: Consider allowing user to customize search query or date range for more flexibility
//TODO: Add caching layer to avoid redundant API calls if user frequently opens/closes the Gmail import modal
//TODO: Implement better error handling and user feedback for different failure scenarios (e.g. auth issues, API rate limits, no results found)
//TODO: Optimize email body extraction to handle different email formats and edge cases more robustly
//TODO: Add loading states and skeleton UI to improve perceived performance while fetching emails
//TODO: Consider using Gmail API's batch endpoints to reduce number of network requests when fetching email details
//TODO: Add unit tests for utility functions and integration tests for the hook to ensure reliability and catch regressions early
//TODO: Explore using a library like mailparser to handle email parsing more comprehensively and accurately, especially for complex email formats with nested MIME parts
//TODO: Add support for fetching and displaying email attachments if relevant for the use case
//TODO: Consider implementing a more advanced search interface that allows users to specify additional criteria (e.g. sender, date range) for more precise email retrieval

function buildSearchDates(): string {
	const now = new Date();
	const pastDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

	const formatDate = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}/${month}/${day}`;
	};

	return `after:${formatDate(pastDate)} before:${formatDate(now)}`;
}

function getHeader(headers: GmailHeader[], name: string): string {
	const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
	return header?.value ?? "";
}

function decodeBase64Url(data: string): string {
	const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
	return decodeURIComponent(
		atob(base64)
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

const STORAGE_KEY = "my_emails_key";

export function useGmailSearch() {
	const [emails, setEmails] = useState<GmailEmail[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [localEmails, setLocalEmails] = useLocalStorage<GmailEmail[]>(STORAGE_KEY, []);

	const searchEmails = useCallback(async (accessToken: string) => {
		setIsSearching(true);
		setError(null);
		setEmails([]);

		try {
			const query = buildSearchQuery();
			const listUrl = `${GMAIL_API_BASE}/messages?q=${encodeURIComponent(query)}&maxResults=${MAX_EMAIL_RESULTS}`;

			const listResponse = await fetchJson<{
				messages?: { id: string; threadId: string }[];
			}>(listUrl, accessToken);
			// console.log(listResponse, 'listResponse?')
			if (!listResponse.messages?.length) {
				setEmails([]);
				setIsSearching(false);
				return;
			}

			const emailDetails = await Promise.all(
				listResponse.messages.map(async (msg) => {
					const detail = await fetchJson<GmailMessageResponse>(`${GMAIL_API_BASE}/messages/${msg.id}?format=full`, accessToken);
					// console.log(detail, 'email detail?')
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
				}),
			);
			setLocalEmails(emailDetails)
			setEmails(emailDetails);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to search emails";
			setError(message);
		} finally {
			setIsSearching(false);
		}
	}, []);

	return { emails, isSearching, error, searchEmails };
}
