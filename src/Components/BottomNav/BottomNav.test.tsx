import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BottomNav from "./BottomNav";
import { ViewProvider } from "../../context/ViewContext";
import type { ViewType } from "../../utils/types";

/** Render inside a real ViewProvider so tab clicks drive actual view state. */
function renderNav({ initialView = "overview" as ViewType, onAddItem = vi.fn() } = {}) {
	render(
		<ViewProvider initialView={initialView}>
			<BottomNav onAddItem={onAddItem} />
		</ViewProvider>,
	);
	return { onAddItem };
}

describe("BottomNav", () => {
	it("renders the four MVP nav tabs and the Add action (Closet/Care/Search/Email)", () => {
		renderNav();

		expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Closet" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Care" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Email" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Add Item" })).toBeInTheDocument();
	});

	it("marks the tab matching the current view with aria-current", () => {
		renderNav({ initialView: "gmail" });

		expect(screen.getByRole("button", { name: "Email" })).toHaveAttribute("aria-current", "page");
		expect(screen.getByRole("button", { name: "Closet" })).not.toHaveAttribute("aria-current");
	});

	it("navigates on tab click: Closet→overview, Care→fabric, Search→entireCloset, Email→gmail", () => {
		renderNav({ initialView: "overview" });

		fireEvent.click(screen.getByRole("button", { name: "Care" }));
		expect(screen.getByRole("button", { name: "Care" })).toHaveAttribute("aria-current", "page");

		fireEvent.click(screen.getByRole("button", { name: "Search" }));
		expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute("aria-current", "page");

		fireEvent.click(screen.getByRole("button", { name: "Email" }));
		expect(screen.getByRole("button", { name: "Email" })).toHaveAttribute("aria-current", "page");

		fireEvent.click(screen.getByRole("button", { name: "Closet" }));
		expect(screen.getByRole("button", { name: "Closet" })).toHaveAttribute("aria-current", "page");
	});

	it("no tab is active on views without a tab (form/edit/carousel/journey)", () => {
		renderNav({ initialView: "form" });

		for (const name of ["Closet", "Care", "Search", "Email"]) {
			expect(screen.getByRole("button", { name })).not.toHaveAttribute("aria-current");
		}
	});

	it("Add FAB calls onAddItem, not setView directly", () => {
		const { onAddItem } = renderNav({ initialView: "overview" });

		fireEvent.click(screen.getByRole("button", { name: "Add Item" }));
		expect(onAddItem).toHaveBeenCalledTimes(1);
		// View unchanged by the nav itself — the App-level handler owns navigation.
		expect(screen.getByRole("button", { name: "Closet" })).toHaveAttribute("aria-current", "page");
	});
});
