import { useRef, useState } from "react";
import { Menu, Search, Spool, Plus, LayoutGrid, Download, FileDown, FileUp, X, SkipBackIcon, Route } from "lucide-react";
import { useView } from "../../context/ViewContext";
import { useSearch } from "../../context/SearchContext";
import { ClothingItem, ViewType } from "../../utils/types";
import ExportClosetModal from "./ExportModal/ExportClosetModal";
import type { ExportFormat } from "../../utils/exportCloset";
import "./NavBar.css";
import { importClosetFromFile } from "../../utils/importCloset";
import ImportClosetModal from "./ImportModal/ImportClosetModal";

interface NavBarProps {
	/**
	 * Optional override for the "Add Item" action. When omitted the NavBar
	 * simply navigates to the form view. App passes a handler that also resets
	 * any prefilled form / gmail source state.
	 */
	onAddItem?: () => void;
	/** Trigger a download of the full closet in the chosen format. Passing this prop enables the Download Closet button. */
	onExportCloset?: (format: ExportFormat) => void;
	/** Persist imported items into the closet (replace or merge). Passing this prop enables the Upload Closet button. */
	onImportCloset?: (items: ClothingItem[], mode: "replace" | "merge") => void;
	/** Number of closet items — shown in the export/import confirmation modals. */
	closetItemCount?: number;
}

const NavBar = ({ onAddItem, onExportCloset, onImportCloset, closetItemCount = 0 }: NavBarProps) => {
	const { view, setView } = useView();
	const { searchQuery, setSearchQuery } = useSearch();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [exportModalOpen, setExportModalOpen] = useState(false);

	const [importModalOpen, setImportModalOpen] = useState(false);
	const [pendingImportItems, setPendingImportItems] = useState<ClothingItem[]>([]);
	const [importMode, setImportMode] = useState<"replace" | "merge">("merge");
	const [importError, setImportError] = useState<string | null>(null);

	// "entireCloset" is the searchable all-items experience. In that mode the
	// nav actions collapse into the hamburger drawer and only search shows.
	const isClosetView = view === "entireCloset";
	const showBackToCarousel = view !== "carousel";
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	const handleDownloadClosetClick = () => {
		closeDrawer();
		setExportModalOpen(true);
	};

	const handleExportConfirm = (format: ExportFormat) => {
		setExportModalOpen(false);
		onExportCloset?.(format);
	};

	const handleExportCancel = () => {
		setExportModalOpen(false);
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleUploadCloset = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		// allow re-uploading the same file
		e.target.value = "";
		if (!file) return;

		setImportError(null);

		try {
			const items = await importClosetFromFile(file);

			setPendingImportItems(items);
			setImportMode("merge");
			setImportModalOpen(true);

			closeDrawer();
		} catch (error) {
			setImportError(error instanceof Error ? error.message : "Could not read that file. Please try a .csv or .json export.");
		}
	};

	const handleImportCancel = () => {
		setPendingImportItems([]);
		setImportModalOpen(false);
	};

	const handleImportConfirm = () => {
		onImportCloset?.(pendingImportItems, importMode);

		setPendingImportItems([]);
		setImportModalOpen(false);
	};

	const navActions = (
		<>
			<button className="action-btn secondary" onClick={() => goTo("entireCloset")}>
				<LayoutGrid size={16} /> View All
			</button>
			<button className="action-btn" onClick={handleAddItem}>
				<Plus size={16} /> Add Item
			</button>
			<button className="action-btn secondary" onClick={() => goTo("gmail")}>
				<Download size={16} /> Import Gmail
			</button>
			{onExportCloset && (
				<button className="action-btn secondary" onClick={handleDownloadClosetClick} title="Download your closet as a spreadsheet">
					<FileDown size={16} /> Download Closet
				</button>
			)}
			{onImportCloset && (
				<button className="action-btn secondary" onClick={handleUploadClick} title="Upload a closet backup (.csv or .json)">
					<FileUp size={16} /> Upload Closet
					<input ref={fileInputRef} type="file" accept=".csv,.json" onChange={handleUploadCloset} style={{ display: "none" }} />
				</button>
			)}

			<button className="action-btn secondary" onClick={() => goTo("fabric")}>
				<Spool size={16} /> Fabric Guide
			</button>
			<button className="action-btn secondary" onClick={() => goTo("journey")}>
				<Route size={16} /> Fiber Journey
			</button>
			{showBackToCarousel && (
				<button className="action-btn secondary " onClick={() => goTo("carousel")}>
					<SkipBackIcon size={16} /> Back to Carousel
				</button>
			)}
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
				{!isClosetView && <h1 className="page-title">Nothing To Wear</h1>}
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

			{onExportCloset && (
				<ExportClosetModal
					isOpen={exportModalOpen}
					itemCount={closetItemCount}
					onConfirm={handleExportConfirm}
					onCancel={handleExportCancel}
				/>
			)}
			{importError && (
				<div className="import-error-banner" role="alert">
					<span>{importError}</span>
					<button className="import-error-banner__close" aria-label="Dismiss error" onClick={() => setImportError(null)}>
						<X size={16} />
					</button>
				</div>
			)}
			{importModalOpen && (
				<ImportClosetModal
					isOpen={importModalOpen}
					currentItemCount={closetItemCount}
					importItemCount={pendingImportItems.length}
					importMode={importMode}
					onModeChange={setImportMode}
					onConfirm={handleImportConfirm}
					onCancel={handleImportCancel}
				/>
			)}
		</header>
	);
};

export default NavBar;
