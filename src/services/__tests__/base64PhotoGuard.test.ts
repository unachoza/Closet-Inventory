import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the Storage upload so we can assert the base64 → path conversion without
// touching Supabase.
const { mockUpload } = vi.hoisted(() => ({ mockUpload: vi.fn() }));
vi.mock("../storageService", () => ({
	uploadItemPhoto: mockUpload,
}));

import { ensureStoredPhoto } from "../base64PhotoGuard";

const USER = "user-123";
// 1×1 transparent PNG data URL (valid base64).
const PNG_DATA_URL =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

describe("ensureStoredPhoto (E1-2.2 base64 guard)", () => {
	beforeEach(() => {
		mockUpload.mockReset();
		mockUpload.mockResolvedValue("user-123/generated-uuid.png");
	});

	it("passes through an existing Storage path unchanged (no upload)", async () => {
		const path = "user-123/abc.jpg";
		const result = await ensureStoredPhoto(path, USER);
		expect(result).toBe(path);
		expect(mockUpload).not.toHaveBeenCalled();
	});

	it("passes through an empty value unchanged", async () => {
		expect(await ensureStoredPhoto("", USER)).toBe("");
		expect(await ensureStoredPhoto(undefined, USER)).toBe(undefined);
		expect(mockUpload).not.toHaveBeenCalled();
	});

	it("passes through an http URL unchanged (stock photos, legacy)", async () => {
		const url = "https://example.com/stock.png";
		expect(await ensureStoredPhoto(url, USER)).toBe(url);
		expect(mockUpload).not.toHaveBeenCalled();
	});

	it("uploads a base64 data URL and returns the Storage path", async () => {
		const result = await ensureStoredPhoto(PNG_DATA_URL, USER);
		expect(result).toBe("user-123/generated-uuid.png");
		expect(mockUpload).toHaveBeenCalledTimes(1);
		const [blob, userId, ext] = mockUpload.mock.calls[0];
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.type).toBe("image/png");
		expect(userId).toBe(USER);
		expect(ext).toBe("png");
	});

	it("derives ext + content-type from the data URL mime (jpeg)", async () => {
		mockUpload.mockResolvedValue("user-123/x.jpeg");
		const jpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
		await ensureStoredPhoto(jpeg, USER);
		const [blob, , ext] = mockUpload.mock.calls[0];
		expect(blob.type).toBe("image/jpeg");
		expect(ext).toBe("jpeg");
	});

	it("returns the original base64 if upload fails (never loses the image)", async () => {
		mockUpload.mockRejectedValue(new Error("network"));
		const result = await ensureStoredPhoto(PNG_DATA_URL, USER);
		expect(result).toBe(PNG_DATA_URL);
	});

	it("returns base64 unchanged when there is no userId (signed-out)", async () => {
		const result = await ensureStoredPhoto(PNG_DATA_URL, null);
		expect(result).toBe(PNG_DATA_URL);
		expect(mockUpload).not.toHaveBeenCalled();
	});
});
