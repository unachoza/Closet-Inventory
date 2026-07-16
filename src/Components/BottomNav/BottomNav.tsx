import { LayoutGrid, Scissors, Plus, Search, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useView } from "../../context/ViewContext";
import type { ViewType } from "../../utils/types";
import "./BottomNav.css";

interface BottomNavProps {
	/** App-level Add-Item handler (same one NavBar receives) — owns the
	 *  form-prefill reset + navigation, so the nav never calls setView itself. */
	onAddItem: () => void;
}

interface Tab {
	view: ViewType;
	label: string;
	Icon: LucideIcon;
}

/* Thumb-order layout: Closet | Care | [Add] | Search | Email (Tight MVP).
   The three MVP features — Inventory (Closet), Care, Search — are first-class
   tabs alongside Email (Gmail import), the primary item-ingestion path.
   The old carousel "Home" tab is dropped for the beta; Add is the center FAB. */
const LEFT_TABS: Tab[] = [
	{ view: "overview", label: "Closet", Icon: LayoutGrid },
	{ view: "fabric", label: "Care", Icon: Scissors },
];
const RIGHT_TABS: Tab[] = [
	{ view: "entireCloset", label: "Search", Icon: Search },
	{ view: "gmail", label: "Email", Icon: Mail },
];

function NavTab({ tab, active, onSelect }: { tab: Tab; active: boolean; onSelect: (view: ViewType) => void }) {
	const { view, label, Icon } = tab;
	return (
		<button
			type="button"
			className={`bottom-nav__tab${active ? " bottom-nav__tab--active" : ""}`}
			aria-current={active ? "page" : undefined}
			onClick={() => onSelect(view)}
		>
			<Icon size={22} aria-hidden="true" />
			<span className="bottom-nav__tab-label">{label}</span>
		</button>
	);
}

/** Mobile-only (≤ --bp-md) persistent bottom navigation with a center Add FAB.
 *  Desktop keeps the hamburger drawer; CSS hides this bar entirely there. */
const BottomNav = ({ onAddItem }: BottomNavProps) => {
	const { view, setView } = useView();

	return (
		<nav className="bottom-nav" aria-label="Primary">
			{LEFT_TABS.map((tab) => (
				<NavTab key={tab.view} tab={tab} active={view === tab.view} onSelect={setView} />
			))}
			<div className="bottom-nav__fab-slot">
				<button type="button" className="bottom-nav__fab" aria-label="Add Item" onClick={onAddItem}>
					<Plus size={26} aria-hidden="true" />
				</button>
			</div>
			{RIGHT_TABS.map((tab) => (
				<NavTab key={tab.view} tab={tab} active={view === tab.view} onSelect={setView} />
			))}
		</nav>
	);
};

export default BottomNav;
