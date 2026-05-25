import { useMemo } from "react";
import type { GmailEmail } from "../../../hooks/useAdvancedSearch";
import type { ExtractedProduct } from "../../../utils/parseProductsFromEmail";
import { parseProductsFromEmail } from "../../../utils/parseProductsFromEmail";
import ProductCardList from "../ProductCard/ProductCard";
import "./EmailPreviewPanel.css";

interface EmailPreviewProps {
	email: GmailEmail;
	onConfirmImport: () => void;
	onImportProduct: (product: ExtractedProduct) => void;
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

export default function EmailPreview({
	email,
	onConfirmImport,
	onImportProduct,
}: EmailPreviewProps) {
	const htmlContent = isHtml(email.body);

	const extractedProducts = useMemo(
		() => parseProductsFromEmail(email.body),
		[email.body]
	);

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
				<ProductCardList
					products={extractedProducts}
					onImportProduct={onImportProduct}
				/>
			)}

			<div className="gmail-preview-body">
				{htmlContent ? (
					<div
						className="gmail-preview-html"
						dangerouslySetInnerHTML={{
							__html: createSanitizedHtml(email.body),
						}}
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
