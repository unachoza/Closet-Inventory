import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import GoogleConsentCard from "./GoogleConsentCard";

describe("GoogleConsentCard", () => {
	it("lists sign-in permissions and shows the fallback avatar without a photo", () => {
		render(<GoogleConsentCard variant="sign-in" />);
		expect(screen.getByText(/sign you in with Google/i)).toBeInTheDocument();
		expect(screen.getByText(/Your closet securely synced to your account/i)).toBeInTheDocument();
		expect(screen.queryByRole("img")).not.toBeInTheDocument();
	});

	it("lists gmail-import permissions", () => {
		render(<GoogleConsentCard variant="gmail-import" />);
		expect(screen.getByText(/connect your Gmail/i)).toBeInTheDocument();
		expect(screen.getByText(/Read-only access to your Gmail/i)).toBeInTheDocument();
	});

	// it("shows initials when a name is given but no photo", () => {
	// 	render(<GoogleConsentCard variant="sign-in" userName="Ada Lovelace" />);
	// 	expect(screen.getByText("AL")).toBeInTheDocument();
	// });

	// it("prefers the user's photo when available", () => {
	// 	const { container } = render(
	// 		<GoogleConsentCard variant="sign-in" userPhotoUrl="https://example.com/avatar.png" userName="Ada Lovelace" />,
	// 	);
	// 	expect(container.querySelector("img")).toHaveAttribute("src", "https://example.com/avatar.png");
	// });

	it("drops the avatar and permission list in compact mode", () => {
		render(<GoogleConsentCard variant="sign-in" userName="Ada Lovelace" compact />);
		expect(screen.queryByText("AL")).not.toBeInTheDocument();
		expect(screen.queryByText(/Your closet securely synced to your account/i)).not.toBeInTheDocument();
	});
});
