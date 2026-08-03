import type { WeaveType } from "./textileTypes";

// Weave structures for the Fabric Guide. Lazy-view only — not on the initial-load path.

export const WEAVE_TYPES: WeaveType[] = [
	{
		id: "plain",
		name: "Plain Weave",
		description:
			"The simplest and oldest weave structure. Each warp thread passes alternately over and under each weft thread — a perfect checkerboard. Produces a flat, firm, and durable fabric with the most interlacing points of any weave, making it the strongest by thread count.",
		chips: ["Most interlacing points", "No right/wrong side", "Firm & durable", "Wrinkles easily"],
		fabrics: ["Muslin, Chambray, Chiffon (silk/poly)", "Organza, Taffeta, Crepe", "Canvas, Gauze, Voile", "Most cotton shirting"],
		compatibleFibers: "Cotton, linen, silk, polyester, wool — virtually all fibers. The most versatile weave structure.",
	},
	{
		id: "twill",
		name: "Twill Weave",
		description:
			"Threads pass over two or more threads before going under, with each row offset by one to create a characteristic diagonal rib. This diagonal interlacing distributes tension well, making twill one of the strongest and most durable weave structures. The diagonal also resists dirt and stains.",
		chips: ["Diagonal ribbing", "High durability", "Drapes well", "Dirt-resistant"],
		fabrics: ["Denim (3/1 twill) — cotton", "Gabardine, Chino — cotton/wool", "Herringbone, Houndstooth — wool", "Drill, Serge, Tweed"],
		compatibleFibers: "Variants: 2/1, 2/2, 3/1 twill. Herringbone reverses the diagonal. Cavalry twill has a steep double rib.",
	},
	{
		id: "satin",
		name: "Satin Weave",
		description:
			'Warp threads float over 4 or more weft threads before interlacing, creating long "floats" on the face of the fabric. Minimal interlacing points mean a smooth, lustrous, reflective surface — but also makes satin more prone to snags and less durable. True satin uses warp floats; sateen uses weft floats.',
		chips: ["Maximum luster", "Smooth surface", "Snag-prone", "Right/wrong sides"],
		fabrics: [
			"Satin — silk, polyester",
			"Charmeuse — silk (light satin)",
			"Sateen — cotton (weft floats)",
			"Duchesse — stiff silk satin for bridal",
		],
		compatibleFibers:
			"Silk is the classic choice — the triangular cross-section enhances luster. Polyester satin is widely used as an affordable alternative. Cotton sateen is weft-float satin.",
	},
	{
		id: "jacquard",
		name: "Jacquard Weave",
		description:
			"The Jacquard loom (1804) allows each individual warp thread to be controlled independently, enabling virtually unlimited pattern complexity woven directly into the fabric structure. Patterns don't fade, pill, or peel because they are the fabric itself, not printed or embroidered on top.",
		chips: ["Unlimited pattern complexity", "Pattern is structural", "High cost", "Durable patterns"],
		fabrics: ["Brocade — silk, cotton, wool", "Damask — silk, cotton, linen", "Tapestry — wool, cotton", "Matelassé (quilted appearance)"],
		compatibleFibers: "Invented by Joseph Marie Jacquard in 1804 — directly inspired Babbage's punch-card computing. Works with any fiber.",
	},
	{
		id: "knit",
		name: "Knit Structure",
		description:
			"Technically not a weave — knit fabric is formed by interlocking loops of yarn rather than crossing warp and weft. This loop structure allows knit to stretch in multiple directions without special additions. Jersey (single knit), rib, interlock, and fleece are all knit constructions.",
		chips: ["Natural 2-way stretch", "Drapes softly", "Can unravel (run)", "No selvedge edge"],
		fabrics: [
			"Jersey — cotton, wool, synthetic",
			"Rib knit — cotton, wool",
			"Fleece / French Terry — cotton, poly",
			"Performance mesh — polyester",
		],
		compatibleFibers: "Weft knit: horizontal loops (most garments). Warp knit: vertical loops (lace, intimates, swimwear).",
	},
	{
		id: "dobby",
		name: "Dobby Weave",
		description:
			"A dobby loom attachment allows groups of warp threads to be raised and lowered independently, creating small geometric repeat patterns — diamonds, dots, stripes — directly in the weave. More design capability than plain weave, but simpler and less expensive than Jacquard.",
		chips: ["Small geometric patterns", "Subtle texture", "Mid-range cost"],
		fabrics: ["Piqué — cotton (polo shirts)", "Dobby shirting — cotton", "Waffle cloth, Bird's eye", "Madras, End-on-end"],
		compatibleFibers: "Cotton is most common. Also used with linen, silk, and synthetic blends for suiting and dress shirts.",
	},
	{
		id: "pile",
		name: "Pile Weave",
		description:
			'Extra yarns are woven into a base fabric and then either left as loops (loop pile) or cut (cut pile). The resulting surface stands up from the base, creating depth, softness, and a luxurious texture. Pile fabric has a directional "nap" — always cut and press pile fabrics in one direction.',
		chips: ["Looped or cut", "Directional nap", "Plush texture", "Extra yarn"],
		fabrics: ["Velvet — silk, cotton, rayon", "Terry cloth / Toweling — cotton", "Corduroy — cotton, stretch", "Velour, Plush, Fleece"],
		compatibleFibers: "Loop pile: terry cloth (cotton). Cut pile: velvet (silk/rayon/cotton), corduroy, velour.",
	},
	{
		id: "leno",
		name: "Leno Weave",
		description:
			"Warp yarns are twisted in pairs around each weft thread, locking them in place despite the open gaps between them. This creates an extremely stable, sheer, net-like structure that resists distortion — the openings don't shift or stretch out of shape. Maximum breathability with structural integrity.",
		chips: ["Open mesh structure", "Very breathable", "Stable / won't distort", "Sheer"],
		fabrics: ["Gauze bandaging — cotton", "Cheesecloth, Mosquito netting", "Marquisette (sheer curtains)", "Some chiffon variations"],
		compatibleFibers: "Cotton, silk, linen, or fine synthetic. Used where stability in an open, sheer fabric is needed.",
	},
];
