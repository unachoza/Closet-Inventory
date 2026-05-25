import { useState, useCallback, useEffect } from "react";
import { useGmailAuth } from "../../hooks/useGmailAuth";
import { useAdvancedSearch } from "../../hooks/useAdvancedSearch";
import type { GmailEmail } from "../../hooks/useAdvancedSearch";
import type { ClothingItem } from "../../utils/types";
import type { AdvancedSearchParams } from "./AdvnacedSearch/AdvancedSearchUI";
import type { ExtractedProduct } from "../../utils/parseProductsFromEmail";
import { parseEmailToFormData } from "../../utils/parseEmailToFormData";
import AdvancedSearchUI from "./AdvnacedSearch/AdvancedSearchUI";
import EmailList from "./EmailList";
import EmailPreview from "./EmailPreviewPanel/EmailPreview";
import "./GmailImport.css";

interface GmailImportProps {
	onImport: (prefilled: Partial<ClothingItem>) => void;
}

export default function GmailImport({ onImport }: GmailImportProps) {
	const {
		accessToken,
		isAuthenticated,
		error: authError,
		isLoading: authLoading,
		login,
		logout,
	} = useGmailAuth();

	const {
		emails,
		isSearching,
		isFetchingBody,
		error: searchError,
		searchEmails,
		fetchNextPage,
		fetchEmailBody,
		filterCachedEmails,
		hasNextPage,
		cacheAge,
	} = useAdvancedSearch();

	const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
	const [selectedEmailBody, setSelectedEmailBody] = useState<string | null>(null);

	// Build a full GmailEmail when body is loaded
	const selectedMeta = emails.find((e) => e.id === selectedEmailId);
	const selectedEmail: GmailEmail | undefined =
		selectedMeta && selectedEmailBody !== null
			? { ...selectedMeta, body: selectedEmailBody }
			: undefined;

	// Auto-search with defaults on first login
	useEffect(() => {
		if (accessToken && isAuthenticated) {
			searchEmails(accessToken);
		}
	}, [accessToken, isAuthenticated, searchEmails]);

	// Lazy-fetch body when an email is selected
	useEffect(() => {
		if (selectedEmailId && accessToken) {
			setSelectedEmailBody(null);
			fetchEmailBody(accessToken, selectedEmailId).then((body) => {
				setSelectedEmailBody(body);
			});
		}
	}, [selectedEmailId, accessToken, fetchEmailBody]);

	const handleAdvancedSearch = useCallback(
		(params: AdvancedSearchParams) => {
			setSelectedEmailId(null);
			setSelectedEmailBody(null);
			filterCachedEmails(params);
		},
		[filterCachedEmails]
	);

	const handleDefaultSearch = useCallback(() => {
		if (accessToken) {
			setSelectedEmailId(null);
			setSelectedEmailBody(null);
			searchEmails(accessToken);
		}
	}, [accessToken, searchEmails]);

	const handleForceRefresh = useCallback(() => {
		if (accessToken) {
			setSelectedEmailId(null);
			setSelectedEmailBody(null);
			searchEmails(accessToken, undefined, true);
		}
	}, [accessToken, searchEmails]);

	const handleToggleSelect = useCallback((emailId: string) => {
		setSelectedEmailId((prev) => (prev === emailId ? null : emailId));
	}, []);

	const handleConfirmImport = useCallback(() => {
		if (!selectedEmail) return;

		const prefilled = parseEmailToFormData(
			selectedEmail.subject,
			selectedEmail.body,
			selectedEmail.from
		);
		onImport(prefilled);
	}, [selectedEmail, onImport]);

	const handleImportProduct = useCallback(
		(product: ExtractedProduct) => {
			const senderBrand = selectedEmail
				? parseEmailToFormData(
						selectedEmail.subject,
						selectedEmail.body,
						selectedEmail.from
					).brand
				: "";

			onImport({
				id: crypto.randomUUID(),
				imageURL: product.imageUrl,
				name: `${product.brand} ${product.name}`.trim(),
				category: "",
				color: product.color.toLowerCase(),
				size: product.size,
				brand: product.brand || senderBrand || "",
				price: product.price,
				material: "",
				occasion: "",
				age: "new",
				care: "",
			});
		},
		[selectedEmail, onImport]
	);

	const handleNextPage = useCallback(() => {
		if (accessToken) {
			fetchNextPage(accessToken);
		}
	}, [accessToken, fetchNextPage]);

	const error = authError ?? searchError;

	const cacheAgeLabel = cacheAge !== null
		? cacheAge < 60_000
			? "just now"
			: cacheAge < 3_600_000
				? `${Math.round(cacheAge / 60_000)}m ago`
				: `${Math.round(cacheAge / 3_600_000)}h ago`
		: null;

	if (!isAuthenticated) {
		return (
			<div className="gmail-container">
				<div className="gmail-auth-section">
					<h2 className="gmail-title">Import from Gmail</h2>
					<p className="gmail-description">
						Connect your Gmail account to find order confirmation emails and
						import clothing items into your closet.
					</p>
					<button
						className="gmail-login-btn"
						onClick={login}
						disabled={authLoading}
						type="button"
					>
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
					<button
						className="gmail-search-btn"
						onClick={handleDefaultSearch}
						disabled={isSearching}
						type="button"
					>
						{isSearching
							? "Searching..."
							: emails.length > 0
								? "Search Again"
								: "Search Emails"}
					</button>
					<button
						className="gmail-search-btn gmail-refresh-btn"
						onClick={handleForceRefresh}
						disabled={isSearching}
						type="button"
						title="Force refresh from Gmail (bypass cache)"
					>
						Refresh
					</button>
					<button
						className="gmail-logout-btn"
						onClick={logout}
						type="button"
					>
						Disconnect
					</button>
				</div>
			</div>

			{cacheAgeLabel && (
				<p className="gmail-cache-label">
					Cached {cacheAgeLabel} &middot; {emails.length} email{emails.length !== 1 ? "s" : ""}
				</p>
			)}

			<AdvancedSearchUI
				onSearch={handleAdvancedSearch}
				loading={isSearching}
			/>

			{error && <p className="gmail-error">{error}</p>}

			{isSearching && (
				<div className="gmail-loading">
					<p>Searching your inbox for order confirmations...</p>
				</div>
			)}

			{!isSearching && emails.length > 0 && (
				<div
					className={
						selectedEmail
							? "display-email-preview-panel"
							: "gmail-results"
					}
				>
					<div className="gmail-list-panel">
						<h3 className="gmail-section-title">
							Found {emails.length} email
							{emails.length !== 1 ? "s" : ""}
						</h3>
						<EmailList
							emails={emails}
							selectedEmailId={selectedEmailId}
							onToggleSelect={handleToggleSelect}
						/>
						{hasNextPage && (
							<button
								className="gmail-search-btn gmail-load-more-btn"
								onClick={handleNextPage}
								disabled={isSearching}
								type="button"
							>
								Load More
							</button>
						)}
					</div>

					{selectedEmailId && !selectedEmail && isFetchingBody && (
						<div className="gmail-preview-panel">
							<div className="gmail-loading">
								<p>Loading email content...</p>
							</div>
						</div>
					)}

					{selectedEmail && (
						<div className="gmail-preview-panel">
							<EmailPreview
								email={selectedEmail}
								onConfirmImport={handleConfirmImport}
								onImportProduct={handleImportProduct}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
