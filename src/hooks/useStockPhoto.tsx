import { CategoryType } from "../utils/types";

type StockPhotoMapType = Record<Exclude<CategoryType, null>, string>;

const stockPhotoMap: StockPhotoMapType = {
	tops: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332284/Screenshot_2025-10-24_at_11.45.56_AM_ef6k5l.png",
	bottoms: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332284/Screenshot_2025-10-24_at_11.46.40_AM_pthozc.png",
	dresses: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1780700552/image-163-1020x1536-1-680x1024_hh70rn.png",
	coats: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332285/Screenshot_2025-10-24_at_11.41.34_AM_ghx9q1.png",
	sweaters: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1780700586/7c5749b7-c23e-498b-8aaa-45ee94427c9c_fplzd3.jpg",
	active: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1780702924/f48e72a201f05e5852a9991af0d295b1_zgaoou.jpg",
	lingerie: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332283/Screenshot_2025-10-24_at_11.56.38_AM_qynpnn.png",
	socks: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332284/Screenshot_2025-10-24_at_11.53.37_AM_apfogb.png",
	underwear: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332283/Screenshot_2025-10-24_at_11.55.50_AM_mx8dri.png",
	// swim: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332284/Screenshot_2025-10-24_at_11.54.40_AM_ml9yqu.png",
};

const useStockPhoto = (category: CategoryType): string => {
	if (!category) return "";
	return stockPhotoMap[category];
};

export default useStockPhoto;
