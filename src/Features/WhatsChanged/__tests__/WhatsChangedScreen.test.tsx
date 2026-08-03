import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WhatsChangedScreen from "../WhatsChangedScreen";

describe("WhatsChangedScreen", () => {
	it("shows the title and up to 3 bullets", () => {
		render(<WhatsChangedScreen bullets={["First", "Second", "Third"]} onDismiss={vi.fn()} />);

		expect(screen.getByText("What's changed")).toBeInTheDocument();
		expect(screen.getByText("First")).toBeInTheDocument();
		expect(screen.getByText("Second")).toBeInTheDocument();
		expect(screen.getByText("Third")).toBeInTheDocument();
	});

	it("calls onDismiss when the CTA is pressed", () => {
		const onDismiss = vi.fn();
		render(<WhatsChangedScreen bullets={["First"]} onDismiss={onDismiss} />);

		fireEvent.click(screen.getByRole("button", { name: /got it/i }));

		expect(onDismiss).toHaveBeenCalled();
	});
});
