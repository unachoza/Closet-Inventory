import { memo, useMemo, useState } from "react";
import type { Ref } from "react";
import type { GmailEmailMeta } from "../../hooks/useAdvancedSearch";
import { classifyStage, STAGE_META, type OrderStage } from "./orderStage";
import { groupOrders, type OrderGroup } from "./orderGrouping";

interface EmailListProps {
	emails: GmailEmailMeta[];
	selectedEmailId: string | null;
	onToggleSelect: (emailId: string) => void;
	// The parent (GmailImport) scrolls the selected row into view AFTER the email
	// body loads and the preview-split layout settles — see the comment there.
	listRef?: Ref<HTMLUListElement>;
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

function StageBadge({ stage }: { stage: OrderStage }) {
	return (
		<span
			className={`gmail-stage-badge ${STAGE_META[stage].className}`}
			title={`This looks like the "${STAGE_META[stage].label}" email for this order`}
		>
			{STAGE_META[stage].label}
		</span>
	);
}

interface EmailListItemProps {
	email: GmailEmailMeta;
	isSelected: boolean;
	onToggleSelect: (emailId: string) => void;
	nested?: boolean;
}

const EmailListItem = memo(function EmailListItem({ email, isSelected, onToggleSelect, nested }: EmailListItemProps) {
	const stage = classifyStage(email.subject);
	return (
		<li className={`gmail-email-item ${nested ? "gmail-email-item--nested" : ""}`}>
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
					<div className="gmail-email-subject">
						{stage && <StageBadge stage={stage} />}
						{email.subject}
					</div>
					<div className="gmail-email-snippet">{email.snippet}</div>
				</div>
			</label>
		</li>
	);
});

interface EmailGroupProps {
	group: OrderGroup;
	selectedEmailId: string | null;
	onToggleSelect: (emailId: string) => void;
}

// One order = the confirmation email shown as primary, with the other stage
// emails collapsed under an expandable toggle. Collapse is never a one-way hide:
// the toggle keeps the shipped/delivered copies reachable in case the shopper
// prefers to import from one of those instead.
function EmailGroup({ group, selectedEmailId, onToggleSelect }: EmailGroupProps) {
	const [expanded, setExpanded] = useState(false);
	const { primary, others, stages } = group;

	// A selected email hidden inside a collapsed group should not appear lost.
	const hiddenSelected = !expanded && others.some((e) => e.id === selectedEmailId);
	const showChildren = expanded || hiddenSelected;

	return (
		<>
			<EmailListItem
				email={primary}
				isSelected={primary.id === selectedEmailId}
				onToggleSelect={onToggleSelect}
			/>
			{others.length > 0 && (
				<li className="gmail-group-toggle-row">
					<button
						type="button"
						className="gmail-group-toggle"
						onClick={() => setExpanded((v) => !v)}
						aria-expanded={showChildren}
					>
						<span className="gmail-group-toggle-label">
							{showChildren ? "Hide" : "Show"} {others.length} more for this order
						</span>
						<span className="gmail-group-toggle-stages">
							{stages.map((s) => (
								<StageBadge key={s} stage={s} />
							))}
						</span>
					</button>
				</li>
			)}
			{showChildren &&
				others.map((e) => (
					<EmailListItem
						key={e.id}
						email={e}
						isSelected={e.id === selectedEmailId}
						onToggleSelect={onToggleSelect}
						nested
					/>
				))}
		</>
	);
}

export default function EmailList({ emails, selectedEmailId, onToggleSelect, listRef }: EmailListProps) {
	const groups = useMemo(() => groupOrders(emails), [emails]);

	if (emails.length === 0) {
		return (
			<div className="gmail-empty">
				<p>No order confirmation emails found.</p>
				<p className="gmail-empty-hint">Try checking if your purchase confirmations use different subject lines.</p>
			</div>
		);
	}

	return (
		<ul className="gmail-email-list" role="list" ref={listRef}>
			{groups.map((group) => (
				<EmailGroup
					key={group.primary.id}
					group={group}
					selectedEmailId={selectedEmailId}
					onToggleSelect={onToggleSelect}
				/>
			))}
		</ul>
	);
}
