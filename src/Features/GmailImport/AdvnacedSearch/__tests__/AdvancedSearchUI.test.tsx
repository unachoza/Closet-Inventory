import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AdvancedSearchUI } from "../AdvancedSearchUI";

// MobileSearchWizard and DesktopSearchSplitPanel use CSS imports — vi.mock them
// so tests focus on AdvancedSearchUI's orchestration logic only.
vi.mock("../MobileAdvancedSearchFlow/MobileAdvancedSearchFlow", () => ({
	MobileSearchWizard: (props: { onSearch: (mode: string) => void; loading: boolean; cachedCount: number }) => (
		<div data-testid="mobile-wizard">
			<button onClick={() => props.onSearch("fetch")}>mobile-fetch</button>
			<button onClick={() => props.onSearch("filter")} disabled={props.cachedCount === 0}>
				mobile-filter
			</button>
			{props.loading && <span>loading</span>}
		</div>
	),
}));

vi.mock("../DesktopAdvancedSearchFlow/DesktopAdvancedSearchFlow", () => ({
	DesktopSearchSplitPanel: (props: { onSearch: (mode: string) => void; loading: boolean; cachedCount: number }) => (
		<div data-testid="desktop-panel">
			<button onClick={() => props.onSearch("fetch")}>desktop-fetch</button>
			<button onClick={() => props.onSearch("filter")} disabled={props.cachedCount === 0}>
				desktop-filter
			</button>
			{props.loading && <span>loading</span>}
		</div>
	),
}));

const DESKTOP_WIDTH = 1024;
const MOBILE_WIDTH = 375;

function setViewportWidth(width: number) {
	Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
	window.dispatchEvent(new Event("resize"));
}

describe("AdvancedSearchUI", () => {
	const onSearch = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		setViewportWidth(DESKTOP_WIDTH);
	});

	afterEach(() => {
		setViewportWidth(DESKTOP_WIDTH);
	});

	it("renders the toggle button and hides wizards by default", () => {
		render(<AdvancedSearchUI onSearch={onSearch} loading={false} cachedCount={0} />);
		expect(screen.getByText(/show advanced search/i)).toBeInTheDocument();
		expect(screen.queryByTestId("desktop-panel")).not.toBeInTheDocument();
		expect(screen.queryByTestId("mobile-wizard")).not.toBeInTheDocument();
	});

	it("shows desktop panel on wide viewport after toggle", () => {
		setViewportWidth(DESKTOP_WIDTH);
		render(<AdvancedSearchUI onSearch={onSearch} loading={false} cachedCount={5} />);

		fireEvent.click(screen.getByText(/show advanced search/i));

		expect(screen.getByTestId("desktop-panel")).toBeInTheDocument();
		expect(screen.queryByTestId("mobile-wizard")).not.toBeInTheDocument();
	});

	it("shows mobile wizard on narrow viewport after toggle", () => {
		setViewportWidth(MOBILE_WIDTH);
		render(<AdvancedSearchUI onSearch={onSearch} loading={false} cachedCount={5} />);

		fireEvent.click(screen.getByText(/show advanced search/i));

		expect(screen.getByTestId("mobile-wizard")).toBeInTheDocument();
		expect(screen.queryByTestId("desktop-panel")).not.toBeInTheDocument();
	});

	it("switches between mobile and desktop views on resize", () => {
		setViewportWidth(DESKTOP_WIDTH);
		render(<AdvancedSearchUI onSearch={onSearch} loading={false} cachedCount={5} />);
		fireEvent.click(screen.getByText(/show advanced search/i));

		expect(screen.getByTestId("desktop-panel")).toBeInTheDocument();

		act(() => setViewportWidth(MOBILE_WIDTH));

		expect(screen.getByTestId("mobile-wizard")).toBeInTheDocument();
		expect(screen.queryByTestId("desktop-panel")).not.toBeInTheDocument();
	});

	it("collapses the panel after onSearch is called", () => {
		render(<AdvancedSearchUI onSearch={onSearch} loading={false} cachedCount={5} />);
		fireEvent.click(screen.getByText(/show advanced search/i));

		expect(screen.getByTestId("desktop-panel")).toBeInTheDocument();
		fireEvent.click(screen.getByText("desktop-fetch"));

		expect(screen.queryByTestId("desktop-panel")).not.toBeInTheDocument();
		expect(screen.getByText(/show advanced search/i)).toBeInTheDocument();
	});

	it("calls onSearch with fetch mode and current params", () => {
		render(<AdvancedSearchUI onSearch={onSearch} loading={false} cachedCount={5} />);
		fireEvent.click(screen.getByText(/show advanced search/i));
		fireEvent.click(screen.getByText("desktop-fetch"));

		expect(onSearch).toHaveBeenCalledOnce();
		const [params, mode] = onSearch.mock.calls[0];
		expect(mode).toBe("fetch");
		expect(params).toMatchObject({ from: "", after: "", before: "" });
		expect(Array.isArray(params.subjects)).toBe(true);
		expect(Array.isArray(params.bodyKeywords)).toBe(true);
	});

	it("calls onSearch with filter mode", () => {
		render(<AdvancedSearchUI onSearch={onSearch} loading={false} cachedCount={5} />);
		fireEvent.click(screen.getByText(/show advanced search/i));
		fireEvent.click(screen.getByText("desktop-filter"));

		const [, mode] = onSearch.mock.calls[0];
		expect(mode).toBe("filter");
	});

	it("passes loading prop down to child wizard", () => {
		render(<AdvancedSearchUI onSearch={onSearch} loading={true} cachedCount={0} />);
		fireEvent.click(screen.getByText(/show advanced search/i));

		expect(screen.getByText("loading")).toBeInTheDocument();
	});

	it("passes cachedCount=0 — filter button is disabled", () => {
		render(<AdvancedSearchUI onSearch={onSearch} loading={false} cachedCount={0} />);
		fireEvent.click(screen.getByText(/show advanced search/i));

		expect(screen.getByText("desktop-filter")).toBeDisabled();
	});

	it("toggle button label flips between Show and Hide", () => {
		render(<AdvancedSearchUI onSearch={onSearch} loading={false} cachedCount={0} />);

		const btn = screen.getByRole("button", { name: /advanced search/i });
		expect(btn.textContent).toMatch(/show/i);

		fireEvent.click(btn);
		expect(btn.textContent).toMatch(/hide/i);

		fireEvent.click(btn);
		expect(btn.textContent).toMatch(/show/i);
	});
});
