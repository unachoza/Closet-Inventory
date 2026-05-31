// ─────────────────────────────────────────────
//  fiberJourneyData.ts
//  Shared phase data for all three
//  Fiber-to-Garment Journey visualisations
// ─────────────────────────────────────────────

export interface PhaseStep {
	title: string;
	body: string;
	sources?: { label: string; url: string }[];
}

export interface Phase {
	id: string;
	number: number;
	name: string;
	shortLabel: string; // ≤ 3 words for wordless version
	icon: string; // emoji used in illustrations
	accentColor: string; // hex
	accentLight: string; // pale tint hex
	summary: string;
	steps: PhaseStep[];
}

export const PHASES: Phase[] = [
	{
		id: "sourcing",
		number: 1,
		name: "Fiber Sourcing",
		shortLabel: "Raw fiber",
		icon: "🌱",
		accentColor: "#5A7A60",
		accentLight: "#EEF4EF",
		summary: "The journey begins by extracting or synthesizing the raw materials that will eventually become thread, then fabric, then clothing.",
		steps: [
			{
				title: "Plant (Cellulosic)",
				body: "Cotton fibers are harvested from fluffy bolls on the cotton plant. Flax stems are retted — soaked in water to separate fibers — to create linen. Hemp fibers are mechanically stripped from plant stalks. All three are pure cellulose.",
				sources: [
					{
						label: "ACS: Fiber to Fabric",
						url: "https://www.acs.org/education/celebrating-chemistry-editions/2022-ncw/fiber-to-fabric.html",
					},
					{
						label: "Ecosilky: Natural Materials",
						url: "https://www.ecosilky.com.vn/en/which-natural-materials-are-used-to-obtain-fibres/",
					},
				],
			},
			{
				title: "Animal (Protein)",
				body: "Wool is sheared from sheep once or twice a year. Silk is painstakingly unraveled from the cocoons of silkworms — a single cocoon yields up to 1,500 m of continuous thread. Cashmere and mohair are combed from the soft undercoats of Cashmere and Angora goats.",
				sources: [
					{
						label: "Ethically Dressed: Production Process",
						url: "https://ethically-dressed.com/how-clothes-are-made-the-entire-production-process/",
					},
					{
						label: "ACS: Fiber to Fabric",
						url: "https://www.acs.org/education/celebrating-chemistry-editions/2022-ncw/fiber-to-fabric.html",
					},
				],
			},
			{
				title: "Synthetic (Petrochemical)",
				body: "Polymers like polyester (PET) and nylon (polyamide) are created by melting down petroleum-based chemicals. The molten polymer is extruded at high pressure through a spinneret — a metal plate with tiny holes, like a showerhead — to form continuous, uniform filaments that cool and solidify into fiber.",
				sources: [
					{
						label: "ACS: Fiber to Fabric",
						url: "https://www.acs.org/education/celebrating-chemistry-editions/2022-ncw/fiber-to-fabric.html",
					},
					{
						label: "Fibreguard: Polyester Fibres",
						url: "https://fibreguard.com/sell/blog/the-ins-and-outs-of-polyester-fibres-and-fabrics",
					},
				],
			},
			{
				title: "Regenerated (Semi-Synthetic)",
				body: "Natural polymers — primarily wood pulp (cellulose) from eucalyptus, beech, or bamboo — are chemically dissolved into a viscous solution, then extruded through a spinneret and solidified in an acid or solvent bath. This creates rayon (viscose), modal, and lyocell (TENCEL™). They are plant-derived but chemically processed.",
				sources: [
					{
						label: "Goyal Textiles: Journey of Fabric",
						url: "https://thegoyaltextiles.com/blog/the-journey-of-fabric-from-fiber-to-fashion/",
					},
					{
						label: "ACS: Fiber to Fabric",
						url: "https://www.acs.org/education/celebrating-chemistry-editions/2022-ncw/fiber-to-fabric.html",
					},
					{ label: "Artisan Stitch: Man-Made Fibres", url: "https://www.artisanstitch.co.uk/man-made-fibres/" },
				],
			},
		],
	},
	{
		id: "spinning",
		number: 2,
		name: "Yarn Spinning",
		shortLabel: "Spin yarn",
		icon: "🧵",
		accentColor: "#B8860B",
		accentLight: "#FDF4DC",
		summary: "Raw fibers — whether from plants, animals, or chemical processes — are transformed into long, continuous, workable threads called yarn.",
		steps: [
			{
				title: "Opening & Cleaning",
				body: "Bales of raw fiber are broken open and fed through opening machines that loosen, separate, and remove impurities like seeds (cotton), vegetable matter (wool), and dust. The fiber emerges as a fluffy, cloud-like mass called a lap.",
			},
			{
				title: "Carding & Drawing",
				body: "The lap is combed through fine wire rollers (carding) to align fibers parallel to each other, producing a soft, continuous rope called a sliver. Multiple slivers are then drafted (drawn out and slightly twisted) to improve evenness and fiber alignment.",
				sources: [
					{
						label: "Toyota Industries: Textile Process",
						url: "https://www.toyota-industries.com/products/relation/textile_process/",
					},
				],
			},
			{
				title: "Drafting & Twisting",
				body: "The sliver is progressively thinned and twisted together tightly on a spinning frame. Twisting binds the fibers together through friction, creating a strong, durable yarn. More twist = stronger but stiffer yarn; less twist = softer but weaker.",
				sources: [
					{
						label: "Ethically Dressed: Production Process",
						url: "https://ethically-dressed.com/how-clothes-are-made-the-entire-production-process/",
					},
				],
			},
			{
				title: "Synthetic & Filament Yarn",
				body: "Synthetic fibers begin as long continuous filaments, not short staple fibers. They can be used directly as filament yarn (smooth, lustrous), or they can be cut into short staple lengths and re-spun like natural fibers to mimic the texture of cotton or wool. They can also be air-jet texturized to add bulk and softness.",
				sources: [
					{
						label: "ACS: Fiber to Fabric",
						url: "https://www.acs.org/education/celebrating-chemistry-editions/2022-ncw/fiber-to-fabric.html",
					},
				],
			},
		],
	},
	{
		id: "construction",
		number: 3,
		name: "Fabric Construction",
		shortLabel: "Make fabric",
		icon: "🪡",
		accentColor: "#4A6B8A",
		accentLight: "#EEF3F8",
		summary: 'Yarn is interlaced, looped, or bonded to create usable fabric — at this stage often called "greige cloth" or grey goods — before any dyeing or finishing.',
		steps: [
			{
				title: "Weaving",
				body: "Performed on a loom, weaving interlaces two sets of perpendicular yarns: the warp (held taut lengthwise on the loom) and the weft (passed over and under the warp). The three fundamental weave structures — plain, twill, and satin — produce stable, non-stretch fabrics. More complex looms (Jacquard) can weave intricate patterns directly into the structure.",
				sources: [{ label: "Scribd: Types of Fabrics", url: "https://www.scribd.com/document/469107812/Types-of-Fabrics" }],
			},
			{
				title: "Knitting",
				body: "A single continuous yarn is interlooped using needles, either by hand or on a circular or flat industrial machine. Knit fabrics are naturally stretchy and comfortable because the loop structure allows movement. Jersey, rib, interlock, and French terry are all knit constructions.",
				sources: [{ label: "Scribd: Types of Fabrics", url: "https://www.scribd.com/document/469107812/Types-of-Fabrics" }],
			},
			{
				title: "Non-Woven",
				body: "Fibers are bonded directly into a sheet without being spun into yarn first. Bonding methods include: mechanical (needle-punching), thermal (heat fusing thermoplastic fibers), and chemical (adhesive bonding). Examples: felt, interfacing, and many medical and industrial textiles.",
				sources: [{ label: "Scribd: Types of Fabrics", url: "https://www.scribd.com/document/469107812/Types-of-Fabrics" }],
			},
		],
	},
	{
		id: "wetprocessing",
		number: 4,
		name: "Wet Processing",
		shortLabel: "Dye & finish",
		icon: "🎨",
		accentColor: "#C1622A",
		accentLight: "#FBF0E8",
		summary: 'The unfinished greige cloth undergoes a series of chemical and mechanical treatments — collectively called "wet processing" — that clean, colour, and finish it for garment use.',
		steps: [
			{
				title: "Preparation: Desizing & Scouring",
				body: "Greige cloth still contains sizing agents (starches added to strengthen warp yarns during weaving), natural waxes, oils, and processing residues. Desizing removes the starch; scouring uses alkaline detergents at high temperatures to remove all remaining impurities, leaving a clean, absorbent fabric ready for dyeing.",
				sources: [
					{
						label: "Fadfay: Stages in Textiles",
						url: "https://fadfay.com/blogs/blogs/what-are-the-stages-in-textiles-from-scratch-to-end-product-a-comprehensive-guide",
					},
				],
			},
			{
				title: "Bleaching",
				body: "Most natural fibers have a natural off-white or yellowish color. Bleaching (usually with hydrogen peroxide) removes natural pigments to produce a clean white base. This step is critical for producing bright whites and true, consistent colors in the subsequent dyeing step.",
			},
			{
				title: "Dyeing & Printing",
				body: "Color is applied either to the fiber, yarn, or finished fabric. Piece dyeing (submerging the whole fabric roll) produces a solid color. Screen printing or digital printing applies patterns. Yarn-dyed fabrics (like denim or plaid) are woven from pre-colored yarns to create structural patterns.",
				sources: [
					{
						label: "Global Textile Times",
						url: "https://www.globaltextiletimes.com/textile/key-insights-into-the-global-textile-industry-today/",
					},
				],
			},
			{
				title: "Finishing",
				body: "Mechanical and chemical finishes are applied to give the fabric specific performance characteristics. Examples: Calendering (hot rollers for sheen), mercerizing cotton (NaOH treatment for luster and dye uptake), DWR coating (water-repellency), resin finishing (wrinkle-resistance), and softening (silicone or enzymatic treatments).",
				sources: [
					{ label: "Juniper Publishers: Textile Finishing", url: "https://juniperpublishers.com/ctftte/CTFTTE.MS.ID.555601.php" },
				],
			},
		],
	},
	{
		id: "assembly",
		number: 5,
		name: "Garment Assembly",
		shortLabel: "Sew garment",
		icon: "✂️",
		accentColor: "#8B5A7A",
		accentLight: "#F6EFF4",
		summary: "The finished roll of dyed and treated textile is transformed into a wearable garment through grading, cutting, sewing, and quality control.",
		steps: [
			{
				title: "Grading & Pattern Marking",
				body: 'Designers create a base pattern in one size, then "grade" it mathematically into a full size range. The nested patterns are digitally or manually laid out onto the fabric in a process called "marking" — optimized to maximize fabric yield and minimize waste (offcuts). Efficiency here directly impacts cost and sustainability.',
				sources: [
					{
						label: "Fadfay: Stages in Textiles",
						url: "https://fadfay.com/blogs/blogs/what-are-the-stages-in-textiles-from-scratch-to-end-product-a-comprehensive-guide",
					},
				],
			},
			{
				title: "Cutting",
				body: 'Fabric is spread in multiple layers (called a "lay") and cut through all layers simultaneously using straight knives, band knives, or computer-controlled cutting machines (CNC cutters). Precision here is critical — a 1 mm error multiplied across thousands of garments creates significant waste and quality issues.',
				sources: [
					{
						label: "Kute Tailor: Clothing Manufacturing Guide",
						url: "https://www.kutetailor.com/blog/the-ultimate-definitive-guide-to-clothing-manufacturing.html",
					},
				],
			},
			{
				title: "Sewing & Assembly",
				body: "Cut pattern pieces are bundled and distributed to sewing operators. Each operator typically performs one or two specific stitching operations in a production line (bundle system or module system). Different stitch types (lockstitch, overlock, coverstitch) are used for different seams and fabrics. A single garment may require 20–100+ individual sewing operations.",
				sources: [
					{
						label: "Common Objective: Fibre to Fashion",
						url: "https://www.commonobjective.co/article/apparel-production-fibre-to-fabric-to-fashion",
					},
				],
			},
			{
				title: "Finishing, QC & Packaging",
				body: "Hardware (buttons, zippers, rivets), labels, and hang tags are attached. Garments are pressed, steamed, and inspected against technical specifications (measurements, stitch density, color, defects). Passing garments are folded or hung, tagged, and packaged for distribution to wholesale or retail.",
				sources: [
					{
						label: "Common Objective: Fibre to Fashion",
						url: "https://www.commonobjective.co/article/apparel-production-fibre-to-fabric-to-fashion",
					},
					{
						label: "Fadfay: Stages in Textiles",
						url: "https://fadfay.com/blogs/blogs/what-are-the-stages-in-textiles-from-scratch-to-end-product-a-comprehensive-guide",
					},
				],
			},
		],
	},
];
