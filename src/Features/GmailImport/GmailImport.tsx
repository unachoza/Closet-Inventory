import { useState, useCallback, useEffect } from "react";
import { useGmailAuth } from "../../hooks/useGmailAuth";
import { useAdvancedSearch } from "../../hooks/useAdvancedSearch";
import type { GmailEmail } from "../../hooks/useAdvancedSearch";
import type { ClothingItem } from "../../utils/types";
import type { ExtractedProduct } from "../../utils/parseProductsFromEmail";
import type { AdvancedSearchParams } from "./AdvnacedSearch/AdvancedSearchUI";
import { parseEmailToFormData } from "../../utils/parseEmailToFormData";
import AdvancedSearchUI from "./AdvnacedSearch/AdvancedSearchUI";
import EmailList from "./EmailList";
import EmailPreview from "./EmailPreviewPanel/EmailPreview";
import "./GmailImport.css";

interface GmailImportProps {
	onImport: (prefilled: Partial<ClothingItem>) => void;
}

export default function GmailImport({ onImport }: GmailImportProps) {
	const { accessToken, isAuthenticated, error: authError, isLoading: authLoading, login, logout } = useGmailAuth();

	const { emails, isSearching, error: searchError, searchEmails, fetchNextPage, hasNextPage, fetchEmailBody } = useAdvancedSearch();

	const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

	// Find the selected email and ensure it has a body (fetch if needed)
	const [selectedEmail, setSelectedEmail] = useState<GmailEmail | undefined>(undefined);

	useEffect(() => {
		let isMounted = true;
		async function loadBody() {
			if (selectedEmailId) {
				const meta = emails.find((e) => e.id === selectedEmailId);
				if (meta && accessToken) {
					// If already has body, cast to GmailEmail
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

	// Auto-search with defaults on first login
	useEffect(() => {
		if (accessToken && isAuthenticated) {
			searchEmails(accessToken);
		}
	}, [accessToken, isAuthenticated, searchEmails]);

	const handleAdvancedSearch = useCallback(
		(params: AdvancedSearchParams) => {
			if (accessToken) {
				setSelectedEmailId(null);
				searchEmails(accessToken, params);
			}
		},
		[accessToken, searchEmails],
	);

	const handleDefaultSearch = useCallback(() => {
		if (accessToken) {
			setSelectedEmailId(null);
			searchEmails(accessToken);
		}
	}, [accessToken, searchEmails]);

	const handleToggleSelect = useCallback((emailId: string) => {
		setSelectedEmailId((prev) => (prev === emailId ? null : emailId));
	}, []);

	const handleConfirmImport = useCallback(() => {
		if (!selectedEmail) return;

		const prefilled = parseEmailToFormData(selectedEmail.subject, selectedEmail.body, selectedEmail.from);
		onImport(prefilled);
	}, [selectedEmail, onImport]);

	const handleImportProduct = useCallback(
		(product: ExtractedProduct) => {
			const emailFrom = selectedEmail?.from ?? "";
			const emailSubject = selectedEmail?.subject ?? "";

			// Use parseEmailToFormData for brand/category detection from email context
			const emailData = parseEmailToFormData(
				emailSubject,
				product.name,
				emailFrom,
			);

			onImport({
				...emailData,
				imageURL: product.imageUrl,
				name: product.name,
				brand: product.brand || emailData.brand,
				category: emailData.category,
				color: product.color,
				size: product.size,
				age: "new",
			});
		},
		[selectedEmail, onImport],
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
					<button className="gmail-logout-btn" onClick={logout} type="button">
						Disconnect
					</button>
				</div>
			</div>

			<AdvancedSearchUI onSearch={handleAdvancedSearch} loading={isSearching} />

			{error && <p className="gmail-error">{error}</p>}

			{isSearching && (
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
						</h3>
						<EmailList emails={emails} selectedEmailId={selectedEmailId} onToggleSelect={handleToggleSelect} />
						{hasNextPage && (
							<button
								className="gmail-search-btn"
								onClick={handleNextPage}
								disabled={isSearching}
								type="button"
								style={{ marginTop: "var(--spacing-100)", width: "100%" }}
							>
								Load More
							</button>
						)}
					</div>

					{selectedEmail && (
						<div className="gmail-preview-panel">
							<EmailPreview email={selectedEmail} onConfirmImport={handleConfirmImport} onImportProduct={handleImportProduct} />
						</div>
					)}
				</div>
			)}
		</div>
	);
}
