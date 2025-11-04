import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, Mock } from "vitest";
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
	it("should have placeholder text", () => {});
	it("should recieve user input", async () => {});
	it("should add a new pill description if it doesn't already exist");
	it("should allow users to remove pill with x", () => {});
	it("if used in pill input field, should post new pill to local storage")
});
