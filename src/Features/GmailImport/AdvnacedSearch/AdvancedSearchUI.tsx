import { useState, useCallback } from "react";
import { GMAIL_SEARCH_SUBJECTS, GMAIL_SEARCH_BODY_KEYWORDS } from "../constants";
import SearchConfirmationModal from "./SearchConfirmationModal";
import "./AdvancedSearch.css";

export type SearchMode = "fetch" | "filter";

export interface AdvancedSearchParams {
	readonly subjects: readonly string[];
	readonly excludedSenders: readonly string[];
	readonly bodyKeywords: readonly string[];
	readonly from: string;
	readonly after: string;
	readonly before: string;
}

export const DEFAULT_SEARCH_PARAMS: AdvancedSearchParams = {
	subjects: GMAIL_SEARCH_SUBJECTS,
	excludedSenders: [],
	bodyKeywords: GMAIL_SEARCH_BODY_KEYWORDS,
	from: "",
	after: "",
	before: "",
};

interface AdvancedSearchUIProps {
	readonly onSearch: (params: AdvancedSearchParams, mode: SearchMode) => void;
	readonly loading: boolean;
	readonly cachedCount: number;
}

export default function AdvancedSearchUI({ onSearch, loading, cachedCount }: AdvancedSearchUIProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [from, setFrom] = useState("");
	const [after, setAfter] = useState("");
	const [before, setBefore] = useState("");
	const [excludedSenderInput, setExcludedSenderInput] = useState("");
	const [excludedSenders, setExcludedSenders] = useState<string[]>([]);
	const [bodyKeywordInput, setBodyKeywordInput] = useState("");
	const [bodyKeywords, setBodyKeywords] = useState<string[]>([...GMAIL_SEARCH_BODY_KEYWORDS]);
	const [subjects, setSubjects] = useState<string[]>([...GMAIL_SEARCH_SUBJECTS]);
	const [subjectInput, setSubjectInput] = useState("");

	// Confirmation modal state
	const [pendingMode, setPendingMode] = useState<SearchMode | null>(null);

	const buildParams = useCallback((): AdvancedSearchParams => ({
		subjects,
		excludedSenders,
		bodyKeywords,
		from,
		after,
		before,
	}), [subjects, excludedSenders, bodyKeywords, from, after, before]);

	// ── Pill add/remove handlers ───────────────────────────

	const handleAddExcludedSender = () => {
		const trimmed = excludedSenderInput.trim();
		if (trimmed && !excludedSenders.includes(trimmed)) {
			setExcludedSenders((prev) => [...prev, trimmed]);
			setExcludedSenderInput("");
		}
	};

	const handleRemoveExcludedSender = (sender: string) => {
		setExcludedSenders((prev) => prev.filter((s) => s !== sender));
	};

	const handleAddBodyKeyword = () => {
		const trimmed = bodyKeywordInput.trim();
		if (trimmed && !bodyKeywords.includes(trimmed)) {
			setBodyKeywords((prev) => [...prev, trimmed]);
			setBodyKeywordInput("");
		}
	};

	const handleRemoveBodyKeyword = (keyword: string) => {
		setBodyKeywords((prev) => prev.filter((k) => k !== keyword));
	};

	const handleAddSubject = () => {
		const trimmed = subjectInput.trim();
		if (trimmed && !subjects.includes(trimmed)) {
			setSubjects((prev) => [...prev, trimmed]);
			setSubjectInput("");
		}
	};

	const handleRemoveSubject = (subject: string) => {
		setSubjects((prev) => prev.filter((s) => s !== subject));
	};

	const handleKeyDown = (e: React.KeyboardEvent, addFn: () => void) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addFn();
		}
	};

	// ── Search flow: button → modal → confirm ──────────────

	const handleRequestSearch = (mode: SearchMode) => {
		setPendingMode(mode);
	};

	const handleConfirmSearch = () => {
		if (pendingMode) {
			onSearch(buildParams(), pendingMode);
			setPendingMode(null);
		}
	};

	const handleEditFilters = () => {
		setPendingMode(null);
		// Keep form open so user can edit
	};

	const handleCancelModal = () => {
		setPendingMode(null);
	};

	return (
		<div className="advanced-search">
			<button
				className="advanced-search-toggle"
				onClick={() => setIsExpanded((prev) => !prev)}
				type="button"
			>
				{isExpanded ? "Hide" : "Show"} Advanced Search
			</button>

			{isExpanded && (
				<form className="advanced-search-form" onSubmit={(e) => e.preventDefault()}>
					{/* Subject patterns */}
					<fieldset className="advanced-search-fieldset">
						<legend>Subject line patterns</legend>
						<div className="advanced-search-pills">
							{subjects.map((s) => (
								<span key={s} className="advanced-search-pill">
									{s}
									<button
										type="button"
										className="advanced-search-pill-remove"
										onClick={() => handleRemoveSubject(s)}
										aria-label={`Remove subject: ${s}`}
									>
										&times;
									</button>
								</span>
							))}
							{subjects.length === 0 && (
								<span className="advanced-search-hint">No subject filters — all subjects will match</span>
							)}
						</div>
						<div className="advanced-search-input-row">
							<input
								type="text"
								value={subjectInput}
								onChange={(e) => setSubjectInput(e.target.value)}
								onKeyDown={(e) => handleKeyDown(e, handleAddSubject)}
								placeholder="Add subject pattern..."
								className="advanced-search-input"
							/>
							<button type="button" className="advanced-search-add-btn" onClick={handleAddSubject}>
								Add
							</button>
						</div>
					</fieldset>

					{/* Excluded senders */}
					<fieldset className="advanced-search-fieldset">
						<legend>Exclude senders</legend>
						<div className="advanced-search-pills">
							{excludedSenders.map((s) => (
								<span key={s} className="advanced-search-pill advanced-search-pill--excluded">
									{s}
									<button
										type="button"
										className="advanced-search-pill-remove"
										onClick={() => handleRemoveExcludedSender(s)}
										aria-label={`Remove excluded sender: ${s}`}
									>
										&times;
									</button>
								</span>
							))}
							{excludedSenders.length === 0 && (
								<span className="advanced-search-hint">No senders excluded</span>
							)}
						</div>
						<div className="advanced-search-input-row">
							<input
								type="text"
								value={excludedSenderInput}
								onChange={(e) => setExcludedSenderInput(e.target.value)}
								onKeyDown={(e) => handleKeyDown(e, handleAddExcludedSender)}
								placeholder="e.g. noreply@uber.com"
								className="advanced-search-input"
							/>
							<button type="button" className="advanced-search-add-btn" onClick={handleAddExcludedSender}>
								Add
							</button>
						</div>
					</fieldset>

					{/* Body keywords */}
					<fieldset className="advanced-search-fieldset">
						<legend>Body keywords</legend>
						<div className="advanced-search-pills">
							{bodyKeywords.map((k) => (
								<span key={k} className="advanced-search-pill">
									{k}
									<button
										type="button"
										className="advanced-search-pill-remove"
										onClick={() => handleRemoveBodyKeyword(k)}
										aria-label={`Remove keyword: ${k}`}
									>
										&times;
									</button>
								</span>
							))}
							{bodyKeywords.length === 0 && (
								<span className="advanced-search-hint">No body keyword filters</span>
							)}
						</div>
						<div className="advanced-search-input-row">
							<input
								type="text"
								value={bodyKeywordInput}
								onChange={(e) => setBodyKeywordInput(e.target.value)}
								onKeyDown={(e) => handleKeyDown(e, handleAddBodyKeyword)}
								placeholder="Add body keyword..."
								className="advanced-search-input"
							/>
							<button type="button" className="advanced-search-add-btn" onClick={handleAddBodyKeyword}>
								Add
							</button>
						</div>
					</fieldset>

					{/* From + date range row */}
					<div className="advanced-search-row">
						<label className="advanced-search-label">
							From sender
							<input
								type="text"
								value={from}
								onChange={(e) => setFrom(e.target.value)}
								placeholder="e.g. orders@zara.com"
								className="advanced-search-input"
							/>
						</label>
						<label className="advanced-search-label">
							After
							<input
								type="date"
								value={after}
								onChange={(e) => setAfter(e.target.value)}
								className="advanced-search-input"
							/>
						</label>
						<label className="advanced-search-label">
							Before
							<input
								type="date"
								value={before}
								onChange={(e) => setBefore(e.target.value)}
								className="advanced-search-input"
							/>
						</label>
					</div>

					{/* Two action buttons */}
					<div className="advanced-search-actions">
						<button
							type="button"
							className="advanced-search-submit advanced-search-submit--fetch"
							disabled={loading}
							onClick={() => handleRequestSearch("fetch")}
						>
							{loading ? "Searching..." : "New Search"}
						</button>
						<button
							type="button"
							className="advanced-search-submit advanced-search-submit--filter"
							disabled={loading || cachedCount === 0}
							onClick={() => handleRequestSearch("filter")}
						>
							{loading
								? "Filtering..."
								: `Filter Existing (${cachedCount})`}
						</button>
					</div>
				</form>
			)}

			{/* Confirmation modal */}
			{pendingMode !== null && (
				<SearchConfirmationModal
					params={buildParams()}
					mode={pendingMode}
					cachedCount={cachedCount}
					onConfirm={handleConfirmSearch}
					onEdit={handleEditFilters}
					onCancel={handleCancelModal}
				/>
			)}
		</div>
	);
}
