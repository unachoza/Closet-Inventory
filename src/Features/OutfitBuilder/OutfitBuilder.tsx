import { useState } from "react";
import { ShoppingBag, X, User, Shirt } from "lucide-react";

import { ClothingItem, Category, MobileView } from "./utils/types"
import { INITIAL_CLOSET, DEFAULT_AVATAR } from "./utils/data";
import { getZone } from "./utils/getZone"

import AvatarPanel from "./AvatarPanel/AvatarPanel";
import ClosetPanel from "./ClosetPanel/ClosetPanel";
import { AddItemModal } from "./AddItemModal/AddItemModal";

import "./App.css";

export default function App() {
	const [closet, setCloset] =
		useState<ClothingItem[]>(INITIAL_CLOSET);

	const [avatarUrl, setAvatarUrl] =
		useState<string>(DEFAULT_AVATAR);

	const [activeCategory, setActiveCategory] =
		useState<Category>("All");

	const [selectedItems, setSelectedItems] = useState<
		Record<string, ClothingItem>
	>({});

	const [isAddingItem, setIsAddingItem] =
		useState(false);

	const [mobileView, setMobileView] =
		useState<MobileView>("closet");

	const toggleItem = (item: ClothingItem) => {
		setSelectedItems((prev) => {
			const next = { ...prev };

			if (next[item.id]) {
				delete next[item.id];
				return next;
			}

			const zone = getZone(item.category);

			if (zone !== -1) {
				Object.values(next).forEach((sel) => {
					if (
						getZone(sel.category) === zone
					) {
						delete next[sel.id];
					}
				});
			}

			next[item.id] = item;
			return next;
		});
	};

	const handleAvatarUpload = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (file) {
			setAvatarUrl(URL.createObjectURL(file));
		}
	};

	const addItem = (
		data: Omit<ClothingItem, "id">,
	) => {
		setCloset((prev) => [
			{
				id: `custom-${Date.now()}`,
				...data,
			},
			...prev,
		]);

		setIsAddingItem(false);
	};

	const selectedList = Object.values(selectedItems);
	const hasOutfit = selectedList.length > 0;

	return (
		<div className="app">
			{/* ================= HEADER ================= */}
			<header className="app__header">
				<div className="app__brand">
					<ShoppingBag
						className="app__brand-icon"
						strokeWidth={1.5}
					/>

					<span className="app__brand-title">
						wardrobe
					</span>

					<span className="app__brand-subtitle">
						/studio
					</span>
				</div>

				<div className="app__header-actions">
					{hasOutfit && (
						<>
							<span className="app__status">
								{selectedList.length} piece
								{selectedList.length !== 1
									? "s"
									: ""}{" "}
								styled
							</span>

							<button
								className="app__clear-btn"
								onClick={() =>
									setSelectedItems({})
								}
							>
								<X size={12} />
								Clear look
							</button>
						</>
					)}
				</div>
			</header>

			{/* ================= DESKTOP LAYOUT ================= */}
			<div className="app__desktop">
				<aside className="app__avatar">
					<AvatarPanel
						avatarUrl={avatarUrl}
						selectedItems={selectedItems}
						onAvatarUpload={
							handleAvatarUpload
						}
						onRemoveItem={toggleItem}
					/>
				</aside>

				<main className="app__closet">
					<ClosetPanel
						closet={closet}
						activeCategory={activeCategory}
						setActiveCategory={
							setActiveCategory
						}
						selectedItems={selectedItems}
						onToggleItem={toggleItem}
						onAddItem={() =>
							setIsAddingItem(true)
						}
					/>
				</main>
			</div>

			{/* ================= MOBILE LAYOUT ================= */}
			<div className="app__mobile">
				{mobileView === "look" ? (
					<div className="app__mobile-view">
						<AvatarPanel
							avatarUrl={avatarUrl}
							selectedItems={
								selectedItems
							}
							onAvatarUpload={
								handleAvatarUpload
							}
							onRemoveItem={toggleItem}
						/>
					</div>
				) : (
					<div className="app__mobile-view">
						<ClosetPanel
							closet={closet}
							activeCategory={
								activeCategory
							}
							setActiveCategory={
								setActiveCategory
							}
							selectedItems={
								selectedItems
							}
							onToggleItem={toggleItem}
							onAddItem={() =>
								setIsAddingItem(true)
							}
						/>
					</div>
				)}
			</div>

			{/* ================= MOBILE NAV ================= */}
			<nav className="app__nav">
				<button
					className={`app__nav-btn ${
						mobileView === "look"
							? "is-active"
							: ""
					}`}
					onClick={() =>
						setMobileView("look")
					}
				>
					<div className="app__nav-icon-wrap">
						<User size={20} />
						{hasOutfit && (
							<span className="app__dot" />
						)}
					</div>

					<span className="app__nav-label">
						My Look
					</span>
				</button>

				<div className="app__divider" />

				<button
					className={`app__nav-btn ${
						mobileView === "closet"
							? "is-active"
							: ""
					}`}
					onClick={() =>
						setMobileView("closet")
					}
				>
					<Shirt size={20} />

					<span className="app__nav-label">
						Closet
					</span>
				</button>
			</nav>

			{/* ================= MODAL ================= */}
			{isAddingItem && (
				<AddItemModal
					onClose={() =>
						setIsAddingItem(false)
					}
					onAdd={addItem}
				/>
			)}
		</div>
	);
}