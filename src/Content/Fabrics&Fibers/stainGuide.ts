// Stain-removal reference for the Fabric Guide. Lazy-view only.
export interface StainGuideEntry {
	fabric: string;
	icon: string;
	rules: string[];
	stains: {
		type: string;
		method: string;
	}[];
}

export const STAIN_GUIDE: StainGuideEntry[] = [
	{
		fabric: "Cotton & Linen",
		icon: "🌿",
		rules: [
			"Act immediately — blot, never rub.",
			"Cold water for protein stains (blood, sweat). Hot water sets them permanently.",
			"Pre-treat before washing — don't let it dry.",
		],
		stains: [
			{
				type: "Red wine",
				method: "Blot excess. Pour salt to absorb, then club soda. Pre-treat with dish soap + hydrogen peroxide (1:1). Cold wash.",
			},
			{ type: "Coffee & tea", method: "Blot immediately. Rinse cold. Apply dish soap + white vinegar. Wash with enzyme detergent." },
			{
				type: "Blood",
				method: "Cold water only — never hot. Soak in cold salt water. Apply hydrogen peroxide on white cotton, enzyme cleaner on coloured.",
			},
			{
				type: "Grease & oil",
				method: "Sprinkle cornstarch or baking soda for 15 min to absorb. Brush off. Apply dish soap directly. Wash in warm water.",
			},
			{
				type: "Ink",
				method: "Dab with rubbing alcohol — don't spread. Blot from the outside in. Rinse and repeat. Wash with enzyme detergent.",
			},
			{
				type: "Sweat / deodorant",
				method: "Soak in white vinegar 30 min. Apply baking soda paste and leave 30 min. Wash in warm water with enzyme detergent.",
			},
			{ type: "Grass", method: "Pre-treat with white vinegar or enzyme detergent. Let sit 15 min. Cold wash. Repeat if needed." },
			{
				type: "Mud",
				method: "Let dry completely first — do not rub wet mud. Brush off. Pre-treat with liquid detergent. Wash as normal.",
			},
		],
	},
	{
		fabric: "Wool & Cashmere",
		icon: "🐑",
		rules: [
			"Blot — never rub. Rubbing causes felting.",
			"Always cold water. Heat = irreversible shrinkage.",
			"Use pH-neutral or wool-specific cleaner. Avoid enzyme detergents — they digest protein fibers.",
		],
		stains: [
			{
				type: "Red wine",
				method: "Blot immediately. Sprinkle salt. Dab cold water with a clean cloth. Apply diluted wool wash. Press out gently — do not wring.",
			},
			{
				type: "Coffee & tea",
				method: "Blot cold water immediately. Dab with diluted white vinegar. Rinse gently with cold water. Air dry flat.",
			},
			{
				type: "Blood",
				method: "Cold water only. Dab — do not rub. Use a tiny amount of cold water with white vinegar. Never use enzyme cleaners on wool.",
			},
			{
				type: "Grease & oil",
				method: "Absorb with cornstarch for 20 min. Brush gently. Dab with dry-cleaning solvent or diluted dish soap. Rinse cold.",
			},
			{
				type: "Ink",
				method: "Dab rubbing alcohol lightly — test on hidden area first. Blot from outside in. Professional dry clean recommended for large stains.",
			},
			{ type: "Mud", method: "Let dry. Brush off gently. Dab cold water. Use wool wash diluted in cold water. Press out — never wring." },
		],
	},
	{
		fabric: "Silk",
		icon: "🪡",
		rules: [
			"Silk is extremely delicate — when in doubt, take it to a dry cleaner.",
			"Never rub. Never use bleach or enzyme cleaners.",
			"Cold water only. Silk loses up to 20% strength when wet.",
		],
		stains: [
			{
				type: "Red wine",
				method: "Blot immediately with white cloth. Dab cold water. Sprinkle salt to absorb. Take to dry cleaner if persistent.",
			},
			{
				type: "Coffee & tea",
				method: "Blot cold water. Dab with diluted white vinegar (1:3 with water). Rinse gently. Air dry away from sunlight.",
			},
			{ type: "Blood", method: "Cold water only — immediately. Dab gently. Do not scrub. Dry clean for best results." },
			{
				type: "Grease & oil",
				method: "Absorb with cornstarch or talcum powder. Leave 30 min. Brush gently. Dab with dry-cleaning solvent. Professional clean recommended.",
			},
			{
				type: "Perspiration",
				method: "White vinegar diluted 1:3 in cold water. Dab gently. Rinse. Silk discolours over time from sweat — dress shields help.",
			},
			{
				type: "Makeup",
				method: "Micellar water on a cotton pad, dabbed gently. Never rub. Rinse with cold water. Dry clean if stain persists.",
			},
		],
	},
	{
		fabric: "Denim",
		icon: "👖",
		rules: [
			"Turn inside out before treating to protect the colour.",
			"Avoid hot water — it can fade indigo dye.",
			"Pre-treat and wash as soon as possible.",
		],
		stains: [
			{
				type: "Red wine",
				method: "Blot, pour salt. Apply dish soap + cold water. For raw denim — dab only, minimal water. Wash cold inside out.",
			},
			{ type: "Grease & oil", method: "Cornstarch 15 min. Brush off. Apply dish soap or WD-40 then dish soap. Cold wash inside out." },
			{ type: "Ink", method: "Dab rubbing alcohol from outside in. Blot repeatedly. Rinse with cold water. Wash inside out, cold." },
			{ type: "Mud", method: "Let dry. Brush off. Pre-treat with liquid detergent. Cold wash inside out." },
			{ type: "Blood", method: "Cold water immediately. Soak in cold salt water. Hydrogen peroxide on light denim. Cold wash only." },
		],
	},
	{
		fabric: "Polyester & Synthetics",
		icon: "⚗️",
		rules: [
			"Most synthetics are stain-resistant — act fast while the advantage lasts.",
			"Avoid high heat — polyester can melt or warp with hot water or direct ironing.",
			"Check for colour-fastness before using any solvent.",
		],
		stains: [
			{
				type: "Red wine",
				method: "Blot excess. Club soda or cold water. Apply dish soap + white vinegar. Cold wash. Synthetics resist wine well if treated fast.",
			},
			{
				type: "Grease & oil",
				method: "Dish soap directly on stain — polyester absorbs oil easily. Work in gently. Cold wash. Repeat if needed. Avoid dryer until stain is gone.",
			},
			{ type: "Ink", method: "Rubbing alcohol dabbed with cotton ball. Blot from outside in. Rinse with cold water. Wash cold." },
			{
				type: "Sweat / deodorant",
				method: "White vinegar soak 30 min. Or baking soda paste 30 min. Cold wash. Avoid hot water — it sets protein stains into synthetics.",
			},
			{
				type: "Makeup",
				method: "Micellar water or makeup remover wipe — dab gently. Rinse cold. Wash with standard detergent, cold cycle.",
			},
		],
	},
	{
		fabric: "Lace & Delicates",
		icon: "🕊️",
		rules: [
			"Treat by dabbing only — lace tears easily.",
			"Always cold water. Hand wash or dry clean only.",
			"Test any solution on a hidden corner first.",
		],
		stains: [
			{
				type: "Any stain",
				method: "Dab cold water immediately. Use a cotton swab for precision. Apply a tiny amount of pH-neutral detergent diluted in water. Rinse by dabbing with a clean damp cloth. Air dry flat.",
			},
			{
				type: "Blood",
				method: "Cold water immediately. Salt paste if fresh. Never rub lace. Professional dry cleaning recommended for valuable pieces.",
			},
			{
				type: "Makeup / foundation",
				method: "Micellar water on a cotton swab, very gently. Rinse by dabbing. Do not stretch the lace while wet.",
			},
		],
	},
];
