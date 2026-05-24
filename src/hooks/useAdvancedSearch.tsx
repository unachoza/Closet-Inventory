
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
import { useState, useRef } from "react";
import { GMAIL_API_BASE, GMAIL_SEARCH_SUBJECTS, MAX_EMAIL_RESULTS } from "../Features/GmailImport/constants";
import { AdvancedSearchParams } from "../Features/GmailImport/AdvancedSearchUI";
import AdvancedSearchUI from "../Features/GmailImport/AdvancedSearchUI";

export interface GmailEmail {
      id: string;
      threadId: string;
      subject: string;
      from: string;
      date: string;
      snippet: string;
      body: string;
}
export function useAdvancedSearch() {
      const [emails, setEmails] = useState<GmailEmail[]>([]);
      const [isSearching, setIsSearching] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const [pageToken, setPageToken] = useState<string | null>(null);
      const [nextPageToken, setNextPageToken] = useState<string | null>(null);
      const [searchParams, setSearchParams] = useState<AdvancedSearchParams | null>(null);
      const cacheRef = useRef<{ [key: string]: GmailEmail[] }>({});

      // Build query string from params
      function buildQuery(params: AdvancedSearchParams, pageToken?: string) {
            let query = "";
            if (params.subject) query += `subject:\"${params.subject}\" `;
            if (params.from) query += `from:${params.from} `;
            if (params.after) query += `after:${params.after.replace(/\//g, "-")} `;
            if (params.before) query += `before:${params.before.replace(/\//g, "-")} `;
            if (!params.subject && !params.from && !params.after && !params.before) {
                  query = GMAIL_SEARCH_SUBJECTS.map((subj) => `subject:\"${subj}\"`).join(" OR ");
            }
            return query.trim();
      }

      // Main search function
      const searchEmails = async (accessToken: string, params: AdvancedSearchParams, pageTok?: string) => {
            setIsSearching(true);
            setError(null);
            setSearchParams(params);

            const query = buildQuery(params, pageTok);
            const cacheKey = `${query}|${pageTok || ""}`;
            if (cacheRef.current[cacheKey]) {
                  setEmails(cacheRef.current[cacheKey]);
                  setIsSearching(false);
                  return;
            }

            try {
                  let url = `${GMAIL_API_BASE}/messages?q=${encodeURIComponent(query)}&maxResults=${MAX_EMAIL_RESULTS}`;
                  if (pageTok) url += `&pageToken=${pageTok}`;
                  const listResponse = await fetchJson<{
                        messages?: { id: string; threadId: string }[];
                        nextPageToken?: string;
                  }>(url, accessToken);
                  setNextPageToken(listResponse.nextPageToken || null);
                  if (!listResponse.messages?.length) {
                        setEmails([]);
                        setIsSearching(false);
                        return;
                  }
                  const emailDetails = await Promise.all(
                        listResponse.messages.map(async (msg) => {
                              const detailUrl = `${GMAIL_API_BASE}/messages/${msg.id}?format=full`;
                              const detailResponse = await fetchJson<any>(detailUrl, accessToken);
                              const headers = detailResponse.payload.headers || [];
                              return {
                                    id: detailResponse.id,
                                    threadId: detailResponse.threadId,
                                    subject: getHeader(headers, "Subject"),
                                    from: getHeader(headers, "From"),
                                    date: getHeader(headers, "Date"),
                                    snippet: detailResponse.snippet,
                                    body: extractEmailBody(detailResponse.payload),
                              };
                        })
                  );
                  setEmails(emailDetails);
                  cacheRef.current[cacheKey] = emailDetails;
            } catch (err: any) {
                  setError(err?.message || "Failed to search emails.");
            } finally {
                  setIsSearching(false);
            }
      };

      // Pagination
      const fetchNextPage = async (accessToken: string) => {
            if (searchParams && nextPageToken) {
                  setPageToken(nextPageToken);
                  await searchEmails(accessToken, searchParams, nextPageToken);
            }
      };

      // UI for advanced search
      function AdvancedSearchUIWrapper({ accessToken }: { accessToken: string }) {
            return (
                  <div>
                        <h3>Advanced Gmail Search</h3>
                        <AdvancedSearchUI
                              onSearch={(params) => searchEmails(accessToken, params)}
                              loading={isSearching}
                        />
                        {error && <div className="gmail-error">{error}</div>}
                        {isSearching && <div className="gmail-loading">Loading...</div>}
                        {emails.length > 0 && (
                              <div>
                                    <button disabled={!nextPageToken} onClick={() => fetchNextPage(accessToken)}>Next Page</button>
                              </div>
                        )}
                  </div>
            );
      }

      return { emails, isSearching, error, searchEmails, AdvancedSearchUIWrapper, fetchNextPage, nextPageToken };
}

function getHeader(headers: any[], name: string): string {
      const header = headers.find((h) => h.name?.toLowerCase() === name.toLowerCase());
      return header?.value ?? "";
}

async function fetchJson<T>(url: string, accessToken: string): Promise<T> {
      const response = await fetch(url, {
            headers: {
                  Authorization: `Bearer ${accessToken}`,
            },
      });
      if (!response.ok) {
            throw new Error(`Failed to fetch JSON from ${url}`);
      }
      return response.json() as Promise<T>;
}


//TODO: allowing user to customize search query or date range for more flexibility
function buildSearchQuery(): string {
      const subjectQuery = GMAIL_SEARCH_SUBJECTS.map((subj) => `subject:"${subj}"`).join(" OR ");
      const fullQuery = `(${subjectQuery})`;
      console.log(fullQuery, 'search query?')
      return fullQuery;
}

function buildSearchQueryWithDateRange(startDate: string, endDate: string): string {
      const subjectQuery = GMAIL_SEARCH_SUBJECTS.map((subj) => `subject:"${subj}"`).join(" OR ");
      const dateQuery = `after:${startDate} before:${endDate}`;
      const fullQuery = `(${subjectQuery}) ${dateQuery}`;
      console.log(fullQuery, 'search query with date range?')
      return fullQuery;
}

function buildSearchQueryWithSender(senderEmail: string): string {
      const subjectQuery = GMAIL_SEARCH_SUBJECTS.map((subj) => `subject:"${subj}"`).join(" OR ");
      const senderQuery = `from:${senderEmail}`;
      const fullQuery = `(${subjectQuery}) ${senderQuery}`;
      console.log(fullQuery, 'search query with sender?')
      return fullQuery;
}
function buildSearchQueryWithDateRangeAndSender(startDate: string, endDate: string, senderEmail: string): string {
      const subjectQuery = GMAIL_SEARCH_SUBJECTS.map((subj) => `subject:"${subj}"`).join(" OR ");
      const dateQuery = `after:${startDate} before:${endDate}`;
      const senderQuery = `from:${senderEmail}`;
      const fullQuery = `(${subjectQuery}) ${dateQuery} ${senderQuery}`;
      console.log(fullQuery, 'search query with date range and sender?')
      return fullQuery;
}

function buildSearchQueryForBodyKeywords(keywords: string[]): string {
      const subjectQuery = GMAIL_SEARCH_SUBJECTS.map((subj) => `subject:"${subj}"`).join(" OR ");
      const bodyQuery = keywords.map((kw) => `in:body "${kw}"`).join(" OR ");
      const fullQuery = `(${subjectQuery}) (${bodyQuery})`;
      console.log(fullQuery, 'search query with body keywords?')
      return fullQuery;
}

function buildSearchQueryWithPagination(pageToken: string): string {
      const subjectQuery = GMAIL_SEARCH_SUBJECTS.map((subj) => `subject:"${subj}"`).join(" OR ");
      const paginationQuery = `pageToken:${pageToken}`;
      const fullQuery = `(${subjectQuery}) ${paginationQuery}`;
      console.log(fullQuery, 'search query with pagination?')
      return fullQuery;
}

function buildSearchQueryWithAllFilters(startDate: string, endDate: string, senderEmail: string, pageToken: string): string {
      const subjectQuery = GMAIL_SEARCH_SUBJECTS.map((subj) => `subject:"${subj}"`).join(" OR ");
      const dateQuery = `after:${startDate} before:${endDate}`;
      const senderQuery = `from:${senderEmail}`;
      const paginationQuery = `pageToken:${pageToken}`;
      const fullQuery = `(${subjectQuery}) ${dateQuery} ${senderQuery} ${paginationQuery}`;
      console.log(fullQuery, 'search query with all filters?')
      return fullQuery; 
}     
function decodeBase64Url(base64Url: string): string {
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const padding = "=".repeat((4 - (base64.length % 4)) % 4);
      const base64Padded = base64 + padding;
      return atob(base64Padded);
}

function extractEmailBody(payload: any): string {
      if (payload.body?.data) {
            return decodeBase64Url(payload.body.data);
      }
      if (payload.parts) {
            const htmlPart = findPart(payload.parts, "text/html");
            if (htmlPart?.body?.data) {
                  return decodeBase64Url(htmlPart.body.data);
            }
            const textPart = findPart(payload.parts, "text/plain");
            if (textPart?.body?.data) {
                  return decodeBase64Url(textPart.body.data);
            }
      }
      return "";
}

function findPart(parts: any[], mimeType: string): any | null {
      for (const part of parts) {
            if (part.mimeType === mimeType) {
                  return part;
            }
            if (part.parts) {
                  const found = findPart(part.parts, mimeType);
                  if (found) return found;
            }
      }
      return null;
}     

