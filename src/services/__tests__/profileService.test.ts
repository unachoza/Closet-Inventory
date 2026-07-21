import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProfile, updateDisplayName, validateDisplayName, DISPLAY_NAME_MAX_LENGTH } from "../profileService";

const { single, selectEq, select, updateEq, update, from } = vi.hoisted(() => {
	const single = vi.fn();
	const selectEq = vi.fn(() => ({ single }));
	const select = vi.fn(() => ({ eq: selectEq }));
	const updateEq = vi.fn();
	const update = vi.fn(() => ({ eq: updateEq }));
	const from = vi.fn(() => ({ select, update }));
	return { single, selectEq, select, updateEq, update, from };
});

vi.mock("../../lib/supabaseClient", () => ({ getSupabase: () => ({ from }) }));

const PROFILE_ROW = {
	id: "user-1",
	created_at: "2026-07-01T00:00:00Z",
	display_name: "Susan",
	photo_url: "https://example.com/a.jpg",
	settings: {},
};

describe("profileService", () => {
	beforeEach(() => {
		single.mockReset().mockResolvedValue({ data: PROFILE_ROW, error: null });
		updateEq.mockReset().mockResolvedValue({ error: null });
		from.mockClear();
		select.mockClear();
		update.mockClear();
	});

	describe("getProfile", () => {
		it("returns the profile row for a signed-in user", async () => {
			const result = await getProfile("user-1");
			expect(result).toEqual({ ok: true, data: PROFILE_ROW });
			expect(from).toHaveBeenCalledWith("profiles");
			expect(selectEq).toHaveBeenCalledWith("id", "user-1");
		});

		it("rejects an empty user id without hitting the database", async () => {
			const result = await getProfile("");
			expect(result).toEqual({ ok: false, error: expect.stringMatching(/signed in/i) });
			expect(from).not.toHaveBeenCalled();
		});

		it("surfaces a database error as a typed failure", async () => {
			single.mockResolvedValue({ data: null, error: { message: "rls denied" } });
			const result = await getProfile("user-1");
			expect(result).toEqual({ ok: false, error: "rls denied" });
		});

		it("surfaces a thrown client error as a typed failure", async () => {
			single.mockRejectedValue(new Error("network down"));
			const result = await getProfile("user-1");
			expect(result).toEqual({ ok: false, error: "network down" });
		});
	});

	describe("validateDisplayName", () => {
		it("trims and accepts a normal name", () => {
			expect(validateDisplayName("  Susan  ")).toEqual({ ok: true, value: "Susan" });
		});

		it("rejects an empty name", () => {
			expect(validateDisplayName("   ")).toEqual({ ok: false, error: expect.stringMatching(/name/i) });
		});

		it("rejects a name over the max length", () => {
			const tooLong = "a".repeat(DISPLAY_NAME_MAX_LENGTH + 1);
			expect(validateDisplayName(tooLong)).toEqual({
				ok: false,
				error: expect.stringContaining(String(DISPLAY_NAME_MAX_LENGTH)),
			});
		});

		it("accepts a name exactly at the max length", () => {
			const exact = "a".repeat(DISPLAY_NAME_MAX_LENGTH);
			expect(validateDisplayName(exact)).toEqual({ ok: true, value: exact });
		});
	});

	describe("updateDisplayName", () => {
		it("updates the trimmed name and returns it", async () => {
			const result = await updateDisplayName("user-1", "  Ari  ");
			expect(result).toEqual({ ok: true, data: "Ari" });
			expect(from).toHaveBeenCalledWith("profiles");
			expect(update).toHaveBeenCalledWith({ display_name: "Ari" });
			expect(updateEq).toHaveBeenCalledWith("id", "user-1");
		});

		it("rejects an invalid name without hitting the database", async () => {
			const result = await updateDisplayName("user-1", "   ");
			expect(result.ok).toBe(false);
			expect(update).not.toHaveBeenCalled();
		});

		it("rejects an empty user id without hitting the database", async () => {
			const result = await updateDisplayName("", "Ari");
			expect(result).toEqual({ ok: false, error: expect.stringMatching(/signed in/i) });
			expect(update).not.toHaveBeenCalled();
		});

		it("surfaces a database error as a typed failure", async () => {
			updateEq.mockResolvedValue({ error: { message: "rls denied" } });
			const result = await updateDisplayName("user-1", "Ari");
			expect(result).toEqual({ ok: false, error: "rls denied" });
		});
	});
});
