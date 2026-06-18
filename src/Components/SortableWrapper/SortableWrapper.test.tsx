import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { SortableWrapper } from "./SortableWrapper";

/**
 * useSortable() must run inside a DndContext + SortableContext, otherwise it
 * throws. This harness provides the minimal valid context for one item.
 */
const renderInSortable = (id: string, child: React.ReactNode) =>
	render(
		<DndContext>
			<SortableContext items={[id]}>
				<SortableWrapper id={id}>{child}</SortableWrapper>
			</SortableContext>
		</DndContext>,
	);

describe("SortableWrapper", () => {
	it("renders its children", () => {
		renderInSortable("x1", <div data-testid="payload">Hello card</div>);
		expect(screen.getByTestId("payload")).toHaveTextContent("Hello card");
	});

	it("exposes an accessible drag handle", () => {
		renderInSortable("x1", <div>child</div>);
		const handle = screen.getByRole("button", { name: /drag to reorder/i });
		expect(handle).toBeInTheDocument();
		expect(handle).toHaveClass("drag-handle");
	});

	it("forwards the provided role onto the wrapper", () => {
		renderInSortable("x1", <div>child</div>);
		// role defaults to undefined; here we assert the listitem path via a second render.
		render(
			<DndContext>
				<SortableContext items={["x2"]}>
					<SortableWrapper id="x2" role="listitem">
						<div>list child</div>
					</SortableWrapper>
				</SortableContext>
			</DndContext>,
		);
		expect(screen.getByRole("listitem")).toBeInTheDocument();
	});
});
