import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState, ReactElement } from "react";
import ErrorBoundary from "./ErrorBoundary";

function Boom({ message = "kaboom" }: { message?: string }): ReactElement {
	throw new Error(message);
}

describe("ErrorBoundary", () => {
	// React logs caught errors to console.error; silence to keep test output clean.
	beforeEach(() => {
		vi.spyOn(console, "error").mockImplementation(() => {});
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("renders children when there is no error", () => {
		render(
			<ErrorBoundary>
				<div>safe content</div>
			</ErrorBoundary>
		);
		expect(screen.getByText("safe content")).toBeInTheDocument();
	});

	it("renders the default fallback with role=alert when a child throws", () => {
		render(
			<ErrorBoundary>
				<Boom message="render failed" />
			</ErrorBoundary>
		);
		const alert = screen.getByRole("alert");
		expect(alert).toBeInTheDocument();
		expect(screen.getByText("render failed")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Try again/i })).toBeInTheDocument();
	});

	it("renders a custom fallback when provided", () => {
		render(
			<ErrorBoundary fallback={<div>custom fallback</div>}>
				<Boom />
			</ErrorBoundary>
		);
		expect(screen.getByText("custom fallback")).toBeInTheDocument();
	});

	it("calls onError with the thrown error", () => {
		const onError = vi.fn();
		render(
			<ErrorBoundary onError={onError}>
				<Boom message="reported" />
			</ErrorBoundary>
		);
		expect(onError).toHaveBeenCalledTimes(1);
		expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
		expect(onError.mock.calls[0][0].message).toBe("reported");
	});

	it("calls onReset when 'Try again' is clicked", () => {
		const onReset = vi.fn();
		render(
			<ErrorBoundary onReset={onReset}>
				<Boom />
			</ErrorBoundary>
		);
		fireEvent.click(screen.getByRole("button", { name: /Try again/i }));
		expect(onReset).toHaveBeenCalledTimes(1);
	});

	it("recovers via 'Try again' when onReset steers to safe content", () => {
		// Mirrors the app: onReset flips the rendered child to something safe,
		// so when the boundary clears its error state it no longer re-throws.
		function Harness() {
			const [safe, setSafe] = useState(false);
			return (
				<ErrorBoundary onReset={() => setSafe(true)}>
					{safe ? <div>recovered</div> : <Boom />}
				</ErrorBoundary>
			);
		}
		render(<Harness />);

		expect(screen.getByRole("alert")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /Try again/i }));

		expect(screen.getByText("recovered")).toBeInTheDocument();
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});
});
