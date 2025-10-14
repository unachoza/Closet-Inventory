import { render, screen } from "@testing-library/react";
import Closet from "./Closet";

describe("Closet Component", () => {
	it("should have Category Title ", () => {
		render(<Closet selectedCategory="dresses" />);
		const message = screen.queryByText(/Dresses/);
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toHaveTextContent("Dresses");
		expect(message).toBeInTheDocument();
	});
	it("Should see clothing cards, no more than 9 with cool animation", () => {});
	it("Cards should be hoverable, to reveal details", () => {});
	it("Cards should be clickable to reveal back, with MORE BUTTON", () => {});
});
