import { useState } from "react";
import { Menu, Search, Spool, Plus, LayoutGrid, Download, X, SkipBackIcon, Route } from "lucide-react";
import { useView } from "../../context/ViewContext";
import { useSearch } from "../../context/SearchContext";
import { ViewType } from "../../utils/types";
import "./NavBar.css";

interface NavBarProps {
	/**
	 * Optional override for the "Add Item" action. When omitted the NavBar
	 * simply navigates to the form view. App passes a handler that also resets
	 * any prefilled form / gmail source state.
	 */
	onAddItem?: () => void;
}

const NavBar = ({ onAddItem }: NavBarProps) => {
	const { view, setView } = useView();
	const { searchQuery, setSearchQuery } = useSearch();
	const [drawerOpen, setDrawerOpen] = useState(false);

	// "entireCloset" is the searchable all-items experience. In that mode the
	// nav actions collapse into the hamburger drawer and only search shows.
	const isClosetView = view === "entireCloset";
	// const showBackToCarousel = view !== "carousel";

	const closeDrawer = () => setDrawerOpen(false);

	const goTo = (next: ViewType) => {
		setView(next);
		closeDrawer();
	};

	const handleAddItem = () => {
		if (onAddItem) {
			onAddItem();
		} else {
			setView("form");
		}
		closeDrawer();
	};

	const navActions = (
		<>
			<button className="action-btn" onClick={handleAddItem}>
				<Plus size={16} /> Add Item
			</button>
			<button className="action-btn secondary" onClick={() => goTo("entireCloset")}>
				<LayoutGrid size={16} /> View All
			</button>
			<button className="action-btn secondary" onClick={() => goTo("gmail")}>
				<Download size={16} /> Import Gmail
			</button>
			<button className="action-btn secondary" onClick={() => goTo("fabric")}>
				<Spool size={16} /> Fabric Guide
			</button>
			<button className="action-btn secondary" onClick={() => goTo("journey")}>
				<Route size={16} /> Fiber Journey
			</button>
			<button className="action-btn secondary " onClick={() => goTo("carousel")}>
				<SkipBackIcon size={16} /> Back to Carousel
			</button>
		</>
	);

	return (
		<header className={`top-nav${isClosetView ? " top-nav--search" : ""}`}>
			<div className="nav-left">
				<button
					className="hamburger-btn"
					aria-label="Open menu"
					aria-expanded={drawerOpen}
					onClick={() => setDrawerOpen((open) => !open)}
				>
					<Menu size={24} />
				</button>
				{!isClosetView && <h1 className="page-title">My Closet Inventory</h1>}
			</div>

			{isClosetView && (
				<div className="search-container">
					<Search size={18} className="search-icon" />
					<input
						type="text"
						placeholder="Search items, brands, colors..."
						className="search-input"
						aria-label="Search closet"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			)}

			<div className="nav-right">{!isClosetView && <div className="nav-actions">{navActions}</div>}</div>

			{drawerOpen && (
				<>
					<div className="nav-drawer-overlay" onClick={closeDrawer} data-testid="nav-drawer-overlay" />
					<nav className="nav-drawer" aria-label="Navigation menu">
						<button className="nav-drawer__close" aria-label="Close menu" onClick={closeDrawer}>
							<X size={20} />
						</button>
						<div className="nav-drawer__actions">{navActions}</div>
					</nav>
				</>
			)}
		</header>
	);
};

export default NavBar;
