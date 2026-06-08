import { Option, Step } from "./types.ts";

export const formItem = {
	id: "",
	category: "",
	color: "",
	size: "",
	brand: "",
	material: [] as import("./types").MaterialBlend[],
	occasion: "",
	age: "",
	condition: "new",
	purchaseDate: "",
	care: "",
	imageURL: "",
};

export const stepsLabels: Step[] = [
	{ step: 1, label: "Category" },
	{ step: 2, label: "Color" },
	{ step: 3, label: "Size" },
	{ step: 4, label: "Brand" },
	{ step: 5, label: "Material" },
	{ step: 6, label: "Occasion" },
	{ step: 7, label: "Age" },
	{ step: 8, label: "Care" },
];

export const steps = ["Category", "Color", "Size", "Brand", "Material", "Occasion", "Age", "Care", "Photo"];

export const colorOptions = ["red", "brown", "black", "grey", "white", "floral", "blue", "gold", "green", "orange", "yellow", "pink", "purple"];

export const sizeOptions = ["xs", "s", "m", "l", "0", "2", "4", "6", "8"];

export const clothesAgesOptions = ["new", "3 months", "6 months", "1 year", "18 months", "3 years", "vintage", "unknown"];

// Subjective condition states (replaces the old free-text "age" picker).
export const conditionOptions = ["new", "like new", "good", "fair", "needs repair"];

export const brandExamples = [
	"aritzia",
	"anthropologie",
	"banana republic",
	"zara",
	"gap",
	"everland",
	"express",
	"forever 21",
	"fenty",
	"lulu lemon",
];

export const materialExamples = ["cotton", "silk", "wool", "linen", "modal", "lace", "chiffon", "cashmere", "polyester", "rayon", "nylon", "spandex"];

export const occasionExamples = [
	"formal",
	"wedding",
	"cocktail",
	"going-out",
	"casual",
	"basics",
	"sports",
	"church",
	"picnic",
	"work wear",
	"everyday",
	"vacation",
	"holiday",
];

export const careExamples = ["dry clean only", "hand wash", "cold water", "hot water", "low heat", "hang dry", "lay flat dry"];

// Categories for the carousel
export const carouselCategories = [
	{ label: "Tops", icon: "👕" },
	{ label: "Bottoms", icon: "👖" },
	{ label: "Dresses", icon: "👗" },
	{ label: "Coats", icon: "🧥" },
	{ label: "Sweaters", icon: "🧶" },
	{ label: "Active", icon: "🏋️‍♀️" },
	{ label: "Lingerie", icon: "🎀" },
	{ label: "Socks", icon: "🧦" },
	{ label: "Underwear", icon: "🩲" },
	{ label: "body", icon: "🕴️" },
	{ label: "Shoes", icon: "👠" },
	{ label: "Sleep", icon: "😴" },
];

export const categoryOptions: Option[] = [
	{ value: "tops", label: "Tops" },
	{ value: "bottoms", label: "Bottoms" },
	{ value: "dresses", label: "Dresses" },
	{ value: "coats", label: "Coats" },
	{ value: "sweaters", label: "Sweaters" },
	{ value: "active", label: "Active" },
	{ value: "lingerie", label: "Lingerie" },
	{ value: "socks", label: "Socks" },
	{ value: "underwear", label: "Underwear" },
];

export const ClothingItemPossibilities = {
	id: "id number",
	imageURL: "url to image of clothing",
	name: " describe the clothing",
	category: categoryOptions,
	color: colorOptions,
	size: sizeOptions,
	brand: brandExamples,
	price: "USD",
	material: materialExamples,
	occasion: occasionExamples,
	// season: ["winter", "summer"],
	age: clothesAgesOptions,
	care: careExamples,
	notes: "",
};

export const categoryDecisionTree = {
	tops: ["neckline", "sleave length"],
	bottoms: ["jeans rise"],
};

export const MY_CLOSET_DATA = [
	{
		id: "001",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760378561/Screenshot_2025-10-13_at_11.02.15_AM_iigax2.png",
		name: "Sculpt Knit Racer Mini Dress | Bodycon Knit Pink dress",
		category: "dress",
		color: "pink",
		size: "M",
		brand: "aritzia",
		price: "$43.99",
		material: "knitt",
		occasion: "sporty",
		age: "one year",
		care: "hand wash",
		notes: "",
		onSale: true,
	},
	{
		id: "002",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760378561/Screenshot_2025-10-13_at_11.01.47_AM_cteckm.png",
		name: "Chill Malibu Dress | Black spagettig strap",
		category: "dress",
		color: "black",
		size: "M",
		brand: "aritzia",
		price: "$19.99",
		material: "knitt",
		occasion: "everyday",
		age: "one year",
		care: "hand wash",
		notes: "",
		onSale: true,
	},
	{
		id: "003",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760378933/Screenshot_2025-10-13_at_11.07.40_AM_ywvcnu.png",
		name: "Boyfriend Linen Shirt | White Buttonup",
		category: "top",
		color: "white",
		size: "M",
		brand: "aritzia",
		price: "$34.99",
		material: "linen",
		occasion: "wear to work",
		age: "one year",
		care: ["cold water", "hang dry"],
		notes: ["has a snag", " and a stain", "needs to be washed"],
		onSale: true,
	},
	{
		id: "004",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760378564/Screenshot_2025-10-13_at_11.01.56_AM_bj8hhy.png",
		name: "Contour Squareneck Mini Dress | Bodycon soft dress",
		category: "dress",
		color: "green",
		size: "L",
		brand: "aritzia",
		price: "$38.99",
		material: "modal",
		occasion: "everyday",
		age: "one year",
		care: "hand wash",
		notes: ["fits a little big around the waste"],
		onSale: true,
	},
	{
		id: "005",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760378560/Screenshot_2025-10-13_at_11.02.21_AM_wtckqg.png",
		name: "Sculpt Knit Squareneck Mini Dress | Brown midi dress",
		category: "dress",
		color: "brown",
		size: "L",
		brand: "aritzia",
		price: "$32.99",
		material: "knitt",
		occasion: "everyday",
		age: "one year",
		care: "hand wash",
		notes: ["loose everywhere"],
		onSale: true,
	},

	{
		id: "006",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760378929/Screenshot_2025-10-13_at_11.07.28_AM_n555pt.png",
		name: "Contour Off-shoulder Longsleeve Dress | Black off the shoulder dress",
		category: "dress",
		color: "black",
		size: "L",
		brand: "aritzia",
		price: "$34.99",
		material: "modal",
		occasion: "going out",
		age: "one year",
		care: "hand wash",
		notes: ["lost at the dry clearns on the upper east side"],
		onSale: true,
	},
	{
		id: "007",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760425172/Screenshot_2025-10-13_at_11.59.09_PM_gb0zvn.png",
		name: "Chill Malibu Dress | Roughed Black mini dress",
		category: "dress",
		color: "black",
		size: "M",
		brand: "aritzia",
		price: "$19.99",
		material: "modal",
		occasion: "casual",
		age: "one year",
		care: "hand wash",
		notes: ["hang dry"],
		onSale: true,
	},
	{
		id: "008",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760378928/Screenshot_2025-10-13_at_11.08.13_AM_auiyu5.png",
		name: "Pleated Pant | High waisted wide leg grey trousers",
		category: "bottom",
		color: "grey",
		size: "4",
		brand: "aritzia",
		price: "$148",
		material: "61% recycled polyester",
		occasion: "work",
		age: "two year",
		care: "machine wash cold",
		notes: [
			"Majo loves these",
			"long, must wear with heels",
			" These are high-waisted, relaxed-fit pants with a pleated front and slash hand pockets.  Expertly tailored in (Re)ssential — softly structured stretch fabric that holds its form while you move easy. ",
		],
		onSale: false,
	},

	{
		id: "009",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760467752/Screenshot_2025-10-14_at_11.48.56_AM_fxlwhs.png",
		name: "High-rise A-line mini skirt | black skirt",
		category: "bottom",
		color: "black",
		size: "M",
		brand: "aritzia",
		price: "$14.99",
		material: "65% LENZING™ ECOVERO™ Viscose, 30% nylon, 5% elastane",
		occasion: "going out",
		age: "two years",
		care: "machine wash",
		notes: [
			"wear with tights",
			"This is a high-rise bodycon mini skirt with an elastic waist. It's knit with stretchy double-knit ponte made from LENZING™ ECOVERO™ Viscose",
		],
		onSale: true,
	},
	{
		id: "010",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760378930/Screenshot_2025-10-13_at_11.07.46_AM_izbebo.png",
		name: "Destiny Blazer | Double-breasted blazer with shoulder pads",
		category: "coat",
		color: "Heather Turner Taupe Grey",
		size: "6",
		brand: "aritzia",
		price: "$166",
		material: "Content: 61% recycled polyester, 26% LENZING™ ECOVERO™ Viscose, 7% cotton, 6% elastane; Lining: 100% cupro",
		occasion: "work",
		age: "two years",
		care: "dry clean",
		notes: [
			"loose fitting",
			" This is a classic double-breasted blazer with a peaked lapel, welt pockets and shoulder pads. It's made with (Re)ssential — softly structured stretch fabric that holds its form while you move easy. ",
		],
		onSale: false,
	},
	{
		id: "011",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760468900/Screenshot_2025-10-14_at_12.03.34_PM_id3je6.png",
		name: "Sherpa Car Coat | Double-breasted blazer with shoulder pads",
		category: "coat",
		color: "brown",
		size: "M",
		brand: "Banana Republic",
		price: "$128.54",
		// was 400
		material: "Shell: 100% polyester; Lining: 100% cupro rayon",
		occasion: "winter",
		age: "two years",
		care: "machine wash",
		notes: [
			"loose fitting",
			"Take a trip of unexpected luxury with this sumptuously soft sherpa coat with meticulous diamond quilted lining to keep you cozy on every adventure. Oversized. Notch collar. Button closure. On-seam pockets. Two interior pockets. WARMER: Lightly lined with quilted lining so you can layer it through the seasons ",
			"Below-knee length",
		],
		onSale: true,
	},
	{
		id: "012",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760378933/Screenshot_2025-10-13_at_11.07.52_AM_o4sbhu.png",
		name: "Deniro Vest | Softly structured button-up suit vest",
		category: "top",
		color: "heather dark grey",
		size: "4",
		brand: "Aritzia",
		price: "$118",
		// was 400
		material: "Content: 61% polyester, 26% viscose, 7% cotton, 6% elastane; Lining: 100% cupro",
		occasion: "wear to work",
		age: "two years",
		care: "dry clean",
		notes: [
			"tight across boobs fitting",
			"This is a button-up vest with a classic fit and princess seams for shaping. ",
			"Fit: Classic — Follows your contours with a little room",
		],
		onSale: false,
	},
	{
		id: "013",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760469087/Screenshot_2025-10-14_at_12.11.15_PM_tindak.png",
		name: "Black Knit Oversized Sweater ",
		category: "sweater",
		color: "black",
		size: "S",
		brand: "Lulus",
		price: "$35",
		// was 44
		material: "95% Cotton, 5% Spandex",
		occasion: "casual",
		age: "4 years",
		care: "hand wash cold",
		notes: ["we fight about this", "fits perfect"],
		onSale: true,
	},
];

export const CLOSET_DATA = [
	{
		id: 100,
		imageURL: "https://static.zara.net/assets/public/8e51/b145/80904ae19a15/6e521e09414a/09314210822-a2/09314210822-a2.jpg?ts=1760022031725&amp;w=336",
		name: "black halter short dress",
		category: "dress",
		color: "red",
		size: "M",
		brand: "Zara",
		material: "cotton",
		occasion: "casual",
		age: 18,
		care: "wash like colors",
	},
];

export const FABRIC_CARE_ICONS: Record<string, string> = {
	"machine wash cold": "🧼",
	"tumble dry low": "🌀",
	"do not bleach": "🚫",
	"hand wash": "🤲",
	"hang dry": "🧺",
	"lay flat dry": "📏",
	"dry clean only": "🧴",
};

export const FABRIC_CARE_DESCRIPTIONS: Record<string, string> = {
	"machine wash cold": "Wash in cold water to prevent shrinking and color fading.",
	"tumble dry low": "Dry on a low heat setting to protect the fabric.",
	"do not bleach": "Avoid using bleach to maintain the integrity of the fabric.",
	"hand wash": "Gently wash by hand to preserve delicate fabrics.",
	"hang dry": "Hang to dry to prevent damage from heat.",
	"lay flat dry": "Lay flat to dry to maintain shape and avoid stretching.",
	"dry clean only": "Professional dry cleaning is recommended for this item.",
};

export const FABRIC_CARE_COLORS: Record<string, string> = {
	"machine wash cold": "#4A90E2",
	"tumble dry low": "#50E3C2",
	"do not bleach": "#D0021B",
	"hand wash": "#F5A623",
	"hang dry": "#9013FE",
	"lay flat dry": "#7ED321",
	"dry clean only": "#B8E986",
};

export const FABRIC_CARE_ICONS_DESCRIPTIONS: Record<string, { icon: string; description: string; color: string }> = Object.fromEntries(
	Object.entries(FABRIC_CARE_ICONS).map(([key, icon]) => [
		key,
		{
			icon,
			description: FABRIC_CARE_DESCRIPTIONS[key],
			color: FABRIC_CARE_COLORS[key],
		},
	]),
);

export const FABRIC_CARE_OPTIONS: Option[] = Object.keys(FABRIC_CARE_ICONS).map((key) => ({
	value: key,
	label: `${FABRIC_CARE_ICONS[key]} ${key}`,
}));

export const linksToFabricCareInfo = "https://textileengineering.net/natural-fibres-types-classification-properties-and-uses/";

const garmentCare = {
	title: "Garment Care",
	children: "Tips for maintaining your clothing items and care instructions for your garments.",
};

const travel = {
	title: "Travel",
	children: "Packing tips and travel-friendly outfit ideas.",
};

const trade = {
	title: "Trade",
	children: "Information on clothing swaps and sustainable shopping.",
};
const wardrobeAnalytics = {
	title: "Wardrobe Analytics",
	children: "Insights into your wardrobe patterns.",
};

const fashionHistory = {
	title: "Fashion History",
	children: "Explore the history of fashion and iconic styles.",
};
const wardrobePlanning = {
	title: "Wardrobe Planning",
	children: "Tools to help you plan your outfits and wardrobe.",
};
export const moreFeatures = [garmentCare, travel, trade, wardrobeAnalytics, fashionHistory, wardrobePlanning];
