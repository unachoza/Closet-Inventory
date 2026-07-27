import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { X, Plus, Search, ArrowRight, ArrowLeft, Check, User, Tag, SlidersHorizontal, EyeOff } from "lucide-react";
import "./MobileAdvancedSearchFlow.css";

/* ─── Default data ─── */
// const DEFAULT_SUBJECTS = [
// 	"Thank you for your purchase",
// 	"Thanks for your purchase",
// 	"Order Confirmation",
// 	"Your order has shipped",
// 	"Receipt for your purchase",
// ];

// const DEFAULT_KEYWORDS = [
// 	"order",
// 	"receipt",
// 	"purchase",
// 	"shipping confirmation",
// 	"invoice",
// 	"Your Order Summary",
// 	"package has been shipped",
// 	"order is being processed",
// 	"See your order details",
// 	"Check order Status",
// 	"Order Subtotal",
// ];

/* ─── Steps config ─── */
const STEPS = [
	{ id: 0, label: "Sender", Icon: User },
	{ id: 1, label: "Order Emails", Icon: Tag },
	{ id: 2, label: "Contents", Icon: SlidersHorizontal },
	{ id: 3, label: "Skip Senders", Icon: EyeOff },
];

/* ─── Tag chip ─── */
function TagChip({ label, onRemove, variant }: { label: string; onRemove: () => void; variant: "sky" | "violet" | "rose" }) {
	return (
		<span className={`sw-tag sw-tag--${variant}`}>
			<span className="sw-tag-text">{label}</span>
			<button className="sw-tag-remove" onClick={onRemove} aria-label={`Remove ${label}`}>
				<X size={11} />
			</button>
		</span>
	);
}

/* ─── Tag input row + chips ─── */
function TagInput({
	tags,
	onAdd,
	onRemove,
	placeholder,
	variant,
}: {
	tags: string[];
	onAdd: (t: string) => void;
	onRemove: (t: string) => void;
	placeholder: string;
	variant: "sky" | "violet" | "rose";
}) {
	const [value, setValue] = useState("");
	const ref = useRef<HTMLInputElement>(null);

	const commit = () => {
		const t = value.trim();
		if (t && !tags.includes(t)) {
			onAdd(t);
			setValue("");
		}
	};

	const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			commit();
		}
		if (e.key === "Backspace" && !value && tags.length > 0) onRemove(tags[tags.length - 1]);
	};

	return (
		<>
			<div className="sw-input-row">
				<input
					ref={ref}
					className="sw-input"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onKeyDown={onKey}
					placeholder={placeholder}
					autoComplete="off"
				/>
				<button className="sw-add-btn" onClick={commit} disabled={!value.trim()} aria-label="Add">
					<Plus size={15} />
				</button>
			</div>
			{tags.length > 0 && (
				<div className="sw-tags">
					{tags.map((t) => (
						<TagChip key={t} label={t} onRemove={() => onRemove(t)} variant={variant} />
					))}
				</div>
			)}
		</>
	);
}

interface MobileSearchWizardProps {
	fromSender: string;
	onFromSenderChange: (value: string) => void;
	dateAfter: string;
	onDateAfterChange: (value: string) => void;
	dateBefore: string;
	onDateBeforeChange: (value: string) => void;
	subjects: string[];
	onAddSubject: (subject: string) => void;
	onRemoveSubject: (subject: string) => void;
	keywords: string[];
	onAddKeyword: (keyword: string) => void;
	onRemoveKeyword: (keyword: string) => void;
	excluded: string[];
	onAddExcluded: (sender: string) => void;
	onRemoveExcluded: (sender: string) => void;
	onSearch: (mode: "fetch" | "filter") => void;
	loading: boolean;
	cachedCount: number;
}

/* ─── Main wizard ─── */
export function MobileSearchWizard({
	fromSender,
	onFromSenderChange,
	dateAfter,
	onDateAfterChange,
	dateBefore,
	onDateBeforeChange,
	subjects,
	onAddSubject,
	onRemoveSubject,
	keywords,
	onAddKeyword,
	onRemoveKeyword,
	excluded,
	onAddExcluded,
	onRemoveExcluded,
	onSearch,
	loading,
	cachedCount,
}: MobileSearchWizardProps) {
	const [step, setStep] = useState(0);
	const [dir, setDir] = useState<"right" | "left">("right");
	const [showSummary, setShowSummary] = useState(false);

	// Re-trigger animation when step changes
	const [panelKey, setPanelKey] = useState(0);
	useEffect(() => {
		setPanelKey((k) => k + 1);
	}, [step, showSummary]);

	const go = (next: number) => {
		setDir(next > step ? "right" : "left");
		setStep(next);
		setShowSummary(false);
	};

	const handleClearAll = () => {
		onFromSenderChange("");
		onDateAfterChange("");
		onDateBeforeChange("");
		// Subject patterns and body keywords are no longer user-editable (see the
		// Order Emails / Contents steps below) — they stay applied automatically,
		// so "Reset" must not wipe them out from under the user. Only clear the
		// fields that are still visibly editable.
		excluded.forEach(onRemoveExcluded);
		setShowSummary(false);
		setDir("right");
		setStep(0);
	};

	// Subject/keyword steps are informational now (no chips shown), so they
	// never carry a step count — only the still-editable steps do.
	const stepCounts = [(fromSender ? 1 : 0) + (dateAfter ? 1 : 0) + (dateBefore ? 1 : 0), 0, 0, excluded.length];

	const totalActive = stepCounts.reduce((a, b) => a + b, 0);
	const progressPct = showSummary ? 100 : Math.round((step / (STEPS.length - 1)) * 100);

	const panelClass = `sw-step-panel sw-step-panel--in-${dir}`;

	return (
		<div className="sw-root">
			{/* ── Header ── */}
			<div className="sw-header">
				<div className="sw-header-row">
					<h2 className="sw-title">Email Search</h2>
					<button className="sw-reset-btn" onClick={handleClearAll}>
						Reset
					</button>
				</div>
				<p className="sw-subtitle">
					Clothing purchase confirmations
					{totalActive > 0 && ` · ${totalActive} filter${totalActive > 1 ? "s" : ""}`}
				</p>

				{/* Step dots */}
				<div className="sw-steps">
					{STEPS.map((s, i) => {
						const isDone = i < step || showSummary;
						const isActive = i === step && !showSummary;
						const count = stepCounts[i];

						let dotClass = "sw-step-dot ";
						dotClass += isDone ? "sw-step-dot--done" : isActive ? "sw-step-dot--active" : "sw-step-dot--idle";

						let labelClass = "sw-step-label ";
						labelClass += isDone ? "sw-step-label--done" : isActive ? "sw-step-label--active" : "";

						return (
							<div key={s.id} className="sw-step-item">
								<button className="sw-step-btn" onClick={() => !showSummary && go(i)}>
									<div className={dotClass}>
										{isDone ? (
											<span className="sw-step-dot-icon sw-step-dot-icon--check">
												<Check size={14} />
											</span>
										) : (
											<span className="sw-step-dot-icon">
												<s.Icon size={13} />
											</span>
										)}
									</div>
									<span className={labelClass}>
										{s.label}
										{count > 0 && <span className="sw-step-count">·{count}</span>}
									</span>
								</button>
								{i < STEPS.length - 1 && (
									<div className={`sw-step-connector${isDone ? " sw-step-connector--done" : ""}`} />
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Progress bar */}
			<div className="sw-progress-track">
				<div className="sw-progress-fill" style={{ width: `${progressPct}%` }} />
			</div>

			{/* ── Content ── */}
			<div className="sw-content">
				{/* Summary */}
				{showSummary && (
					<div key={`summary-${panelKey}`} className="sw-summary">
						<p className="sw-panel-hint">Your search is ready</p>
						{[
							{ k: "From sender", v: fromSender || "Any", dim: !fromSender },
							{
								k: "Date range",
								v: dateAfter || dateBefore ? `${dateAfter || "–"} → ${dateBefore || "–"}` : "Any time",
								dim: !dateAfter && !dateBefore,
							},
							{ k: "Order emails", v: "Matched automatically", dim: false },
							{ k: "Email contents", v: "Scanned automatically", dim: false },
							{
								k: "Senders to skip",
								v: excluded.length ? `${excluded.length} senders` : "None",
								dim: !excluded.length,
							},
						].map((row) => (
							<div className="sw-summary-row" key={row.k}>
								<span className="sw-summary-key">{row.k}</span>
								<span className={`sw-summary-val${row.dim ? " sw-summary-val--dim" : ""}`}>{row.v}</span>
							</div>
						))}
					</div>
				)}

				{/* Step 0 — Sender & Dates */}
				{!showSummary && step === 0 && (
					<div key={`0-${panelKey}`} className={panelClass}>
						<p className="sw-panel-hint">Who sent the email?</p>

						<div className="sw-input-group">
							<label className="sw-label">From sender</label>
							<input
								className="sw-input"
								type="text"
								value={fromSender}
								onChange={(e) => onFromSenderChange(e.target.value)}
								placeholder="E.g. orders@zara.com"
								autoComplete="off"
							/>
						</div>

						<div className="sw-date-grid">
							<div className="sw-input-group">
								<label className="sw-label">Received after</label>
								<input
									className="sw-input"
									type="date"
									value={dateAfter}
									onChange={(e) => onDateAfterChange(e.target.value)}
								/>
							</div>
							<div className="sw-input-group">
								<label className="sw-label">Received before</label>
								<input
									className="sw-input"
									type="date"
									value={dateBefore}
									onChange={(e) => onDateBeforeChange(e.target.value)}
								/>
							</div>
						</div>
					</div>
				)}

				{/* Steps 1 & 2 — subject-pattern and body-keyword editing are hidden for
				    now: engineer-speak to shoppers, and the pre-seeded ~16-entry chip
				    list isn't something a user created or expects to manage. `subjects`/
				    `keywords` still flow into buildApiQuery exactly as before via
				    AdvancedSearchUI's seeded state, so hiding this UI does not change
				    what actually gets searched. Revisit with a more thoughtful
				    (shopper-facing) way to expose this later — see the commented
				    TagInput below for the prior editable UI. */}
				{!showSummary && step === 1 && (
					<div key={`1-${panelKey}`} className={panelClass}>
						<p className="sw-panel-hint">
							We automatically look for common order-confirmation subject lines, like "Order Confirmation" or
							"Your order has shipped" — no setup needed here.
						</p>
						{/* <TagInput
							tags={subjects}
							onAdd={onAddSubject}
							onRemove={onRemoveSubject}
							placeholder="Add subject pattern…"
							variant="sky"
						/> */}
					</div>
				)}

				{!showSummary && step === 2 && (
					<div key={`2-${panelKey}`} className={panelClass}>
						<p className="sw-panel-hint">
							We also scan each email for purchase details, like receipts, invoices, and order summaries — this
							happens automatically too.
						</p>
						{/* <TagInput
							tags={keywords}
							onAdd={onAddKeyword}
							onRemove={onRemoveKeyword}
							placeholder="Add body keyword…"
							variant="violet"
						/> */}
					</div>
				)}

				{/* Step 3 — Exclude */}
				{!showSummary && step === 3 && (
					<div key={`3-${panelKey}`} className={panelClass}>
						<p className="sw-panel-hint">Skip emails from these senders</p>
						<TagInput
							tags={excluded}
							onAdd={onAddExcluded}
							onRemove={onRemoveExcluded}
							placeholder="E.g. noreply@uber.com"
							variant="rose"
						/>
					</div>
				)}
			</div>

			{/* ── Footer ── */}
			<div className="sw-footer">
				{showSummary ? (
					<>
						{/* "New Search" vs "Filter Existing" was a fetch-vs-filter implementation
						    detail no shopper can reason about. A single Search button now picks
						    the mode automatically: filter the already-cached results when we have
						    them (faster, no API call), otherwise run a fresh Gmail search — the
						    same choice a savvy user would make manually. Old two-button UI kept
						    below, commented, in case a more explicit choice is wanted later. */}
						<div className="sw-footer-row">
							<button
								className="sw-btn sw-btn--icon"
								onClick={() => {
									setShowSummary(false);
									setDir("left");
								}}
								disabled={loading}
							>
								<ArrowLeft size={16} />
							</button>
							<button
								className="sw-btn sw-btn--success"
								onClick={() => onSearch(cachedCount > 0 ? "filter" : "fetch")}
								disabled={loading}
							>
								<Search size={14} />
								{loading ? "Searching..." : "Search"}
							</button>
						</div>
						{/*
						<button
							className="sw-btn sw-btn--ghost sw-btn--full"
							onClick={() => onSearch("filter")}
							disabled={loading || cachedCount === 0}
						>
							{loading ? "Filtering..." : `Filter Existing (${cachedCount})`}
						</button>
						*/}
					</>
				) : (
					<div className="sw-footer-row">
						{step > 0 && (
							<button className="sw-btn sw-btn--icon" onClick={() => go(step - 1)} disabled={loading}>
								<ArrowLeft size={16} />
							</button>
						)}
						{step < STEPS.length - 1 ? (
							<button className="sw-btn sw-btn--primary" onClick={() => go(step + 1)} disabled={loading}>
								Next
								<ArrowRight size={14} />
							</button>
						) : (
							<button className="sw-btn sw-btn--success" onClick={() => setShowSummary(true)} disabled={loading}>
								<Check size={14} />
								Review
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
