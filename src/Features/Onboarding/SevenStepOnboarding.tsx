import { useState, useEffect } from "react";
import {
	ChevronRight,
	ChevronLeft,
	Search,
	Check,
	Plus,
	Sparkles,
	Download,
	LayoutGrid,
	Scissors,
	Activity,
	ArrowLeft,
	SkipBack,
	FileDown,
	FileUp,
	X,
} from "lucide-react";
import "./SevenStepsOnboarding.css";

// ─── Step 1: App menu — Import Gmail highlighted ────────────────────────────────

function Step1Demo() {
	const [tapped, setTapped] = useState(false);
	useEffect(() => {
		const t = setTimeout(() => setTapped(true), 1000);
		return () => clearTimeout(t);
	}, []);

	const menuItems = [
		{ icon: Plus, label: "Add Item" },
		{ icon: LayoutGrid, label: "View All" },
		{ icon: Download, label: "Import Gmail", highlight: true },
		{ icon: FileDown, label: "Download Closet" },
		{ icon: FileUp, label: "Upload Closet" },
		{ icon: Scissors, label: "Fabric Guide" },
		{ icon: Activity, label: "Fiber Journey" },
		{ icon: SkipBack, label: "Back to Carousel" },
	];

	return (
		<div className="ob-demo-shell ob-menu">
			{menuItems.map(({ icon: Icon, label, highlight }) => {
				let itemClass = "ob-menu-item";
				if (highlight && tapped) itemClass += " ob-menu-item--tapped";
				else if (highlight) itemClass += " ob-menu-item--highlight";
				return (
					<div key={label} className={itemClass}>
						<Icon className="ob-menu-icon" />
						<span className="ob-menu-label">{label}</span>
					</div>
				);
			})}
		</div>
	);
}

// ─── Step 2: Email list ─────────────────────────────────────────────────────────

const emails = [
	{ from: "POSHMARK", subject: "YOUR POSHMARK ORDER CONFIRMATI…", preview: "HELLO ARIANNA! THANK YOU FOR SHOPPING ON P…" },
	{ from: "ZARA", subject: "THANKS FOR YOUR PURCHASE", preview: "THANK YOU FOR YOUR PURCHASE ORDER NO. 5431…" },
	{ from: "ZARA", subject: "THANKS FOR YOUR PURCHASE", preview: "THANK YOU FOR YOUR PURCHASE ORDER NO. 546…" },
	{ from: "POSHMARK", subject: "YOUR POSHMARK ORDER CONFIRMATI…", preview: "HELLO ARIANNA! THANK YOU FOR SHOPPING ON P…" },
];

function Step2Demo() {
	const [visibleCount, setVisibleCount] = useState(0);
	const [checked, setChecked] = useState<Set<number>>(new Set([0]));

	useEffect(() => {
		const timers = emails.map((_, i) => setTimeout(() => setVisibleCount(i + 1), 200 + i * 300));
		return () => timers.forEach(clearTimeout);
	}, []);

	const toggle = (i: number) =>
		setChecked((prev) => {
			const next = new Set(prev);
			next.has(i) ? next.delete(i) : next.add(i);
			return next;
		});

	return (
		<div className="ob-demo-shell ob-email-wrap">
			<div className="ob-email-header">Found 100 emails</div>
			<div className="ob-email-list">
				{emails.map((email, i) => (
					<button
						key={i}
						onClick={() => toggle(i)}
						className={`ob-email-row${checked.has(i) ? " ob-email-row--checked" : ""}`}
						style={{
							opacity: i < visibleCount ? 1 : 0,
							transform: i < visibleCount ? "none" : "translateY(6px)",
						}}
					>
						<div className={`ob-checkbox${checked.has(i) ? " ob-checkbox--checked" : ""}`}>
							{checked.has(i) && <Check style={{ width: 10, height: 10, color: "#fff" }} />}
						</div>
						<div className="ob-email-body">
							<div className="ob-email-sender">{email.from}</div>
							<div className="ob-email-subject">{email.subject}</div>
							<div className="ob-email-preview">{email.preview}</div>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}

// ─── Step 3: Parsed items ───────────────────────────────────────────────────────

const parsedItems = [
	{ name: "Sleeveless Top", price: "$14.90", size: "S", color: "Brown", bg: "#78716c" },
	{ name: "Rib Sleeveless Top", price: "$12.90", size: "S", color: "Blue / White", bg: "#475569" },
	{ name: "Cotton Modal Tan…", price: "$12.90", size: "S", color: "Tan", bg: "#92400e" },
	{ name: "Polyamide Blend S…", price: "$29.90", size: "S", color: "Raspberry", bg: "#9f1239" },
	{ name: "Cotton Sleeveless…", price: "$12.90", size: "M", color: "White", bg: "#d6d3d1" },
];

function Step3Demo() {
	const [imported, setImported] = useState<Set<number>>(new Set());
	const [allDone, setAllDone] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setAllDone(true), 2400);
		return () => clearTimeout(t);
	}, []);

	const importItem = (i: number) => setImported((p) => new Set([...p, i]));

	return (
		<div className="ob-demo-shell ob-items-wrap">
			<div className="ob-items-scroll">
				<div className="ob-items-header">Detected 5 Items</div>
				{parsedItems.map((item, i) => (
					<div key={item.name} className={`ob-item-row${imported.has(i) ? " ob-item-row--imported" : ""}`}>
						<div className="ob-item-thumb" style={{ background: item.bg }}>
							<div className="ob-item-thumb-inner" />
						</div>
						<div className="ob-item-info">
							<div className="ob-item-name">{item.name}</div>
							<div className="ob-item-price">
								{item.price} <span className="ob-item-size">Size: {item.size}</span>
							</div>
							<div className="ob-item-color">Color: {item.color}</div>
						</div>
						<button onClick={() => importItem(i)} className={`ob-import-btn${imported.has(i) ? " ob-import-btn--done" : ""}`}>
							{imported.has(i) ? "✓" : "Import"}
						</button>
					</div>
				))}
			</div>
			<div className="ob-import-all-bar">
				<button
					onClick={() => {
						setImported(new Set(parsedItems.map((_, i) => i)));
						setAllDone(true);
					}}
					className={`ob-import-all-btn${allDone ? " ob-import-all-btn--done" : ""}`}
				>
					{allDone ? `✓ All ${parsedItems.length} items imported` : `Import All ${parsedItems.length} Items`}
				</button>
			</div>
		</div>
	);
}

// ─── Step 4: Review form ────────────────────────────────────────────────────────

const reviewFields = [
	{ key: "name", label: "NAME", value: "SLEEVELESS TOP" },
	{ key: "cat", label: "CATEGORY", value: "Tops" },
	{ key: "color", label: "COLOR", value: "Brown" },
	{ key: "size", label: "SIZE", value: "S" },
	{ key: "brand", label: "BRAND", value: "Zara" },
	{ key: "price", label: "PRICE", value: "$14.90" },
];

function Step4Demo() {
	const [editing, setEditing] = useState<string | null>(null);

	return (
		<div className="ob-demo-shell ob-form-wrap">
			<div className="ob-form-nav">
				<button className="ob-form-back">
					<ArrowLeft style={{ width: 12, height: 12 }} />
					Return to Email Preview
				</button>
				<span className="ob-form-counter">Item 1 of 5</span>
				<button className="ob-form-close">
					<X style={{ width: 14, height: 14 }} />
				</button>
			</div>

			<div className="ob-form-thumb-row">
				<div className="ob-form-thumb">
					<div className="ob-form-thumb-inner" />
				</div>
				<span className="ob-form-hint">Tap a field to edit</span>
			</div>

			<div className="ob-fields-grid">
				{reviewFields.map((f) => {
					const isEditing = editing === f.key;
					return (
						<button
							key={f.key}
							onClick={() => setEditing(isEditing ? null : f.key)}
							className={`ob-field-btn${isEditing ? " ob-field-btn--editing" : ""}`}
						>
							<div className="ob-caps">{f.label}</div>
							<div className={`ob-field-value${isEditing ? " ob-field-value--editing" : ""}`}>{f.value}</div>
						</button>
					);
				})}
			</div>

			<div className="ob-form-actions">
				<button className="ob-add-btn">Add to Closet</button>
				<button className="ob-skip-item-btn">Do NOT Add This Item</button>
			</div>
		</div>
	);
}

// ─── Step 5: 9-step manual form ─────────────────────────────────────────────────

const formStepLabels = ["Photo", "Details", "Category", "Brand", "Size", "Color", "Material", "Price", "Care"];

function Step5Demo() {
	const [step, setStep] = useState(0);
	useEffect(() => {
		const t = setInterval(() => setStep((s) => (s + 1) % formStepLabels.length), 800);
		return () => clearInterval(t);
	}, []);

	const bodySlot = step % 3;

	return (
		<div className="ob-demo-shell ob-manual-wrap">
			<div className="ob-pills">
				{formStepLabels.map((s, i) => {
					let cls = "ob-pill";
					if (i === step) cls += " ob-pill--active";
					else if (i < step) cls += " ob-pill--done";
					return (
						<div key={s} className={cls}>
							{s}
						</div>
					);
				})}
			</div>

			<div className="ob-manual-body">
				{bodySlot === 0 && (
					<div className="ob-photo-drop">
						<div className="ob-photo-drop-inner">
							<Plus style={{ width: 32, height: 32 }} />
							<span className="ob-photo-label">Add photo</span>
						</div>
					</div>
				)}
				{bodySlot === 1 && (
					<div className="ob-field-group">
						<div>
							<div className="ob-caps">ITEM NAME</div>
							<div className="ob-fake-input" style={{ marginTop: 4 }}>
								White Oxford Shirt
							</div>
						</div>
						<div>
							<div className="ob-caps">NOTES</div>
							<div className="ob-fake-textarea" style={{ marginTop: 4 }}>
								Bought for work…
							</div>
						</div>
					</div>
				)}
				{bodySlot === 2 && (
					<div className="ob-field-group">
						<div className="ob-caps">CATEGORY</div>
						<div className="ob-cat-options">
							{["Tops", "Bottoms", "Outerwear", "Accessories"].map((c, ci) => (
								<div key={c} className={`ob-cat-option${ci === 0 ? " ob-cat-option--active" : ""}`}>
									{c}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

// ─── Step 6: Search & filter ────────────────────────────────────────────────────

const closetItems = [
	{ label: "Sleeveless Top", bg: "#78716c" },
	{ label: "Wide Leg Jeans", bg: "#334155" },
	{ label: "Linen Blazer", bg: "#451a03" },
	{ label: "Slip Dress", bg: "#881337" },
	{ label: "Cardigan", bg: "#404040" },
	{ label: "Trousers", bg: "#3f3f46" },
];

function Step6Demo() {
	const filters = ["Cotton", "Under $100", "Tops"];
	return (
		<div className="ob-demo-shell ob-search-wrap">
			<div className="ob-search-bar">
				<Search className="ob-search-icon" />
				<span className="ob-search-text">summer top</span>
				<span className="ob-search-count">4 results</span>
			</div>
			<div className="ob-filter-chips">
				{filters.map((f) => (
					<div key={f} className="ob-filter-chip">
						{f}
						<X className="ob-chip-x" />
					</div>
				))}
			</div>
			<div className="ob-closet-grid">
				{closetItems.map((item) => (
					<div key={item.label} className="ob-closet-card" style={{ background: item.bg }}>
						<div className="ob-closet-card-body">
							<div className="ob-closet-card-icon" />
						</div>
						<div className="ob-closet-card-label">{item.label}</div>
					</div>
				))}
			</div>
		</div>
	);
}

// ─── Step 7: Fabric guide ───────────────────────────────────────────────────────

const fabrics = [
	{
		name: "Cotton",
		care: "Machine wash cold · Tumble dry low",
		bars: [
			{ label: "Washability", pct: 90 },
			{ label: "Durability", pct: 80 },
		],
		fill: "#fbbf24",
	},
	{
		name: "Polyester",
		care: "Machine wash warm · Avoid high heat",
		bars: [
			{ label: "Washability", pct: 95 },
			{ label: "Durability", pct: 95 },
		],
		fill: "#60a5fa",
	},
	{
		name: "Silk",
		care: "Hand wash only · Do not tumble dry",
		bars: [
			{ label: "Washability", pct: 30 },
			{ label: "Durability", pct: 40 },
		],
		fill: "#c084fc",
	},
];

function Step7Demo() {
	const [active, setActive] = useState(0);
	const fabric = fabrics[active];

	return (
		<div className="ob-demo-shell ob-fabric-wrap">
			<div className="ob-fabric-tabs">
				{fabrics.map((f, i) => (
					<button
						key={f.name}
						onClick={() => setActive(i)}
						className={`ob-fabric-tab${i === active ? " ob-fabric-tab--active" : ""}`}
					>
						{f.name}
					</button>
				))}
			</div>

			<div className="ob-fabric-card">
				<div className="ob-fabric-section">
					<div className="ob-caps">FABRIC</div>
					<div className="ob-bar-track">
						<div className="ob-bar-fill" style={{ width: "80%", background: fabric.fill }} />
					</div>
					<div className="ob-bar-legend">
						<span>80% {fabric.name}</span>
						<span>20% Blend</span>
					</div>
				</div>

				<div className="ob-fabric-section">
					<div className="ob-caps">CARE</div>
					<div className="ob-care-text">{fabric.care}</div>
				</div>

				<div className="ob-mini-bars">
					{fabric.bars.map((b) => (
						<div key={b.label} className="ob-mini-bar-row">
							<div className="ob-mini-bar-header">
								<span>{b.label}</span>
								<span>{b.pct}%</span>
							</div>
							<div className="ob-mini-track">
								<div className="ob-mini-fill" style={{ width: `${b.pct}%`, background: fabric.fill }} />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// ─── Step definitions ───────────────────────────────────────────────────────────

type StepDef = {
	badge: string;
	group: string;
	groupStyle: React.CSSProperties;
	title: string;
	description: string;
	demo: React.ReactNode;
};

const STEPS: StepDef[] = [
	{
		badge: "Step 1 of 7",
		group: "Email Import",
		groupStyle: { background: "rgba(19,17,146,0.30)", color: "rgb(199,210,254)", border: "1px solid rgba(199,210,254,0.25)" },
		title: "Connect your Gmail",
		description: "Tap 'Import Gmail' from the main menu. Closet Inventory reads only order confirmation emails — nothing personal, never.",
		demo: <Step1Demo />,
	},
	{
		badge: "Step 2 of 7",
		group: "Email Import",
		groupStyle: { background: "rgba(19,17,146,0.30)", color: "rgb(199,210,254)", border: "1px solid rgba(199,210,254,0.25)" },
		title: "We find your purchases",
		description:
			"The app scans your inbox and surfaces order confirmations. Found 100 emails? You'll see them all listed here ready to select.",
		demo: <Step2Demo />,
	},
	{
		badge: "Step 3 of 7",
		group: "Email Import",
		groupStyle: { background: "rgba(19,17,146,0.30)", color: "rgb(199,210,254)", border: "1px solid rgba(199,210,254,0.25)" },
		title: "Pick items to import",
		description:
			"Import one item at a time or hit 'Import All' to bring everything in at once. Each order is parsed into individual garments.",
		demo: <Step3Demo />,
	},
	{
		badge: "Step 4 of 7",
		group: "Email Import",
		groupStyle: { background: "rgba(19,17,146,0.30)", color: "rgb(199,210,254)", border: "1px solid rgba(199,210,254,0.25)" },
		title: "Review the parsed details",
		description:
			"AI extracts name, category, color, size, brand, and price from each order. Tap any field to correct it before adding to your closet.",
		demo: <Step4Demo />,
	},
	{
		badge: "Step 5 of 7",
		group: "Manual Entry",
		groupStyle: { background: "rgba(245,158,11,0.15)", color: "rgb(251,191,36)", border: "1px solid rgba(245,158,11,0.2)" },
		title: "Add items manually too",
		description: "Use the 9-step guided form for items you own but didn't buy online — snap a photo, fill what you know, and you're done.",
		demo: <Step5Demo />,
	},
	{
		badge: "Step 6 of 7",
		group: "Search & Filter",
		groupStyle: { background: "rgba(168,85,247,0.15)", color: "rgb(192,132,252)", border: "1px solid rgba(168,85,247,0.2)" },
		title: "Find anything instantly",
		description:
			"Fuzzy search by name, brand, or material. Stack filters — color, category, price — to narrow the exact piece you're looking for.",
		demo: <Step6Demo />,
	},
	{
		badge: "Step 7 of 7",
		group: "Fabric Guide",
		groupStyle: { background: "rgba(34,197,94,0.15)", color: "rgb(74,222,128)", border: "1px solid rgba(34,197,94,0.2)" },
		title: "Know how to care for it",
		description: "The Fabric Guide shows washability, durability, and exact care instructions for every material in your closet.",
		demo: <Step7Demo />,
	},
];

// ─── Main component ─────────────────────────────────────────────────────────────

export function OnboardingExpanded({ onComplete }: { onComplete: () => void }) {
	const [currentStep, setCurrentStep] = useState(0);

	const step = STEPS[currentStep];
	const isFirst = currentStep === 0;
	const isLast = currentStep === STEPS.length - 1;

	const goTo = (next: number) => setCurrentStep(next);

	return (
		<div className="ob-root ob-page">
			<div className="ob-container">
				{/* Progress */}
				<div className="ob-progress">
					{STEPS.map((_, i) => {
						let cls = "ob-progress-seg";
						if (i < currentStep) cls += " ob-progress-seg--done";
						else if (i === currentStep) cls += " ob-progress-seg--active";
						return <div key={i} className={cls} />;
					})}
				</div>

				{/* Demo — keyed so animations restart on step change */}
				<div key={currentStep}>{step.demo}</div>

				{/* Content */}
				<div className="ob-content">
					<div className="ob-badges">
						<span className="ob-group-badge" style={step.groupStyle}>
							{step.group}
						</span>
						<span className="ob-step-label">{step.badge}</span>
					</div>
					<h2 className="ob-title">{step.title}</h2>
					<p className="ob-description">{step.description}</p>
				</div>

				{/* Navigation */}
				<div className="ob-nav">
					<button
						onClick={() => goTo(currentStep - 1)}
						disabled={isFirst}
						className={`ob-back-btn${isFirst ? " ob-back-btn--hidden" : ""}`}
					>
						<ChevronLeft style={{ width: 16, height: 16 }} />
						Back
					</button>

					<div className="ob-nav-right">
						{!isLast && (
							<button onClick={onComplete} className="ob-skip-btn">
								Skip all
							</button>
						)}
						<button onClick={() => (isLast ? onComplete() : goTo(currentStep + 1))} className="ob-next-btn">
							{isLast ? "Go to my closet" : "Next"}
							{isLast ? (
								<Sparkles style={{ width: 16, height: 16 }} />
							) : (
								<ChevronRight style={{ width: 16, height: 16 }} />
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
