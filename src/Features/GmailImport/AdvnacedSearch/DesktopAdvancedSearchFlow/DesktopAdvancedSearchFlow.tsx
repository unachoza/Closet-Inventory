import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { X, Plus, Search, Check, User, Tag, SlidersHorizontal, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import "./DesktopAdvancedSearchFlow.css";

const DEFAULT_SUBJECTS = [
	"Thank you for your purchase",
	"Thanks for your purchase",
	"Order Confirmation",
	"Your order has shipped",
	"Receipt for your purchase",
];
const DEFAULT_KEYWORDS = [
	"order",
	"receipt",
	"purchase",
	"shipping confirmation",
	"invoice",
	"Your Order Summary",
	"package has been shipped",
	"order is being processed",
	"See your order details",
	"Check order Status",
	"Order Subtotal",
];

const STEPS = [
	{ id: 0, label: "Sender & Dates", desc: "Who sent it and when", Icon: User },
	{ id: 1, label: "Subject Patterns", desc: "Subject line keywords", Icon: Tag },
	{ id: 2, label: "Body Keywords", desc: "Words in the email body", Icon: SlidersHorizontal },
	{ id: 3, label: "Exclude Senders", desc: "Senders to skip", Icon: EyeOff },
];

function TagChip({ label, onRemove, variant }: { label: string; onRemove: () => void; variant: "sky" | "violet" | "rose" }) {
	return (
		<span className={`sw-tag sw-tag--${variant}`}>
			<span className="sw-tag-text">{label}</span>
			<button className="sw-tag-remove" onClick={onRemove}>
				<X size={11} />
			</button>
		</span>
	);
}

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
	const commit = () => {
		const t = value.trim();
		if (t && !tags.includes(t)) {
			onAdd(t);
			setValue("");
		}
	};
	return (
		<>
			<div className="sw-input-row">
				<input
					className="sw-input"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
						if (e.key === "Enter") {
							e.preventDefault();
							commit();
						}
						if (e.key === "Backspace" && !value && tags.length > 0) onRemove(tags[tags.length - 1]);
					}}
					placeholder={placeholder}
					autoComplete="off"
				/>
				<button className="sw-add-btn" onClick={commit} disabled={!value.trim()}>
					<Plus size={15} />
				</button>
			</div>
			{tags.length > 0 && (
				<div className="sw-tags" style={{ marginTop: 12 }}>
					{tags.map((t) => (
						<TagChip key={t} label={t} onRemove={() => onRemove(t)} variant={variant} />
					))}
				</div>
			)}
		</>
	);
}

interface DesktopSearchSplitPanelProps {
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

export function DesktopSearchSplitPanel({
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
}: DesktopSearchSplitPanelProps) {
	const [step, setStep] = useState(0);
	const [dir, setDir] = useState<"right" | "left">("right");
	const [showSummary, setShowSummary] = useState(false);
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
		subjects.forEach(onRemoveSubject);
		keywords.forEach(onRemoveKeyword);
		excluded.forEach(onRemoveExcluded);
		setShowSummary(false);
		setStep(0);
	};

	const stepCounts = [(fromSender ? 1 : 0) + (dateAfter ? 1 : 0) + (dateBefore ? 1 : 0), subjects.length, keywords.length, excluded.length];

	const panelClass = `sw-step-panel sw-step-panel--in-${dir}`;

	return (
		<div className="ssp-root">
			{/* ── Left sidebar ── */}
			<aside className="ssp-sidebar">
				<div className="ssp-sidebar-header">
					<div className="ssp-sidebar-icon">
						<Search size={16} />
					</div>
					<div>
						<p className="ssp-sidebar-title">Email Search</p>
						<p className="ssp-sidebar-sub">Clothing purchases</p>
					</div>
				</div>

				<nav className="ssp-nav">
					{STEPS.map((s, i) => {
						const isDone = i < step || showSummary;
						const isActive = i === step && !showSummary;
						const count = stepCounts[i];
						return (
							<button
								key={s.id}
								className={`ssp-nav-item${isActive ? " ssp-nav-item--active" : ""}${isDone ? " ssp-nav-item--done" : ""}`}
								onClick={() => {
									if (!showSummary) go(i);
									else {
										setShowSummary(false);
										go(i);
									}
								}}
							>
								<div
									className={`ssp-nav-dot${isActive ? " ssp-nav-dot--active" : ""}${isDone ? " ssp-nav-dot--done" : ""}`}
								>
									{isDone ? <Check size={12} /> : <s.Icon size={12} />}
								</div>
								<div className="ssp-nav-text">
									<span className="ssp-nav-label">{s.label}</span>
									<span className="ssp-nav-desc">{s.desc}</span>
								</div>
								{count > 0 && <span className="ssp-nav-badge">{count}</span>}
							</button>
						);
					})}
				</nav>

				<div className="ssp-sidebar-footer">
					<button onClick={handleClearAll} className="ssp-clear-btn" disabled={loading}>
						Clear all filters
					</button>
				</div>
			</aside>

			{/* ── Right content ── */}
			<div className="ssp-main">
				{/* Top bar */}
				<div className="ssp-topbar">
					<div>
						<h2 className="ssp-topbar-title">{showSummary ? "Review & Search" : STEPS[step].label}</h2>
						<p className="ssp-topbar-hint">
							{showSummary ? "Confirm your filters before running the search" : STEPS[step].desc}
						</p>
					</div>
					{/* Progress dots */}
					<div className="ssp-dots">
						{STEPS.map((_, i) => (
							<div
								key={i}
								className={`ssp-dot${i < step || showSummary ? " ssp-dot--done" : i === step && !showSummary ? " ssp-dot--active" : ""}`}
							/>
						))}
					</div>
				</div>

				{/* Content */}
				<div className="ssp-content">
					{showSummary && (
						<div key={`sum-${panelKey}`} className="sw-summary">
							<p className="sw-panel-hint">Your search is ready to run</p>
							{[
								{ k: "From sender", v: fromSender || "Any", dim: !fromSender },
								{
									k: "Date range",
									v: dateAfter || dateBefore ? `${dateAfter || "–"} → ${dateBefore || "–"}` : "Any time",
									dim: !dateAfter && !dateBefore,
								},
								{
									k: "Subject patterns",
									v: subjects.length ? `${subjects.length} patterns` : "None",
									dim: !subjects.length,
								},
								{
									k: "Body keywords",
									v: keywords.length ? `${keywords.length} keywords` : "None",
									dim: !keywords.length,
								},
								{
									k: "Excluded senders",
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

					{!showSummary && step === 0 && (
						<div key={`0-${panelKey}`} className={panelClass}>
							<div className="ssp-field-group">
								<label className="sw-label">From sender</label>
								<input
									className="sw-input"
									type="text"
									value={fromSender}
									onChange={(e) => onFromSenderChange(e.target.value)}
									placeholder="E.g. orders@zara.com"
									autoComplete="off"
									disabled={loading}
								/>
							</div>
							<div className="ssp-date-row">
								<div className="ssp-field-group">
									<label className="sw-label">Received after</label>
									<input
										className="sw-input"
										type="date"
										value={dateAfter}
										onChange={(e) => onDateAfterChange(e.target.value)}
										disabled={loading}
									/>
								</div>
								<div className="ssp-field-group">
									<label className="sw-label">Received before</label>
									<input
										className="sw-input"
										type="date"
										value={dateBefore}
										onChange={(e) => onDateBeforeChange(e.target.value)}
										disabled={loading}
									/>
								</div>
							</div>
						</div>
					)}

					{!showSummary && step === 1 && (
						<div key={`1-${panelKey}`} className={panelClass}>
							<TagInput
								tags={subjects}
								onAdd={onAddSubject}
								onRemove={onRemoveSubject}
								placeholder="Add subject pattern…"
								variant="sky"
							/>
						</div>
					)}

					{!showSummary && step === 2 && (
						<div key={`2-${panelKey}`} className={panelClass}>
							<TagInput
								tags={keywords}
								onAdd={onAddKeyword}
								onRemove={onRemoveKeyword}
								placeholder="Add body keyword…"
								variant="violet"
							/>
						</div>
					)}

					{!showSummary && step === 3 && (
						<div key={`3-${panelKey}`} className={panelClass}>
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

				{/* Footer actions */}
				<div className="ssp-actions">
					{showSummary ? (
						<>
							<button
								className="ssp-btn ssp-btn--ghost"
								onClick={() => {
									setShowSummary(false);
									setDir("left");
								}}
								disabled={loading}
							>
								<ArrowLeft size={14} /> Back
							</button>
							<div style={{ display: "flex", gap: 8, flex: 1, justifyContent: "flex-end" }}>
								<button
									className="ssp-btn ssp-btn--secondary"
									onClick={() => onSearch("filter")}
									disabled={loading || cachedCount === 0}
								>
									{loading ? "Filtering..." : `Filter Existing (${cachedCount})`}
								</button>
								<button className="ssp-btn ssp-btn--primary" onClick={() => onSearch("fetch")} disabled={loading}>
									<Search size={14} /> {loading ? "Searching..." : "New Search"}
								</button>
							</div>
						</>
					) : (
						<>
							{step > 0 && (
								<button className="ssp-btn ssp-btn--ghost" onClick={() => go(step - 1)} disabled={loading}>
									<ArrowLeft size={14} /> Back
								</button>
							)}
							<div style={{ flex: 1 }} />
							{step < STEPS.length - 1 ? (
								<button className="ssp-btn ssp-btn--primary" onClick={() => go(step + 1)} disabled={loading}>
									Next <ArrowRight size={14} />
								</button>
							) : (
								<button className="ssp-btn ssp-btn--success" onClick={() => setShowSummary(true)} disabled={loading}>
									<Check size={14} /> Review
								</button>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
