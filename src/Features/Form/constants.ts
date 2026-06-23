// For coloring checkboxes
export const colorOptions = ["red", "brown", "black", "grey", "white", "floral", "blue", "gold", "green"];
export const sizeOptions = ["xs", "s", "m", "l", "0", "2", "4", "6", "8"];

interface Option {
	value: string;
	label: string;
}
export const options: Option[] = [
	{ value: "tops", label: "Tops" },
	{ value: "bottoms", label: "Bottoms" },
	{ value: "dresses", label: "Dresses" },
	{ value: "coats", label: "Coats" },
	{ value: "sweaters", label: "Sweaters" },
	{ value: "intimates", label: "Intimates" },
	{ value: "socks", label: "Socks" },
	{ value: "underwear", label: "Underwear" },
	{ value: "sleep", label: "Sleep" },
];

//Fibers
export const materials = {
	natural: ["wool", "linen", "cotton", "silk", "hemp", "cashmere", "bamboo", "ramie", "leather", "suede"],
	semiSynthetic: ["rayon", "viscos", "modal", "lyocell", "tencel"],
	//viscos and rayon when wet weaken
	//modal and tencel -> Lenzing closed loop?
	synthetic: ["polyester", "acrylic", "nylon", "spandex"],
};
