import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useGmailAuthContext } from "../../context/GmailAuthContext";
import { useAdvancedSearch } from "../../hooks/useAdvancedSearch";
import type { GmailEmail } from "../../hooks/useAdvancedSearch";
import type { ClothingItem, WearState } from "../../utils/types";
import type { ExtractedProduct } from "../../utils/parseProductsFromEmail";
import { AdvancedSearchParams, AdvancedSearchUI, SearchMode } from "./AdvancedSearch/AdvancedSearchUI";
import { parseEmailToFormData, extractForwardedSender, extractForwardedPurchaseDate } from "../../utils/parseEmailToFormData";
import { inferCare, inferProductAttributes, normalizeColor } from "../FashionParser";
import { normalizeMaterial } from "../../utils/materialUtils";
import { extractColorFromName } from "../../utils/parseNameHelpers";
import EmailList from "./EmailList";
import EmailPreview from "./EmailPreviewPanel/EmailPreview";
import { useGoogleUnverifiedNotice } from "../Onboarding/useGoogleUnverifiedNotice";
import GoogleUnverifiedNotice from "../Onboarding/GoogleUnverifiedNotice";
import { useProfile } from "../../hooks/useProfile";
import GoogleHeadsUpNotice from "../../Components/GoogleHeadsUpNotice/GoogleHeadsUpNotice";
import "./GmailImport.css";
import { toTitleCase } from "../../utils/toTitleCase";
import { condenseName } from "../../utils/condenseName";
import { track } from "../../lib/analytics";
import { describeGmailError } from "./gmailErrorMessages";

interface GmailImportProps {
	onImport: (prefilled: Partial<ClothingItem>) => void;
	onImportAll?: (items: Partial<ClothingItem>[]) => void;
	/** When returning from EditItemView, re-open this email's preview */
	initialSelectedEmailId?: string | null;
	/** Notify parent of which email the user is importing from */
	onSourceEmailChange?: (emailId: string | null) => void;
	/**
	 * E3-bug.9 — parent-owned "unskipped" selection per email id, so an
	 * include/include-all choice survives the gmail → edit → "Back to email"
	 * round trip (this component unmounts on the view switch).
	 */
	unskippedByEmail?: Record<string, number[]>;
	onUnskippedByEmailChange?: (emailId: string, indices: number[]) => void;
}

export default function GmailImport({
	onImport,
	onImportAll,
	initialSelectedEmailId,
	onSourceEmailChange,
	unskippedByEmail,
	onUnskippedByEmailChange,
}: GmailImportProps) {
	const { accessToken, isAuthenticated, error: authError, isLoading: authLoading, login, logout } = useGmailAuthContext();
	const googleNotice = useGoogleUnverifiedNotice();
	const { profile } = useProfile();

	const {
		emails,
		isSearching,
		isFetchingMore,
		isFetchingBody,
		progress,
		error: searchError,
		searchEmails,
		fetchNextPage,
		hasNextPage,
		fetchEmailBody,
		filterCachedEmails,
		clearCache,
		cachedCount,
		searchMode,
	} = useAdvancedSearch();
	const [selectedEmailId, setSelectedEmailId] = useState<string | null>(initialSelectedEmailId ?? null);

	// Find the selected email and ensure it has a body (fetch if needed)
	const [selectedEmail, setSelectedEmail] = useState<GmailEmail | undefined>(undefined);

	const listRef = useRef<HTMLUListElement>(null);

	// Clear the in-memory + sessionStorage Gmail caches (metadata + bodies).
	const handleClearCache = useCallback(() => {
		clearCache();
		setSelectedEmailId(null);
	}, [clearCache]);

	// Log out and wipe cached inbox content so nothing is left for the next user.
	const handleLogout = useCallback(() => {
		clearCache();
		logout();
	}, [clearCache, logout]);

	useEffect(() => {
		let isMounted = true;
		async function loadBody() {
			if (selectedEmailId) {
				const meta = emails.find((e) => e.id === selectedEmailId);
				if (meta && accessToken) {
					if (typeof meta.body === "string") {
						setSelectedEmail(meta as GmailEmail);
					} else if (typeof meta.body === "undefined" && typeof fetchEmailBody === "function") {
						const body = await fetchEmailBody(accessToken, meta.id);
						if (isMounted) setSelectedEmail({ ...meta, body });
					}
				} else {
					setSelectedEmail(undefined);
				}
			} else {
				setSelectedEmail(undefined);
			}
		}
		loadBody();
		return () => {
			isMounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedEmailId, emails, accessToken]);
	// Scroll the selected row into view so the left list matches the right preview
	// (esp. on "Back to email"). This MUST run after `selectedEmail` is set: that's
	// what flips the layout to the 40%-width preview split, which re-wraps the rows
	// to new heights. Scrolling any earlier (e.g. on row mount, while the list is
	// still full-width and the body hasn't loaded) lands on a stale offset and the
	// re-wrap drops you back at the top. requestAnimationFrame waits for that final
	// layout to paint before measuring.
	useEffect(() => {
		if (!selectedEmail) return;
		const row = listRef.current?.querySelector<HTMLElement>(".gmail-email-label--selected");
		if (!row || typeof row.scrollIntoView !== "function") return;
		const raf = requestAnimationFrame(() => {
			// Instant, not smooth: a follow-up re-render (async color enrichment,
			// preview mount) would interrupt a smooth animation and strand the list
			// partway. Setting the offset in one go survives those re-renders.
			row.scrollIntoView({ behavior: "auto", block: "start" });
		});
		return () => cancelAnimationFrame(raf);
	}, [selectedEmail, selectedEmailId]);

	// Auto-search with defaults on first login. The on-connect search is most
	// testers' FIRST import, so it must open the funnel: fire import_started
	// when there's no cache to restore (a real fetch), once per mount.
	const autoStartTracked = useRef(false);
	useEffect(() => {
		if (accessToken && isAuthenticated) {
			if (!autoStartTracked.current && cachedCount === 0) {
				autoStartTracked.current = true;
				track("import_started", { mode: "auto" });
			}
			searchEmails(accessToken);
		}
		// cachedCount is read, not depended on: it only gates the one-shot track.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accessToken, isAuthenticated, searchEmails]);

	// Funnel: results shown. Fires when a search settles (isSearching true →
	// false) without an error — INCLUDING zero results, so "searched and found
	// nothing" is visible as funnel drop-off instead of silently disappearing.
	const prevSearching = useRef(false);
	useEffect(() => {
		if (prevSearching.current && !isSearching && !searchError) {
			track("import_results_shown", { count: emails.length });
		}
		prevSearching.current = isSearching;
	}, [isSearching, emails.length, searchError]);

	// Funnel: searches that die (expired token, network, Gmail 5xx) — reported
	// with a coarse reason so PostHog shows WHY testers drop, deduped per error.
	const lastTrackedError = useRef<string | null>(null);
	const error = authError ?? searchError;
	useEffect(() => {
		if (!error || lastTrackedError.current === error) return;
		lastTrackedError.current = error;
		track("import_failed", { reason: describeGmailError(error).reason });
	}, [error]);

	// Remember the last fetch's params so "Try Again" retries the same search.
	const lastSearchParams = useRef<AdvancedSearchParams | undefined>(undefined);

	// Advanced search: routes to fetch or filter based on user's choice
	const handleAdvancedSearch = useCallback(
		(params: AdvancedSearchParams, mode: SearchMode) => {
			setSelectedEmailId(null);
			if (mode === "fetch" && accessToken) {
				lastSearchParams.current = params;
				track("import_started", { mode: "advanced" });
				searchEmails(accessToken, params, true);
			} else {
				filterCachedEmails(params);
			}
		},
		[accessToken, searchEmails, filterCachedEmails],
	);

	const emailDateRange = useMemo(() => {
		if (emails.length === 0) return null;

		const dates = emails.map((email) => new Date(email.date)).filter((date) => !Number.isNaN(date.getTime()));

		if (dates.length === 0) return null;

		const newest = new Date(Math.max(...dates.map((d) => d.getTime())));
		const oldest = new Date(Math.min(...dates.map((d) => d.getTime())));

		const formatter = new Intl.DateTimeFormat("en-US", {
			month: "short",
			year: "numeric",
		});

		return {
			oldest: formatter.format(oldest),
			newest: formatter.format(newest),
		};
	}, [emails]);

	const handleDefaultSearch = useCallback(() => {
		if (accessToken) {
			setSelectedEmailId(null);
			lastSearchParams.current = undefined;
			track("import_started", { mode: "default" });
			searchEmails(accessToken, undefined, true);
		}
	}, [accessToken, searchEmails]);

	const handleToggleSelect = useCallback((emailId: string) => {
		setSelectedEmailId((prev) => (prev === emailId ? null : emailId));
	}, []);

	// Dismiss the preview (used by the mobile overlay's Back button).
	const handleClosePreview = useCallback(() => {
		setSelectedEmailId(null);
		setSelectedEmail(undefined);
	}, []);

	const handleImportProduct = useCallback(
		(product: ExtractedProduct) => {
			// For forwarded emails the outer sender is the forwarder's own address;
			// recover the real retailer from the forwarded header in the full body.
			const emailFrom = extractForwardedSender(selectedEmail?.body ?? "") || selectedEmail?.from || "";
			const emailSubject = selectedEmail?.subject ?? "";
			// For forwarded emails, the purchase date is when the retailer sent the
			// original email, not when the user forwarded it.
			const emailDate = extractForwardedPurchaseDate(selectedEmail?.body ?? "") || selectedEmail?.date;
			const emailData = parseEmailToFormData(emailSubject, product.name, emailFrom, emailDate);
			const style = inferProductAttributes(product.name);
			// Color: prefer the structured value from the email HTML; otherwise
			// scan the item name (e.g. "Babaton Deep Taupe ... Dress" → Brown).
			const color = product.color || normalizeColor(extractColorFromName(product.name));
			const material = normalizeMaterial(product.material || emailData.material);
			onSourceEmailChange?.(selectedEmailId);
			onImport({
				...emailData,
				imageURL: product.imageUrl,
				name: toTitleCase(condenseName(product.name, product.brand)),
				brand: product.brand || emailData.brand,
				price: typeof product.price === "string" ? parseFloat(product.price.replace(/[^\d.]/g, "")) : product.price,
				originalPrice: product.originalPrice ? parseFloat(product.originalPrice.replace(/[^\d.]/g, "")) : undefined,
				qty: product.qty,
				category: emailData.category,
				color,
				size: product.size,
				material,
				onSale: product.onSale,
				// condition + purchaseDate already provided by emailData (parseEmailToFormData)
				condition: emailData.condition as WearState | undefined,
				// Recompute care from the RESOLVED color/material — the card's color
				// (e.g. "Color: White") isn't visible to parseEmailToFormData.
				care: inferCare(product.name, color, material),
				style,
			});
			track("import_finished", { count: 1, source: "single" });
		},
		[selectedEmail, selectedEmailId, onImport, onSourceEmailChange],
	);

	const handleImportAllProducts = useCallback(
		(products: ExtractedProduct[]) => {
			if (!onImportAll) return;
			const emailFrom = extractForwardedSender(selectedEmail?.body ?? "") || selectedEmail?.from || "";
			const emailSubject = selectedEmail?.subject ?? "";
			// For forwarded emails, the purchase date is when the retailer sent the
			// original email, not when the user forwarded it.
			const emailDate = extractForwardedPurchaseDate(selectedEmail?.body ?? "") || selectedEmail?.date;

			onSourceEmailChange?.(selectedEmailId);

			const items = products.map((product) => {
				const emailData = parseEmailToFormData(emailSubject, product.name, emailFrom, emailDate);
				const style = inferProductAttributes(product.name);
				const color = product.color || normalizeColor(extractColorFromName(product.name));
				const material = normalizeMaterial(product.material || emailData.material);
				return {
					...emailData,
					imageURL: product.imageUrl,
					name: toTitleCase(condenseName(product.name, product.brand)),
					brand: product.brand || emailData.brand,
					price: typeof product.price === "string" ? parseFloat(product.price.replace(/[^\d.]/g, "")) : product.price,
					originalPrice: product.originalPrice ? parseFloat(product.originalPrice.replace(/[^\d.]/g, "")) : undefined,
					qty: product.qty,
					category: emailData.category,
					color,
					size: product.size,
					material,
					onSale: product.onSale,
					condition: emailData.condition,
					// Recompute care from the RESOLVED color/material (card color isn't
					// visible to parseEmailToFormData).
					care: inferCare(product.name, color, material),
					style,
				} as Partial<ClothingItem>;
			});
			onImportAll(items);
			track("import_finished", { count: items.length, source: "all" });
		},
		[selectedEmail, selectedEmailId, onImportAll, onSourceEmailChange],
	);

	const handleNextPage = useCallback(() => {
		if (accessToken) fetchNextPage(accessToken);
	}, [fetchNextPage, accessToken]);

	// Raw errors ("Gmail API error (401): {...}") are for Sentry, not testers —
	// translate to plain language plus the one action that fixes it.
	const friendlyError = error ? describeGmailError(error) : null;

	const handleReconnect = useCallback(() => {
		googleNotice.requestGoogleSignIn(login);
	}, [googleNotice, login]);

	const handleRetry = useCallback(() => {
		if (accessToken) searchEmails(accessToken, lastSearchParams.current, true);
	}, [accessToken, searchEmails]);

	// Zero-results state can pop the advanced-search panel open (counter, so it
	// re-opens after the user collapses it).
	const [advancedExpandSignal, setAdvancedExpandSignal] = useState(0);

	// The email whose preview is open (or opening — body may still be loading).
	const selectedMeta = selectedEmailId ? emails.find((e) => e.id === selectedEmailId) : undefined;

	if (!isAuthenticated) {
		return (
			<div className="gmail-container">
				<div className="gmail-auth-section">
					<h2 className="gmail-title">Import from Gmail</h2>
					<p className="gmail-description">
						Connect your Gmail account to find order confirmation emails and import clothing items into your closet.
					</p>
					<button
						className="gmail-login-btn"
						onClick={() => googleNotice.requestGoogleSignIn(login)}
						disabled={authLoading}
						type="button"
					>
						{authLoading ? "Connecting..." : "Connect Gmail Account"}
					</button>
					<GoogleHeadsUpNotice variant="gmail-import" />
					{friendlyError && <p className="gmail-error">{friendlyError.message}</p>}
					<GoogleUnverifiedNotice
						isOpen={googleNotice.isOpen}
						onContinue={googleNotice.confirm}
						onCancel={googleNotice.dismiss}
						variant="gmail-import"
						userPhotoUrl={profile?.photo_url}
						userName={profile?.display_name}
					/>
					{error && <p className="gmail-error">{error}</p>}
				</div>
			</div>
		);
	}

	return (
		<div className="gmail-container">
			<div className="gmail-header-bar">
				<h2 className="gmail-title">Import from Gmail</h2>
				<div className="gmail-header-actions">
					<button className="gmail-search-btn" onClick={handleDefaultSearch} disabled={isSearching} type="button">
						{isSearching ? "Searching..." : emails.length > 0 ? "Search Again" : "Search Emails"}
					</button>
					<button className="gmail-logout-btn" onClick={handleLogout} type="button">
						Disconnect
					</button>
					<button className="gmail-clear-cache-btn" onClick={handleClearCache} type="button">
						Clear Emails
					</button>
				</div>
			</div>

			<AdvancedSearchUI
				onSearch={handleAdvancedSearch}
				loading={isSearching}
				cachedCount={cachedCount}
				expandSignal={advancedExpandSignal}
			/>

			{friendlyError && !isSearching && (
				<div className="gmail-error-box" role="alert">
					<p className="gmail-error-message">{friendlyError.message}</p>
					{friendlyError.action === "reconnect" ? (
						<button className="gmail-error-action" onClick={handleReconnect} type="button">
							Reconnect Gmail
						</button>
					) : (
						<button className="gmail-error-action" onClick={handleRetry} type="button">
							Try Again
						</button>
					)}
				</div>
			)}

			{/* Search progress: the metadata fetch is rate-limited (batches of 5,
			    300ms apart) and can take tens of seconds for a full page of
			    results — show a live count so it never reads as frozen. */}
			{isSearching && (
				<div className="gmail-loading" role="status">
					<span className="gmail-spinner" aria-hidden="true" />
					{searchMode === "filter" ? (
						<p className="advanced-search-status advanced-search-status--filter">Filtering cached emails...</p>
					) : progress && progress.total > 0 ? (
						<p className="advanced-search-status advanced-search-status--fetch">
							Found {progress.total} email{progress.total !== 1 ? "s" : ""} — loading details ({progress.fetched}/
							{progress.total})...
						</p>
					) : (
						<p className="advanced-search-status advanced-search-status--fetch">
							Searching your inbox for order confirmations...
						</p>
					)}
				</div>
			)}

			{!isSearching && emails.length > 0 && (
				<div className={selectedMeta ? "display-email-preview-panel" : "gmail-results"}>
					<h3 className="gmail-section-title" data-testid="email-count">
						<span>Found</span> {emails.length} email
						{emails.length !== 1 ? "s" : ""}
						{emailDateRange && (
							<>
								<br />
								<span>Date range: </span>
								{emailDateRange.newest} - {emailDateRange.oldest}
							</>
						)}
						{cachedCount > 0 && emails.length !== cachedCount && (
							<span className="gmail-cache-hint"> (of {cachedCount} cached)</span>
						)}
					</h3>
					<div className="gmail-labels-and-preview">
						<div className="gmail-list-panel">
							<EmailList
								emails={emails}
								selectedEmailId={selectedEmailId}
								onToggleSelect={handleToggleSelect}
								listRef={listRef}
							/>
							{isFetchingMore && (
								<>
									<div className="gmail-skeleton-row" aria-hidden="true" />
									<div className="gmail-skeleton-row" aria-hidden="true" />
									<div className="gmail-skeleton-row" aria-hidden="true" />
								</>
							)}
							{hasNextPage && (
								<button
									className="gmail-search-btn"
									onClick={handleNextPage}
									disabled={isFetchingMore}
									type="button"
									style={{ marginTop: "var(--spacing-100)", width: "100%" }}
								>
									{isFetchingMore ? "Loading..." : "Load More"}
								</button>
							)}
						</div>
						{selectedMeta && (
							<div className="gmail-preview-panel">
								<button
									className="gmail-preview-close"
									onClick={handleClosePreview}
									type="button"
									aria-label="Back to email list"
								>
									← Back to list
								</button>
								{selectedEmail ? (
									<EmailPreview
										email={selectedEmail}
										onImportProduct={handleImportProduct}
										onImportAllProducts={onImportAll ? handleImportAllProducts : undefined}
										unskippedIndices={
											onUnskippedByEmailChange && selectedEmailId
												? (unskippedByEmail?.[selectedEmailId] ?? [])
												: undefined
										}
										onUnskippedIndicesChange={
											onUnskippedByEmailChange && selectedEmailId
												? (indices) => onUnskippedByEmailChange(selectedEmailId, indices)
												: undefined
										}
									/>
								) : (
									// Body still downloading — tapping an email must show
									// feedback immediately, not dead air until the fetch lands.
									<div className="gmail-preview-loading" role="status">
										<span className="gmail-spinner" aria-hidden="true" />
										<p>Opening email...</p>
										{isFetchingBody && <div className="gmail-skeleton-row" aria-hidden="true" />}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			)}
			{!isSearching && !friendlyError && emails.length < 1 && (
				<div className="gmail-empty">
					<p className="gmail-empty-title">No order emails found yet.</p>
					<p className="gmail-empty-hint">
						Every store words its emails differently — try searching for a specific sender (like orders@zara.com) or widening
						the date range.
					</p>
					<button className="gmail-empty-action" onClick={() => setAdvancedExpandSignal((n) => n + 1)} type="button">
						Open Advanced Search
					</button>
				</div>
			)}
		</div>
	);
}

// TODO:
// test for EXPRESS
//make swim category -> if swimsuit might be european size ie 38 - 36-Flamingo
//REI Order Confirmation #A307597894
// shoe sizes have 1/2 sizes
// advanced search - add more than one sender, for serch
// ebay Eddie Bauer Shoes 9 M Mocassins Loafers- Mocassins Loafers
