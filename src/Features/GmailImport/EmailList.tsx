import { memo, useCallback } from "react";
import type { GmailEmailMeta } from "../../hooks/useAdvancedSearch";

interface EmailListProps {
	emails: GmailEmailMeta[];
	selectedEmailId: string | null;
	onToggleSelect: (emailId: string) => void;
}

function formatDate(dateString: string): string {
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return dateString;
	}
}

function extractSenderName(from: string): string {
	const match = from.match(/^"?([^"<]+)"?\s*</);
	return match ? match[1].trim() : from;
}

interface EmailListItemProps {
	email: GmailEmailMeta;
	isSelected: boolean;
	onToggleSelect: (emailId: string) => void;
}

const EmailListItem = memo(function EmailListItem({
	email,
	isSelected,
	onToggleSelect,
	scrollRef,
}: EmailListItemProps & { scrollRef?: (node: HTMLLIElement | null) => void }) {
	return (
		<li className="gmail-email-item" ref={scrollRef}>
			<label className={`gmail-email-label ${isSelected ? "gmail-email-label--selected" : ""}`}>
				<input
					type="checkbox"
					checked={isSelected}
					onChange={() => onToggleSelect(email.id)}
					className="gmail-email-checkbox"
					aria-label={`Select email: ${email.subject}`}
				/>
				<div className="gmail-email-content">
					<div className="gmail-email-header">
						<span className="gmail-email-sender">{extractSenderName(email.from)}</span>
						<span className="gmail-email-date">{formatDate(email.date)}</span>
					</div>
					<div className="gmail-email-subject">{email.subject}</div>
					<div className="gmail-email-snippet">{email.snippet}</div>
				</div>
			</label>
		</li>
	);
});

export default function EmailList({ emails, selectedEmailId, onToggleSelect }: EmailListProps) {
	// Ref callback fires every time the selected <li> mounts — including when
	// EmailList itself remounts on "Back to email" with an already-set selectedEmailId
	// (a useEffect with [selectedEmailId] wouldn't fire because the value didn't change).
	const scrollRef = useCallback((node: HTMLLIElement | null) => {
		if (node && typeof node.scrollIntoView === "function") {
			node.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, []);

	if (emails.length === 0) {
		return (
			<div className="gmail-empty">
				<p>No order confirmation emails found.</p>
				<p className="gmail-empty-hint">Try checking if your purchase confirmations use different subject lines.</p>
			</div>
		);
	}

	return (
		<ul className="gmail-email-list" role="list">
			{emails.map((email) => {
				const isSelected = email.id === selectedEmailId;
				return (
					<EmailListItem
						key={email.id}
						scrollRef={isSelected ? scrollRef : undefined}
						email={email}
						isSelected={isSelected}
						onToggleSelect={onToggleSelect}
					/>
				);
			})}
		</ul>
	);
}
