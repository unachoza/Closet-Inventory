import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MaterialBlendInput from "./MaterialBlendInput";
import type { MaterialBlend } from "../../utils/types";

const blend: MaterialBlend[] = [{ material: "cotton", percentage: 80 }];
const onChange = vi.fn();

describe("MaterialBlendInput", () => {
	it("renders existing material rows", () => {
		render(<MaterialBlendInput value={blend} onChange={onChange} />);
		expect(screen.getByDisplayValue("cotton")).toBeInTheDocument();
		expect(screen.getByDisplayValue("80")).toBeInTheDocument();
	});

	it("renders no material rows and an enabled Add Material button when empty", () => {
		const { container } = render(<MaterialBlendInput value={[]} onChange={onChange} />);
		// The old "No materials added yet" empty state was intentionally removed;
		// an empty blend simply shows zero rows with Add Material available.
		expect(container.querySelectorAll(".mbi__row")).toHaveLength(0);
		expect(screen.getByRole("button", { name: /add material/i })).toBeEnabled();
	});

	it("clicking Add Material calls onChange with a new empty row", () => {
		const fn = vi.fn();
		render(<MaterialBlendInput value={[]} onChange={fn} />);
		fireEvent.click(screen.getByRole("button", { name: /add material/i }));
		expect(fn).toHaveBeenCalledWith([{ material: "", percentage: 100 }]);
	});

	it("disables Add Material when total is already 100%", () => {
		render(<MaterialBlendInput value={[{ material: "cotton", percentage: 100 }]} onChange={onChange} />);
		expect(screen.getByRole("button", { name: /add material/i })).toBeDisabled();
	});

	it("changing percentage calls onChange with the updated value", () => {
		const fn = vi.fn();
		render(<MaterialBlendInput value={blend} onChange={fn} />);
		fireEvent.change(screen.getByLabelText(/material 1 percentage/i), { target: { value: "60" } });
		expect(fn).toHaveBeenCalledWith([{ material: "cotton", percentage: 60 }]);
	});

	it("removing a row calls onChange without that entry", () => {
		const fn = vi.fn();
		render(<MaterialBlendInput value={blend} onChange={fn} />);
		fireEvent.click(screen.getByRole("button", { name: /remove cotton/i }));
		expect(fn).toHaveBeenCalledWith([]);
	});

	it("shows over-budget warning when total exceeds 100%", () => {
		const over: MaterialBlend[] = [
			{ material: "cotton", percentage: 80 },
			{ material: "polyester", percentage: 40 },
		];
		render(<MaterialBlendInput value={over} onChange={onChange} />);
		expect(screen.getByText(/over by 20%/i)).toBeInTheDocument();
	});

	it("shows checkmark when total is exactly 100%", () => {
		const exact: MaterialBlend[] = [
			{ material: "cotton", percentage: 80 },
			{ material: "spandex", percentage: 20 },
		];
		render(<MaterialBlendInput value={exact} onChange={onChange} />);
		expect(screen.getByText(/✓/)).toBeInTheDocument();
	});
});
