import { Option, Step, MaterialBlend } from "./types.ts";
import TopIcon from "../assets/clothes-icons/blouse.svg";
import BottomIcon from "../assets/clothes-icons/trousers.svg";
import SweaterIcon from "../assets/clothes-icons/sweater.svg";
import CoatIcon from "../assets/clothes-icons/raincoat.svg";
import DressIcon1 from "../assets/clothes-icons/dress1.svg";
import GymClothesIcon from "../assets/clothes-icons/gym-clothes.svg";
import PajamasIcon from "../assets/clothes-icons/pajamas.svg";
import UnderwearIcon from "../assets/clothes-icons/underwear.svg";
import HeelIcon from "../assets/clothes-icons/heel.svg";
import IntimatesIcon from "../assets/clothes-icons/intimates.svg";
import SocksIcon from "../assets/clothes-icons/socks.svg";
import JumpsuitIcon from "../assets/clothes-icons/jumpsuit.svg";

const b = (material: string, percentage: number): MaterialBlend => ({ material, percentage });

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
	"athleisure",
	"church",
	"picnic",
	"work wear",
	"everyday",
	"vacation",
	"holiday",
	"elevated",
];

export const careExamples = ["dry clean only", "hand wash", "cold water", "hot water", "low heat", "hang dry", "lay flat dry"];

// Categories for the carousel
export const carouselCategories = [
	{ label: "Tops", icon: TopIcon },
	{ label: "Bottoms", icon: BottomIcon },
	{ label: "Dresses", icon: DressIcon1 },
	{ label: "Coats", icon: CoatIcon },
	{ label: "Sweaters", icon: SweaterIcon },
	{ label: "Athleisure", icon: GymClothesIcon },
	{ label: "Intimates", icon: IntimatesIcon },
	{ label: "Socks", icon: SocksIcon },
	{ label: "Underwear", icon: UnderwearIcon },
	{ label: "body", icon: JumpsuitIcon },
	{ label: "Shoes", icon: HeelIcon },
	{ label: "Sleep", icon: PajamasIcon },
];

export const categoryOptions: Option[] = [
	{ value: "tops", label: "Tops" },
	{ value: "bottoms", label: "Bottoms" },
	{ value: "dresses", label: "Dresses" },
	{ value: "coats", label: "Coats" },
	{ value: "sweaters", label: "Sweaters" },
	{ value: "athleisure", label: "Athleisure" },
	{ value: "intimates", label: "Intimates" },
	{ value: "socks", label: "Socks" },
	{ value: "underwear", label: "Underwear" },
	{ value: "shoes", label: "Shoes" },
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
	season: ["winter", "summer"],
	condition: ["new", "like new", "good", "poor", "needs repair"],
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
		purchaseDate: "2026-06-05T21:11:11.000Z",
		condition: "good",
		material: [
			{ material: "nylon", percentage: 99 },
			{ material: "elastane", percentage: 1 },
		],
		occasion: "elevated",
		care: ["hand wash", "lay flat"],
		notes: [
			"faint oil stain",
			"This is a racerback mini dress with a crew neckline and fully fashioned construction",
			"This garment is constructed using an Ottoman stitch with close distinct ribs for a structured and textural feel. ",
			"Fit: Tight — A close fit that hugs the body",
			"Length: Mini — Intended to hit between mid thigh and low thigh",
		],
		onSale: true,
	},
	{
		id: "002",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760378561/Screenshot_2025-10-13_at_11.01.47_AM_cteckm.png",
		name: "Henrietta Dress | Black spaghetti strap",
		category: "dress",
		color: "black",
		size: "S",
		brand: "aritzia",
		price: "$38.99",
		purchaseDate: "2023-03-07T05:59:07.000Z",
		condition: "good",
		material: [
			{ material: "viscose", percentage: 48 },
			{ material: "polyester", percentage: 30 },
			{ material: "nylon", percentage: 19 },
			{ material: "elastane", percentage: 3 },
		],
		occasion: "casual",
		care: ["machine wash", "cold water", "lay flat"],
		notes: [
			"This is a cami mini dress with adjustable straps and fully fashioned construction",
			"Double Knit stitch for structure and a flat, dense feel",
		],
		onSale: true,
	},
	{
		id: "003",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760378933/Screenshot_2025-10-13_at_11.07.40_AM_ywvcnu.png",
		name: "Boyfriend Linen Shirt | White Buttonup",
		category: "top",
		color: "white",
		size: "L",
		brand: "aritzia",
		price: "$34.99",
		purchaseDate: "2026-06-05T21:11:11.000Z",
		condition: "good",
		material: [
			{ material: "linen", percentage: 55 },
			{ material: "viscose", percentage: 45 },
		],
		occasion: "preppy",
		care: ["machine wash", "cold water", "hang dry"],
		notes: [
			"yellows easily",
			"This is a long-sleeve button-up shirt with a front patch pocket, raglan sleeves and a rounded hem",
			"relaxed fit",
		],
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
		purchaseDate: "2026-06-05T21:11:11.000Z",
		material: [
			{ material: "nylon", percentage: 94 },
			{ material: "elastane", percentage: 6 },
		],
		occasion: "elevated",
		care: ["hand wash", "cold water", "lay flat"],
		notes: [
			"fits a little big around the waste",
			"This is a mini tank dress with a double square neckline. It’s made with Babaton’s signature Contour — luxe, ultra-flattering fabric coveted for its smoothing effect and second-skin feel",
		],
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
		condition: "new",
		material: [
			{ material: "nylon", percentage: 99 },
			{ material: "elastane", percentage: 1 },
		],
		occasion: "elevated",
		purchaseDate: "2024-08-20T03:24:08.000Z",
		care: ["hand wash", "hang dry"],
		notes: [
			"loose everywhere",
			"with tags",
			"This garment is constructed using an Ottoman stitch with close distinct ribs for a structured and textural feel. ",
		],
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
		material: [
			{ material: "nylon", percentage: 94 },
			{ material: "elastane", percentage: 6 },
		],
		occasion: "going out",
		age: "one year",
		care: ["hand wash", "hang dry"],
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
		material: [
			{ material: "cotton", percentage: 95 },
			{ material: "elastane", percentage: 5 },
		],
		occasion: "casual",
		purchaseDate: "2026-06-05T21:11:11.000Z",
		care: ["machine wash", "cold water"],
		nnotes: ["Fit: Slim — Streamlined to fit close to the body", "Length: Mini — Intended to hit between mid thigh and low thigh"],
		onSale: true,
	},
	{
		id: "008",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1760378928/Screenshot_2025-10-13_at_11.08.13_AM_auiyu5.png",
		name: "Babaton Pleated Pant | High waisted wide leg grey trousers",
		category: "bottom",
		color: "grey",
		size: "4",
		brand: "aritzia",
		price: "$148",
		material: [
			{ material: "polyester", percentage: 61 },
			{ material: "viscose", percentage: 26 },
			{ material: "cotton", percentage: 7 },
			{ material: "elastane", percentage: 6 },
		],
		occasion: "work",
		purchaseDate: "2023-03-07T05:59:07.000Z",
		care: ["machine wash", "cold water"],
		notes: [
			"Majo loves these",
			"long, must wear with heels",
			" These are high-waisted, relaxed-fit pants with a pleated front and slash hand pockets.  Expertly tailored in (Re)ssential — softly structured stretch fabric that holds its form while you move easy. ",
			"Softly structured high-waisted wide-leg pleated pants",
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
		material: [
			{ material: "viscose", percentage: 65 },
			{ material: "nylon", percentage: 30 },
			{ material: "elastane", percentage: 5 },
		],
		condition: "good",
		occasion: "going out",
		purchaseDate: "2023-08-17T03:24:11.000Z",
		care: ["machine wash", "lay flat"],
		notes: ["wear with tights", "This is a high-rise bodycon mini skirt with an elastic waist. It's knit with stretchy double-knit ponte"],
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
		material: [b("recycled polyester", 61), b("viscose", 26), b("cotton", 7), b("elastane", 6)],
		occasion: "work",
		purchaseDate: "2023-08-23T01:59:09.000Z",
		condition: "good",
		care: "dry clean",
		notes: [
			"loose fitting",
			" This is a classic double-breasted blazer with a peaked lapel, welt pockets and shoulder pads. It's made with (Re)ssential — softly structured stretch fabric that holds its form while you move easy. ",
		],
		onSale: false,
	},
	{
		id: "011",
		imageURL: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1781163001/l_wp_699bd186ff353a34a178dd67_es6xwd.webp",
		name: "Sherpa Car Coat | Double-breasted blazer with shoulder pads",
		category: "coat",
		color: "brown",
		size: "M",
		brand: "Banana Republic",
		price: "$128.54",
		// was 400
		material: [b("polyester", 100)],
		occasion: "winter",
		condition: "good",
		purchaseDate: "2023-01-19T21:19:18.000Z",
		care: "machine wash",
		notes: [
			"loose fitting",
			"Take a trip of unexpected luxury with this sumptuously soft sherpa coat with meticulous diamond quilted lining to keep you cozy on every adventure. Oversized. Notch collar. Button closure. On-seam pockets. Two interior pockets. WARMER: Lightly lined with quilted lining so you can layer it through the seasons ",
			"Below-knee length",
			"SHERPA: Luxuriously soft, this vegan-friendly faux fur fabric looks and feels even better than the real thing. WARMEST: Fully lined and ultra-cozy, this style is designed to keep you warm through the coldest days. Wide notch lapel, Front pockets, Center back vent, Fully lined, Semi-fitted with room through the chest, arms and waist, Long sleeves, Knee length",
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
		material: [b("polyester", 61), b("viscose", 26), b("cotton", 7), b("elastane", 6)],
		occasion: "wear to work",
		condition: "good",
		purchaseDate: "2023-01-19T21:19:18.000Z",
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
		material: [b("cotton", 95), b("spandex", 5)],
		purchaseDate: "2021-11-10T01:02:37.000Z",
		condition: "needs repair",
		occasion: "casual",
		care: " wash cold",
		notes: ["we fight about this", "fits perfect", "small hole"],
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
		material: [b("cotton", 100)],
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
