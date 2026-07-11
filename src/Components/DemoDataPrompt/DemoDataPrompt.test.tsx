import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DemoDataPrompt from "./DemoDataPrompt";

describe("DemoDataPrompt", () => {
	it("renders nothing when there is no active prompt", () => {
		const { container } = render(<DemoDataPrompt prompt={null} onKeep={vi.fn()} onClear={vi.fn()} />);
		expect(container).toBeEmptyDOMElement();
	});

	it("celebrate variant shows the first-item acknowledgement", () => {
		render(<DemoDataPrompt prompt="celebrate" onKeep={vi.fn()} onClear={vi.fn()} />);
		expect(screen.getByText(/first real piece/i)).toBeInTheDocument();
		expect(screen.getByText(/never saved to your account/i)).toBeInTheDocument();
	});

	it("reprompt variant asks again without the celebration", () => {
		render(<DemoDataPrompt prompt="reprompt" onKeep={vi.fn()} onClear={vi.fn()} />);
		expect(screen.getByText(/clear the samples/i)).toBeInTheDocument();
		expect(screen.queryByText(/first real piece/i)).not.toBeInTheDocument();
	});

	it("wires Keep and Clear to their handlers", async () => {
		const onKeep = vi.fn();
		const onClear = vi.fn();
		render(<DemoDataPrompt prompt="celebrate" onKeep={onKeep} onClear={onClear} />);

		await userEvent.click(screen.getByRole("button", { name: /keep them for now/i }));
		expect(onKeep).toHaveBeenCalledTimes(1);

		await userEvent.click(screen.getByRole("button", { name: /clear sample items/i }));
		expect(onClear).toHaveBeenCalledTimes(1);
	});
});
