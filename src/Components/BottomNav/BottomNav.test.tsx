import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BottomNav from "./BottomNav";
import { ViewProvider } from "../../context/ViewContext";
import type { ViewType } from "../../utils/types";

/** Render inside a real ViewProvider so tab clicks drive actual view state. */
function renderNav({ initialView = "carousel" as ViewType, onAddItem = vi.fn() } = {}) {
	render(
		<ViewProvider initialView={initialView}>
			<BottomNav onAddItem={onAddItem} />
		</ViewProvider>,
	);
	return { onAddItem };
}

describe("BottomNav", () => {
	it("renders the four nav tabs and the Add action (E5-1.2/E5-1.3)", () => {
		renderNav();

		expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Closet" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Import" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Add Item" })).toBeInTheDocument();
	});

	it("marks the tab matching the current view with aria-current", () => {
		renderNav({ initialView: "gmail" });

		expect(screen.getByRole("button", { name: "Import" })).toHaveAttribute("aria-current", "page");
		expect(screen.getByRole("button", { name: "Home" })).not.toHaveAttribute("aria-current");
	});

	it("navigates on tab click: Closet→overview, Search→entireCloset, Import→gmail, Home→carousel", () => {
		renderNav({ initialView: "carousel" });

		fireEvent.click(screen.getByRole("button", { name: "Closet" }));
		expect(screen.getByRole("button", { name: "Closet" })).toHaveAttribute("aria-current", "page");

		fireEvent.click(screen.getByRole("button", { name: "Search" }));
		expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute("aria-current", "page");

		fireEvent.click(screen.getByRole("button", { name: "Import" }));
		expect(screen.getByRole("button", { name: "Import" })).toHaveAttribute("aria-current", "page");

		fireEvent.click(screen.getByRole("button", { name: "Home" }));
		expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page");
	});

	it("no tab is active on views without a tab (form/edit/fabric/journey)", () => {
		renderNav({ initialView: "form" });

		for (const name of ["Home", "Closet", "Search", "Import"]) {
			expect(screen.getByRole("button", { name })).not.toHaveAttribute("aria-current");
		}
	});

	it("Add FAB calls onAddItem, not setView directly", () => {
		const { onAddItem } = renderNav({ initialView: "carousel" });

		fireEvent.click(screen.getByRole("button", { name: "Add Item" }));
		expect(onAddItem).toHaveBeenCalledTimes(1);
		// View unchanged by the nav itself — the App-level handler owns navigation.
		expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page");
	});
});
