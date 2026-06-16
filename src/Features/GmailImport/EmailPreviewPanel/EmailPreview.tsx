import { useMemo, useState, useEffect } from "react";
import type { GmailEmail } from "../../../hooks/useAdvancedSearch";
import type { ExtractedProduct } from "../../../utils/parseProductsFromEmail";
import { parseProductsFromEmail, detectImageBasedRetailer } from "../../../utils/parseProductsFromEmail";
import { detectDominantColor } from "../../../utils/detectColorFromImage";
import ProductCardList from "../ProductCard/ProductCard";
import "./EmailPreviewPanel.css";

interface EmailPreviewProps {
	email: GmailEmail;
	onConfirmImport: () => void;
	onImportProduct: (product: ExtractedProduct) => void;
	onImportAllProducts?: (products: ExtractedProduct[]) => void;
}

function createSanitizedHtml(html: string): string {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");

	doc.querySelectorAll("script, iframe, object, embed, form").forEach((el) => el.remove());

	doc.querySelectorAll("a").forEach((anchor) => {
		anchor.setAttribute("target", "_blank");
		anchor.setAttribute("rel", "noopener noreferrer");
	});

	return doc.body.innerHTML;
}

function isHtml(text: string): boolean {
	return /<[a-z][\s\S]*>/i.test(text);
}

/**
 * For products missing a color, attempt canvas-based dominant color detection.
 * Returns a new array with colors filled in where possible.
 * TODO// make sure extracting color from text before checking image"
 */
async function enrichProductColors(products: readonly ExtractedProduct[]): Promise<ExtractedProduct[]> {
	const needsColor = products.some((p) => !p.color && p.imageUrl);
	if (!needsColor) return [...products];

	const enriched = await Promise.all(
		products.map(async (product) => {
			if (product.color || !product.imageUrl) return product;

			const detectedColor = await detectDominantColor(product.imageUrl);
			if (!detectedColor) return product;

			return { ...product, color: detectedColor };
		}),
	);

	return enriched;
}

export default function EmailPreview({ email, onConfirmImport, onImportProduct, onImportAllProducts }: EmailPreviewProps) {
	const htmlContent = isHtml(email.body);

	// Step 1: synchronous parse
	const parsedProducts = useMemo(() => parseProductsFromEmail(email.body), [email.body]);

	// DOMParser + sanitization is expensive — only re-run when email body changes
	const sanitizedBody = useMemo(() => (htmlContent ? createSanitizedHtml(email.body) : ""), [email.body, htmlContent]);

	// Always run image-based retailer detection (e.g. Temu renders products as PNGs).
	// When detected, parsed products are false positives from the image fallback strategy.
	const imageBasedRetailer = useMemo(() => detectImageBasedRetailer(email.body, email.from), [email.body, email.from]);

	const effectiveProducts = useMemo(() => (imageBasedRetailer ? [] : parsedProducts), [imageBasedRetailer, parsedProducts]);

	// Step 2: async color enrichment
	const [enrichedProducts, setEnrichedProducts] = useState<ExtractedProduct[]>(effectiveProducts);

	useEffect(() => {
		let cancelled = false;

		setEnrichedProducts(effectiveProducts);

		if (effectiveProducts.length > 0) {
			enrichProductColors(effectiveProducts).then((result) => {
				if (!cancelled) setEnrichedProducts(result);
			});
		}

		return () => {
			cancelled = true;
		};
	}, [effectiveProducts]);

	return (
		<div className="gmail-preview">
			<div className="gmail-preview-header">
				<h3 className="gmail-preview-subject">{email.subject}</h3>
				<p className="gmail-preview-meta">
					<span>From: {email.from}</span>
					<span>Date: {email.date}</span>
				</p>
			</div>

			{imageBasedRetailer && (
				<div className="gmail-preview-image-notice">
					<p>
						<strong>{imageBasedRetailer}</strong> renders product details as images, so items can&apos;t be auto-detected. Use{" "}
						<strong>Import Entire Email</strong> below to start a blank item with the brand pre-filled, then add details
						manually.
					</p>
				</div>
			)}

			{enrichedProducts.length > 0 && (
				<>
					<ProductCardList products={enrichedProducts} onImportProduct={onImportProduct} />
					{enrichedProducts.length > 1 && onImportAllProducts && (
						<button className="gmail-import-all-btn" onClick={() => onImportAllProducts(enrichedProducts)} type="button">
							Import All {enrichedProducts.length} Items
						</button>
					)}
				</>
			)}

			<div className="gmail-preview-body">
				{htmlContent ? (
					<div className="gmail-preview-html" dangerouslySetInnerHTML={{ __html: sanitizedBody }} />
				) : (
					<pre className="gmail-preview-text">{email.body}</pre>
				)}
			</div>

		</div>
	);
}
