import { useState, useEffect, useReducer } from "react";
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
	X,
	Menu,
} from "lucide-react";
import "./OnboardingSteps.css";
import logo from "../../assets/hangerLogo.png";
import { carouselCategories } from "../../utils/constants";
import "../Carousel/Carousel.css";

// ─── Step 0: Welcome ────────────────────────────────────────────────────────────

const welcomeFeatures = [
	{ dot: "var(--coral)", text: "Import from Gmail automatically" },
	{ dot: "var(--dot-teal)", text: "Learn fabric care for every item" },
	{ dot: "var(--dot-blue)", text: "Search & filter your whole closet" },
];

function WelcomeStepDemo() {
	return (
		<div className="ob-demo-shell ob-welcome-full">
			<div className="ob-welcome-glow" />
			<div className="ob-welcome-logo-wrap">
				<img src={logo} alt="Closet Inventory logo" className="ob-welcome-logo" />
			</div>
			<div className="ob-welcome-appname">Nothing To Wear</div>
			<div className="ob-welcome-tagline">A personal wardrobe management app</div>
			<div className="ob-welcome-feats">
				{welcomeFeatures.map((f) => (
					<div key={f.text} className="ob-welcome-feat">
						<div className="ob-welcome-feat-dot" style={{ background: f.dot }} />
						{f.text}
					</div>
				))}
			</div>
		</div>
	);
}

// ─── Step 1: App menu — Import Gmail highlighted ────────────────────────────────

function Step1Demo() {
	const [tapped, setTapped] = useState(false);
	const [pressing, setPressing] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);

	//mock user pressing hamburger for menu slide out and tap on Gmail Import
	useEffect(() => {
		const press = setTimeout(() => setPressing(true), 700);
		const release = setTimeout(() => setPressing(false), 1050);
		const open = setTimeout(() => setDrawerOpen(true), 1000);
		const tap = setTimeout(() => setTapped(true), 2400);
		return () => [press, release, open, tap].forEach(clearTimeout);
	}, []);

	const menuItems = [
		{ icon: LayoutGrid, label: "View All" },
		{ icon: Plus, label: "Add Item" },
		{ icon: Download, label: "Import Gmail", highlight: true },
		{ icon: FileDown, label: "Download Closet" },
		{ icon: Scissors, label: "Fabric Guide" },
		{ icon: Activity, label: "Fiber Journey" },
		{ icon: SkipBack, label: "Back to Carousel" },
	];

	return (
		<div className="ob-demo-shell ob-nav-demo">
			{/* Home screen behind the drawer */}
			<div className="ob-nav-topbar">
				<div className={`ob-nav-hamburger${pressing ? " ob-nav-hamburger--press" : ""}`}>
					<Menu size={18} />
					{pressing && <span className="ob-nav-tap" aria-hidden="true" />}
				</div>
				<span className="ob-nav-title">Nothing To Wear</span>
			</div>
			<div className="ob-nav-home">
				<div className="ob-nav-ghost-row">
					{carouselCategories.slice(1, 4).map(({ label, icon }) => {
						return (
							<div key={label} className=" ob-nav-ghost-tile clothes-card emoji">
								<img src={icon} alt={icon} className="carousel-icons" />
							</div>
						);
					})}
				</div>
			</div>

			{/* Slide-out drawer (mirrors the real NavBar drawer) */}
			<div className={`ob-nav-overlay${drawerOpen ? " ob-nav-overlay--show" : ""}`} aria-hidden="true" />
			<nav className={`ob-nav-drawer${drawerOpen ? " ob-nav-drawer--open" : ""}`} aria-label="Navigation menu">
				<div className="ob-nav-drawer-close">
					<X size={14} />
				</div>
				<div className="ob-nav-drawer-list">
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
			</nav>
		</div>
	);
}

// ─── Step 2: Email list ─────────────────────────────────────────────────────────

const emails = [
	{ from: "POSHMARK", subject: "YOUR POSHMARK ORDER CONFIRMATI…", preview: "HELLO ARIANNA! THANK YOU FOR SHOPPING ON P…" },
	{ from: "ZARA", subject: "THANKS FOR YOUR PURCHASE", preview: "THANK YOU FOR YOUR PURCHASE ORDER NO. 5431…" },
	{ from: "GAP", subject: "THANKS FOR YOUR PURCHASE", preview: "THANK YOU FOR YOUR PURCHASE ORDER NO. 546…" },
	{ from: "MACY'S", subject: "YOUR POSHMARK ORDER CONFIRMATI…", preview: "HELLO ARIANNA! THANK YOU FOR SHOPPING ON P…" },
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
			if (next.has(i)) next.delete(i);
			else next.add(i);
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
	{
		name: "Sleeveless Top",
		price: "$14.90",
		size: "S",
		color: "Brown",
		bg: "var(--garment-stone)",
		imgURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1781150747/Screenshot_2026-06-10_at_9.02.32_PM_ddjuk6.png",
	},
	{
		name: "Cotton Modal Tan…",
		price: "$12.90",
		size: "S",
		color: "Tan",
		bg: "var(--garment-amber-dark)",
		imgURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1781151252/Screenshot_2026-06-10_at_9.13.32_PM_elrnha.png",
	},
	{
		name: "Polyamide Blend S…",
		price: "$29.90",
		size: "S",
		color: "Raspberry",
		bg: "var(--garment-rose-dark)",
		imgURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1781150851/Screenshot_2026-06-10_at_9.06.54_PM_h3kjkd.png",
	},
	{
		name: "Cotton Sleeveless…",
		price: "$12.90",
		size: "M",
		color: "White",
		bg: "var(--garment-stone-light)",
		imgURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1781151106/Screenshot_2026-06-10_at_9.11.29_PM_nl3nxc.png",
	},
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
				<div className="ob-items-header">Detected 4 Items</div>
				{parsedItems.map((item, i) => (
					<div key={item.name} className={`ob-item-row${imported.has(i) ? " ob-item-row--imported" : ""}`}>
						<div className="ob-item-thumb" style={{ background: item.bg }}>
							<img className="ob-item-thumb-inner" src={item.imgURL} alt="clothing image" />
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

const NAME_TARGET = "Strappy Top";

type Step4State = {
	editing: string | null;
	autoEditName: boolean;
	typing: boolean;
	nameValue: string;
	addPulse: boolean;
};

type Step4Action =
	| { type: "START_EDIT" }
	| { type: "TYPE_CHAR"; value: string }
	| { type: "COMMIT_EDIT" }
	| { type: "PULSE_ADD" }
	| { type: "SET_EDITING"; field: string | null };

const step4Initial: Step4State = {
	editing: null,
	autoEditName: false,
	typing: false,
	nameValue: reviewFields[0].value,
	addPulse: false,
};

function step4Reducer(state: Step4State, action: Step4Action): Step4State {
	switch (action.type) {
		case "START_EDIT":
			return { ...state, autoEditName: true, typing: true, nameValue: "" };
		case "TYPE_CHAR":
			return { ...state, nameValue: action.value };
		case "COMMIT_EDIT":
			return { ...state, typing: false, autoEditName: false };
		case "PULSE_ADD":
			return { ...state, addPulse: true };
		case "SET_EDITING":
			return { ...state, editing: action.field };
	}
}

function Step4Demo() {
	const [state, dispatch] = useReducer(step4Reducer, step4Initial);
	const { editing, autoEditName, typing, nameValue, addPulse } = state;

	useEffect(() => {
		const timers: ReturnType<typeof setTimeout>[] = [];
		// 1. Tap the NAME field → highlight + clear, ready to retype.
		timers.push(setTimeout(() => dispatch({ type: "START_EDIT" }), 800));
		// 2. Type the corrected name one character at a time.
		const TYPE_START = 1100;
		const TYPE_MS = 90;
		[...NAME_TARGET].forEach((_, i) => {
			timers.push(setTimeout(() => dispatch({ type: "TYPE_CHAR", value: NAME_TARGET.slice(0, i + 1) }), TYPE_START + i * TYPE_MS));
		});
		const typedAt = TYPE_START + NAME_TARGET.length * TYPE_MS;
		// 3. Commit the edit (drop the highlight + cursor).
		timers.push(setTimeout(() => dispatch({ type: "COMMIT_EDIT" }), typedAt + 400));
		// 4. Pulse "Add to Closet" to point at the next action.
		timers.push(setTimeout(() => dispatch({ type: "PULSE_ADD" }), typedAt + 800));
		return () => timers.forEach(clearTimeout);
	}, []);

	return (
		<div className="ob-demo-shell ob-form-wrap">
			<div className="ob-form-nav">
				<button className="ob-form-back">
					<ArrowLeft style={{ width: 12, height: 12 }} />
					Return to Email Preview
				</button>
				<span className="ob-form-counter">Item 1 of 4</span>
				<button className="ob-form-close">
					<X style={{ width: 14, height: 14 }} />
				</button>
			</div>

			<div className="ob-form-thumb-row">
				<div className="ob-form-thumb">
					<img
						className="ob-item-thumb-inner"
						src="https://res.cloudinary.com/dh41vh9dx/image/upload/v1781150851/Screenshot_2026-06-10_at_9.07.20_PM_vvmgkb.png"
						alt="clothing image"
					/>
				</div>
				<span className="ob-form-hint">Tap a field to edit</span>
			</div>

			<div className="ob-fields-grid">
				{reviewFields.map((f) => {
					// The NAME field is driven by the auto-demo (or a manual tap); the rest stay tap-to-edit.
					const isEditing = f.key === "name" ? autoEditName || editing === "name" : editing === f.key;
					const value = f.key === "name" ? nameValue : f.value;
					const showCursor = f.key === "name" && typing;
					return (
						<button
							key={f.key}
							onClick={() => dispatch({ type: "SET_EDITING", field: editing === f.key ? null : f.key })}
							className={`ob-field-btn${isEditing ? " ob-field-btn--editing" : ""}`}
						>
							<div className="ob-caps">{f.label}</div>
							<div className={`ob-field-value${isEditing ? " ob-field-value--editing" : ""}`}>
								{value}
								{showCursor && <span className="ob-field-cursor" />}
							</div>
						</button>
					);
				})}
			</div>

			<div className="ob-form-actions">
				<button className="ob-skip-item-btn">Skip This Item</button>
				<button className={`ob-add-btn${addPulse ? " ob-add-btn--pulse" : ""}`}>Add to Closet</button>
			</div>
		</div>
	);
}

// ─── Step 5: guided manual form ─────────────────────────────────────────────────

const formStepLabels = ["Category", "Color", "Size", "Details", "Photo"];

// Option chips shown for the choice-style steps. Keyed by pill label.
const formStepOptions: Record<string, string[]> = {
	Category: ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Sleep", "Accessories"],
	Color: ["Black", "White", "Brown", "Blue", "Red", "Purple"],
	Size: ["XS", "S", "M", "L", "XL"],
};

// The choice the demo "user" makes on each step — building a White Oxford Shirt.
const formStepSelection: Record<string, string> = {
	Category: "Tops",
	Color: "White",
	Size: "M",
};

const NOTES_TARGET = "Bought for work";
// Mock photo for the "upload" step
const UPLOADED_PHOTO = "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760378933/Screenshot_2025-10-13_at_11.07.40_AM_ywvcnu.png";

type Step5State = {
	step: number;
	done: boolean;
	picked: Set<string>;
	notes: string;
	uploaded: boolean;
};

type Step5Action =
	| { type: "SET_STEP"; step: number }
	| { type: "PICK"; label: string }
	| { type: "TYPE_NOTE"; value: string }
	| { type: "UPLOAD" }
	| { type: "FINISH" };

const step5Initial: Step5State = { step: 0, done: false, picked: new Set(), notes: "", uploaded: false };

function step5Reducer(state: Step5State, action: Step5Action): Step5State {
	switch (action.type) {
		case "SET_STEP":
			return { ...state, step: action.step };
		case "PICK":
			return { ...state, picked: new Set([...state.picked, action.label]) };
		case "TYPE_NOTE":
			return { ...state, notes: action.value };
		case "UPLOAD":
			return { ...state, uploaded: true };
		case "FINISH":
			return { ...state, done: true };
	}
}

function Step5Demo() {
	const [state, dispatch] = useReducer(step5Reducer, step5Initial);
	const { step, done, picked, notes, uploaded } = state;

	useEffect(() => {
		// Choice steps keep the steady cadence; the Details + Photo steps get extra
		// room so the typed note and the photo upload have time to breathe.
		const STEP_MS = 1300;
		const PICK_DELAY = 600;
		const timers: ReturnType<typeof setTimeout>[] = [];

		const detailsIdx = formStepLabels.indexOf("Details");
		const photoIdx = formStepLabels.indexOf("Photo");

		// Category → Color → Size → Details advance on the steady 1300ms cadence.
		for (let i = 1; i <= detailsIdx; i++) {
			timers.push(setTimeout(() => dispatch({ type: "SET_STEP", step: i }), i * STEP_MS));
		}
		// Choice steps: chips appear grey, then the picked one highlights blue.
		formStepLabels.forEach((lbl, i) => {
			if (formStepSelection[lbl]) {
				timers.push(setTimeout(() => dispatch({ type: "PICK", label: lbl }), i * STEP_MS + PICK_DELAY));
			}
		});

		// Details: pause, then type the note slowly, then let it settle.
		const NOTE_START = detailsIdx * STEP_MS + 500;
		const NOTE_MS = 90;
		[...NOTES_TARGET].forEach((_, i) => {
			timers.push(setTimeout(() => dispatch({ type: "TYPE_NOTE", value: NOTES_TARGET.slice(0, i + 1) }), NOTE_START + i * NOTE_MS));
		});
		const noteEnd = NOTE_START + NOTES_TARGET.length * NOTE_MS;

		// Photo: linger on the finished note, reveal the drop zone, then mock an upload.
		const photoAt = noteEnd + 900;
		timers.push(setTimeout(() => dispatch({ type: "SET_STEP", step: photoIdx }), photoAt));
		const uploadAt = photoAt + 900;
		timers.push(setTimeout(() => dispatch({ type: "UPLOAD" }), uploadAt));

		// Success once the photo has "uploaded".
		timers.push(setTimeout(() => dispatch({ type: "FINISH" }), uploadAt + 1000));
		return () => timers.forEach(clearTimeout);
	}, []);

	const label = formStepLabels[step];
	const options = formStepOptions[label];

	return (
		<div className="ob-demo-shell ob-manual-wrap">
			<div className="ob-pills">
				{formStepLabels.map((s, i) => {
					let cls = "ob-pill";
					if (done || i < step) cls += " ob-pill--done";
					else if (i === step) cls += " ob-pill--active";
					return (
						<div key={s} className={cls}>
							{s}
						</div>
					);
				})}
			</div>

			<div className="ob-manual-body">
				{done ? (
					<div className="ob-manual-success">
						<div className="ob-success-check">
							<Check style={{ width: 30, height: 30 }} />
						</div>
						<div className="ob-success-text">All set!</div>
					</div>
				) : (
					/* keyed by step → remounts so the fade animation replays on each change */
					<div key={step} className="ob-manual-panel">
						{label === "Photo" &&
							(uploaded ? (
								<div className="ob-photo-drop">
									<div className="ob-photo-uploaded">
										<img className="ob-photo-uploaded-img" src={UPLOADED_PHOTO} alt="White Oxford Shirt" />
										<div className="ob-photo-uploaded-badge">
											<Check style={{ width: 12, height: 12 }} />
											Photo added
										</div>
									</div>
								</div>
							) : (
								<div className="ob-photo-drop">
									<div className="ob-photo-drop-inner">
										<Plus style={{ width: 32, height: 32 }} />
										<span className="ob-photo-label">Add photo</span>
									</div>
								</div>
							))}
						{label === "Details" && (
							<div className="ob-field-group">
								<div>
									<div className="ob-caps">ITEM NAME</div>
									<div className="ob-fake-input" style={{ marginTop: 4 }}>
										White Oxford Shirt
									</div>
								</div>
								<div>
									<div className="ob-caps">NOTES</div>
									<div
										className={`ob-fake-textarea${notes ? " ob-fake-textarea--filled" : ""}`}
										style={{ marginTop: 4 }}
									>
										{notes}
										<span className="ob-field-cursor" />
									</div>
								</div>
							</div>
						)}
						{options && (
							<div className="ob-field-group">
								<div className="ob-caps">{label}</div>
								<div className="ob-cat-options">
									{options.map((c) => {
										const isPicked = picked.has(label) && formStepSelection[label] === c;
										return (
											<div key={c} className={`ob-cat-option${isPicked ? " ob-cat-option--active" : ""}`}>
												{c}
											</div>
										);
									})}
								</div>
							</div>
						)}
					</div>
				)}
			</div>

			{done && (
				<div className="ob-toast" role="status">
					<span className="ob-toast-check">
						<Check style={{ width: 12, height: 12 }} />
					</span>
					White Oxford Shirt <br /> added to your closet!
				</div>
			)}
		</div>
	);
}

// ─── Step 6: Search & filter ────────────────────────────────────────────────────

const closetItems = [
	{ label: "Strappy Top", bg: "var(--garment-stone)" },
	{ label: "Wide Leg Jeans", bg: "var(--garment-slate)" },
	{ label: "Linen Blazer", bg: "var(--garment-brown)" },
	{ label: "Slip Dress", bg: "var(--garment-crimson)" },
	{ label: "Cardigan", bg: "var(--garment-charcoal)" },
	{ label: "Trousers", bg: "var(--garment-zinc)" },
];

const SEARCH_QUERY = "going out";
const SEARCH_FILTER_CHIP = "Sleeveless";
// "going out" narrows to these three going-out pieces…
const QUERY_DROPS = ["Wide Leg Jeans", "Cardigan", "Trousers"];
// …then the Sleeveless chip drops the blazer, leaving Strappy Top + Slip Dress.
const CHIP_DROPS = ["Linen Blazer"];

type Step6State = {
	query: string;
	chipShown: boolean;
	out: Set<string>;
	collapsed: Set<string>;
	resultCount: number;
};

type Step6Action =
	| { type: "TYPE_QUERY"; value: string }
	| { type: "QUERY_FADE"; drops: string[] }
	| { type: "QUERY_COLLAPSE"; drops: string[] }
	| { type: "SHOW_CHIP" }
	| { type: "CHIP_FADE"; drops: string[] }
	| { type: "CHIP_COLLAPSE"; drops: string[] };

const step6Initial: Step6State = {
	query: "",
	chipShown: false,
	out: new Set(),
	collapsed: new Set(),
	resultCount: closetItems.length,
};

function step6Reducer(state: Step6State, action: Step6Action): Step6State {
	switch (action.type) {
		case "TYPE_QUERY":
			return { ...state, query: action.value };
		case "QUERY_FADE":
			return { ...state, out: new Set(action.drops), resultCount: closetItems.length - action.drops.length };
		case "QUERY_COLLAPSE":
			return { ...state, collapsed: new Set(action.drops) };
		case "SHOW_CHIP":
			return { ...state, chipShown: true };
		case "CHIP_FADE": {
			const all = [...state.out, ...action.drops];
			return { ...state, out: new Set(all), resultCount: closetItems.length - all.length };
		}
		case "CHIP_COLLAPSE":
			return { ...state, collapsed: new Set([...state.collapsed, ...action.drops]) };
	}
}

function Step6Demo() {
	const [state, dispatch] = useReducer(step6Reducer, step6Initial);
	const { query, chipShown, out, collapsed, resultCount } = state;

	useEffect(() => {
		const timers: ReturnType<typeof setTimeout>[] = [];

		// 1. Type the query.
		const TYPE_START = 400;
		const TYPE_MS = 95;
		[...SEARCH_QUERY].forEach((_, i) => {
			timers.push(setTimeout(() => dispatch({ type: "TYPE_QUERY", value: SEARCH_QUERY.slice(0, i + 1) }), TYPE_START + i * TYPE_MS));
		});
		const queryEnd = TYPE_START + SEARCH_QUERY.length * TYPE_MS;

		// 2. Query narrows the grid to the going-out three (fade, then collapse).
		timers.push(setTimeout(() => dispatch({ type: "QUERY_FADE", drops: QUERY_DROPS }), queryEnd + 350));
		timers.push(setTimeout(() => dispatch({ type: "QUERY_COLLAPSE", drops: QUERY_DROPS }), queryEnd + 700));

		// 3. A filter chip lands and drops the blazer, settling on the final two.
		const chipAt = queryEnd + 1450;
		timers.push(setTimeout(() => dispatch({ type: "SHOW_CHIP" }), chipAt));
		timers.push(setTimeout(() => dispatch({ type: "CHIP_FADE", drops: CHIP_DROPS }), chipAt + 350));
		timers.push(setTimeout(() => dispatch({ type: "CHIP_COLLAPSE", drops: CHIP_DROPS }), chipAt + 700));

		return () => timers.forEach(clearTimeout);
	}, []);

	return (
		<div className="ob-demo-shell ob-search-wrap">
			<div className="ob-search-bar">
				<Search className="ob-search-icon" />
				{query ? (
					<span className="ob-search-text ob-search-text--typed">
						{query}
						<span className="ob-field-cursor" />
					</span>
				) : (
					<span className="ob-search-text">
						Search your closet
						<span className="ob-field-cursor" />
					</span>
				)}
				<span className="ob-search-count">{resultCount} results</span>
			</div>
			<div className="ob-filter-chips">
				{chipShown && (
					<div className="ob-filter-chip ob-filter-chip--in">
						{SEARCH_FILTER_CHIP}
						<X className="ob-chip-x" />
					</div>
				)}
			</div>
			<div className="ob-closet-grid">
				{closetItems.map((item) => {
					let cls = "ob-closet-card";
					if (out.has(item.label)) cls += " ob-closet-card--out";
					if (collapsed.has(item.label)) cls += " ob-closet-card--collapsed";
					return (
						<div key={item.label} className={cls} style={{ background: item.bg }}>
							<div className="ob-closet-card-body">
								<div className="ob-closet-card-icon" />
							</div>
							<div className="ob-closet-card-label">{item.label}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

// ─── Step 7: Fabric guide ───────────────────────────────────────────────────────
// Mirrors the real Textile Compendium: fiber tabs with category dots,
// High/Medium/Low property pills, and icon care cards.

type Level = "High" | "Medium" | "Low";

const fabrics: {
	name: string;
	dot: string; // fiber-category dot color, matching the real guide's TOC
	type: string;
	properties: { label: string; level: Level }[];
	keyFacts: string[];
	care: { icon: string; label: string; value: string }[];
}[] = [
	{
		name: "Cotton",
		dot: "var(--fiber-natural)", // natural (plant) → sage
		type: "Natural Fiber - Plant",
		properties: [
			{ label: "Breathability", level: "High" },
			{ label: "Durability", level: "High" },
		],
		keyFacts: [
			"Wicks moisture but holds it (stays wet longer than synthetics)",
			"Wrinkles easily — blending with polyester reduces wrinkling",
		],
		care: [
			{ icon: "🫧", label: "Washing", value: "Machine wash cold" },
			{ icon: "🌀", label: "Drying", value: "Tumble dry low" },
		],
	},
	{
		name: "Polyester",
		dot: "var(--fiber-synthetic)", // synthetic → mauve
		type: "Synthetic",
		properties: [
			{ label: "Breathability", level: "Low" },
			{ label: "Durability", level: "High" },
		],
		keyFacts: ["Releases microplastic fibers when washed", "Polyester is not biodegradable and can persist for hundreds of years"],
		care: [
			{ icon: "🫧", label: "Washing", value: "Machine wash warm" },
			{ icon: "🌀", label: "Drying", value: "Low heat only" },
		],
	},
	{
		name: "Silk",
		dot: "var(--fiber-natural)", // natural (animal) → sage
		type: "Natural Fiber - Animal",
		properties: [
			{ label: "Breathability", level: "High" },
			{ label: "Durability", level: "Medium" },
		],
		keyFacts: ["Weakens by ~20% when wet — handle very gently", "UV rays degrade silk — avoid prolonged sunlight storage"],

		care: [
			{ icon: "🤲", label: "Washing", value: "Hand wash only" },
			{ icon: "🚫", label: "Drying", value: "Do not tumble dry" },
		],
	},
];

const pillClass = (level: Level) => (level === "High" ? "ob-pill-high" : level === "Medium" ? "ob-pill-med" : "ob-pill-low");

function Step7Demo() {
	const [active, setActive] = useState(0);
	const fabric = fabrics[active];

	useEffect(() => {
		const pressCotton = setTimeout(() => setActive(0), 800);
		const pressPolyester = setTimeout(() => setActive(1), 1600);
		const pressSilk = setTimeout(() => setActive(2), 2900);
		return () => [pressCotton, pressPolyester, pressSilk].forEach(clearTimeout);
	}, []);

	return (
		<div className="ob-demo-shell ob-fabric-wrap">
			<div className="ob-fabric-tabs">
				{fabrics.map((f, i) => (
					<button
						key={f.name}
						onClick={() => setActive(i)}
						className={`ob-fabric-tab${i === active ? " ob-fabric-tab--active" : ""}`}
					>
						<span className="ob-fabric-dot" style={{ background: f.dot }} />
						{f.name}
					</button>
				))}
			</div>

			<div className="ob-fabric-card">
				<div className="ob-fabric-eyebrow">Fabric Care</div>
				<h3 className="ob-fabric-title">{fabric.name}</h3>

				<div className="ob-fabric-props">
					{fabric.properties.map((p) => (
						<div key={p.label} className="ob-fabric-prop">
							<span className="ob-fabric-prop-label">{p.label}</span>
							<span className={`ob-prop-pill ${pillClass(p.level)}`}>{p.level}</span>
						</div>
					))}
				</div>
				<div className="ob-fabric-props">
					{fabric.keyFacts.map((p, i) => (
						<div key={i} className="ob-fabric-prop">
							<span className="ob-fabric-fact">{p}</span>
						</div>
					))}
				</div>

				<div className="ob-care-grid">
					{fabric.care.map((c) => (
						<div key={c.label} className="ob-care-card">
							<div className="ob-care-icon">{c.icon}</div>
							<div className="ob-care-label">{c.label}</div>
							<div className="ob-care-value">{c.value}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// ─── Step 2b: Advanced search demo ─────────────────────────────────────────────

const ADV_NAV = ["Sender", "Dates", "Keywords", "Exclude"];
const ADV_SENDER = "zara.com";
const ADV_TAGS = ["Order Confirmation", "Thanks for purchase"];

function StepAdvancedSearchDemo() {
	const [senderText, setSenderText] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [highlightSearch, setHighlightSearch] = useState(false);
	const [activeNav, setActiveNav] = useState(0);

	useEffect(() => {
		const senderTimers = [...ADV_SENDER].map((_, i) => setTimeout(() => setSenderText(ADV_SENDER.slice(0, i + 1)), 500 + i * 90));
		const t1 = setTimeout(() => {
			setActiveNav(1);
		}, 1400);
		const t2 = setTimeout(() => {
			setActiveNav(2);
			setTags([ADV_TAGS[0]]);
		}, 2000);
		const t3 = setTimeout(() => setTags([...ADV_TAGS]), 2600);
		const t4 = setTimeout(() => setActiveNav(3), 3200);
		const t5 = setTimeout(() => setActiveNav(4), 3800);
		const t6 = setTimeout(() => setHighlightSearch(true), 4200);
		return () => {
			senderTimers.forEach(clearTimeout);
			[t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
		};
	}, []);

	return (
		<div className="ob-demo-shell ob-adv-root">
			<div className="ob-adv-header">
				<Search size={13} className="ob-adv-header-icon" />
				<span className="ob-adv-header-title">Advanced Email Search</span>
			</div>

			<div className="ob-adv-body">
				<nav className="ob-adv-sidebar">
					{ADV_NAV.map((label, i) => {
						const isDone = i < activeNav;
						const isActive = i === activeNav;
						return (
							<div
								key={label}
								className={`ob-adv-nav-item${isActive ? " ob-adv-nav-item--active" : ""}${isDone ? " ob-adv-nav-item--done" : ""}`}
							>
								<div
									className={`ob-adv-nav-dot${isActive ? " ob-adv-nav-dot--active" : ""}${isDone ? " ob-adv-nav-dot--done" : ""}`}
								>
									{isDone && <Check size={8} />}
								</div>
								<span className="ob-adv-nav-label">{label}</span>
								{i === 0 && senderText && <span className="ob-adv-nav-badge">1</span>}
								{i === 2 && tags.length > 0 && <span className="ob-adv-nav-badge">{tags.length}</span>}
							</div>
						);
					})}
				</nav>

				<div className="ob-adv-content">
					<div className="ob-caps">From sender</div>
					<div className="ob-adv-input">
						<span>{senderText}</span>
						<span className={`ob-adv-cursor${senderText === ADV_SENDER ? " ob-adv-cursor--hidden" : ""}`} />
					</div>

					{tags.length > 0 && (
						<>
							<div className="ob-caps ob-adv-tags-label">Subjects</div>
							<div className="ob-adv-tags">
								{tags.map((t) => (
									<span key={t} className="ob-adv-tag">
										{t}
									</span>
								))}
							</div>
						</>
					)}
				</div>
			</div>

			<div className="ob-adv-footer">
				<button className="ob-adv-btn ob-adv-btn--ghost">Filter (12)</button>
				<button className={`ob-adv-btn ob-adv-btn--primary${highlightSearch ? " ob-adv-btn--pulse" : ""}`}>
					<Search size={11} /> New Search
				</button>
			</div>
		</div>
	);
}

// ─── Step definitions ───────────────────────────────────────────────────────────

type StepDef = {
	group: string;
	groupStyle: React.CSSProperties;
	title: string;
	description: string;
	demo: React.ReactNode;
};

const EMAIL_IMPORT_STYLE: React.CSSProperties = {
	background: "var(--indigo-faint)",
	color: "var(--indigo-text)",
	border: "1px solid var(--indigo-border)",
};

const STEPS: StepDef[] = [
	{
		group: "Welcome",
		groupStyle: { background: "var(--coral-faint)", color: "var(--coral)", border: "1px solid var(--coral-border)" },
		title: "Nothing To Wear",
		description: "Wardrobe inventory and logistics management. Upload your closet, learn fabric care, and more!",
		demo: <WelcomeStepDemo />,
	},
	{
		group: "Email Import",
		groupStyle: EMAIL_IMPORT_STYLE,
		title: "Connect your Gmail",
		description: "Tap 'Import Gmail' from the main menu. Closet Inventory reads only order confirmation emails — nothing personal, never.",
		demo: <Step1Demo />,
	},
	{
		group: "Email Import",
		groupStyle: EMAIL_IMPORT_STYLE,
		title: "We find your purchases",
		description:
			"The app scans your inbox and surfaces order confirmations. Found 100 emails? You'll see them all listed here ready to select.",
		demo: <Step2Demo />,
	},
	{
		group: "Email Import",
		groupStyle: EMAIL_IMPORT_STYLE,
		title: "Narrow your search",
		description:
			"Use Advanced Search to filter by sender, date range, subject patterns, or body keywords — then choose 'New Search' to fetch fresh results or 'Filter Existing' to slice what's already cached.",
		demo: <StepAdvancedSearchDemo />,
	},
	{
		group: "Email Import",
		groupStyle: EMAIL_IMPORT_STYLE,
		title: "Pick items to import",
		description:
			"Import one item at a time or hit 'Import All' to bring everything in at once. Each order is parsed into individual garments.",
		demo: <Step3Demo />,
	},
	{
		group: "Email Import",
		groupStyle: EMAIL_IMPORT_STYLE,
		title: "Review the parsed details",
		description:
			"Name, category, color, size, brand, and price is extracted from each order. Tap any field to correct it before adding to your closet.",
		demo: <Step4Demo />,
	},
	{
		group: "Manual Entry",
		groupStyle: { background: "var(--amber-faint)", color: "var(--amber-text)", border: "1px solid var(--amber-border)" },
		title: "Add items manually too",
		description:
			"Use the guided step-by-step form for items you own but didn't buy online — snap a photo, fill what you know, and you're done.",
		demo: <Step5Demo />,
	},
	{
		group: "Search & Filter",
		groupStyle: { background: "var(--purple-faint)", color: "var(--purple-text)", border: "1px solid var(--purple-border)" },
		title: "Find anything instantly",
		description:
			"Fuzzy search by name, brand, or material. Stack filters — color, category, price — to narrow the exact piece you're looking for.",
		demo: <Step6Demo />,
	},
	{
		group: "Fabric Guide",
		groupStyle: { background: "var(--emerald-faint)", color: "var(--emerald-text)", border: "1px solid var(--emerald-border)" },
		title: "Know how to care for it",
		description: "The Fabric Guide shows breathability, durability, and exact care instructions for every material in your closet.",
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
				<div className="ob-progress-container">
					<div className="ob-progress">
						{STEPS.map((_, i) => {
							let cls = "ob-progress-seg";
							if (i < currentStep) cls += " ob-progress-seg--done";
							else if (i === currentStep) cls += " ob-progress-seg--active";
							return <div key={i} className={cls} />;
						})}
					</div>
					<div className="ob-badges">
						<span className="ob-group-badge" style={step.groupStyle}>
							{step.group}
						</span>
						<span className="ob-step-label">
							Step {currentStep + 1} of {STEPS.length}
						</span>
					</div>
				</div>

				{/* Content */}
				<div className="ob-content">
					<h2 className="ob-title">{step.title}</h2>
					<p className="ob-description">{step.description}</p>
					{/* Demo — keyed so animations restart on step change */}
					<div key={currentStep}>{step.demo}</div>
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
