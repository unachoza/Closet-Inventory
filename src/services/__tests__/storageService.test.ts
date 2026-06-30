import { describe, it, expect } from "vitest";
import { validateImageFile } from "../storageService";

function fileOfSize(bytes: number, type = "image/jpeg"): File {
	return new File([new Uint8Array(bytes)], "photo.jpg", { type });
}

describe("validateImageFile", () => {
	it("accepts a normal-sized image file", () => {
		expect(validateImageFile(fileOfSize(1024))).toBeNull();
	});

	it("rejects non-image MIME types", () => {
		const file = fileOfSize(1024, "text/plain");
		expect(validateImageFile(file)).toMatch(/image/i);
	});

	it("rejects files over the 20MB cap", () => {
		const file = fileOfSize(20 * 1024 * 1024 + 1);
		expect(validateImageFile(file)).toMatch(/too large/i);
	});

	it("accepts a file exactly at the 20MB cap", () => {
		const file = fileOfSize(20 * 1024 * 1024);
		expect(validateImageFile(file)).toBeNull();
	});
});
