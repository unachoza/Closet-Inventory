import { Dispatch, SetStateAction, KeyboardEvent } from "react";
import { ProductAttributes } from "../utils/inferProductAttributes";

export interface MaterialBlend {
	material: string;
	percentage: number;
}

/** E2 US-2.8: does this item fit the user right now? Distinct from style.fit (a style descriptor). */
export type ItemFit = 'fits' | 'too_big' | 'too_small' | 'unknown';

/** E2 US-2.8: a single body measurement stored with its unit for in↔cm conversion. */
export interface Measurement {
	value: number;
	unit: 'in' | 'cm';
}

export interface ItemMeasurements {
	waist?: Measurement;
	chest?: Measurement;
	hips?: Measurement;
	length?: Measurement;
}

/** E2 US-2.11 */
export type AcquisitionType =
	| 'bought'
	| 'gifted'
	| 'inherited'
	| 'hand_me_down'
	| 'thrifted'
	| 'resale'
	| 'borrowed';

/**
 * E2 US-2.5: free-text loan record (localStorage-first).
 * Account-based borrow_requests with a user FK is E4.
 */
export interface LoanRecord {
	borrowerName: string;
	since: string;       // ISO date
	dueBack?: string;    // ISO date
}

/** E1 + E2: combined item status enum. E11 owns clean/dirty; E2 owns the rest. */
export type ItemStatus =
	| 'clean'
	| 'dirty'
	| 'at_cleaner'
	| 'in_repair'
	| 'traveling'
	| 'on_loan';

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
	/** Legacy single-value occasion. Migrated to item_tags (season/occasion/vibe) in E2-10.3. */
	occasion: string;
	/** Legacy free-text age (e.g. "1 year"). Superseded by purchaseDate + condition. */
	age?: string;
	/** Subjective wear state: "new" | "like new" | "good" | "fair" | "needs repair". */
	condition?: string;
	/** ISO date the item was purchased — source of the card's factual age. */
	purchaseDate?: string;
	care: string | string[];
	onSale?: boolean;
	notes?: string | string[];
	style?: ProductAttributes;

	// ── E1 gap (should have been in v1 spine) ──────────────────────────────
	status?: ItemStatus;

	// ── E2 US-2.2: location ─────────────────────────────────────────────────
	locationId?: string;

	// ── E2 US-2.5: lending ──────────────────────────────────────────────────
	loan?: LoanRecord;

	// ── E2 US-2.8: fit & measurements ───────────────────────────────────────
	itemFit?: ItemFit;
	measurements?: ItemMeasurements;

	// ── E2 US-2.10: taxonomy tags (resolved labels; ids live in item_tags) ──
	tags?: string[];

	// ── E2 US-2.11: provenance, origin & sentiment ───────────────────────────
	acquisitionType?: AcquisitionType;
	countryOfOrigin?: string;
	isSentimental?: boolean;
	isHighValue?: boolean;

	// ── E4 (seeded early — is_sentimental drives is_private default) ─────────
	isPrivate?: boolean;
	isLendable?: boolean;

	// ── E11 cached rollup (E11 owns the write path) ───────────────────────────
	wornCount?: number;
	lastWornAt?: string;   // ISO date
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

export type CategoryType = "tops" | "bottoms" | "dresses" | "coats" | "sweaters" | "intimates" | "athleisure" | "socks" | "underwear" | null;

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
