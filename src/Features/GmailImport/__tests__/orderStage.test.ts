import { describe, it, expect } from "vitest";
import { classifyStage } from "../orderStage";

describe("classifyStage", () => {
	// Real subjects pulled from the parser fixtures.
	it("classifies real confirmation subjects", () => {
		expect(classifyStage("Order I538721 confirmed")).toBe("confirmed");
		expect(classifyStage("Your Nordstrom Rack order #1042965288, confirmed!")).toBe("confirmed");
		expect(classifyStage("Thank you for your purchase")).toBe("confirmed");
		expect(classifyStage("Order Confirmation")).toBe("confirmed");
	});

	it("classifies real delivered subjects", () => {
		expect(classifyStage("📦 ORDER DELIVERED: Eddie Bauer Shoes Womens 9 M")).toBe("delivered");
		expect(classifyStage("Your package from order #1043129433 has arrived")).toBe("delivered");
	});

	it("classifies shipped subjects", () => {
		expect(classifyStage("Your order has shipped")).toBe("shipped");
		expect(classifyStage("Your order is on its way")).toBe("shipped");
		expect(classifyStage("Shipping confirmation for your order")).toBe("shipped");
	});

	// The discriminating case: "shipped"/"delivered" must win over "confirmed"
	// even though the subject still contains the word "order".
	it("prefers the most-advanced stage when multiple signals appear", () => {
		expect(classifyStage("Your order #123456 has shipped")).toBe("shipped");
		expect(classifyStage("Your order #123456 was delivered")).toBe("delivered");
		expect(classifyStage("Order confirmation — your package has arrived")).toBe("delivered");
	});

	it("treats 'out for delivery' as shipped, not delivered", () => {
		expect(classifyStage("Your package is out for delivery")).toBe("shipped");
	});

	it("returns null for unrelated subjects", () => {
		expect(classifyStage("Your weekly newsletter")).toBeNull();
		expect(classifyStage("Save 20% this weekend")).toBeNull();
		expect(classifyStage("")).toBeNull();
	});
});
