import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ToastProvider, useToast } from "./Toast";

// Small helper component that triggers a toast on button click
const Trigger = ({ message }: { message: string }) => {
	const { showToast } = useToast();
	return <button onClick={() => showToast(message)}>Show Toast</button>;
};

const setup = (message = "Item added!") =>
	render(
		<ToastProvider>
			<Trigger message={message} />
		</ToastProvider>,
	);

describe("Toast / ToastProvider", () => {
	it("renders nothing until showToast is called", () => {
		setup();
		expect(screen.queryByText("Item added!")).not.toBeInTheDocument();
	});

	it("shows the toast message after showToast is called", () => {
		setup();
		fireEvent.click(screen.getByRole("button", { name: /show toast/i }));
		expect(screen.getByText("Item added!")).toBeInTheDocument();
	});

	it("dismisses the toast when the close button is clicked", async () => {
		setup();
		fireEvent.click(screen.getByRole("button", { name: /show toast/i }));
		// The close button is the second button rendered (after "Show Toast")
		const buttons = screen.getAllByRole("button");
		const closeBtn = buttons.find((b) => b !== screen.getByRole("button", { name: /show toast/i }))!;
		fireEvent.click(closeBtn);
		// AnimatePresence exit is async in jsdom
		await waitFor(() => expect(screen.queryByText("Item added!")).not.toBeInTheDocument());
	});

	it("queues multiple toasts — both messages render simultaneously", () => {
		render(
			<ToastProvider>
				<Trigger message="First" />
				<Trigger message="Second" />
			</ToastProvider>,
		);
		const [first, second] = screen.getAllByRole("button", { name: /show toast/i });
		act(() => {
			fireEvent.click(first);
			fireEvent.click(second);
		});
		expect(screen.getByText("First")).toBeInTheDocument();
		expect(screen.getByText("Second")).toBeInTheDocument();
	});
});
