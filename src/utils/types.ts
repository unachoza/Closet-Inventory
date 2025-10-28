import { Dispatch, SetStateAction, KeyboardEvent } from "react";

export type ClothingItem = {
	id: string | number;
	imageURL: string;
	name: string;
	category: string;
	color: string;
	size: string;
	brand: string;
	price?: string;
	material: string;
	occasion: string;
	age: string;
	care: string | string[];
	onSale?: boolean;
	notes?: string | string[];
};

export interface ItemFormData {
	id: string;
	imageURL?: string;
	category: string;
	color: string; // single color
	size: string; // single size
	brand: string;
	material: string;
	occasion: string;
	age: string;
	purchaseDate?: string;
	care: string;
}

export type CategoryType = "tops" | "bottoms" | "dresses" | "coats" | "sweaters" | "lingerie" | "active" | "socks" | "underwear";

export type ViewType = "carousel" | "form" | "overview";

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
	handleFormUpdate: SetStateAction<string | any>;
	onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export interface CarouselProps {
	setCategory: Dispatch<SetStateAction<CategoryType>>;
}
