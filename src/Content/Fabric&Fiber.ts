// ─────────────────────────────────────────────
//  textileData.ts
//  All static data for the Complete Textile
//  Compendium — fibers, weaves, care, sources
// ─────────────────────────────────────────────

export type FiberCategory = "animal" | "plant" | "semi" | "synth";

export interface FiberProp {
	label: string;
	value: number; // 0–100
	color: string;
}

export interface FiberDetailSection {
	title: string;
	content?: string;
	list?: string[];
}

export interface Fiber {
	id: string;
	name: string;
	category: FiberCategory;
	tagLabel: string;
	source: string; // e.g. "Merino sheep · Australia, NZ"
	description: string;
	imageUrl: string;
	imageAlt: string;
	properties: FiberProp[];
	detail: FiberDetailSection[];
}

export interface WeaveType {
	id: string;
	name: string;
	description: string;
	chips: string[];
	fabrics: string[]; // fabric names produced
	compatibleFibers: string; // plain prose note
}

export interface CareGroup {
	title: string;
	subtitle: string;
	items: {
		icon: string;
		label: string;
		value: string;
	}[];
}

export interface Source {
	num: string;
	title: string;
	url: string;
	domain: string;
}

// ─────────── FIBERS ───────────

export const FIBERS: Fiber[] = [
	/* ── ANIMAL ── */
	{
		id: "merino",
		name: "Merino Wool",
		category: "animal",
		tagLabel: "Animal · Sheep",
		source: "Merino sheep · Primarily Australia & New Zealand",
		imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=180&fit=crop&q=80",
		imageAlt: "Grey merino wool knit texture close-up",
		description:
			"The gold standard of wool. Merino's ultra-fine fibers (15–24 microns) make it remarkably soft — it does not itch like coarser wools. Naturally odor-resistant and temperature-regulating.",
		properties: [
			{ label: "Breathability", value: 90, color: "#5A7A60" },
			{ label: "Durability", value: 75, color: "#5A7A60" },
			{ label: "Softness", value: 88, color: "#5A7A60" },
			{ label: "Warmth", value: 85, color: "#5A7A60" },
		],
		detail: [
			{
				title: "What makes it special",
				content: "Merino fiber measures 15–24 microns in diameter — fine enough that it bends rather than pricks the skin. This prevents itching. The natural crimp creates millions of tiny air pockets, providing remarkable insulation while remaining breathable. It is naturally odor-resistant due to its protein structure, which binds odor molecules.",
			},
			{
				title: "Feel & handle",
				content: "Silky smooth and soft against skin. Has a slight natural bounce and elasticity due to its crimp. Drapes fluidly in fine-gauge knits. Higher micron counts (22–24µm) are used for outerwear; finer (15–18µm) for next-to-skin garments.",
			},
			{
				title: "Key facts",
				list: [
					"Can absorb up to 35% of its weight in moisture without feeling wet",
					"Naturally regulates temperature — warm in cold, cool in warmth",
					"Biodegradable within months in soil conditions",
					"Naturally flame-resistant — won't melt when burned",
					"Mulesing-free certifications available (ZQ, RWS)",
				],
			},
			{
				title: "Care",
				list: [
					"Hand wash or machine wash on wool/delicate cycle",
					"Cold water — max 30 °C",
					"Wool-specific detergent (Eucalan, Woolite, Perwoll)",
					"Lay flat to dry — never tumble dry or hang",
					"Store folded with cedar blocks. Clean before storing.",
				],
			},
		],
	},
	{
		id: "cashmere",
		name: "Cashmere",
		category: "animal",
		tagLabel: "Animal · Cashmere Goat",
		source: "Capra hircus laniger · Mongolia, Inner Mongolia, Kashmir Region",
		imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&h=180&fit=crop&q=80",
		imageAlt: "Soft cashmere knit fabric texture",
		description:
			"Combed from the soft undercoat of Cashmere goats, this is one of the world's most luxurious fibers. Warmer than wool by weight, incredibly lightweight, and develops a beautiful drape.",
		properties: [
			{ label: "Breathability", value: 80, color: "#B8860B" },
			{ label: "Durability", value: 50, color: "#B8860B" },
			{ label: "Softness", value: 97, color: "#B8860B" },
			{ label: "Warmth", value: 92, color: "#B8860B" },
		],
		detail: [
			{
				title: "What makes it special",
				content: "Cashmere is the downy undercoat of the Cashmere goat, combed (not sheared) during the spring molt. Each goat yields only 150–200 g of combed fiber per year — requiring 3–5 goats to make one sweater. Its fineness (14–19 microns) and scales make it exceptionally soft with a natural warmth-to-weight ratio superior to regular wool.",
			},
			{
				title: "Key facts",
				list: [
					"8× warmer than sheep's wool by weight",
					"Prone to pilling — premium grade 1 pills less",
					"Price ranges from $80 to $3,000+ depending on grade",
					"Susceptible to moths — store with cedar or lavender",
					"Mongolia produces ~70% of world's raw cashmere",
				],
			},
			{
				title: "Care",
				list: [
					"Hand wash in cool water, pH-neutral or baby shampoo",
					"Gently squeeze — never wring or twist",
					"Lay flat on a towel to dry in original shape",
					"Steam rather than iron when possible",
					"Depill with a cashmere comb or fine-toothed fabric shaver",
					"Wash only when necessary — frequent washing weakens fibers",
				],
			},
		],
	},
	{
		id: "mohair",
		name: "Mohair",
		category: "animal",
		tagLabel: "Animal · Angora Goat",
		source: "Capra hircus aegagrus (Angora breed) · South Africa, Texas, Turkey",
		imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=400&h=180&fit=crop&q=80",
		imageAlt: "Fluffy mohair angora goat yarn texture",
		description:
			'Called the "Diamond Fiber," mohair has a brilliant luster unlike any other natural fiber. Highly durable and resilient — it doesn\'t felt or pill easily and takes dye in exceptionally vivid colors.',
		properties: [
			{ label: "Breathability", value: 78, color: "#C1622A" },
			{ label: "Durability", value: 88, color: "#C1622A" },
			{ label: "Luster", value: 95, color: "#C1622A" },
			{ label: "Warmth", value: 80, color: "#C1622A" },
		],
		detail: [
			{
				title: "What makes it special",
				content: 'Called the "Diamond Fiber," mohair has a brilliant natural luster that no other protein fiber can match. Unlike cashmere, it is highly durable and resilient — it resists felting, pilling, and creasing. The fiber has a smooth, relatively scale-free surface, which gives it its characteristic sheen and makes it naturally stain-resistant.',
			},
			{
				title: "Key facts",
				list: [
					"South Africa produces ~50% of the world's mohair supply",
					"Kid mohair: 23–29 microns; adult: 30–40 microns",
					"Highly resilient — can be bent 20,000 times without breaking",
					"Often blended with wool or silk for combined properties",
					"MOHAIR SA and IAMAB certify responsible production",
				],
			},
			{
				title: "Care",
				list: [
					"Hand wash or dry clean",
					"Cool water only — use wool wash detergent",
					"Never agitate — gently squeeze and rinse",
					"Lay flat to dry to prevent stretching",
					"Shake to restore the halo after drying",
				],
			},
		],
	},
	{
		id: "silk",
		name: "Silk",
		category: "animal",
		tagLabel: "Animal · Silkworm",
		source: "Bombyx mori silkworm · China, India, Japan, Thailand",
		imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=180&fit=crop&q=80",
		imageAlt: "Shimmery silk fabric with natural luster",
		description:
			"A single silkworm cocoon can yield up to 1,000 meters of continuous fiber. The result is a naturally lustrous, hypoallergenic fabric with unparalleled drape and a cool-to-the-touch feel.",
		properties: [
			{ label: "Breathability", value: 88, color: "#8B5A7A" },
			{ label: "Durability", value: 65, color: "#8B5A7A" },
			{ label: "Luster", value: 99, color: "#8B5A7A" },
			{ label: "Softness", value: 92, color: "#8B5A7A" },
		],
		detail: [
			{
				title: "What makes it special",
				content: "Silk is the only natural fiber produced as a continuous filament — one silkworm cocoon contains up to 1,500 meters of thread. The resulting fiber is triangular in cross-section, which acts as a prism, refracting light into its characteristic shimmer. It is the strongest natural fiber (by diameter), hypoallergenic, and naturally thermoregulating.",
			},
			{
				title: "Key facts",
				list: [
					"China produces ~80% of world silk (sericiculture = silk farming)",
					"5,000+ years of cultivation history in China",
					"Weakens by ~20% when wet — handle very gently",
					"UV rays degrade silk — avoid prolonged sunlight storage",
					"Momme weight (mm) measures silk density: 12mm = light, 22mm = heavy",
				],
			},
			{
				title: "Care",
				list: [
					"Hand wash in cool water with silk-specific detergent",
					"Or dry clean — especially for structured silk garments",
					"Never wring — roll in a towel to remove moisture",
					"Dry in shade — sunlight yellows and weakens silk",
					"Iron on silk/cool setting while slightly damp, on reverse",
					"Avoid perfume and deodorant directly on silk",
				],
			},
		],
	},
	{
		id: "alpaca",
		name: "Alpaca",
		category: "animal",
		tagLabel: "Animal · Alpaca",
		source: "Vicugna pacos · Peruvian, Bolivian & Chilean Andes (3,500–5,000 m)",
		imageUrl: "https://images.unsplash.com/photo-1574710813-62b2db8a2ee6?w=400&h=180&fit=crop&q=80",
		imageAlt: "Natural alpaca fiber texture",
		description:
			'Hypoallergenic because it lacks lanolin. Alpaca fiber is lighter, warmer, and stronger than sheep\'s wool with a silky feel. "Baby alpaca" refers to the finest grade, not young animals.',
		properties: [
			{ label: "Breathability", value: 82, color: "#5A7A60" },
			{ label: "Durability", value: 80, color: "#5A7A60" },
			{ label: "Softness", value: 85, color: "#5A7A60" },
			{ label: "Warmth", value: 94, color: "#5A7A60" },
		],
		detail: [
			{
				title: "What makes it special",
				content: 'Alpaca fiber contains no lanolin, making it hypoallergenic and accessible to those sensitive to wool. The hollow structure of alpaca fiber creates exceptional warmth-to-weight ratio — warmer than wool and lighter too. "Baby alpaca" (the finest grade, 18–22 microns) is exceptionally soft.',
			},
			{
				title: "Key facts",
				list: [
					"Two breeds: Huacaya (fluffy, most common) and Suri (silky, less common)",
					"Hypoallergenic — no lanolin means no common wool allergy trigger",
					"One alpaca yields 2–4 kg fiber per year",
					"Fiber grades: Baby (<22µm), Fine (22–25.5µm), Medium (25.5–32µm)",
					"Sustainable: low water use, soft hooves don't damage land",
				],
			},
			{
				title: "Care",
				list: [
					"Hand wash cold or machine delicate cycle",
					"Lay flat to dry — alpaca can stretch if hung wet",
					"Gentle wool detergent or baby shampoo",
					"Rarely needs washing — air between wears",
					"Store folded with cedar. Moths can damage alpaca.",
				],
			},
		],
	},
	{
		id: "angora",
		name: "Angora",
		category: "animal",
		tagLabel: "Animal · Angora Rabbit",
		source: "Oryctolagus cuniculus (Angora breed) · China, France, Germany, Americas",
		imageUrl: "https://images.unsplash.com/photo-1548036161-6df28aced7a6?w=400&h=180&fit=crop&q=80",
		imageAlt: "Fluffy soft white angora rabbit fiber",
		description:
			"Exceptionally fine and fluffy, angora fiber has a distinctive halo effect and is incredibly soft. Often blended with other fibers for structure, as pure angora can shed.",
		properties: [
			{ label: "Softness", value: 98, color: "#B8860B" },
			{ label: "Warmth", value: 88, color: "#B8860B" },
			{ label: "Durability", value: 35, color: "#B8860B" },
			{ label: "Breathability", value: 60, color: "#B8860B" },
		],
		detail: [
			{
				title: "What makes it special",
				content: 'Angora fiber is the finest animal fiber commonly used in textiles, at 12–16 microns. It has a distinctive "halo" or cloud-like appearance due to its microscopic hollow structure. This hollow core makes it much lighter than wool at equivalent warmth — about 7× warmer per weight than sheep wool.',
			},
			{
				title: "Care",
				list: [
					"Hand wash only, very gently in cold water",
					"Use baby shampoo or angora-specific wash",
					"Never agitate or rub — the fine fibers tangle instantly",
					"Dry flat on towel — never hang or tumble dry",
					"Store in breathable bag. Cedar essential for moth prevention.",
				],
			},
		],
	},
	{
		id: "vicuna",
		name: "Vicuña",
		category: "animal",
		tagLabel: "Animal · Vicuña",
		source: "Vicugna vicugna · Andes (Argentina, Bolivia, Chile, Peru) — protected",
		imageUrl: "https://images.unsplash.com/photo-1567161322021-2c2db16bbb8c?w=400&h=180&fit=crop&q=80",
		imageAlt: "Luxury camel natural fine fiber",
		description:
			"The rarest and most expensive natural fiber in the world. At 12–14 microns, it is the finest fiber known. Once reserved for Incan royalty.",
		properties: [
			{ label: "Fineness", value: 100, color: "#C1622A" },
			{ label: "Rarity", value: 100, color: "#C1622A" },
			{ label: "Softness", value: 100, color: "#C1622A" },
			{ label: "Warmth", value: 93, color: "#C1622A" },
		],
		detail: [
			{
				title: "What makes it special",
				content: 'At 12–14 microns, vicuña fiber is the finest known natural fiber — finer even than cashmere or qiviut. The vicuña is a protected wild species related to the alpaca, and its fiber can only be collected through the traditional Andean "chaku" round-up where animals are herded, shorn, and released. Each animal yields only 200–400 g of fiber per two-year shearing cycle.',
			},
			{
				title: "Key facts",
				list: [
					"World's most expensive natural fiber: $400–$600/kg raw, $3,000+ per garment",
					"Once reserved exclusively for Incan royalty under penalty of death",
					"Listed under CITES — international trade strictly regulated",
					"Peru holds ~80% of world's vicuña population (~400,000 animals)",
					"Annual global production: ~5,000–6,000 kg",
				],
			},
			{
				title: "Care",
				list: [
					"Dry clean only — do not attempt home washing",
					"Air gently after wearing — minimal washing needed",
					"Store folded in acid-free tissue in cool, dry environment",
					"Treat as a heirloom — proper care preserves it for decades",
				],
			},
		],
	},
	{
		id: "qiviut",
		name: "Qiviut",
		category: "animal",
		tagLabel: "Animal · Musk Ox",
		source: "Ovibos moschatus · Arctic Alaska & Canada",
		imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=180&fit=crop&q=80",
		imageAlt: "Dark textured qiviut musk ox wool",
		description:
			"The ultra-fine underfleece of the Arctic musk ox. Naturally shed each spring, qiviut is 8× warmer than wool and hypoallergenic. One of the rarest fibers.",
		properties: [
			{ label: "Warmth", value: 98, color: "#5A7A60" },
			{ label: "Softness", value: 95, color: "#5A7A60" },
			{ label: "Durability", value: 70, color: "#5A7A60" },
			{ label: "Rarity", value: 98, color: "#5A7A60" },
		],
		detail: [
			{
				title: "What makes it special",
				content: 'Qiviut (pronounced "kiv-ee-oot") is the downy underfleece of the musk ox, naturally shed each spring. At 16–20 microns, it is finer than cashmere and approximately 8× warmer than wool by weight. Remarkably, it does not shrink or felt when washed — unique among protein fibers.',
			},
			{
				title: "Care",
				list: [
					"Hand wash in cool or lukewarm water with gentle soap",
					"Rinse carefully and lay flat to dry",
					"Remarkably easy care — does not felt",
					"Will not shrink in water — but avoid heat",
					"Fold and store in cool, dry location",
				],
			},
		],
	},

	/* ── PLANT ── */
	{
		id: "cotton",
		name: "Cotton",
		category: "plant",
		tagLabel: "Plant · Cotton Boll",
		source: "Gossypium hirsutum · USA, India, China, Brazil, Pakistan",
		imageUrl: "https://images.unsplash.com/photo-1503342394128-c24b3fbe23f8?w=400&h=180&fit=crop&q=80",
		imageAlt: "White cotton plant boll in field",
		description:
			"The world's most-used natural fiber. Cotton is soft, breathable, absorbent, and machine washable. It grows softer with each wash and is hypoallergenic.",
		properties: [
			{ label: "Breathability", value: 90, color: "#5A7A60" },
			{ label: "Durability", value: 80, color: "#5A7A60" },
			{ label: "Softness", value: 82, color: "#5A7A60" },
			{ label: "Absorbency", value: 88, color: "#5A7A60" },
		],
		detail: [
			{
				title: "Key grades",
				list: [
					"Egyptian cotton: Gossypium barbadense — long staple, silky, premium",
					"Pima cotton (Supima): Similar to Egyptian, grown in US Southwest",
					"Upland cotton: Most common grade — everyday use",
					"Organic cotton: Grown without synthetic pesticides or fertilizers",
				],
			},
			{
				title: "Key facts",
				list: [
					"Conventional cotton uses ~16% of world's insecticides on 2.5% of farmland",
					"Organic cotton uses ~71% less water than conventional",
					"Wicks moisture but holds it (stays wet longer than synthetics)",
					"Wrinkles easily — blending with polyester reduces wrinkling",
				],
			},
			{
				title: "Care",
				list: [
					"Machine wash warm or cold — cold preserves color and reduces shrinkage",
					"Tumble dry low or line dry",
					"High-heat iron — cotton can take it well",
					"Use chlorine bleach only for white cotton; oxygen bleach for colors",
					"Pre-wash new cotton items — can shrink 5–10%",
				],
			},
		],
	},
	{
		id: "linen",
		name: "Linen",
		category: "plant",
		tagLabel: "Plant · Flax Stalk",
		source: "Linum usitatissimum · Belgium, France, Ireland, Netherlands",
		imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=180&fit=crop&q=80",
		imageAlt: "Natural linen fabric texture close-up",
		description:
			"One of the oldest textiles — found in Egyptian tombs. Linen is crisp, cool, and strongest when wet. It softens beautifully over time and is naturally antibacterial.",
		properties: [
			{ label: "Breathability", value: 95, color: "#5A7A60" },
			{ label: "Durability", value: 88, color: "#5A7A60" },
			{ label: "Softness", value: 65, color: "#5A7A60" },
			{ label: "Coolness", value: 96, color: "#5A7A60" },
		],
		detail: [
			{
				title: "Key facts",
				list: [
					"Belgium and Northern France: world's finest flax growing regions",
					"Naturally antibacterial and antifungal",
					"Becomes softer, stronger, and more lustrous with each wash",
					"Temperature regulation: cool in summer, warm in winter",
					"The oldest linen cloth dates to ~6500 BC in Turkey (Çatalhöyük)",
				],
			},
			{
				title: "Care",
				list: [
					"Machine wash warm (40 °C) or cold — it gets better with washing",
					"Line dry or tumble dry low — remove promptly to reduce wrinkles",
					"Iron damp with high heat — linen irons beautifully",
					"Do not dry clean — unnecessary and damages over time",
					"Embrace wrinkles — or iron damp for a crisp look",
				],
			},
		],
	},
	{
		id: "hemp",
		name: "Hemp",
		category: "plant",
		tagLabel: "Plant · Hemp Stalk",
		source: "Cannabis sativa L. · China, France, Romania, Canada",
		imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=180&fit=crop&q=80",
		imageAlt: "Hemp canvas natural fiber texture",
		description:
			"The most sustainable textile crop — requires no pesticides, enriches soil, uses minimal water, and yields 3× more fiber per acre than cotton.",
		properties: [
			{ label: "Durability", value: 95, color: "#5A7A60" },
			{ label: "Breathability", value: 85, color: "#5A7A60" },
			{ label: "Softness", value: 55, color: "#5A7A60" },
			{ label: "Eco-Rating", value: 98, color: "#5A7A60" },
		],
		detail: [
			{
				title: "Key facts",
				list: [
					"Grows to harvestable height in 70–110 days",
					"Sequesters more CO₂ than trees acre-for-acre",
					"Naturally UV-resistant — blocks more UV rays than cotton",
					"Retains heat better than cotton — natural insulation",
					"Contains no THC in the fiber — hemp and marijuana are different cultivars",
				],
			},
			{
				title: "Care",
				list: [
					"Machine wash cold or warm — tough fiber handles it well",
					"Tumble dry low or line dry",
					"Softens with every wash — improve over time",
					"Medium-high iron",
				],
			},
		],
	},
	{
		id: "ramie",
		name: "Ramie",
		category: "plant",
		tagLabel: "Plant · Ramie Stalk",
		source: "Boehmeria nivea · China, Japan, Brazil, Philippines",
		imageUrl: "https://images.unsplash.com/photo-1586495777744-4e6b8c9d1c02?w=400&h=180&fit=crop&q=80",
		imageAlt: "Woven natural ramie bast fiber",
		description:
			'Known as "China grass," ramie is one of the strongest natural fibers — 8× stronger than cotton and even stronger when wet. Lustrous like silk with a natural white sheen.',
		properties: [
			{ label: "Strength", value: 93, color: "#C1622A" },
			{ label: "Breathability", value: 88, color: "#C1622A" },
			{ label: "Softness", value: 45, color: "#C1622A" },
			{ label: "Luster", value: 78, color: "#C1622A" },
		],
		detail: [
			{
				title: "Key facts",
				list: [
					"One of the oldest fiber crops — cultivated in China for 6,000+ years",
					"Does not shrink — dimensionally very stable",
					"Naturally white — reduces dyeing requirements",
					"Harvested 3–6 times per year from the same plant",
					"Difficult to process — requires degumming to remove gummy resin",
				],
			},
			{
				title: "Care",
				list: [
					"Machine wash cold or lukewarm",
					"Lay flat or hang to dry — avoid excessive heat",
					"Iron on medium heat while damp for best results",
					"Does not shrink — a major care advantage over cotton",
				],
			},
		],
	},
	{
		id: "jute",
		name: "Jute",
		category: "plant",
		tagLabel: "Plant · Jute Stalk",
		source: "Corchorus capsularis & C. olitorius · Bangladesh, India, China",
		imageUrl: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&h=180&fit=crop&q=80",
		imageAlt: "Jute burlap golden fiber texture",
		description:
			'Called the "Golden Fiber," jute is the second most produced natural fiber globally (after cotton). Fully biodegradable and requires very little water or pesticide to grow.',
		properties: [
			{ label: "Strength", value: 85, color: "#5A7A60" },
			{ label: "Eco-Rating", value: 94, color: "#5A7A60" },
			{ label: "Softness", value: 20, color: "#5A7A60" },
			{ label: "Durability", value: 80, color: "#5A7A60" },
		],
		detail: [
			{
				title: "Key facts",
				list: [
					"Bangladesh produces ~70% of world's raw jute",
					"Completely biodegradable — decomposes in 1–2 seasons",
					"Often used in eco-packaging as plastic alternative",
					'Can be blended with silk for a "jute silk" blend — softer and shiny',
					"Low moisture retention — suitable for dry goods packaging",
				],
			},
			{
				title: "Care",
				list: [
					"Hand wash gently in cold water if necessary",
					"Line dry only — natural jute degrades in high heat",
					"Softer jute blends can be gentle machine washed cold",
					"Avoid prolonged moisture exposure — can mildew",
				],
			},
		],
	},

	/* ── SEMI-SYNTHETIC ── */
	{
		id: "viscose",
		name: "Viscose / Rayon",
		category: "semi",
		tagLabel: "Semi-Synthetic · Wood Pulp",
		source: 'Regenerated cellulose — Developed 1890s as "artificial silk"',
		imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=180&fit=crop&q=80",
		imageAlt: "Draped viscose rayon fabric",
		description:
			"The first generation of regenerated cellulose. Silky drape, excellent absorbency, soft feel. Weakens when wet and requires careful washing.",
		properties: [
			{ label: "Drape", value: 95, color: "#4A6B8A" },
			{ label: "Breathability", value: 83, color: "#4A6B8A" },
			{ label: "Durability", value: 45, color: "#4A6B8A" },
			{ label: "Eco-Rating", value: 40, color: "#4A6B8A" },
		],
		detail: [
			{
				title: "Production",
				content: "Wood pulp from beech, pine, bamboo, or eucalyptus is dissolved in sodium hydroxide and carbon disulfide, then extruded through a spinneret into an acid bath. Standard viscose production uses toxic chemicals that pose health and environmental risks when not properly managed.",
			},
			{
				title: "Care",
				list: [
					"Hand wash only in cool water, or dry clean",
					"Mild detergent — handle extremely gently",
					"Never wring or twist — very weak when wet",
					"Lay flat on towel to dry — hanging can distort shape",
					"Steam or iron on low setting while still slightly damp",
				],
			},
		],
	},
	{
		id: "modal",
		name: "Modal",
		category: "semi",
		tagLabel: "Semi-Synthetic · Beech Tree",
		source: "Fagus sylvatica (beech) · Primarily Austria and Central Europe (Lenzing)",
		imageUrl: "https://images.unsplash.com/photo-1589465885857-44538ae55f3f?w=400&h=180&fit=crop&q=80",
		imageAlt: "Soft modal beech fabric loungewear",
		description:
			"A second-generation rayon with improved wet strength. Silkier, stronger, and more resistant to shrinkage than standard viscose. Stays soft wash after wash.",
		properties: [
			{ label: "Drape", value: 90, color: "#4A6B8A" },
			{ label: "Durability", value: 68, color: "#4A6B8A" },
			{ label: "Softness", value: 90, color: "#4A6B8A" },
			{ label: "Eco-Rating", value: 65, color: "#4A6B8A" },
		],
		detail: [
			{
				title: "Key facts",
				list: [
					"50% more water-absorbent than cotton",
					"Maintains softness and shape through many washes",
					"Stronger wet than dry unlike standard viscose",
					"Biodegradable and made from renewable beech forests",
					"MicroModal is an even finer, more luxurious variant (half the diameter of silk)",
				],
			},
			{
				title: "Care",
				list: [
					"Machine wash cold or warm on gentle cycle",
					"Tumble dry low or lay flat/hang to dry",
					"Iron on low-medium heat",
					"Far more forgiving than standard viscose",
					"Avoid high heat — can cause shrinkage",
				],
			},
		],
	},
	{
		id: "tencel",
		name: "TENCEL™ / Lyocell",
		category: "semi",
		tagLabel: "Semi-Synthetic · Eucalyptus & Beech",
		source: "Eucalyptus globulus · Lenzing AG, Austria (TENCEL™ brand name)",
		imageUrl: "https://images.unsplash.com/photo-1617093818-d4b0c5c8d9a3?w=400&h=180&fit=crop&q=80",
		imageAlt: "TENCEL lyocell eucalyptus fabric",
		description:
			"The most sustainable regenerated fiber. Made via a closed-loop process that recycles 99%+ of solvents. Stronger than viscose, moisture-wicking, and breathable.",
		properties: [
			{ label: "Eco-Rating", value: 95, color: "#4A6B8A" },
			{ label: "Durability", value: 80, color: "#4A6B8A" },
			{ label: "Softness", value: 88, color: "#4A6B8A" },
			{ label: "Breathability", value: 87, color: "#4A6B8A" },
		],
		detail: [
			{
				title: "Sustainability credentials",
				content: "TENCEL™ is the gold standard in sustainable textiles. Eucalyptus requires 5–10× less water than cotton and can grow on non-arable land. The closed-loop process has virtually zero chemical waste. The fiber is certified biodegradable and compostable (OK Compost, OEKO-TEX).",
			},
			{
				title: "Care",
				list: [
					"Machine wash cold or warm on gentle cycle — much more robust than viscose",
					"Tumble dry low or hang/lay flat to dry",
					"Low heat iron",
					"TENCEL™ denim can be machine washed in cold water",
					"One of the easiest semi-synthetics to care for",
				],
			},
		],
	},
	{
		id: "bamboo",
		name: "Bamboo",
		category: "semi",
		tagLabel: "Semi-Synthetic · Bamboo Grass",
		source: "Phyllostachys edulis (Moso bamboo) · Primarily China",
		imageUrl: "https://images.unsplash.com/photo-1588675646184-14b4a2ae1f90?w=400&h=180&fit=crop&q=80",
		imageAlt: "Bamboo fabric soft texture",
		description:
			'Often marketed as eco-friendly, most "bamboo fabric" is actually bamboo viscose — chemically processed. The plant grows remarkably fast but processing method matters enormously.',
		properties: [
			{ label: "Softness", value: 88, color: "#4A6B8A" },
			{ label: "Moisture-Wick", value: 88, color: "#4A6B8A" },
			{ label: "Durability", value: 58, color: "#4A6B8A" },
			{ label: "Eco-Rating", value: 55, color: "#4A6B8A" },
		],
		detail: [
			{
				title: "Labeling note",
				content: 'The US FTC requires that bamboo fabric made via viscose process be labeled "bamboo rayon" or "bamboo viscose" — not simply "bamboo." True mechanically processed bamboo linen (rare and expensive) retains more of the original fiber\'s properties.',
			},
			{
				title: "Care",
				list: [
					"Hand wash or gentle machine wash cold — treat like viscose",
					"Lay flat or hang to dry",
					"Low-medium heat iron",
					"Avoid high heat — can cause shrinkage",
					"Handle gently when wet — weaker than cotton",
				],
			},
		],
	},
	{
		id: "cupro",
		name: "Cupro (Bemberg™)",
		category: "semi",
		tagLabel: "Semi-Synthetic · Cotton Linters",
		source: "Short cotton linters (cottonseed) · Asahi Kasei (Japan) — Bemberg™",
		imageUrl: "https://images.unsplash.com/photo-1606744824163-985d376605aa?w=400&h=180&fit=crop&q=80",
		imageAlt: "Cupro Bemberg silk-like fabric lining",
		description:
			"Made from waste cotton linters, dissolved in copper oxide solution. Has unmatched silk-like drape and is naturally antistatic. Used as luxury lining in high-end garments.",
		properties: [
			{ label: "Drape", value: 97, color: "#4A6B8A" },
			{ label: "Breathability", value: 85, color: "#4A6B8A" },
			{ label: "Softness", value: 92, color: "#4A6B8A" },
			{ label: "Durability", value: 50, color: "#4A6B8A" },
		],
		detail: [
			{
				title: "Key facts",
				list: [
					"Uses a waste product (cotton linters) — relatively sustainable raw material",
					"Antistatic — unlike most lining materials",
					"Biodegradable, unlike polyester lining (the common alternative)",
					"OEKO-TEX Standard 100 certified in responsible production",
					"Used by major luxury fashion houses as preferred lining",
				],
			},
			{
				title: "Care",
				list: [
					"Hand wash cold with delicate detergent",
					"Can also be dry cleaned",
					"Lay flat or hang to dry — no wringing",
					"Low iron setting, steam works well",
					"Avoid high temperatures",
				],
			},
		],
	},

	/* ── SYNTHETIC ── */
	{
		id: "polyester",
		name: "Polyester",
		category: "synth",
		tagLabel: "Synthetic · PET Polymer",
		source: "Polyethylene terephthalate — First commercial production 1941 (ICI, UK)",
		imageUrl: "https://images.unsplash.com/photo-1536494126589-caff6b0b7816?w=400&h=180&fit=crop&q=80",
		imageAlt: "Polyester synthetic technical fabric",
		description:
			"The world's most produced fiber at 57–65% of global output. Wrinkle-resistant, colorfast, quick-drying, and resistant to stretching. Can now be made from recycled PET bottles.",
		properties: [
			{ label: "Durability", value: 95, color: "#8B5A7A" },
			{ label: "Wrinkle-Res.", value: 95, color: "#8B5A7A" },
			{ label: "Breathability", value: 30, color: "#8B5A7A" },
			{ label: "Eco-Rating", value: 20, color: "#8B5A7A" },
		],
		detail: [
			{
				title: "Environmental reality",
				content: "Polyester manufacturing generates approximately 700 million metric tons of CO₂-equivalent annually. Each synthetic wash releases microplastic fibers — a Guppyfriend wash bag captures ~86% of these. Polyester is not biodegradable and can persist for hundreds of years. Recycled polyester (rPET) has ~30–50% lower carbon footprint than virgin polyester.",
			},
			{
				title: "Care",
				list: [
					"Machine wash cold — most polyester is easy care",
					"Tumble dry low — high heat can warp fibers permanently",
					"Use a Guppyfriend bag to reduce microplastic release",
					"Avoid fabric softener — coats fibers and reduces performance",
					"No bleach on colored polyester",
				],
			},
		],
	},
	{
		id: "nylon",
		name: "Nylon",
		category: "synth",
		tagLabel: "Synthetic · Polyamide",
		source: "Polyamide — DuPont, 1938 (world's first fully synthetic fiber)",
		imageUrl: "https://images.unsplash.com/photo-1571009763359-e51bfc0dd3e9?w=400&h=180&fit=crop&q=80",
		imageAlt: "Nylon performance fabric texture",
		description:
			"The first fully synthetic fiber. Exceptional strength, abrasion resistance, and elasticity. Lighter and more flexible than polyester.",
		properties: [
			{ label: "Strength", value: 95, color: "#8B5A7A" },
			{ label: "Elasticity", value: 85, color: "#8B5A7A" },
			{ label: "Breathability", value: 38, color: "#8B5A7A" },
			{ label: "UV Resistance", value: 30, color: "#8B5A7A" },
		],
		detail: [
			{
				title: "Key facts",
				list: [
					"UV radiation degrades nylon over time — fades and weakens outdoors",
					"Excellent abrasion resistance — outlasts polyester in high-wear applications",
					"Static electricity — attracts dust and lint",
					"Lower melting point than polyester — iron with more care",
					"ECONYL® recycled nylon from ocean plastic is a sustainable alternative",
				],
			},
			{
				title: "Care",
				list: [
					"Machine wash cold or warm on gentle cycle",
					"Tumble dry low or air dry",
					"Iron on very low heat or avoid ironing",
					"Avoid high heat — lower melting point than polyester",
					"No chlorine bleach",
				],
			},
		],
	},
	{
		id: "spandex",
		name: "Spandex / Lycra™",
		category: "synth",
		tagLabel: "Synthetic · Polyurethane",
		source: "Polyurethane — DuPont, 1958 (trade name: Lycra™)",
		imageUrl: "https://images.unsplash.com/photo-1542744094-24638eff58bb?w=400&h=180&fit=crop&q=80",
		imageAlt: "Spandex stretch lycra activewear fabric",
		description:
			"Can stretch 400–700% of its original length and return perfectly. Almost never used alone — blended at 2–25% with virtually any fiber to add stretch.",
		properties: [
			{ label: "Elasticity", value: 100, color: "#8B5A7A" },
			{ label: "Recovery", value: 98, color: "#8B5A7A" },
			{ label: "Breathability", value: 25, color: "#8B5A7A" },
			{ label: "Durability", value: 70, color: "#8B5A7A" },
		],
		detail: [
			{
				title: "Key facts",
				list: [
					'DuPont created spandex in 1958 — originally called "Fiber K"',
					'"Spandex" is the US term; "elastane" is used in Europe; Lycra™ is a DuPont brand',
					"Degrades with chlorine (pool water) and repeated heat exposure",
					"Can stretch 500–600% and recover — compared to rubber at 100%",
				],
			},
			{
				title: "Care",
				list: [
					"Machine wash cold — heat damages elastic properties",
					"Air dry or tumble dry very low heat",
					"Never chlorine bleach — destroys elastane fibers rapidly",
					"Avoid fabric softener — coats fibers and reduces stretch recovery",
					"Keep away from velcro — snags instantly and permanently",
				],
			},
		],
	},
	{
		id: "acrylic",
		name: "Acrylic",
		category: "synth",
		tagLabel: "Synthetic · Acrylonitrile",
		source: "Polyacrylonitrile — Commercial production since 1950s",
		imageUrl: "https://images.unsplash.com/photo-1574710813-62b2db8a2ee6?w=400&h=180&fit=crop&q=80",
		imageAlt: "Colorful acrylic yarn knit texture",
		description:
			"Designed to mimic wool: warm, lightweight, and soft. Holds vivid colors extremely well. Resists moths, mildew, and shrinkage. Significantly cheaper than wool but prone to pilling.",
		properties: [
			{ label: "Warmth", value: 82, color: "#8B5A7A" },
			{ label: "Color Retention", value: 93, color: "#8B5A7A" },
			{ label: "Breathability", value: 25, color: "#8B5A7A" },
			{ label: "Pilling Resist.", value: 30, color: "#8B5A7A" },
		],
		detail: [
			{
				title: "Key facts",
				list: [
					"Lightweight — can be 10–15% lighter than equivalent wool",
					"Holds dye exceptionally well — prints and colors stay vivid",
					"Moth and mildew resistant — advantage over wool for storage",
					"Microplastic shedder — similar environmental concerns to polyester",
				],
			},
			{
				title: "Care",
				list: [
					"Machine wash warm or cold on gentle cycle",
					"Lay flat to dry to prevent stretching — or tumble dry low",
					"Use low heat iron — acrylic can melt or glaze",
					"Remove pilling with a fabric shaver",
					"No bleach — damages the fiber",
				],
			},
		],
	},
	{
		id: "polypropylene",
		name: "Polypropylene",
		category: "synth",
		tagLabel: "Synthetic · Polypropylene Polymer",
		source: "Thermoplastic polymer — Used in technical textiles since 1970s",
		imageUrl: "https://images.unsplash.com/photo-1536494126589-caff6b0b7816?w=400&h=180&fit=crop&q=80",
		imageAlt: "Polypropylene technical performance fabric",
		description:
			"The only common textile fiber lighter than water. Does not absorb moisture at all — moisture migrates along the fiber surface. Ideal for base layers and outdoor performance gear.",
		properties: [
			{ label: "Moisture-Wick", value: 95, color: "#8B5A7A" },
			{ label: "Durability", value: 82, color: "#8B5A7A" },
			{ label: "Softness", value: 48, color: "#8B5A7A" },
			{ label: "Breathability", value: 50, color: "#8B5A7A" },
		],
		detail: [
			{
				title: "Key facts",
				list: [
					"Does not absorb water — 0% moisture absorption",
					"Lightest common textile fiber (lighter than water)",
					"Excellent thermal insulation when used in layered systems",
					"Resistant to most chemicals, mold, and bacteria",
					"Low melting point — cannot be ironed and requires careful care",
				],
			},
			{
				title: "Care",
				list: [
					"Machine wash cold only — low melting point is the main constraint",
					"Air dry only — cannot tumble dry (heat distorts)",
					"Never iron — will melt or permanently deform",
					"Very durable and easy care otherwise",
				],
			},
		],
	},
];

// ─────────── WEAVE TYPES ───────────

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
		compatibleFibers: "Weft knit: horizontal loops (most garments). Warp knit: vertical loops (lace, lingerie, swimwear).",
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

// ─────────── CARE GROUPS ───────────

export const CARE_GROUPS: CareGroup[] = [
	{
		title: "Wool, Cashmere & Mohair",
		subtitle: "Protein fibers. Sensitive to heat, agitation, and alkaline detergents. Never felt these.",
		items: [
			{
				icon: "🫧",
				label: "Washing",
				value: "Hand wash cold or machine delicate. Use wool-specific or pH-neutral detergent (e.g. Eucalan, Woolite).",
			},
			{
				icon: "💨",
				label: "Drying",
				value: "Lay flat to dry — never hang (causes stretching). Never tumble dry (causes irreversible felting).",
			},
			{
				icon: "🔥",
				label: "Ironing",
				value: "Cool iron with steam, or steam only. Press through a cloth. Never iron directly on cashmere.",
			},
			{
				icon: "📦",
				label: "Storage",
				value: "Fold — never hang. Store in breathable cotton bag with cedar. Clean before storing to repel moths.",
			},
			{
				icon: "⚡",
				label: "Pilling",
				value: "Use a cashmere comb or fabric shaver gently. Pilling is normal — especially in friction areas.",
			},
			{
				icon: "✨",
				label: "Pro Tip",
				value: "Cashmere and mohair don't need frequent washing. Air between wears — hang in a well-ventilated space overnight.",
			},
		],
	},
	{
		title: "Silk",
		subtitle: "Protein fiber. Loses up to 20% of strength when wet. Extremely sensitive to heat, sunlight, and alkaline chemicals.",
		items: [
			{
				icon: "🫧",
				label: "Washing",
				value: "Hand wash in cold water with silk-specific detergent. Or dry clean. Never wring — gently squeeze out water.",
			},
			{
				icon: "💨",
				label: "Drying",
				value: "Roll in a clean towel to absorb moisture, then hang in shade. Direct sunlight yellows and weakens silk.",
			},
			{
				icon: "🔥",
				label: "Ironing",
				value: "Iron slightly damp on the reverse side using a low/silk setting. Steam with care — water spots visible on some silks.",
			},
			{
				icon: "🚫",
				label: "Never",
				value: "Never bleach. Never machine wash (unless label says so). Never use deodorant directly against silk — alcohol damages it.",
			},
		],
	},
	{
		title: "Cotton & Linen",
		subtitle: "Cellulose fibers. The most forgiving of all natural fibers. Strengthen when wet. Durable and easy-care.",
		items: [
			{
				icon: "🫧",
				label: "Washing",
				value: "Machine wash warm or cold. Cold preserves colors and reduces shrinkage. Linen becomes softer with each wash.",
			},
			{
				icon: "💨",
				label: "Drying",
				value: "Tumble dry low or line dry. Remove promptly to reduce wrinkles. Linen wrinkles readily — embrace it or iron damp.",
			},
			{
				icon: "🔥",
				label: "Ironing",
				value: "Cotton and linen can take high heat. Iron damp for best results. Linen irons beautifully — press while slightly wet.",
			},
			{
				icon: "⚠️",
				label: "Shrinkage",
				value: "Pre-wash before sewing. Cotton can shrink 5–10%. Buy slightly larger if garment is not pre-washed/preshrunk.",
			},
		],
	},
	{
		title: "Viscose, Rayon, Modal & TENCEL™",
		subtitle: "Regenerated cellulose. Viscose and standard rayon weaken significantly when wet. Modal and TENCEL™ are much more stable.",
		items: [
			{
				icon: "🫧",
				label: "Viscose / Rayon",
				value: "Hand wash only in cool water, or dry clean. Never wring. Machine washing risks permanent distortion due to wet weakness.",
			},
			{
				icon: "🫧",
				label: "Modal & TENCEL™",
				value: "Machine wash cold on gentle cycle. Much more stable wet. Lay flat or hang to dry. Avoid high heat tumble drying.",
			},
			{
				icon: "🔥",
				label: "Ironing",
				value: "Low-medium heat. Steam is effective. These fabrics wrinkle easily but respond well to gentle steaming.",
			},
			{
				icon: "✨",
				label: "Tip",
				value: "TENCEL™ and Modal are significantly more care-friendly than viscose. Worth the small price premium for ease of care.",
			},
		],
	},
	{
		title: "Polyester, Nylon & Synthetics",
		subtitle: "The most care-resilient category. Cold water is the primary rule — high heat can permanently warp synthetic fibers.",
		items: [
			{
				icon: "🫧",
				label: "Washing",
				value: "Machine wash cold, gentle cycle. Most synthetics are very easy care — just avoid hot water, which can warp fibers.",
			},
			{
				icon: "💨",
				label: "Drying",
				value: "Low heat or air dry. Never high heat — can permanently warp polyester. Nylon melts at high temperatures.",
			},
			{
				icon: "🌊",
				label: "Microplastics",
				value: "Use a Guppyfriend wash bag to capture microfibers. Wash less frequently to reduce environmental impact.",
			},
			{
				icon: "🚫",
				label: "Spandex",
				value: "Never bleach spandex blends — chlorine destroys elastane. Avoid fabric softener — it reduces stretch recovery.",
			},
			{
				icon: "🔥",
				label: "Ironing",
				value: "Use low/synthetic setting. Always use a pressing cloth as synthetics can melt or develop shine.",
			},
			{
				icon: "💡",
				label: "Odor",
				value: "Add white vinegar to the rinse cycle. Technical sportswear detergents (Nikwax, Sport Wash) help significantly.",
			},
		],
	},
];

// ─────────── SOURCES ───────────

export const SOURCES: Source[] = [
	{
		num: "01",
		title: "Ultimate Guide to Natural Fabrics — Yanmao Textile",
		url: "https://yanmaotextile.com/the-ultimate-guide-to-natural-fabrics-types-benefits-and-a-complete-list/",
		domain: "yanmaotextile.com",
	},
	{
		num: "02",
		title: "Natural Fabrics: Ultimate Guide — Sino Silk",
		url: "https://snsilk.com/what-are-natural-fabrics-an-ultimate-guide-to-eco-friendly-textiles/",
		domain: "snsilk.com",
	},
	{
		num: "03",
		title: "Natural Fiber Choices in Sustainable Fashion — New England Woolens",
		url: "https://www.newenglandwoolens.com/blogs/articles/sustainable-fashion-a-guide-to-natural-fiber-choices",
		domain: "newenglandwoolens.com",
	},
	{
		num: "04",
		title: "Synthetic Fibers: Complete Guide — VNPOLYFIBER",
		url: "https://vnpolyfiber.com/synthetic-fibers-fabrics-complete-guide-to-types-properties-uses/",
		domain: "vnpolyfiber.com",
	},
	{
		num: "05",
		title: "List of Synthetic Fabric Types — Sewing Trip",
		url: "https://sewingtrip.com/list-of-synthetic-fabric-types/",
		domain: "sewingtrip.com",
	},
	{
		num: "06",
		title: "Semi-Synthetic Fabrics: Modal, Rayon, Lyocell, Cupro",
		url: "https://www.naturalclothing.com/modal-rayon-lyocell-cupro-semi-synthetic-fabric/",
		domain: "naturalclothing.com",
	},
	{
		num: "07",
		title: "Tencel vs Viscose vs Modal vs Rayon — Taihu Snow",
		url: "https://taihusnow.com/viscose-vs-tencel.html",
		domain: "taihusnow.com",
	},
	{
		num: "08",
		title: "Rayon Fabric Guide: Viscose, Modal, Lyocell — Apex Fashion Lab",
		url: "https://www.apexfashionlab.com/glossary/rayon-fabric",
		domain: "apexfashionlab.com",
	},
	{
		num: "09",
		title: "Designer's Guide to Weave Types — Anuprerna",
		url: "https://anuprerna.com/blogs/a-designer-s-guide-to-types-of-twill-jacquard-honeycomb-more/9202606",
		domain: "anuprerna.com",
	},
	{
		num: "10",
		title: "Plain vs Twill vs Satin Weave — Sino Silk",
		url: "https://snsilk.com/the-difference-between-plain-twill-and-satin-weave/",
		domain: "snsilk.com",
	},
	{
		num: "11",
		title: "Different Types of Weaves — Fibre2Fashion",
		url: "https://www.fibre2fashion.com/industry-article/3343/different-types-of-weaves",
		domain: "fibre2fashion.com",
	},
	{
		num: "12",
		title: "Textile Weaving Patterns: Types & Applications — RKC Weaving",
		url: "https://rkcotweaving.com/blog/weaving-patterns-in-textile/",
		domain: "rkcotweaving.com",
	},
	{
		num: "13",
		title: "Complete Guide to Caring for Synthetic Fabrics — Clothing Digest",
		url: "https://clothingdigest.com/caring-for-synthetic-fabrics/",
		domain: "clothingdigest.com",
	},
	{
		num: "14",
		title: "4 Essential Synthetic Fibers — ID Custom Apparel",
		url: "https://idcustomapparel.com/synthetic-fibers-polyester-nylon-acrylic-spandex/",
		domain: "idcustomapparel.com",
	},
];


// Sources
// https://www.commonobjective.co/article/cellulosic-fibres-and-preferred-cellulosics
// https://www.commonobjective.co/