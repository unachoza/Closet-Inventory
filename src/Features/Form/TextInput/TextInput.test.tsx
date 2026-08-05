import { render } from "@testing-library/react";
import { describe, it, beforeEach, expect, vi, Mock } from "vitest";
import TextInput from "./TextInput.tsx";
import { InputProps } from "../../../utils/types";

describe("TextInput Component", () => {
	beforeEach(() => {
		vi.spyOn(window, "alert");
		const handleUpdatesMock: Mock<InputProps["handleFormUpdate"]> = vi.fn();
		render(
			<>
				<TextInput
					key={1}
					type="textarea"
					name="messageExample"
					label="messageExample"
					value=""
					errorMessage="oops there was an error"
					placeholder="placeholder text"
					handleFormUpdate={handleUpdatesMock}
				/>
				<button type="submit">Submit</button>
			</>
		);
	});
	// The error <div role="alert"> sits next to the input visually, but nothing
	// ties them together programmatically. A screen reader landing on the input
	// via Tab or the rotor reads only the label — the error text is a separate,
	// unrelated node it has no reason to visit. aria-describedby is what makes
	// "focus the input" and "hear the error" the same event.
	it("associates the error message with the input via aria-describedby", () => {
		const input = document.querySelector('input[name="messageExample"]')!;
		const errorId = input.getAttribute("aria-describedby");
		expect(errorId).toBeTruthy();
		expect(document.getElementById(errorId!)).toHaveTextContent("oops there was an error");
	});

	it("marks the input aria-invalid when an error is present", () => {
		const input = document.querySelector('input[name="messageExample"]')!;
		expect(input).toHaveAttribute("aria-invalid", "true");
	});

	it("should have placeholder text", () => {});
	it("should recieve user input", async () => {});
	it("should add a new pill description if it doesn't already exist");
	it("should allow users to remove pill with x", () => {});
	it("if used in pill input field, should post new pill to local storage")
});
