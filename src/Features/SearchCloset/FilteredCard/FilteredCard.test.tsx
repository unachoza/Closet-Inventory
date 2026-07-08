import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FilteredCard from "./FilteredCard";
import type { ClothingItem } from "../../../utils/types";

// Isolate the wrapper's border/dot logic from the heavy 3D flip card.
vi.mock("../../Components/ClothesCard/Card/Card", () => ({
	default: () => <div data-testid="clothing-card" />,
}));

vi.mock("../../../context/LocationsContext", () => ({
	useLocations: () => ({
		getLocation: (id?: string) => {
			const registry: Record<string, { id: string; label: string; kind: string; isPrimary?: boolean }> = {
				home: { id: "home", label: "Home", kind: "home", isPrimary: true },
				storage: { id: "storage", label: "Storage", kind: "storage" },
				suitcase: { id: "suitcase", label: "Suitcase", kind: "suitcase" },
				other: { id: "other", label: "Other", kind: "other" },
			};
			return registry[id ?? "home"] ?? registry.home;
		},
	}),
}));

const baseItem: ClothingItem = {
	id: "x1",
	imageURL: "",
	name: "Test Item",
	category: "top",
	color: "black",
	size: "M",
	brand: "acme",
	material: [],
	occasion: "casual",
	care: "machine wash",
};

const renderCard = (item: Partial<ClothingItem>, borderMode: "off" | "location" | "location_status") =>
	render(<FilteredCard item={{ ...baseItem, ...item }} matchKeys={[]} borderMode={borderMode} />).container
		.querySelector(".filtered-card") as HTMLElement;

describe("FilteredCard border rendering", () => {
	it("off mode sets no border/location/status attributes and no dot", () => {
		const card = renderCard({ locationId: "storage", status: "dirty" }, "off");
		expect(card).not.toHaveAttribute("data-border");
		expect(card).not.toHaveAttribute("data-location-kind");
		expect(card.querySelector(".filtered-card__status-dot")).toBeNull();
	});

	it("location mode sets the location kind but no status dot", () => {
		const card = renderCard({ locationId: "suitcase", status: "dirty" }, "location");
		expect(card).toHaveAttribute("data-border", "location");
		expect(card).toHaveAttribute("data-location-kind", "suitcase");
		expect(card.querySelector(".filtered-card__status-dot")).toBeNull();
	});

	it("home / absent location resolves to the neutral home kind", () => {
		expect(renderCard({ locationId: undefined }, "location")).toHaveAttribute("data-location-kind", "home");
		expect(renderCard({ locationId: "home" }, "location")).toHaveAttribute("data-location-kind", "home");
	});

	it("location_status mode adds a status dot reflecting the item status", () => {
		const card = renderCard({ locationId: "storage", status: "on_loan" }, "location_status");
		expect(card).toHaveAttribute("data-location-kind", "storage");
		const dot = card.querySelector(".filtered-card__status-dot");
		expect(dot).not.toBeNull();
		expect(dot).toHaveAttribute("data-status", "on_loan");
	});

	it("defaults missing status to clean in the combined mode (dot on every card)", () => {
		const card = renderCard({ locationId: "home", status: undefined }, "location_status");
		const dot = card.querySelector(".filtered-card__status-dot");
		expect(dot).not.toBeNull();
		expect(dot).toHaveAttribute("data-status", "clean");
	});
});
