import Modal from "../../../../Components/Modal/Modal";
import type { AdvancedSearchParams, SearchMode } from "../AdvancedSearchUI";
import "./SearchConfirmationModal.css";

interface SearchConfirmationModalProps {
	readonly params: AdvancedSearchParams;
	readonly mode: SearchMode;
	readonly cachedCount: number;
	readonly onConfirm: () => void;
	readonly onEdit: () => void;
	readonly onCancel: () => void;
}

function FilterSection({ label, items }: { readonly label: string; readonly items: readonly string[] }) {
	if (items.length === 0) return null;
	return (
		<div className="scm-section">
			<span className="scm-label">{label}</span>
			<div className="scm-pills">
				{items.map((item) => (
					<span key={item} className="scm-pill">
						{item}
					</span>
				))}
			</div>
		</div>
	);
}

function FilterField({ label, value }: { readonly label: string; readonly value: string }) {
	if (!value.trim()) return null;
	return (
		<div className="scm-section">
			<span className="scm-label">{label}</span>
			<span className="scm-value">{value}</span>
		</div>
	);
}

export default function SearchConfirmationModal({ params, mode, cachedCount, onConfirm, onEdit, onCancel }: SearchConfirmationModalProps) {
	const isFetch = mode === "fetch";

	const hasAnyFilter =
		params.subjects.length > 0 ||
		params.excludedSenders.length > 0 ||
		params.bodyKeywords.length > 0 ||
		params.from.trim() !== "" ||
		params.after.trim() !== "" ||
		params.before.trim() !== "";

	return (
		<Modal
			isOpen
			onClose={onCancel}
			title="Confirm Search"
			footer={
				<>
					<button className="scm-btn scm-btn--confirm" onClick={onConfirm} type="button">
						{isFetch ? "Fetch & Search" : "Filter Now"}
					</button>
					<button className="scm-btn scm-btn--edit" onClick={onEdit} type="button">
						Edit Filters
					</button>
					<button className="scm-btn scm-btn--cancel" onClick={onCancel} type="button">
						Cancel
					</button>
				</>
			}
		>
			<div className={`scm-mode-badge ${isFetch ? "scm-mode-badge--fetch" : "scm-mode-badge--filter"}`}>
				{isFetch ? "Fetching new emails from Gmail" : `Filtering ${cachedCount} cached email${cachedCount !== 1 ? "s" : ""}`}
			</div>

			{isFetch && (
				<p className="scm-mode-hint">
					Subjects, sender, and date range will be sent to the Gmail API. Body keywords and excluded senders will filter the
					results locally.
				</p>
			)}
			{!isFetch && <p className="scm-mode-hint">All filters will be applied to your already-fetched emails. No API calls.</p>}

			{!hasAnyFilter && <p className="scm-empty">No filters set — all emails will be shown.</p>}

			{hasAnyFilter && (
				<div className="scm-filters">
					<FilterSection label="Subjects" items={params.subjects} />
					<FilterField label="From sender" value={params.from} />
					<FilterField label="After" value={params.after} />
					<FilterField label="Before" value={params.before} />
					<FilterSection label="Body keywords" items={params.bodyKeywords} />
					<FilterSection label="Excluded senders" items={params.excludedSenders} />
				</div>
			)}
		</Modal>
	);
}
