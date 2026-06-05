import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ImageUploaderInput from "./ImageUploader";

const FAKE_BASE64 = "data:image/png;base64,abc123";

// Stub FileReader — component reads `reader.result` directly, not from the event
class FakeFileReader {
	result: string = FAKE_BASE64;
	onload: (() => void) | null = null;
	readAsDataURL() {
		this.onload?.();
	}
}

beforeEach(() => {
	vi.stubGlobal("FileReader", FakeFileReader);
});

describe("ImageUploaderInput", () => {
	it("renders the upload label and click-to-upload placeholder", () => {
		render(<ImageUploaderInput image={undefined} onImageSelect={vi.fn()} onImageRemove={vi.fn()} />);
		expect(screen.getByText(/upload item photo/i)).toBeInTheDocument();
		expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
	});

	it("shows a preview image when an existing image is passed", () => {
		render(<ImageUploaderInput image={FAKE_BASE64} onImageSelect={vi.fn()} onImageRemove={vi.fn()} />);
		expect(screen.getByRole("img", { name: /preview/i })).toBeInTheDocument();
	});

	it("calls onImageSelect with base64 string after file selection", async () => {
		const onImageSelect = vi.fn();
		render(<ImageUploaderInput image={undefined} onImageSelect={onImageSelect} onImageRemove={vi.fn()} />);

		const input = document.querySelector("input[type=file]") as HTMLInputElement;
		const file = new File(["img"], "photo.png", { type: "image/png" });
		fireEvent.change(input, { target: { files: [file] } });

		await waitFor(() => expect(onImageSelect).toHaveBeenCalledWith(FAKE_BASE64));
	});

	it("shows a preview after file selection", async () => {
		render(<ImageUploaderInput image={undefined} onImageSelect={vi.fn()} onImageRemove={vi.fn()} />);

		const input = document.querySelector("input[type=file]") as HTMLInputElement;
		fireEvent.change(input, { target: { files: [new File(["img"], "photo.png", { type: "image/png" })] } });

		await waitFor(() => expect(screen.getByRole("img", { name: /preview/i })).toBeInTheDocument());
	});

	it("calls onImageRemove and hides preview when Remove is clicked", async () => {
		const onImageRemove = vi.fn();
		render(<ImageUploaderInput image={FAKE_BASE64} onImageSelect={vi.fn()} onImageRemove={onImageRemove} />);
		fireEvent.click(screen.getByRole("button", { name: /remove/i }));
		expect(onImageRemove).toHaveBeenCalled();
		expect(screen.queryByRole("img")).not.toBeInTheDocument();
	});
});
