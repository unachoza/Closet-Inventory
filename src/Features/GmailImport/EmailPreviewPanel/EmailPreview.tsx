import { useMemo, useState, useEffect } from "react";
import type { GmailEmail } from "../../../hooks/useAdvancedSearch";
import type { ExtractedProduct } from "../../../utils/parseProductsFromEmail";
import { parseProductsFromEmail } from "../../../utils/parseProductsFromEmail";
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

	doc.querySelectorAll("script, iframe, object, embed, form").forEach((el) =>
		el.remove()
	);

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

export default function EmailPreview({
	email,
	onConfirmImport,
	onImportProduct,
	onImportAllProducts,
}: EmailPreviewProps) {
	const htmlContent = isHtml(email.body);

	// Step 1: synchronous parse
	const parsedProducts = useMemo(
		() => parseProductsFromEmail(email.body),
		[email.body],
	);

	// DOMParser + sanitization is expensive — only re-run when email body changes
	const sanitizedBody = useMemo(
		() => (htmlContent ? createSanitizedHtml(email.body) : ""),
		[email.body, htmlContent],
	);

	// Step 2: async color enrichment
	const [enrichedProducts, setEnrichedProducts] = useState<ExtractedProduct[]>(parsedProducts);

	useEffect(() => {
		let cancelled = false;

		// Start with parsed products immediately (no delay for color detection)
		setEnrichedProducts(parsedProducts);

		if (parsedProducts.length > 0) {
			enrichProductColors(parsedProducts).then((result) => {
				if (!cancelled) setEnrichedProducts(result);
			});
		}

		return () => {
			cancelled = true;
		};
	}, [parsedProducts]);

	return (
		<div className="gmail-preview">
			<div className="gmail-preview-header">
				<h3 className="gmail-preview-subject">{email.subject}</h3>
				<p className="gmail-preview-meta">
					<span>From: {email.from}</span>
					<span>Date: {email.date}</span>
				</p>
			</div>

			{extractedProducts.length > 0 && (
				<>
					<ProductCardList
						products={extractedProducts}
						onImportProduct={onImportProduct}
					/>
					{extractedProducts.length > 1 && onImportAllProducts && (
						<button
							className="gmail-import-all-btn"
							onClick={() => onImportAllProducts(extractedProducts)}
							type="button"
						>
							Import All {extractedProducts.length} Items
						</button>
					)}
				</>
			)}

			<div className="gmail-preview-body">
				{htmlContent ? (
					<div
						className="gmail-preview-html"
						dangerouslySetInnerHTML={{ __html: sanitizedBody }}
					/>
				) : (
					<pre className="gmail-preview-text">{email.body}</pre>
				)}
			</div>

			<div className="gmail-preview-actions">
				<button
					className="gmail-import-btn"
					onClick={onConfirmImport}
					type="button"
				>
					Import Entire Email
				</button>
			</div>
		</div>
	);
}
