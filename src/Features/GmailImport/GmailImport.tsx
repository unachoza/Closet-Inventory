import { useState, useCallback, useEffect } from "react";
import { useGmailAuth } from "../../hooks/useGmailAuth";
import { useGmailSearch } from "../../hooks/useGmailSearch";
import type { GmailEmail } from "../../hooks/useGmailSearch";
import type { ItemFormData } from "../../utils/types";
import { parseEmailToFormData } from "../../utils/parseEmailToFormData";
import EmailList from "./EmailList";
import EmailPreview from "./EmailPreviewPanel/EmailPreview";
import "./GmailImport.css";

interface GmailImportProps {
	onImport: (prefilled: Partial<ItemFormData>) => void;
}
const MY_EMAILS_KEY = "my_emails_key";
export default function GmailImport({ onImport }: GmailImportProps) {
	const { accessToken, isAuthenticated, error: authError, isLoading: authLoading, login, logout } = useGmailAuth();
	const { emails, isSearching, error: searchError, searchEmails } = useGmailSearch();
	const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

	const selectedEmail: GmailEmail | undefined = emails.find((e) => e.id === selectedEmailId);

	const getemails = (): GmailEmail[] => {
		try {
			const stored = localStorage.getItem(MY_EMAILS_KEY);
			return stored ? (JSON.parse(stored) as GmailEmail[]) : [];
		} catch {
			return [];
		}
	};

	useEffect(() => {
		if (accessToken && isAuthenticated) {
			searchEmails(accessToken);
		}
	}, [accessToken, isAuthenticated, searchEmails]);

	const handleSearch = useCallback(() => {
		if (accessToken) {
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

	const error = authError ?? searchError;

	if (!isAuthenticated) {
		console.log(getemails());
		console.log("not auth");
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

	if (getemails().length > 0) {
		console.log(isAuthenticated);
		return (
			<div>
				already stored emails
				<div className={selectedEmail ? "display-email-preview-panel" : "gmail-results"}>
					<div className="gmail-list-panel">
						<h3 className="gmail-section-title">
							Found {emails.length} email{emails.length !== 1 ? "s" : ""}
						</h3>
						<EmailList emails={emails} selectedEmailId={selectedEmailId} onToggleSelect={handleToggleSelect} />
					</div>
					{selectedEmail && (
						<div className="gmail-preview-panel">
							<EmailPreview email={selectedEmail} onConfirmImport={handleConfirmImport} />
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="gmail-container">
			<div className="gmail-header-bar">
				<h2 className="gmail-title">Import from Gmail</h2>
				<div className="gmail-header-actions">
					<button className="gmail-search-btn" onClick={handleSearch} disabled={isSearching} type="button">
						{isSearching ? "Searching..." : emails.length > 0 ? "Search Again" : "Search Emails"}
					</button>
					<button className="gmail-logout-btn" onClick={logout} type="button">
						Disconnect
					</button>
				</div>
			</div>

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
							Found {emails.length} email{emails.length !== 1 ? "s" : ""}
						</h3>
						<EmailList emails={emails} selectedEmailId={selectedEmailId} onToggleSelect={handleToggleSelect} />
					</div>
					{selectedEmail && (
						<div className="gmail-preview-panel">
							<EmailPreview email={selectedEmail} onConfirmImport={handleConfirmImport} />
						</div>
					)}
				</div>
			)}
		</div>
	);
}
