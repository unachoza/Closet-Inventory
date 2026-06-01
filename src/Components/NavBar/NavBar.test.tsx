import { render, screen, fireEvent } from "@testing-library/react";
import { ReactNode } from "react";
import NavBar from "./NavBar";
import { ViewProvider, useView } from "../../context/ViewContext";
import { SearchProvider, useSearch } from "../../context/SearchContext";
import { ViewType } from "../../utils/types";

// Probes expose the current context state so we can assert NavBar's effects.
function ViewProbe() {
	const { view } = useView();
	return <div data-testid="current-view">{view}</div>;
}

function SearchProbe() {
	const { searchQuery } = useSearch();
	return <div data-testid="current-query">{searchQuery}</div>;
}

interface RenderOptions {
	initialView?: ViewType;
	onAddItem?: () => void;
	children?: ReactNode;
}

function renderNav({ initialView = "carousel", onAddItem, children }: RenderOptions = {}) {
	return render(
		<ViewProvider initialView={initialView}>
			<SearchProvider>
				<NavBar onAddItem={onAddItem} />
				<ViewProbe />
				<SearchProbe />
				{children}
			</SearchProvider>
		</ViewProvider>
	);
}

describe("NavBar", () => {
	describe("layout by view", () => {
		it("shows the page title in the default (carousel) view", () => {
			renderNav({ initialView: "carousel" });
			expect(screen.getByRole("heading", { name: /My Closet Inventory/i })).toBeInTheDocument();
		});

		it("shows inline action buttons when not in the closet/overview view", () => {
			renderNav({ initialView: "carousel" });
			expect(screen.getByRole("button", { name: /Add Item/i })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /View All/i })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /Import Gmail/i })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /Fabric Guide/i })).toBeInTheDocument();
		});

		it("hides the title and inline actions in the entire-closet view, showing only search", () => {
			renderNav({ initialView: "entireCloset" });
			expect(screen.queryByRole("heading", { name: /My Closet Inventory/i })).not.toBeInTheDocument();
			expect(screen.getByRole("textbox", { name: /Search closet/i })).toBeInTheDocument();
			// Inline actions are collapsed (only the hamburger drawer holds them now).
			expect(screen.queryByRole("button", { name: /View All/i })).not.toBeInTheDocument();
		});

		it("does not render the search box outside the overview view", () => {
			renderNav({ initialView: "carousel" });
			expect(screen.queryByRole("textbox", { name: /Search closet/i })).not.toBeInTheDocument();
		});
	});

	describe("search", () => {
		it("writes the search input value into SearchContext", () => {
			renderNav({ initialView: "entireCloset" });
			const input = screen.getByRole("textbox", { name: /Search closet/i });
			fireEvent.change(input, { target: { value: "brown" } });
			expect(screen.getByTestId("current-query")).toHaveTextContent("brown");
		});
	});

	describe("Back to Carousel", () => {
		it("is hidden on the carousel view", () => {
			renderNav({ initialView: "carousel" });
			expect(screen.queryByRole("button", { name: /Back to Carousel/i })).not.toBeInTheDocument();
		});

		it("is visible on other views and navigates back to the carousel", () => {
			renderNav({ initialView: "overview" });
			const back = screen.getByRole("button", { name: /Back to Carousel/i });
			expect(back).toBeInTheDocument();
			fireEvent.click(back);
			expect(screen.getByTestId("current-view")).toHaveTextContent("carousel");
		});
	});

	describe("navigation actions", () => {
		it("View All navigates to the entire-closet view", () => {
			renderNav({ initialView: "carousel" });
			fireEvent.click(screen.getByRole("button", { name: /View All/i }));
			expect(screen.getByTestId("current-view")).toHaveTextContent("entireCloset");
		});

		it("Import Gmail navigates to the gmail view", () => {
			renderNav({ initialView: "carousel" });
			fireEvent.click(screen.getByRole("button", { name: /Import Gmail/i }));
			expect(screen.getByTestId("current-view")).toHaveTextContent("gmail");
		});

		it("Fabric Guide navigates to the fabric view", () => {
			renderNav({ initialView: "carousel" });
			fireEvent.click(screen.getByRole("button", { name: /Fabric Guide/i }));
			expect(screen.getByTestId("current-view")).toHaveTextContent("fabric");
		});

		it("Add Item uses the onAddItem callback when provided", () => {
			const onAddItem = vi.fn();
			renderNav({ initialView: "carousel", onAddItem });
			fireEvent.click(screen.getByRole("button", { name: /Add Item/i }));
			expect(onAddItem).toHaveBeenCalledTimes(1);
		});

		it("Add Item falls back to navigating to the form view without a callback", () => {
			renderNav({ initialView: "carousel" });
			fireEvent.click(screen.getByRole("button", { name: /Add Item/i }));
			expect(screen.getByTestId("current-view")).toHaveTextContent("form");
		});
	});

	describe("hamburger drawer", () => {
		it("opens the drawer with all nav actions when the hamburger is clicked", () => {
			renderNav({ initialView: "entireCloset" });
			expect(screen.queryByRole("navigation", { name: /Navigation menu/i })).not.toBeInTheDocument();

			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));

			const drawer = screen.getByRole("navigation", { name: /Navigation menu/i });
			expect(drawer).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /View All/i })).toBeInTheDocument();
		});

		it("navigates and closes the drawer when a drawer action is clicked", () => {
			renderNav({ initialView: "entireCloset" });
			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
			fireEvent.click(screen.getByRole("button", { name: /Import Gmail/i }));

			expect(screen.getByTestId("current-view")).toHaveTextContent("gmail");
			expect(screen.queryByRole("navigation", { name: /Navigation menu/i })).not.toBeInTheDocument();
		});

		it("closes the drawer when the overlay is clicked", () => {
			renderNav({ initialView: "entireCloset" });
			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
			fireEvent.click(screen.getByTestId("nav-drawer-overlay"));
			expect(screen.queryByRole("navigation", { name: /Navigation menu/i })).not.toBeInTheDocument();
		});
	});
});
