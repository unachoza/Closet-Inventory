import { Option, Step, MaterialBlend, ItemStatus, WearState } from "./types.ts";
import { MY_CLOSET_DATA } from "./demoClosetData";
import TopIcon from "../assets/clothes-icons/blouse.svg";
import BottomIcon from "../assets/clothes-icons/trousers.svg";
import SweaterIcon from "../assets/clothes-icons/sweater.svg";
import CoatIcon from "../assets/clothes-icons/raincoat.svg";
import DressIcon1 from "../assets/clothes-icons/dress1.svg";
import GymClothesIcon from "../assets/clothes-icons/gym-clothes.svg";
import PajamasIcon from "../assets/clothes-icons/pajamas.svg";
import HeelIcon from "../assets/clothes-icons/heel.svg";
import IntimatesIcon from "../assets/clothes-icons/intimates.svg";
import SocksIcon from "../assets/clothes-icons/socks.svg";
import JumpsuitIcon from "../assets/clothes-icons/jumpsuit.svg";
import SwimIcon from "../assets/clothes-icons/leotard.svg";

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
	condition: "new" as WearState,
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

// Subjective wear states (canonical WearState values; humanize for display).
export const conditionOptions: WearState[] = ["new", "like_new", "good", "fair", "poor", "needs_repair"];

// E2: mutable lifecycle status (distinct from condition). E11 owns clean/dirty.
export const statusOptions: ItemStatus[] = ["clean", "dirty", "at_cleaner", "in_repair", "traveling", "on_loan"];

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
	{ label: "Swim", icon: SwimIcon },
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
	{ value: "swim", label: "Swim" },
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
	condition: ["new", "like_new", "good", "fair", "poor", "needs_repair"],
	age: clothesAgesOptions,
	care: careExamples,
	notes: [],
};

export const categoryDecisionTree = {
	tops: ["neckline", "sleave length"],
	bottoms: ["jeans rise"],
};

export { MY_CLOSET_DATA };

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
