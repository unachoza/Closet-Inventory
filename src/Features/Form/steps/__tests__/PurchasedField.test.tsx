import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PurchasedField from "../PurchasedField";

describe("PurchasedField", () => {
	it("renders a native month input when supported", () => {
		render(<PurchasedField value="" onChange={() => {}} monthInputSupported={true} />);
		const input = screen.getByLabelText("Purchased month");
		expect(input).toHaveAttribute("type", "month");
	});

	it("native input writes a first-of-month ISO date", () => {
		const onChange = vi.fn();
		render(<PurchasedField value="" onChange={onChange} monthInputSupported={true} />);
		fireEvent.change(screen.getByLabelText("Purchased month"), { target: { value: "2025-03" } });
		expect(onChange).toHaveBeenCalledTimes(1);
		const iso = onChange.mock.calls[0][0] as string;
		const d = new Date(iso);
		expect(d.getFullYear()).toBe(2025);
		expect(d.getMonth()).toBe(2);
		expect(d.getDate()).toBe(1);
	});

	it("falls back to two native selects when month input is unsupported", () => {
		render(<PurchasedField value="" onChange={() => {}} monthInputSupported={false} />);
		expect(screen.getByLabelText("Purchased month").tagName).toBe("SELECT");
		expect(screen.getByLabelText("Purchased year").tagName).toBe("SELECT");
	});

	it("fallback selects write a first-of-month ISO date", () => {
		const onChange = vi.fn();
		render(<PurchasedField value="" onChange={onChange} monthInputSupported={false} />);
		fireEvent.change(screen.getByLabelText("Purchased month"), { target: { value: "5" } }); // June
		const iso = onChange.mock.calls[0][0] as string;
		const d = new Date(iso);
		expect(d.getMonth()).toBe(5);
		expect(d.getDate()).toBe(1);
		expect(d.getFullYear()).toBe(new Date().getFullYear());
	});

	it("fallback selects reflect an existing value", () => {
		const iso = new Date(2023, 10, 1).toISOString();
		render(<PurchasedField value={iso} onChange={() => {}} monthInputSupported={false} />);
		expect(screen.getByLabelText("Purchased month")).toHaveValue("10");
		expect(screen.getByLabelText("Purchased year")).toHaveValue("2023");
	});
});
