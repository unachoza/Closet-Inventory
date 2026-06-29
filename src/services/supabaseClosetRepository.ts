import { getSupabase } from "../lib/supabaseClient";
import { normalizeMaterial } from "../utils/materialUtils";
import type { ClothingItem, MaterialBlend } from "../utils/types";
import type { ClosetRepository, ImportMode } from "./closetRepository";

// ── DB row shape (what Supabase returns) ─────────────────────────────────────

interface ItemRow {
	id: string;
	closet_id: string;
	location_id: string | null;
	name: string;
	category: string;
	brand: string | null;
	color: string | null;
	size: string | null;
	purchase_price: number | null;
	original_price: number | null;
	purchase_date: string | null;
	condition: string | null;
	on_sale: boolean;
	notes: string | null;
	primary_photo_url: string | null;
	status: string | null;
	item_fit: string | null;
	measurements: unknown | null;
	acquisition_type: string | null;
	country_of_origin: string | null;
	is_sentimental: boolean;
	is_high_value: boolean;
	is_private: boolean;
	is_lendable: boolean;
	occasion: string | null;
	care: string[];
	qty: number | null;
	style: unknown | null;
	worn_count: number;
	last_worn_at: string | null;
	loan: unknown | null;
	updated_at: string;
	item_materials: Array<{ fiber: string; percentage: number | null }>;
}

// ── Mapping helpers ───────────────────────────────────────────────────────────

function rowToItem(row: ItemRow): ClothingItem {
	return {
		id: row.id,
		name: row.name,
		category: row.category,
		brand: row.brand ?? "",
		color: row.color ?? "",
		size: row.size ?? "",
		imageURL: row.primary_photo_url ?? "",
		price: row.purchase_price != null ? String(row.purchase_price) : undefined,
		originalPrice: row.original_price != null ? String(row.original_price) : undefined,
		purchaseDate: row.purchase_date ?? undefined,
		condition: row.condition ?? undefined,
		onSale: row.on_sale,
		notes: row.notes ?? undefined,
		occasion: row.occasion ?? "",
		care: row.care,
		qty: row.qty ?? undefined,
		style: (row.style as ClothingItem["style"]) ?? undefined,
		material: (row.item_materials ?? []).map((m): MaterialBlend => ({ material: m.fiber, percentage: m.percentage ?? 0 })),
		locationId: row.location_id ?? undefined,
		status: (row.status as ClothingItem["status"]) ?? undefined,
		itemFit: (row.item_fit as ClothingItem["itemFit"]) ?? undefined,
		measurements: (row.measurements as ClothingItem["measurements"]) ?? undefined,
		acquisitionType: (row.acquisition_type as ClothingItem["acquisitionType"]) ?? undefined,
		countryOfOrigin: row.country_of_origin ?? undefined,
		isSentimental: row.is_sentimental,
		isHighValue: row.is_high_value,
		isPrivate: row.is_private,
		isLendable: row.is_lendable,
		wornCount: row.worn_count,
		lastWornAt: row.last_worn_at ?? undefined,
		loan: (row.loan as ClothingItem["loan"]) ?? undefined,
		updatedAt: row.updated_at,
	};
}

function itemToRow(item: ClothingItem, closetId: string): Record<string, unknown> {
	return {
		id: item.id,
		closet_id: closetId,
		location_id: item.locationId ?? null,
		name: item.name,
		category: item.category,
		brand: item.brand || null,
		color: item.color || null,
		size: item.size || null,
		purchase_price: item.price ? parseFloat(item.price) : null,
		original_price: item.originalPrice ? parseFloat(item.originalPrice) : null,
		purchase_date: item.purchaseDate ?? null,
		condition: item.condition ?? null,
		on_sale: item.onSale ?? false,
		notes: Array.isArray(item.notes) ? item.notes.join("\n") : (item.notes ?? null),
		primary_photo_url: item.imageURL || null,
		status: item.status ?? null,
		item_fit: item.itemFit ?? null,
		measurements: item.measurements ?? null,
		acquisition_type: item.acquisitionType ?? null,
		country_of_origin: item.countryOfOrigin ?? null,
		is_sentimental: item.isSentimental ?? false,
		is_high_value: item.isHighValue ?? false,
		is_private: item.isPrivate ?? false,
		is_lendable: item.isLendable ?? true,
		occasion: item.occasion || null,
		care: Array.isArray(item.care) ? item.care : item.care ? [item.care] : [],
		qty: item.qty ?? null,
		style: item.style ?? null,
		worn_count: item.wornCount ?? 0,
		last_worn_at: item.lastWornAt ?? null,
		loan: item.loan ?? null,
	};
}

async function upsertMaterials(itemId: string, material: ClothingItem["material"]): Promise<void> {
	const supabase = getSupabase();
	const normalized = normalizeMaterial(material);
	await supabase.from("item_materials").delete().eq("item_id", itemId);
	if (normalized.length > 0) {
		await supabase.from("item_materials").insert(normalized.map((m) => ({ item_id: itemId, fiber: m.material, percentage: m.percentage })));
	}
}

// ── Repository ────────────────────────────────────────────────────────────────

export class SupabaseClosetRepository implements ClosetRepository {
	private readonly userId: string;
	private closetIdCache: string | null = null;

	constructor(userId: string) {
		this.userId = userId;
	}

	/**
	 * Resolves the user's default closet id.
	 *
	 * Every signup gets a profile + "My Closet" + owner membership created
	 * server-side by the `handle_new_user()` trigger (SECURITY DEFINER, RLS-
	 * bypassed — see 20260626000001_v1_spine.sql). So this only ever SELECTs the
	 * membership; it never creates a closet client-side (which RLS would reject,
	 * since the user isn't a member of a closet that doesn't exist yet).
	 */
	private async resolveClosetId(): Promise<string> {
		if (this.closetIdCache) return this.closetIdCache;

		const supabase = getSupabase();

		const { data: member, error } = await supabase
			.from("closet_members")
			.select("closet_id")
			.eq("user_id", this.userId)
			.order("joined_at")
			.limit(1)
			.maybeSingle();

		if (error) throw new Error(`Failed to resolve closet: ${error.message}`);
		if (!member) {
			throw new Error(
				"No closet found for user — the handle_new_user bootstrap trigger may not have run.",
			);
		}

		this.closetIdCache = member.closet_id as string;
		return this.closetIdCache;
	}

	async getAll(): Promise<ClothingItem[]> {
		const supabase = getSupabase();
		const closetId = await this.resolveClosetId();

		const { data, error } = await supabase
			.from("items")
			.select("*, item_materials(fiber, percentage)")
			.eq("closet_id", closetId)
			.order("created_at");

		if (error) throw new Error(`getAll failed: ${error.message}`);
		return (data as ItemRow[]).map(rowToItem);
	}

	async getById(id: string): Promise<ClothingItem | null> {
		const supabase = getSupabase();

		const { data, error } = await supabase.from("items").select("*, item_materials(fiber, percentage)").eq("id", id).single();

		if (error) return null;
		return rowToItem(data as ItemRow);
	}

	async add(item: ClothingItem): Promise<ClothingItem> {
		const supabase = getSupabase();
		const closetId = await this.resolveClosetId();

		const { error } = await supabase.from("items").upsert(itemToRow(item, closetId));
		if (error) throw new Error(`add failed: ${error.message}`);

		await upsertMaterials(item.id, item.material);
		return item;
	}

	async update(id: string, patch: Partial<ClothingItem>): Promise<ClothingItem | null> {
		const supabase = getSupabase();

		const row = itemToRow(
			{
				id,
				name: "",
				category: "",
				imageURL: "",
				color: "",
				size: "",
				brand: "",
				material: [],
				occasion: "",
				care: "",
				...patch,
			} as ClothingItem,
			"",
		);
		// Only send defined fields
		const defined = Object.fromEntries(Object.entries(row).filter(([k, v]) => v !== undefined && k !== "closet_id" && k !== "id"));

		const { data, error } = await supabase.from("items").update(defined).eq("id", id).select("*, item_materials(fiber, percentage)").single();
		if (error) return null;

		if (patch.material !== undefined) {
			await upsertMaterials(id, patch.material);
		}
		return rowToItem(data as ItemRow);
	}

	async remove(id: string): Promise<void> {
		const supabase = getSupabase();
		await supabase.from("items").delete().eq("id", id);
	}

	async importItems(items: ClothingItem[], _mode: ImportMode): Promise<ClothingItem[]> {
		const closetId = await this.resolveClosetId();
		const supabase = getSupabase();

		if (items.length === 0) return [];

		const rows = items.map((item) => itemToRow(item, closetId));
		const { error } = await supabase.from("items").upsert(rows);
		if (error) throw new Error(`importItems failed: ${error.message}`);

		await Promise.all(items.map((item) => upsertMaterials(item.id, item.material)));
		return items;
	}

	async clear(): Promise<void> {
		const supabase = getSupabase();
		const closetId = await this.resolveClosetId();
		await supabase.from("items").delete().eq("closet_id", closetId);
	}
}
