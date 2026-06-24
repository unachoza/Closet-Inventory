/**
 * @ntw/types — the shared backend contract for Nothing To Wear.
 *
 * These are the FORWARD-LOOKING types for the Supabase/Postgres backend and the
 * cloud service layer (items, users, the v8 borrow/share graph). They are the
 * canonical shape the `supabase/migrations` DDL and the RLS policies map onto.
 *
 * NOTE: the web app's current persisted model is `ClothingItem` in
 * `src/utils/types.ts` (localStorage era). `Item` below is the cloud target.
 * The two are reconciled during the Supabase port (seed-on-first-sign-in maps
 * each `ClothingItem` → `Item`). Until then, do not rename `ClothingItem`.
 */

export type ItemStatus =
	| "clean"
	| "dirty"
	| "at_cleaner"
	| "on_loan"
	| "in_repair"
	| "traveling"
	| "packed"
	| "unknown";

export type ItemLocation = "home" | "storage" | "suitcase" | "other";

export type ClosestLocation = {

}

export type ItemSource = "manual" | "gmail_import" | "outlook_import" | "camera";

export type ConnectionStatus = "pending" | "connected";

export type BorrowStatus = "pending" | "accepted" | "declined" | "returned";

export interface MaterialBlend {
	material: string;
	percentage: number;
}

export interface Item {
	id: string;
	ownerId: string;
	name: string;
	brand?: string;
	category: string;
	color?: string;
	size?: string;
	material?: MaterialBlend[];
	careInstructions?: string[];
	status: ItemStatus;
	location: ItemLocation;
	locationLabel?: string;
	borrowedBy?: string | null;
	isShareable: boolean;
	source: ItemSource;
	retailer?: string;
	purchaseDate?: string;
	purchasePrice?: number;
	originalPrice?: number;
	wearCount: number;
	lastWornAt?: string;
	imageUrl?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Closet {
	closetId: string;
	userId: string;
	createdAt: string;
	location: string;
}

export interface User {
	id: string;
	displayName: string;
	email: string;
	photoURL?: string;
	createdAt: string;
	//TODO: missing details?
	closetId: string;
	viewingPrivledges: string[]
}

export interface Connection {
	id: string;
	userA: string;
	userB: string;
	status: ConnectionStatus;
	createdAt: string;
}

export interface BorrowRequest {
	id: string;
	fromUserId: string;
	toUserId: string;
	itemId: string;
	status: BorrowStatus;
	message?: string;
	requestedAt: string;
	respondedAt?: string;
	returnedAt?: string;
}

/** Consistent envelope for the future API layer (see global patterns rule). */
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	meta?: {
		total: number;
		page: number;
		limit: number;
	};
}
