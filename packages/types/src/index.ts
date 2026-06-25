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
 *
 * See planning/backend/DATA_MODEL_2026-06-24.md for the full relational spine.
 */

// ── Item status ───────────────────────────────────────────────────────────────
// Describes the item's condition/state. "traveling" overlaps with LocationKind
// intentionally — status is a fast query filter; locationId gives physical detail.
// App layer must keep them in sync: assigning a traveling location → status = "traveling".
export type ItemStatus =
	| "clean"
	| "dirty"
	| "at_cleaner"
	| "on_loan"
	| "needs_repair"   // flagged by user; item is at home but needs fixing
	| "at_repair"      // dropped off at tailor / cobbler / etc.
	| "packed"         // packed and ready to leave — transitional before travel
	| "traveling"      // currently with you on a trip; mirrors LocationKind.traveling
	| "unknown";

// ── Location kind ─────────────────────────────────────────────────────────────
// The `kind` field on the `locations` table. Pairs with a user-typed `label`
// (e.g. "Hall closet", "Under the bed", "Dresser") for sub-location detail.
// Items reference a location via locationId (FK to locations table), not inline.
export type LocationKind =
	| "primary_residence"    // main home — most items live here
	| "secondary_residence"  // vacation home, parents' house, etc.
	| "storage_unit"         // off-site storage
	| "traveling"            // currently with you on a trip (suitcase / carry-on)
	| "other";

// ── Storage method ────────────────────────────────────────────────────────────
// HOW an item is stored — separate from WHERE (LocationKind).
// Drives care reminders: knitwear should be folded not hung (stretches shoulders).
export type StorageMethod = "hung" | "folded" | "flat" | "rolled";

// ── Item source ───────────────────────────────────────────────────────────────
// How the item entered the app. Hotmail and Yahoo are distinct from Gmail even
// though Microsoft/Alphabet own both — the import flows are separate.
export type ItemSource =
	| "manual"
	| "gmail_import"
	| "hotmail_import"   // Hotmail / Outlook.com (Microsoft Graph API)
	| "yahoo_import"     // Yahoo Mail
	| "camera"
	| "chrome_ext";      // browser extension auto-capture (planned)

export type ConnectionStatus = "pending" | "connected";

export type BorrowStatus = "pending" | "accepted" | "declined" | "returned";

export type ClosetMemberRole = "owner" | "editor" | "stylist" | "viewer";

export interface MaterialBlend {
	material: string;
	percentage: number;
}

// ── Item ──────────────────────────────────────────────────────────────────────
// Ownership flows through closet_members (many-to-many), not a direct ownerId.
// Location is a FK to the locations table — locationId + the resolved label live
// separately so queries can filter by kind without joining every time.
export interface Item {
	id: string;
	closetId: string;              // → closets.id (WHOSE — axis 1)
	locationId?: string;           // → locations.id (WHERE — axis 2, nullable)
	name: string;
	brand?: string;
	category: string;
	color?: string;
	size?: string;
	material?: MaterialBlend[];
	careInstructions?: string[];
	storageMethod?: StorageMethod; // folded/hung/flat/rolled — feeds care reminders
	status: ItemStatus;
	source: ItemSource;
	retailer?: string;
	purchaseDate?: string;
	purchasePrice?: number;
	originalPrice?: number;
	condition?: string;
	onSale?: boolean;
	isPrivate: boolean;            // hides from shared-closet viewers; default true for Intimates
	isLendable: boolean;           // opt-in for borrowing (E4)
	notes?: string[];              // bulleted notes — stored as text[] in Postgres
	wearCount: number;             // cached rollup of wear_events
	lastWornAt?: string;           // cached rollup of wear_events
	primaryPhotoUrl?: string;      // denorm cache of default item_photos row
	createdAt: string;
	updatedAt: string;
}

// ── Location ──────────────────────────────────────────────────────────────────
// A physical place owned by a household/account. Items reference a location via
// locationId. Users can have multiple locations (primary home, storage, etc.).
export interface Location {
	id: string;
	ownerUserId: string;
	kind: LocationKind;
	label: string;                 // user-typed: "Hall closet", "Dresser", "Under the bed"
	createdAt: string;
}

// ── Closet ────────────────────────────────────────────────────────────────────
// No single ownerId — ownership and access live in ClosetMember.
// A user can own/belong-to many closets (personal, shared, stylist-managed).
export interface Closet {
	id: string;
	name: string;                  // "My Closet", "Our Closet", "Kid's Closet"
	createdBy: string;             // → profiles.id (creator, always an owner in closet_members)
	createdAt: string;
}

export interface ClosetMember {
	closetId: string;
	userId: string;
	role: ClosetMemberRole;
	joinedAt: string;
}

// ── Profile ───────────────────────────────────────────────────────────────────
// 1:1 with auth.users. Social fields are shareable; settings are private/functional.
export interface Profile {
	id: string;                    // = auth.users.id
	displayName: string;
	email: string;
	photoUrl?: string;
	settings?: Record<string, unknown>; // machine_size, lifestyle prefs (E12)
	createdAt: string;
}

// ── Social graph ──────────────────────────────────────────────────────────────
export interface Connection {
	id: string;
	userA: string;
	userB: string;
	status: ConnectionStatus;
	createdAt: string;
}

export interface BorrowRequest {
	id: string;
	itemId: string;
	borrowerUserId: string;        // account required — no free-text borrower
	ownerUserId: string;
	status: BorrowStatus;
	message?: string;
	careAgreement?: string;        // "dry clean before return" etc. (E4)
	careAcknowledged?: boolean;
	requestedAt: string;
	respondedAt?: string;
	returnedAt?: string;
	dueBack?: string;
}

/** Consistent envelope for the API layer. */
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
