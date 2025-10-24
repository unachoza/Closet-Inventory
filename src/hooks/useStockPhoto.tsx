import {CategoryType} from "../utils/types"

type StockPhotoMapType = Record<CategoryType, string>

const stockPhotoMap : StockPhotoMapType = {
	tops: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332284/Screenshot_2025-10-24_at_11.45.56_AM_ef6k5l.png",
	bottoms: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332284/Screenshot_2025-10-24_at_11.46.40_AM_pthozc.png",
	dresses: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332285/Screenshot_2025-10-24_at_11.44.31_AM_buymxe.png",
	coats: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332285/Screenshot_2025-10-24_at_11.41.34_AM_ghx9q1.png",
	sweaters: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332285/Screenshot_2025-10-24_at_11.43.12_AM_atwszi.png",
	active: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332846/Screenshot_2025-10-24_at_12.07.08_PM_f36dhu.png",
	lingerie: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332283/Screenshot_2025-10-24_at_11.56.38_AM_qynpnn.png",
	socks: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332284/Screenshot_2025-10-24_at_11.53.37_AM_apfogb.png",
	underwear: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332283/Screenshot_2025-10-24_at_11.55.50_AM_mx8dri.png",
	// swim: "https://res.cloudinary.com/dh41vh9dx/image/upload/v1761332284/Screenshot_2025-10-24_at_11.54.40_AM_ml9yqu.png",
};

const useStockPhoto = (category: CategoryType): string => {
	return stockPhotoMap[category] ;
};

export default useStockPhoto;
