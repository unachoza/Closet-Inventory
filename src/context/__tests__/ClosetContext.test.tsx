import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock useCloudCloset so we can prove the provider instantiates it exactly ONCE
// no matter how many consumers read the context (the whole point of the
// refactor — avoid 6 independent sync loops).
const { mockUseCloudCloset, sentinel } = vi.hoisted(() => {
	const sentinel = {
		closet: [{ id: "a" }],
		getCloset: () => [],
		addItem: () => {},
		addFullItem: () => {},
		importItems: () => {},
		removeItem: () => {},
		updateItem: () => {},
		clearCloset: () => {},
		isLoading: false,
		syncStatus: "synced" as const,
	};
	return { mockUseCloudCloset: vi.fn(() => sentinel), sentinel };
});
vi.mock("../../hooks/useCloudCloset", () => ({ useCloudCloset: mockUseCloudCloset }));

import { ClosetProvider, useCloset } from "../ClosetContext";

function Consumer({ testid }: { testid: string }) {
	const ctx = useCloset();
	return <span data-testid={testid}>{ctx.closet.length}</span>;
}

describe("ClosetContext", () => {
	beforeEach(() => mockUseCloudCloset.mockClear());

	it("useCloset throws when used outside ClosetProvider", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => render(<Consumer testid="x" />)).toThrow(/ClosetProvider/);
		spy.mockRestore();
	});

	it("instantiates useCloudCloset exactly once for many consumers", () => {
		render(
			<ClosetProvider>
				<Consumer testid="one" />
				<Consumer testid="two" />
				<Consumer testid="three" />
			</ClosetProvider>,
		);
		expect(mockUseCloudCloset).toHaveBeenCalledTimes(1);
	});

	it("shares the same closet API instance across consumers", () => {
		let a: unknown;
		let b: unknown;
		function Capture({ into }: { into: (v: unknown) => void }) {
			into(useCloset());
			return null;
		}
		render(
			<ClosetProvider>
				<Capture into={(v) => (a = v)} />
				<Capture into={(v) => (b = v)} />
			</ClosetProvider>,
		);
		expect(a).toBe(b);
		expect(a).toBe(sentinel);
	});

	it("renders the shared closet data to all consumers", () => {
		render(
			<ClosetProvider>
				<Consumer testid="one" />
				<Consumer testid="two" />
			</ClosetProvider>,
		);
		expect(screen.getByTestId("one").textContent).toBe("1");
		expect(screen.getByTestId("two").textContent).toBe("1");
	});
});
