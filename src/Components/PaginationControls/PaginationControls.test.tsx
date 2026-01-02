import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import PaginationControls from "./PaginationControls";

describe("PaginationControls", () => {
	it("renders nothing when totalPages is 1 or less", () => {
		const { container } = render(
			<PaginationControls
				currentPage={1}
				totalPages={1}
				onNext={vi.fn()}
				onPrev={vi.fn()}
			/>
		);

		expect(container.firstChild).toBeNull();
	});

	it("displays current page and total pages", () => {
		render(
			<PaginationControls
				currentPage={2}
				totalPages={5}
				onNext={vi.fn()}
				onPrev={vi.fn()}
			/>
		);

		expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
	});

	it("disables Previous button on first page", () => {
		render(
			<PaginationControls
				currentPage={1}
				totalPages={3}
				onNext={vi.fn()}
				onPrev={vi.fn()}
			/>
		);

		expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
	});

	it("disables Next button on last page", () => {
		render(
			<PaginationControls
				currentPage={3}
				totalPages={3}
				onNext={vi.fn()}
				onPrev={vi.fn()}
			/>
		);

		expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
	});

	it("calls onPrev and onNext when buttons are clicked", async () => {
		const user = userEvent.setup();
		const onNext = vi.fn();
		const onPrev = vi.fn();

		render(
			<PaginationControls
				currentPage={2}
				totalPages={3}
				onNext={onNext}
				onPrev={onPrev}
			/>
		);

		await user.click(screen.getByRole("button", { name: /previous/i }));
		await user.click(screen.getByRole("button", { name: /next/i }));

		expect(onPrev).toHaveBeenCalledTimes(1);
		expect(onNext).toHaveBeenCalledTimes(1);
	});
});
