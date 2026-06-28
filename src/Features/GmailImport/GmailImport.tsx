import { useState, useCallback, useEffect, useRef } from "react";
import { useGmailAuthContext } from "../../context/GmailAuthContext";
import { useAdvancedSearch } from "../../hooks/useAdvancedSearch";
import type { GmailEmail } from "../../hooks/useAdvancedSearch";
import type { ClothingItem } from "../../utils/types";
import type { ExtractedProduct } from "../../utils/parseProductsFromEmail";
import { AdvancedSearchParams, AdvancedSearchUI, SearchMode } from "./AdvancedSearch/AdvancedSearchUI";
import { parseEmailToFormData, extractForwardedSender } from "../../utils/parseEmailToFormData";
import { inferCare } from "../../utils/inferCare";
import { normalizeMaterial } from "../../utils/materialUtils";
import { extractColorFromName } from "../../utils/parseNameHelpers";
import normalizeColor from "../../utils/normalizeColors";
import EmailList from "./EmailList";
import EmailPreview from "./EmailPreviewPanel/EmailPreview";
import "./GmailImport.css";
import { inferProductAttributes } from "../../utils/inferProductAttributes";
import { toTitleCase } from "../../utils/toTitleCase";
import { condenseName } from "../../utils/condenseName";

interface GmailImportProps {
	onImport: (prefilled: Partial<ClothingItem>) => void;
	onImportAll?: (items: Partial<ClothingItem>[]) => void;
	/** When returning from EditItemView, re-open this email's preview */
	initialSelectedEmailId?: string | null;
	/** Notify parent of which email the user is importing from */
	onSourceEmailChange?: (emailId: string | null) => void;
}

export default function GmailImport({ onImport, onImportAll, initialSelectedEmailId, onSourceEmailChange }: GmailImportProps) {
	const { accessToken, isAuthenticated, error: authError, isLoading: authLoading, login, logout } = useGmailAuthContext();

	const {
		emails,
		isSearching,
		isFetchingMore,
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

	// Auto-search with defaults on first login
	useEffect(() => {
		if (accessToken && isAuthenticated) {
			searchEmails(accessToken);
		}
	}, [accessToken, isAuthenticated, searchEmails]);

	// Advanced search: routes to fetch or filter based on user's choice
	const handleAdvancedSearch = useCallback(
		(params: AdvancedSearchParams, mode: SearchMode) => {
			setSelectedEmailId(null);
			if (mode === "fetch" && accessToken) {
				searchEmails(accessToken, params, true);
			} else {
				filterCachedEmails(params);
			}
		},
		[accessToken, searchEmails, filterCachedEmails],
	);

	const handleDefaultSearch = useCallback(() => {
		if (accessToken) {
			setSelectedEmailId(null);
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
			const emailDate = selectedEmail?.date;
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
				price: String(product.price),
				originalPrice: product.originalPrice,
				qty: product.qty,
				category: emailData.category,
				color,
				size: product.size,
				material,
				onSale: product.onSale,
				// condition + purchaseDate already provided by emailData (parseEmailToFormData)
				condition: emailData.condition,
				// Recompute care from the RESOLVED color/material — the card's color
				// (e.g. "Color: White") isn't visible to parseEmailToFormData.
				care: inferCare(product.name, color, material),
				style,
			});
		},
		[selectedEmail, selectedEmailId, onImport, onSourceEmailChange],
	);

	const handleImportAllProducts = useCallback(
		(products: ExtractedProduct[]) => {
			if (!onImportAll) return;
			const emailFrom = extractForwardedSender(selectedEmail?.body ?? "") || selectedEmail?.from || "";
			const emailSubject = selectedEmail?.subject ?? "";
			const emailDate = selectedEmail?.date;

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
					price: product.price,
					originalPrice: product.originalPrice,
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
		},
		[selectedEmail, selectedEmailId, onImportAll, onSourceEmailChange],
	);

	const handleNextPage = useCallback(() => {
		if (accessToken) fetchNextPage(accessToken);
	}, [fetchNextPage, accessToken]);

	const error = authError ?? searchError;

	if (!isAuthenticated) {
		return (
			<div className="gmail-container">
				<div className="gmail-auth-section">
					<h2 className="gmail-title">Import from Gmail</h2>
					<p className="gmail-description">
						Connect your Gmail account to find order confirmation emails and import clothing items into your closet.
					</p>
					<button className="gmail-login-btn" onClick={login} disabled={authLoading} type="button">
						{authLoading ? "Connecting..." : "Connect Gmail Account"}
					</button>
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
					<button className="gmail-clear-cache-btn" onClick={handleClearCache} type="button" style={{ marginLeft: 8 }}>
						Clear Email Cache
					</button>
				</div>
			</div>

			<AdvancedSearchUI onSearch={handleAdvancedSearch} loading={isSearching} cachedCount={cachedCount} />

			{error && <p className="gmail-error">{error}</p>}

			{/* Search mode indicator */}
			{isSearching && searchMode && (
				<div className="gmail-loading">
					{searchMode === "fetch" ? (
						<p className="advanced-search-status advanced-search-status--fetch">Fetching new emails from Gmail...</p>
					) : (
						<p className="advanced-search-status advanced-search-status--filter">Filtering cached emails...</p>
					)}
				</div>
			)}

			{/* Fallback loading without mode */}
			{isSearching && !searchMode && (
				<div className="gmail-loading">
					<p>Searching your inbox for order confirmations...</p>
				</div>
			)}

			{!isSearching && emails.length > 0 && (
				<div className={selectedEmail ? "display-email-preview-panel" : "gmail-results"}>
					<div className="gmail-list-panel">
						<h3 className="gmail-section-title">
							Found {emails.length} email
							{emails.length !== 1 ? "s" : ""}
							{cachedCount > 0 && emails.length !== cachedCount && (
								<span className="gmail-cache-hint"> (of {cachedCount} cached)</span>
							)}
						</h3>
						<EmailList emails={emails} selectedEmailId={selectedEmailId} onToggleSelect={handleToggleSelect} listRef={listRef} />
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

					{selectedEmail && (
						<div className="gmail-preview-panel">
							<button
								className="gmail-preview-close"
								onClick={handleClosePreview}
								type="button"
								aria-label="Back to email list"
							>
								← Back to list
							</button>
							<EmailPreview
								email={selectedEmail}
								onImportProduct={handleImportProduct}
								onImportAllProducts={onImportAll ? handleImportAllProducts : undefined}
							/>
						</div>
					)}
				</div>
			)}
			{!isSearching && emails.length < 1 && (
				<div className="gmail-empty">
					<p>No order confirmation emails found.</p>
					<p className="gmail-empty-hint">
						Try checking if your purchase confirmations use different subject lines or adjusting your search dates.
					</p>
				</div>
			)}
		</div>
	);
}
