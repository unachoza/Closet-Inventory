import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import PurchasedField from "./PurchasedField";

describe("PurchasedField", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("shows a plain-language label, not 'age'", () => {
		render(<PurchasedField onSelectDate={vi.fn()} />);
		expect(screen.getByText(/when did you buy it/i)).toBeInTheDocument();
		expect(screen.queryByText(/^age$/i)).not.toBeInTheDocument();
	});

	it("uses a native month input when supported", () => {
		render(<PurchasedField onSelectDate={vi.fn()} />);
		const input = document.getElementById("purchased-month") as HTMLInputElement | null;
		expect(input).toBeInTheDocument();
	});

	it("emits a Date on the 1st of the chosen month when the native input changes", () => {
		const onSelectDate = vi.fn();
		render(<PurchasedField onSelectDate={onSelectDate} />);
		const input = document.getElementById("purchased-month") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "2026-03" } });
		expect(onSelectDate).toHaveBeenCalledWith(new Date(2026, 2, 1));
	});

	describe("when the browser lacks native month input support (desktop Safari)", () => {
		beforeEach(() => {
			// Feature-detection trick: jsdom (like Safari) resets an invalid input type back to "text".
			const originalSetAttribute = HTMLInputElement.prototype.setAttribute;
			vi.spyOn(HTMLInputElement.prototype, "setAttribute").mockImplementation(function (
				this: HTMLInputElement,
				name: string,
				value: string
			) {
				if (name === "type" && value === "month") return;
				return originalSetAttribute.call(this, name, value);
			});
		});

		it("falls back to two selects for month and year", () => {
			render(<PurchasedField onSelectDate={vi.fn()} />);
			expect(screen.getByLabelText(/purchase month/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/purchase year/i)).toBeInTheDocument();
			expect(document.getElementById("purchased-month")).not.toBeInTheDocument();
		});

		it("emits a Date when a fallback select changes", () => {
			const onSelectDate = vi.fn();
			render(<PurchasedField selectedDate={new Date(2026, 0, 1)} onSelectDate={onSelectDate} />);
			fireEvent.change(screen.getByLabelText(/purchase month/i), { target: { value: "5" } });
			expect(onSelectDate).toHaveBeenCalledWith(new Date(2026, 5, 1));
		});
	});
});
