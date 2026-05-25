import { memo } from "react";
import type { ExtractedProduct } from "../../../utils/parseProductsFromEmail";
import "./ProductCard.css";

interface ProductCardProps {
	product: ExtractedProduct;
	onImport: (product: ExtractedProduct) => void;
}

const ProductCard = memo(function ProductCard({ product, onImport }: ProductCardProps) {
	return (
		<div className="product-card">
			{product.imageUrl && (
				<div className="product-card-image">
					<img src={product.imageUrl} alt={product.name} loading="lazy" />
				</div>
			)}
			<div className="product-card-details">
				{product.brand && <span className="product-card-brand">{product.brand}</span>}
				<h4 className="product-card-name">{product.name}</h4>
				<div className="product-card-meta">
					{product.price && <span className="product-card-price">{product.price}</span>}
					{product.size && <span className="product-card-tag">Size: {product.size}</span>}
					{product.color && <span className="product-card-tag">Color: {product.color}</span>}
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
