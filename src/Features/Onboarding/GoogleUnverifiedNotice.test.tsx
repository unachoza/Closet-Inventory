import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GoogleUnverifiedNotice from "./GoogleUnverifiedNotice";

describe("GoogleUnverifiedNotice", () => {
	it("renders nothing when closed", () => {
		render(<GoogleUnverifiedNotice isOpen={false} onContinue={vi.fn()} onCancel={vi.fn()} />);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("when open, explains the Advanced → Go to app steps", () => {
		render(<GoogleUnverifiedNotice isOpen={true} onContinue={vi.fn()} onCancel={vi.fn()} />);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.getByText(/advanced/i)).toBeInTheDocument();
		expect(screen.getByText(/go to nothing to wear \(unsafe\)/i)).toBeInTheDocument();
	});

	it("Continue calls onContinue; Cancel calls onCancel", () => {
		const onContinue = vi.fn();
		const onCancel = vi.fn();
		render(<GoogleUnverifiedNotice isOpen={true} onContinue={onContinue} onCancel={onCancel} />);

		fireEvent.click(screen.getByRole("button", { name: /continue to google sign-in/i }));
		expect(onContinue).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
		expect(onCancel).toHaveBeenCalledTimes(1);
	});
});
