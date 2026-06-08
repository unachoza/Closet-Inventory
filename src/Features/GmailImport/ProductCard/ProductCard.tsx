import { memo, useState, useCallback } from "react";
import type { ExtractedProduct } from "../../../utils/parseProductsFromEmail";
import { toTitleCase } from "../../../utils/toTitleCase";
import "./ProductCard.css";

interface ProductCardProps {
	product: ExtractedProduct;
	onImport: (product: ExtractedProduct) => void;
}

/**
 * Placeholder shown when product image is missing or fails to load (e.g.
 * CORS-blocked CDN images from ThredUp). The user can add a photo later
 * in the EditItemView form.
 */
function ImagePlaceholder() {
	return (
		<div className="product-card-image product-card-placeholder">
			<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="No image available">
				<rect width="60" height="60" rx="6" fill="rgba(255,255,255,0.08)" />
				<path
					d="M20 40V22a2 2 0 012-2h16a2 2 0 012 2v18M18 40h24M24 20v-2a6 6 0 0112 0v2"
					stroke="rgba(255,255,255,0.3)"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	);
}

const ProductCard = memo(function ProductCard({ product, onImport }: ProductCardProps) {
	const [imgFailed, setImgFailed] = useState(false);
	const handleImgError = useCallback(() => setImgFailed(true), []);

	const showPlaceholder = !product.imageUrl || imgFailed;

	return (
		<div className="product-card">
			{showPlaceholder ? (
				<ImagePlaceholder />
			) : (
				<div className="product-card-image">
					<img
						src={product.imageUrl}
						alt={product.name}
						loading="lazy"
						onError={handleImgError}
					/>
				</div>
			)}
			<div className="product-card-details">
				{product.brand && <span className="product-card-brand">{product.brand}</span>}
				<h4 className="product-card-name">{toTitleCase(product.name)}</h4>
				<div className="product-card-meta">
					{product.price && <span className="product-card-price">{product.price}</span>}
					{product.onSale && <span className="product-card-tag product-card-sale">Sale</span>}
					{product.size && <span className="product-card-tag">Size: {product.size}</span>}
					{product.color && <span className="product-card-tag">Color: {product.color}</span>}
					{product.material && <span className="product-card-tag">Material: {product.material}</span>}
				</div>
			</div>
			<button className="product-card-import-btn" onClick={() => onImport(product)} type="button">
				Import
			</button>
		</div>
	);
});

interface ProductCardListProps {
	products: ExtractedProduct[];
	onImportProduct: (product: ExtractedProduct) => void;
}

export default function ProductCardList({ products, onImportProduct }: ProductCardListProps) {
	if (products.length === 0) return null;

	return (
		<div className="product-card-list">
			<h4 className="product-card-list-title">
				Detected {products.length} item{products.length !== 1 ? "s" : ""}
			</h4>
			{products.map((product, index) => (
				<ProductCard key={`${product.name}-${index}`} product={product} onImport={onImportProduct} />
			))}
		</div>
	);
}
