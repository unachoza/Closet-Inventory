import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import type { ClothingItem } from "../../../utils/types";
import EditItemView from "./EditItemView";

vi.mock("framer-motion");

vi.mock("../../../context/ClosetContext", () => ({
	useCloset: () => ({ updateItem: vi.fn(), addItem: vi.fn(), addFullItem: vi.fn() }),
}));
vi.mock("../../../context/LocationsContext", () => ({
	useLocations: () => ({ locations: [{ id: "home", label: "Home", kind: "home", isPrimary: true }] }),
}));
vi.mock("../../../Components/Toast/Toast", () => ({ useToast: () => ({ showToast: vi.fn() }) }));

// A demo-seeded item also carries machine fields that must never render as
// editable text inputs.
const demoItem: ClothingItem = {
	id: "1",
	name: "Aritzia Blazer",
	size: "M",
	brand: "Aritzia",
	material: [{ material: "wool", percentage: 100 }],
	occasion: "work",
	age: "",
	condition: "good",
	care: "Dry clean",
	imageURL: "https://example.com/i.jpg",
	color: "Camel",
	category: "Outerwear",
	isDemo: true,
	status: "clean",
	locationId: "home",
	updatedAt: "2026-07-01T00:00:00.000Z",
	wornCount: 3,
};

describe("EditItemView beta gating + machine-field leak", () => {
	afterEach(() => vi.unstubAllEnvs());

	it("never renders isDemo or other machine fields as inputs", () => {
		render(<EditItemView item={demoItem} setView={vi.fn()} />);
		// The reported "ISDEMO: True" leak and its siblings.
		expect(screen.queryByLabelText(/isDemo/i)).not.toBeInTheDocument();
		expect(screen.queryByLabelText(/updatedAt/i)).not.toBeInTheDocument();
		expect(screen.queryByLabelText(/wornCount/i)).not.toBeInTheDocument();
		// Legit editable fields still render.
		expect(screen.getByLabelText("name")).toBeInTheDocument();
		expect(screen.getByLabelText("brand")).toBeInTheDocument();
	});

	it("hides the status and location selects when the beta flag is off (default)", () => {
		vi.stubEnv("VITE_SHOW_STATUS_LOCATION", "");
		render(<EditItemView item={demoItem} setView={vi.fn()} />);
		expect(screen.queryByLabelText("status")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("location")).not.toBeInTheDocument();
		// Condition is NOT gated — it's a separate, live field.
		expect(screen.getByLabelText("condition")).toBeInTheDocument();
	});

	it("shows the status and location selects when the beta flag is on", () => {
		vi.stubEnv("VITE_SHOW_STATUS_LOCATION", "true");
		render(<EditItemView item={demoItem} setView={vi.fn()} />);
		expect(screen.getByLabelText("status")).toBeInTheDocument();
		expect(screen.getByLabelText("location")).toBeInTheDocument();
	});
});
