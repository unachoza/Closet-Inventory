export interface MaterialBlend {
	name: string;
	pct: number;
	color: string;
}

export interface CareItem {
	emoji: string;
	label: string;
}

export interface ClothingDetail {
	name: string;
	brand: string;
	season: string;
	year: string;
	price: string;
	purchaseDate: string;
	retailer: string;
	condition: string;
	size: string;
	sizeSystem: string;
	fitType: string;
	color: string;
	pattern: string;
	material: MaterialBlend[];
	texture: string;
	category: string;
	subcategory: string;
	silhouette: string;
	hemLength: string;
	neckline: string;
	sleeve: string;
	closure: string;
	pockets: string;
	lining: string;
	transparency: string;
	occasion: string[];
	care: CareItem[];
	howAcquired: string;
	notes: string;
}

export const merinoSweater: ClothingDetail = {
	name: "Merino Crew Sweater",
	brand: "Icebreaker",
	season: "Fall / Winter",
	year: "2023",
	price: "$180",
	purchaseDate: "Oct 2023",
	retailer: "REI",
	condition: "Like New",
	size: "M",
	sizeSystem: "US",
	fitType: "True to size",
	color: "Heather Grey",
	pattern: "Solid",
	material: [
		{ name: "Merino Wool", pct: 96, color: "#4ab6f5" },
		{ name: "Elastane", pct: 4, color: "rgba(255,255,255,0.45)" },
	],
	texture: "Ribbed knit",
	category: "Sweaters",
	subcategory: "Pullover",
	silhouette: "Regular",
	hemLength: "Hip length",
	neckline: "Crew neck",
	sleeve: "Long sleeve",
	closure: "Pull-on",
	pockets: "None",
	lining: "None",
	transparency: "Opaque",
	occasion: ["Casual", "Everyday", "Outdoor"],
	care: [
		{ emoji: "🧼", label: "Cold wash" },
		{ emoji: "🌀", label: "Tumble low" },
		{ emoji: "🚫", label: "No bleach" },
		{ emoji: "🧺", label: "Hang dry" },
	],
	howAcquired: "Purchased",
	notes: "Favorite winter layer. Packs down small for travel.",
};
