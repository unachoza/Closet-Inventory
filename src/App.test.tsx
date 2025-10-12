import { render, screen } from "@testing-library/react";
import App from "./App";

describe("the App", () => {
	it("should have heading text ", () => {
		render(<App />);
		const message = screen.queryByText(/My Closet/);
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toHaveTextContent("My Closet");
		expect(message).toBeInTheDocument();
	});
	it("should render a carosel", () => {});
	it("should have two button 'add item' and 'view closet'", () => {});
	it("should default to show closet", () => {});
});
