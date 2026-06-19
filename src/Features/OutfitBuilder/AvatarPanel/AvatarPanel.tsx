import { Upload, X, Plus, Check, ShoppingBag, Sparkles, Camera, Star, User, Shirt } from "lucide-react";
import { ClothingItem, Category } from "../utils/types";
import { CATEGORIES, INITIAL_CLOSET, OVERLAY_ORDER, OVERLAY_STYLE } from "../utils/data";
import { useRef } from "react";
import "./AvatarPanel.css";

interface AvatarPanelProps {
	avatarUrl: string;
	selectedItems: Record<string, ClothingItem>;
	onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onRemoveItem: (item: ClothingItem) => void;
}

const AvatarPanel = ({ avatarUrl, selectedItems, onAvatarUpload, onRemoveItem }: AvatarPanelProps) => {
	const avatarInputRef = useRef<HTMLInputElement>(null);

	const selectedList = Object.values(selectedItems);
	const hasOutfit = selectedList.length > 0;

	const orderedSelected = OVERLAY_ORDER.flatMap((cat) => selectedList.filter((item) => item.category === cat));

	return (
		<div className="avatar-panel">
			<div className="avatar-panel__header">
				<div>
					<p className="avatar-panel__eyebrow">Your avatar</p>
					<h2 className="avatar-panel__title">Today's Look</h2>
				</div>

				<button type="button" className="avatar-panel__change-btn" onClick={() => avatarInputRef.current?.click()}>
					<Camera size={12} strokeWidth={1.5} />
					<span>Change</span>
				</button>

				<input ref={avatarInputRef} type="file" accept="image/*" className="avatar-panel__file-input" onChange={onAvatarUpload} />
			</div>

			<div className="avatar-panel__canvas">
				<img src={avatarUrl} alt="Avatar" className="avatar-panel__image" />

				{orderedSelected.map((item) => (
					<img
						key={item.id}
						src={item.imageUrl}
						alt={item.name}
						className="avatar-panel__overlay"
						style={{
							mixBlendMode: "multiply",
							...OVERLAY_STYLE[item.category],
						}}
					/>
				))}

				{!hasOutfit && (
					<div className="avatar-panel__empty-state">
						<div className="avatar-panel__hint">
							<Sparkles size={14} strokeWidth={1.5} />
							<p>Select items to style your look</p>
						</div>
					</div>
				)}

				{hasOutfit && (
					<div className="avatar-panel__selected-items">
						{selectedList.map((item) => (
							<div key={item.id} className="avatar-panel__selected-item">
								<span
									className="avatar-panel__color-dot"
									style={{
										backgroundColor: item.colorHex,
									}}
								/>

								<span className="avatar-panel__item-name">{item.name}</span>

								<span className="avatar-panel__item-category">{item.category}</span>

								<button type="button" className="avatar-panel__remove-btn" onClick={() => onRemoveItem(item)}>
									<X size={12} strokeWidth={1.5} />
								</button>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="avatar-panel__spacer" />
		</div>
	);
};

export default AvatarPanel;
