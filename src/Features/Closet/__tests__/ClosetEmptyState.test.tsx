import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClosetEmptyState from "../ClosetEmptyState";

describe("ClosetEmptyState", () => {
	it("shows the add CTA when the whole closet is empty", async () => {
		const onAddItem = vi.fn();
		render(<ClosetEmptyState isFiltered={false} onAddItem={onAddItem} />);

		expect(screen.getByText(/your closet is empty/i)).toBeInTheDocument();
		const cta = screen.getByRole("button", { name: /add your first piece/i });
		await userEvent.click(cta);
		expect(onAddItem).toHaveBeenCalledOnce();
	});

	it("omits the CTA when no onAddItem is provided", () => {
		render(<ClosetEmptyState isFiltered={false} />);
		expect(screen.queryByRole("button", { name: /add your first piece/i })).not.toBeInTheDocument();
	});

	it("shows a filter-specific message (no CTA) when a category matched nothing", () => {
		const onAddItem = vi.fn();
		render(<ClosetEmptyState isFiltered categoryLabel="Sleep" onAddItem={onAddItem} />);

		expect(screen.getByText(/nothing in sleep yet/i)).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /add your first piece/i })).not.toBeInTheDocument();
	});
});
