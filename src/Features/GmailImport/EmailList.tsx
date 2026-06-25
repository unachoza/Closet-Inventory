import { memo, forwardRef, useEffect, useRef } from "react";
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

const EmailListItem = memo(
	forwardRef<HTMLLIElement, EmailListItemProps>(function EmailListItem({ email, isSelected, onToggleSelect }, ref) {
		return (
			<li className="gmail-email-item" ref={ref}>
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
	}),
);

export default function EmailList({ emails, selectedEmailId, onToggleSelect }: EmailListProps) {
	// Keep the highlighted row in view so the left list always matches the email
	// shown in the right preview. Matters most when returning from "Back to email":
	// the list would otherwise reset to the top while the preview shows a row that's
	// scrolled out of sight. `block: "nearest"` only scrolls when the row isn't
	// already visible, so it never fights the user's own scrolling.
	const selectedRef = useRef<HTMLLIElement>(null);
	useEffect(() => {
		// Guard the call: scrollIntoView is unimplemented in some environments
		// (e.g. jsdom under test) — a missing method must not crash the list.
		if (selectedEmailId && typeof selectedRef.current?.scrollIntoView === "function") {
			selectedRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
		}
		// Re-run when the restored selection or the loaded list changes (the cache
		// may populate a tick after mount on return).
	}, [selectedEmailId, emails.length]);

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
						ref={isSelected ? selectedRef : undefined}
						email={email}
						isSelected={isSelected}
						onToggleSelect={onToggleSelect}
					/>
				);
			})}
		</ul>
	);
}
