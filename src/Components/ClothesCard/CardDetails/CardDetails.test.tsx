import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CardDetails from "./CardDetails";
import type { ClothingItem } from "../../../utils/types";
import { desc } from "framer-motion/client";

const item: ClothingItem = {
	id: "1",
	name: "Nike Top",
	brand: "Nike",
	category: "tops",
	color: "black",
	size: "M",
	material: [{ material: "cotton", percentage: 100 }],
	occasion: "casual",
	age: "new",
	care: "machine wash",
	imageURL: "https://example.com/img.jpg",
};

describe("Card details component", () => {
	it("should have a show more button that expands with smooth scroll", () => {});
	it("should have an edit button that opens up the edit form", () => {});
	it("should take up entire screen on mobile", () => {});
});
