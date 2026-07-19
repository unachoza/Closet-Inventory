import { describe, it, expect } from "vitest";
import { extractOrderNumber, extractRetailer, groupOrders } from "../orderGrouping";
import type { GmailEmailMeta } from "../../../hooks/useAdvancedSearch";

function email(over: Partial<GmailEmailMeta> & { id: string }): GmailEmailMeta {
	return {
		threadId: `t-${over.id}`,
		subject: "",
		from: "",
		date: "2026-01-01T00:00:00Z",
		snippet: "",
		...over,
	};
}

describe("extractOrderNumber", () => {
	it("pulls real order numbers from fixture subjects", () => {
		expect(extractOrderNumber("Order I538721 confirmed")).toBe("I538721");
		expect(extractOrderNumber("Your Nordstrom Rack order #1042965288, confirmed!")).toBe("1042965288");
		expect(extractOrderNumber("Your package from order #1043129433 has arrived")).toBe("1043129433");
	});

	it("normalizes so # and 'order' forms of the same number match", () => {
		expect(extractOrderNumber("#1042965288")).toBe(extractOrderNumber("order 1042965288"));
	});

	// The destructive-failure guards: none of these may yield a token.
	it("rejects non-order tokens (the dangerous cases)", () => {
		expect(extractOrderNumber("Order Confirmation")).toBeNull();
		expect(extractOrderNumber("Save 20% on your order")).toBeNull();
		expect(extractOrderNumber("Your order has shipped")).toBeNull();
		expect(extractOrderNumber("Thank you for your purchase")).toBeNull();
		expect(extractOrderNumber("Your 2024 order recap")).toBeNull(); // bare year
		expect(extractOrderNumber("Order #12")).toBeNull(); // too few digits
	});
});

describe("extractRetailer", () => {
	it("reduces senders to a registrable domain", () => {
		expect(extractRetailer('"NORDSTROM RACK" <nordstromrack@eml.nordstromrack.com>')).toBe("nordstromrack.com");
		expect(extractRetailer("noreply@orders.icebreaker.com")).toBe("icebreaker.com");
	});

	it("keeps Nordstrom and Nordstrom Rack distinct", () => {
		expect(extractRetailer("nordstrom@eml.nordstrom.com")).not.toBe(
			extractRetailer("nordstromrack@eml.nordstromrack.com"),
		);
	});

	it("returns empty string when there is no address", () => {
		expect(extractRetailer("")).toBe("");
	});
});

describe("groupOrders", () => {
	it("groups the three emails of one order and keeps confirmation as primary", () => {
		const emails = [
			email({ id: "ship", from: "x@eml.acme.com", subject: "Your order #900123 has shipped", date: "2026-01-03" }),
			email({ id: "conf", from: "x@eml.acme.com", subject: "Order #900123 confirmed", date: "2026-01-01" }),
			email({ id: "deliv", from: "x@eml.acme.com", subject: "Order #900123 was delivered", date: "2026-01-05" }),
		];
		const groups = groupOrders(emails);
		expect(groups).toHaveLength(1);
		expect(groups[0].primary.id).toBe("conf");
		expect(groups[0].others.map((e) => e.id).sort()).toEqual(["deliv", "ship"]);
		expect(groups[0].stages).toEqual(["confirmed", "shipped", "delivered"]);
	});

	it("does NOT merge different order numbers from the same retailer", () => {
		const emails = [
			email({ id: "a", from: "x@eml.acme.com", subject: "Order #900123 confirmed" }),
			email({ id: "b", from: "x@eml.acme.com", subject: "Order #900999 confirmed" }),
		];
		expect(groupOrders(emails)).toHaveLength(2);
	});

	it("leaves emails without an order number ungrouped (singletons)", () => {
		const emails = [
			email({ id: "a", from: "x@eml.acme.com", subject: "Thank you for your purchase" }),
			email({ id: "b", from: "x@eml.acme.com", subject: "Your order has shipped" }),
		];
		const groups = groupOrders(emails);
		expect(groups).toHaveLength(2);
		expect(groups.every((g) => g.others.length === 0)).toBe(true);
	});

	it("falls back to earliest stage as primary when no confirmation is present", () => {
		const emails = [
			email({ id: "deliv", from: "x@eml.acme.com", subject: "Order #55555 was delivered", date: "2026-01-05" }),
			email({ id: "ship", from: "x@eml.acme.com", subject: "Order #55555 has shipped", date: "2026-01-03" }),
		];
		const groups = groupOrders(emails);
		expect(groups).toHaveLength(1);
		expect(groups[0].primary.id).toBe("ship"); // shipped ranks ahead of delivered
	});

	it("preserves original list order by first appearance", () => {
		const emails = [
			email({ id: "z", from: "x@z.com", subject: "hello" }),
			email({ id: "y", from: "x@y.com", subject: "world" }),
		];
		expect(groupOrders(emails).map((g) => g.primary.id)).toEqual(["z", "y"]);
	});
});
