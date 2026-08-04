import type { CareGroup } from "./textileTypes";

// Care guidance by fiber family. Used by inferCare + the Fabric Guide.

export const CARE_GROUPS: CareGroup[] = [
	{
		title: "Wool, Cashmere & Mohair",
		subtitle: "Protein fibers. Sensitive to heat, agitation, and alkaline detergents. Never felt these.",
		items: [
			{
				icon: "🫧",
				label: "Washing",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780604530/1761432869403199-4126818_ogxz8v.png?w=200&h=180&fit=crop&q=80",
				value: "Hand wash cold or machine delicate. Use wool-specific or pH-neutral detergent (e.g. Eucalan, Woolite).",
			},
			{
				icon: "💨",
				label: "Drying",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780604552/14e6cfa72b214761038ee850a28a3c34_scplmh.jpg?w=200&h=180&fit=crop&q=80",
				value: "Lay flat to dry — never hang (causes stretching). Never tumble dry (causes irreversible felting).",
			},
			{
				icon: "🔥",
				label: "Ironing",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780604588/Garment-Hanger-Steamer-for-Clothes-Standing-Flat-Hanging-with-Ironing-Board-98_c34bbaa0-a61d-48c3-aca1-109a3b9e3e5d.bb82a78f97f227111421fa63a34bcbc5_kamxoa.jpg?w=200&h=180&fit=crop&q=80",
				value: "Cool iron with steam, or steam only. Press through a cloth. Never iron directly on cashmere.",
			},
			{
				icon: "📦",
				label: "Storage",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780603545/Cedar-Protection-Prevents-Problems-768x431_a1wtjc.jpg?w=200&h=180&fit=crop&q=80",
				value: "Fold — never hang. Store in breathable cotton bag with cedar. Clean before storing to repel moths.",
			},
			{
				icon: "⚡",
				label: "Pilling",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780604845/pilling-on-clothes_usjmkh.jpg?w=200&h=180&fit=crop&q=80",
				value: "Use a cashmere comb or fabric shaver gently. Pilling is normal — especially in friction areas.",
			},
			{
				icon: "✨",
				label: "Pro Tip",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780607024/the-wardrobe-airing-routine-that-prevents-musty-smells-how-ventilation-reduces-trapped-moisture_fkdlks.jpg?w=200&h=180&fit=crop&q=80",
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
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780604530/1761432869403199-4126818_ogxz8v.png?w=200&h=180&fit=crop&q=80",
				value: "Hand wash in cold water with silk-specific detergent. Or dry clean. Never wring — gently squeeze out water.",
			},
			{
				icon: "💨",
				label: "Drying",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780604725/Retractable-Clothesline-768x1097_t6nmzs.jpg?w=200&h=180&fit=crop&q=80",
				value: "Roll in a clean towel to absorb moisture, then hang in shade. Direct sunlight yellows and weakens silk.",
			},
			{
				icon: "🔥",
				label: "Ironing",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780603585/ironing_board_b_124x38cm_ssir_-_denim_grey_-_8710755236129_aqhifv.png?w=200&h=180&fit=crop&q=80",
				value: "Iron slightly damp on the reverse side using a low/silk setting. Steam with care — water spots visible on some silks.",
			},
			{
				icon: "🚫",
				label: "Never",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780607351/ghk-guide-to-laundry-symbols-never-bleach-1650379877_psp5hk.png?w=200&h=180&fit=crop&q=80",
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
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780603581/how-to-use-a-front-loader-washing-machine-1708363815_iytko5.jpg?w=200&h=180&fit=crop&q=80",
				value: "Machine wash warm or cold. Cold preserves colors and reduces shrinkage. Linen becomes softer with each wash.",
			},
			{
				icon: "💨",
				label: "Drying",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780603600/Clothes-on-Hangers-Hanging-on-Patio_egwwi2.jpg?w=200&h=180&fit=crop&q=80",
				value: "Tumble dry low or line dry. Remove promptly to reduce wrinkles. Linen wrinkles readily — embrace it or iron damp.",
			},
			{
				icon: "🔥",
				label: "Ironing",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780603585/ironing_board_b_124x38cm_ssir_-_denim_grey_-_8710755236129_aqhifv.png?w=200&h=180&fit=crop&q=80",
				value: "Cotton and linen can take high heat. Iron damp for best results. Linen irons beautifully — press while slightly wet.",
			},
			{
				icon: "⚠️",
				label: "Shrinkage",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780607076/E5_9B_BE_E7_89_878_kzfwrv.jpg?w=200&h=180&fit=crop&q=80",
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
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780604530/1761432869403199-4126818_ogxz8v.png?w=200&h=180&fit=crop&q=80",
				value: "Hand wash only in cool water, or dry clean. Never wring. Machine washing risks permanent distortion due to wet weakness.",
			},
			{
				icon: "🫧",
				label: "Modal & TENCEL™",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780603581/how-to-use-a-front-loader-washing-machine-1708363815_iytko5.jpg?w=200&h=180&fit=crop&q=80",
				value: "Machine wash cold on gentle cycle. Much more stable wet. Lay flat or hang to dry. Avoid high heat tumble drying.",
			},
			{
				icon: "🔥",
				label: "Ironing",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780604588/Garment-Hanger-Steamer-for-Clothes-Standing-Flat-Hanging-with-Ironing-Board-98_c34bbaa0-a61d-48c3-aca1-109a3b9e3e5d.bb82a78f97f227111421fa63a34bcbc5_kamxoa.jpg?w=200&h=180&fit=crop&q=80",
				value: "Low-medium heat. Steam is effective. These fabrics wrinkle easily but respond well to gentle steaming.",
			},
			{
				icon: "✨",
				label: "Tip",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780603581/how-to-use-a-front-loader-washing-machine-1708363815_iytko5.jpg?w=200&h=180&fit=crop&q=80",
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
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780603581/how-to-use-a-front-loader-washing-machine-1708363815_iytko5.jpg?w=200&h=180&fit=crop&q=80",
				value: "Machine wash cold, gentle cycle. Most synthetics are very easy care — just avoid hot water, which can warp fibers.",
			},
			{
				icon: "💨",
				label: "Drying",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780603600/Clothes-on-Hangers-Hanging-on-Patio_egwwi2.jpg?w=200&h=180&fit=crop&q=80",
				value: "Low heat or air dry. Never high heat — can permanently warp polyester. Nylon melts at high temperatures.",
			},
			{
				icon: "🌊",
				label: "Microplastics",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780604518/7355b165-gp0stq2bx_medium_res_tavmf7.jpg?w=200&h=180&fit=crop&q=80",
				value: "Use a Guppyfriend wash bag to capture microfibers. Wash less frequently to reduce environmental impact.",
			},
			{
				icon: "🚫",
				label: "Spandex",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780607351/ghk-guide-to-laundry-symbols-never-bleach-1650379877_psp5hk.png?w=200&h=180&fit=crop&q=80",
				value: "Never bleach spandex blends — chlorine destroys elastane. Avoid fabric softener — it reduces stretch recovery.",
			},
			{
				icon: "🔥",
				label: "Ironing",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780603585/ironing_board_b_124x38cm_ssir_-_denim_grey_-_8710755236129_aqhifv.png?w=200&h=180&fit=crop&q=80",
				value: "Use low/synthetic setting. Always use a pressing cloth as synthetics can melt or develop shine.",
			},
			{
				icon: "💡",
				label: "Odor",
				backgroundImageUrl:
					"https://res.cloudinary.com/dh41vh9dx/image/upload/v1780604594/White-vinegar-to-remove-bad-odors-on-the-couch_qu3agd.jpg?w=200&h=180&fit=crop&q=80",
				value: "Add white vinegar to the rinse cycle. Technical sportswear detergents (Nikwax, Sport Wash) help significantly.",
			},
		],
	},
];
