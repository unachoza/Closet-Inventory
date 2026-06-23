/**
 * EmailPreview — XSS sanitization.
 *
 * Order-confirmation emails are untrusted HTML rendered via
 * dangerouslySetInnerHTML. These tests prove the DOMPurify sanitizer strips
 * the attribute-level vectors the old tag-only filter missed:
 * inline event handlers, javascript: URLs, and SVG/embedded script payloads.
 */
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { ExtractedProduct } from "../../../../utils/parseProductsFromEmail";

// Uses the shared manual mock at __mocks__/framer-motion.tsx
vi.mock("framer-motion");

// No products — we only care about the rendered email body here.
vi.mock("../../../../utils/parseProductsFromEmail", () => ({
	parseProductsFromEmail: (): ExtractedProduct[] => [],
	detectImageBasedRetailer: () => null,
}));
vi.mock("../../../../utils/parseEmailToFormData", () => ({
	categoryFromName: () => "tops",
}));
vi.mock("../../../../utils/detectColorFromImage", () => ({
	detectDominantColor: () => Promise.resolve(null),
}));
vi.mock("../../ProductCard/ProductCard", () => ({ default: () => null }));

import EmailPreview from "../EmailPreview";

function renderBody(body: string) {
	const { container } = render(
		<EmailPreview email={{ id: "e1", threadId: "t1", subject: "s", from: "a@b.com", date: "2024-01-01", body }} onImportProduct={vi.fn()} />,
	);
	return container.querySelector(".gmail-preview-html") as HTMLElement;
}

describe("EmailPreview — XSS sanitization", () => {
	it("strips inline event handlers (onerror)", () => {
		const html = renderBody('<p>hi</p><img src="x" onerror="window.__pwned = true">');
		expect(html.querySelector("img")?.getAttribute("onerror")).toBeNull();
		// The benign content survives.
		expect(html.textContent).toContain("hi");
	});

	it("removes javascript: URLs from links", () => {
		const html = renderBody('<a href="javascript:alert(document.cookie)">Track order</a>');
		const href = html.querySelector("a")?.getAttribute("href") ?? "";
		expect(href.toLowerCase()).not.toContain("javascript:");
	});

	it("strips <script> tags entirely", () => {
		const html = renderBody('<p>order</p><script>window.__pwned = true</script>');
		expect(html.querySelector("script")).toBeNull();
		expect(html.textContent).toContain("order");
	});

	it("neutralizes svg onload payloads", () => {
		const html = renderBody('<svg onload="window.__pwned = true"></svg>');
		// html profile drops <svg> entirely; either way no onload survives.
		expect(html.querySelector("svg")?.getAttribute("onload") ?? null).toBeNull();
		expect(html.innerHTML.toLowerCase()).not.toContain("onload");
	});

	it("forces surviving links to open safely in a new tab", () => {
		const html = renderBody('<a href="https://example.com">Order</a>');
		const a = html.querySelector("a");
		expect(a?.getAttribute("target")).toBe("_blank");
		expect(a?.getAttribute("rel")).toBe("noopener noreferrer");
	});
});
