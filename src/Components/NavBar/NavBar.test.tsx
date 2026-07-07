import { render, screen, fireEvent } from "@testing-library/react";
import { ReactNode } from "react";
import { vi } from "vitest";
import NavBar from "./NavBar";
import { ViewProvider, useView } from "../../context/ViewContext";

// CloudSyncControl needs Supabase + Closet contexts; its behaviour is covered by
// its own test. Stub it here so NavBar tests stay focused on navigation.
vi.mock("../CloudSyncControl/CloudSyncControl", () => ({ default: () => null }));
// AccountDataModal needs Supabase auth context; covered by its own test.
vi.mock("./AccountDataModal/AccountDataModal", () => ({ default: () => null }));
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
	onExportCloset?: () => void;
	closetItemCount?: number;
	children?: ReactNode;
}

function renderNav({ initialView = "carousel", onAddItem, onExportCloset, closetItemCount, children }: RenderOptions = {}) {
	return render(
		<ViewProvider initialView={initialView}>
			<SearchProvider>
				<NavBar onAddItem={onAddItem} onExportCloset={onExportCloset} closetItemCount={closetItemCount} />
				<ViewProbe />
				<SearchProbe />
				{children}
			</SearchProvider>
		</ViewProvider>
	);
}

describe("NavBar", () => {
	describe("layout by view", () => {
		it("shows the page title in carousel view", () => {
			renderNav({ initialView: "carousel" });
			expect(screen.getByRole("heading", { name: /Nothing To Wear/i })).toBeInTheDocument();
		});

		it("shows the page title in entire closet view", () => {
			renderNav({ initialView: "entireCloset" });
			expect(screen.getByRole("heading", { name: /Nothing To Wear/i })).toBeInTheDocument();
		});

		it("never renders the search box in carousel view", () => {
			renderNav({ initialView: "carousel" });
			expect(screen.queryByRole("textbox", { name: /Search closet/i })).not.toBeInTheDocument();
		});

		it("never renders the search box in entire closet view", () => {
			renderNav({ initialView: "entireCloset" });
			expect(screen.queryByRole("textbox", { name: /Search closet/i })).not.toBeInTheDocument();
		});
	});

	describe("Back to Carousel", () => {
		it("is hidden on the carousel view", () => {
			renderNav({ initialView: "carousel" });
			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
			expect(screen.queryByRole("button", { name: /Back to Carousel/i })).not.toBeInTheDocument();
		});

		it("is visible in drawer on other views and navigates back to the carousel", () => {
			renderNav({ initialView: "overview" });
			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
			const back = screen.getByRole("button", { name: /Back to Carousel/i });
			expect(back).toBeInTheDocument();
			fireEvent.click(back);
			expect(screen.getByTestId("current-view")).toHaveTextContent("carousel");
		});
	});

	describe("navigation actions", () => {
		it("View All navigates to the entire-closet view", () => {
			renderNav({ initialView: "carousel" });
			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
			fireEvent.click(screen.getByRole("button", { name: /View All/i }));
			expect(screen.getByTestId("current-view")).toHaveTextContent("entireCloset");
		});

		it("Import Gmail navigates to the gmail view", () => {
			renderNav({ initialView: "carousel" });
			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
			fireEvent.click(screen.getByRole("button", { name: /Import Gmail/i }));
			expect(screen.getByTestId("current-view")).toHaveTextContent("gmail");
		});

		it("Fabric Guide navigates to the fabric view", () => {
			renderNav({ initialView: "carousel" });
			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
			fireEvent.click(screen.getByRole("button", { name: /Fabric Guide/i }));
			expect(screen.getByTestId("current-view")).toHaveTextContent("fabric");
		});

		it("Add Item uses the onAddItem callback when provided", () => {
			const onAddItem = vi.fn();
			renderNav({ initialView: "carousel", onAddItem });
			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
			fireEvent.click(screen.getByRole("button", { name: /Add Item/i }));
			expect(onAddItem).toHaveBeenCalledTimes(1);
		});

		it("Add Item falls back to navigating to the form view without a callback", () => {
			renderNav({ initialView: "carousel" });
			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
			fireEvent.click(screen.getByRole("button", { name: /Add Item/i }));
			expect(screen.getByTestId("current-view")).toHaveTextContent("form");
		});
	});

	describe("Download Closet", () => {
		it("does not render the Download Closet button when onExportCloset is not provided", () => {
			renderNav({ initialView: "carousel" });
			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
			expect(screen.queryByRole("button", { name: /download closet/i })).not.toBeInTheDocument();
		});

		it("renders the Download Closet button when onExportCloset is provided", () => {
			renderNav({ initialView: "carousel", onExportCloset: vi.fn() });
			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
			expect(screen.getByRole("button", { name: /download closet/i })).toBeInTheDocument();
		});

		it("opens the export confirmation modal when Download Closet is clicked", () => {
			renderNav({ initialView: "carousel", onExportCloset: vi.fn(), closetItemCount: 8 });
			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
			fireEvent.click(screen.getByRole("button", { name: /download closet/i }));
			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(screen.getByText(/download your closet/i)).toBeInTheDocument();
		});

		it("shows the correct item count in the modal", () => {
			renderNav({ initialView: "carousel", onExportCloset: vi.fn(), closetItemCount: 5 });
			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
			fireEvent.click(screen.getByRole("button", { name: /download closet/i }));
			expect(screen.getByText("5 items will be exported")).toBeInTheDocument();
		});

		it("calls onExportCloset and closes the modal when Download Spreadsheet is confirmed", () => {
			const onExportCloset = vi.fn();
			renderNav({ initialView: "carousel", onExportCloset, closetItemCount: 3 });

			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
			fireEvent.click(screen.getByRole("button", { name: /download closet/i }));
			expect(screen.getByRole("dialog")).toBeInTheDocument();

			fireEvent.click(screen.getByRole("button", { name: /download spreadsheet/i }));
			expect(onExportCloset).toHaveBeenCalledTimes(1);
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		it("closes the modal without calling onExportCloset when Cancel is clicked", () => {
			const onExportCloset = vi.fn();
			renderNav({ initialView: "carousel", onExportCloset });

			fireEvent.click(screen.getByRole("button", { name: /Open menu/i }));
			fireEvent.click(screen.getByRole("button", { name: /download closet/i }));
			fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

			expect(onExportCloset).not.toHaveBeenCalled();
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		it("closes the drawer before opening the modal when triggered from the hamburger drawer", () => {
			renderNav({ initialView: "entireCloset", onExportCloset: vi.fn() });

			fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
			expect(screen.getByRole("navigation", { name: /navigation menu/i })).toBeInTheDocument();

			fireEvent.click(screen.getByRole("button", { name: /download closet/i }));
			expect(screen.queryByRole("navigation", { name: /navigation menu/i })).not.toBeInTheDocument();
			expect(screen.getByRole("dialog")).toBeInTheDocument();
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
