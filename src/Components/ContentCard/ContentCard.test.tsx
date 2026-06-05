import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import ContentCard from "./ContentCard";

describe("ContentCard Component", () => {
	it("renders the component with the correct title", () => {
		render(<ContentCard title="Test Title" />);
		expect(screen.getByText("Test Title")).toBeInTheDocument();
	});
	it("renders children content correctly", () => {
		render(
			<ContentCard title="Test Title">
				<p>Child Content</p>
			</ContentCard>,
		);
		expect(screen.getByText("Child Content")).toBeInTheDocument();
	});
	// it("applies the correct CSS class to the container", () => {
	// 	const { container } = render(<ContentCard title="Test Title" />);
	// 	expect(container.firstChild).toHaveClass("content-card");
	// });
	// it("renders text visibly and accessibly following WCAG accessibility guidelines", () => {
	// 	render(<ContentCard title="Accessible Title" />);
	// 	const titleElement = screen.getByText("Accessible Title");
	// 	expect(titleElement).toBeInTheDocument();
	// 	expect(titleElement).toBeVisible();
	// });
	// it("renders white text on a dark background to ensure sufficient contrast", () => {
	// 	const { container } = render(<ContentCard title="Contrast Test" />);
	// 	const contentCardElement = container.firstChild;
	// 	expect(contentCardElement).toHaveStyle("color: white");
	// 	expect(contentCardElement).toHaveStyle("background-color: #333");
	// });
});
