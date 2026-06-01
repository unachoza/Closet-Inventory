import { useState } from "react";
import { Menu, Search, Filter, Spool, Plus, LayoutGrid, Download, X, ChevronDown, ChevronUp, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import SearchBar from "../../Features/SearchCloset/SearchBar/SearchBar";
import "./NavBar.css";

const NavBar = () => {
	const [searchQuery, setSearchQuery] = useState<string>("");
	return (
		<header className="top-nav">
			<div className="nav-left">
				<button className="hamburger-btn">
					<Menu size={24} />
				</button>
				<h1 className="page-title">My Closet Inventory</h1>
			</div>

			<div className="search-container">
				<SearchBar />
				{/* <Search size={18} className="search-icon" />
				<input
					type="text"
					placeholder="Search items, brands, colors..."
					className="search-input"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/> */}
			</div>

			<div className="nav-actions">
				<button className="action-btn">
					<Plus size={16} /> Add Item
				</button>
				<button className="action-btn secondary">
					<LayoutGrid size={16} /> View All
				</button>
				<button className="action-btn secondary">
					<Download size={16} /> Import Gmail
				</button>
				<button className="action-btn secondary">
					<Spool size={16} />
					Fabric Guide{" "}
				</button>
			</div>
		</header>
	);
};

export default NavBar;
