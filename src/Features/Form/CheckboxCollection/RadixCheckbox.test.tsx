import { screen, render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import AnimatedCheckbox from "./RadixCheckbox";

describe("AnimatedCheckbox", () => {
	it("renders unchecked by default", () => {
		render(<AnimatedCheckbox label="New" />);
		expect(screen.getByRole("checkbox")).not.toBeChecked();
	});

	it("renders checked when prop is true", () => {
		render(<AnimatedCheckbox label="New" checked />);
		expect(screen.getByRole("checkbox")).toBeChecked();
	});

	it("calls onCheckedChange when clicked", async () => {
		const handler = vi.fn();
		render(<AnimatedCheckbox label="New" checked={false} onCheckedChange={handler} />);
		await userEvent.click(screen.getByRole("checkbox"));
		expect(handler).toHaveBeenCalledOnce();
	});

	describe("non-color labels (condition, age, etc.)", () => {
		it("does not apply inline backgroundColor when unchecked", () => {
			render(<AnimatedCheckbox label="Like New" checked={false} />);
			const root = screen.getByRole("checkbox");
			expect(root).not.toHaveStyle("background-color: inherit");
		});

		it("does not apply inline backgroundColor when checked — lets CSS handle it", () => {
			render(<AnimatedCheckbox label="Like New" checked />);
			const root = screen.getByRole("checkbox");
			// Inline style must be absent so the CSS class var(--Check-Blue) wins
			expect(root.style.backgroundColor).toBe("");
		});

		it("does not apply inline borderColor when checked", () => {
			render(<AnimatedCheckbox label="Good" checked />);
			const root = screen.getByRole("checkbox");
			expect(root.style.borderColor).toBe("");
		});
	});

	describe("color-name labels (for color swatches)", () => {
		it("applies inline backgroundColor matching the label when checked", () => {
			render(<AnimatedCheckbox label="red" checked />);
			const root = screen.getByRole("checkbox");
			expect(root.style.backgroundColor).toBe("red");
		});

		it("does not apply inline color when unchecked", () => {
			render(<AnimatedCheckbox label="blue" checked={false} />);
			const root = screen.getByRole("checkbox");
			expect(root.style.backgroundColor).toBe("");
		});
	});
});
