import { Dispatch, SetStateAction, KeyboardEvent } from "react";
import { ProductAttributes } from "../utils/inferProductAttributes";

export interface MaterialBlend {
	material: string;
	percentage: number;
}

export type ClothingItem = {
	id: string;
	imageURL: string;
	name: string;
	category: string;
	color: string;
	size: string;
	brand: string;
	price?: string;
	originalPrice?: string;
	qty?: number;
	material: MaterialBlend[];
	occasion: string;
	/** Legacy free-text age (e.g. "1 year"). Superseded by purchaseDate (factual age) + condition (subjective state). Kept for back-compat display fallback. */
	age?: string;
	/** Subjective wear state: "new" | "like new" | "good" | "fair" | "needs repair". */
	condition?: string;
	/** ISO date the item was purchased — the source of the card's factual age. */
	purchaseDate?: string;
	care: string | string[];
	onSale?: boolean;
	notes?: string | string[];
	style?: ProductAttributes;
};

export interface ItemFormData {
	id: string;
	imageURL?: string;
	category: string;
	color: string; // single color
	size: string; // single size
	brand: string;
	material: MaterialBlend[] | string;
	occasion: string;
	age: string;
	condition?: string;
	purchaseDate?: string;
	care: string | string[];
	image?: string;
}

export type CategoryType = "tops" | "bottoms" | "dresses" | "coats" | "sweaters" | "intimates" | "athleisure" | "socks" | "underwear" | "shoes" | null;

export type ViewType = "carousel" | "form" | "overview" | "edit" | "gmail" | "fabric" | "journey" | "entireCloset";

export interface Option {
	value: string;
	label: string;
}

export interface Step {
	label: string;
	step: number;
}

export interface InputProps {
	id?: string;
	label?: string;
	min?: number;
	name: string;
	type?: string;
	className?: string;
	value: string | number;
	errorMessage?: string;
	placeholder: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, label?: string) => void;
	handleFormUpdate: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, label?: string) => void;
	onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export interface CarouselProps {
	setCategory: Dispatch<SetStateAction<CategoryType>>;
}
