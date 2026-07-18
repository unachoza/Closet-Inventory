import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitFeedback, collectContext } from "../feedbackService";

const { insert, from } = vi.hoisted(() => {
	const insert = vi.fn();
	const from = vi.fn(() => ({ insert }));
	return { insert, from };
});

vi.mock("../../lib/supabaseClient", () => ({ getSupabase: () => ({ from }) }));
vi.mock("../../lib/monitoring", () => ({ appVersion: () => "v-test" }));

describe("feedbackService", () => {
	beforeEach(() => {
		insert.mockReset().mockResolvedValue({ error: null });
		from.mockClear();
	});

	it("rejects an empty message without hitting the database", async () => {
		const result = await submitFeedback("user-1", "   ", "overview");
		expect(result).toEqual({ ok: false, error: expect.stringMatching(/message/i) });
		expect(from).not.toHaveBeenCalled();
	});

	it("rejects when there is no signed-in user", async () => {
		const result = await submitFeedback("", "great app", "overview");
		expect(result).toEqual({ ok: false, error: expect.stringMatching(/signed in/i) });
		expect(from).not.toHaveBeenCalled();
	});

	it("inserts a trimmed message with context for a valid submission", async () => {
		const result = await submitFeedback("user-1", "  love the care guide  ", "fabric");
		expect(result).toEqual({ ok: true });
		expect(from).toHaveBeenCalledWith("feedback");
		expect(insert).toHaveBeenCalledWith(
			expect.objectContaining({
				user_id: "user-1",
				message: "love the care guide",
				context: expect.objectContaining({ view: "fabric", app_version: "v-test" }),
			}),
		);
	});

	it("surfaces a database error as a typed failure", async () => {
		insert.mockResolvedValue({ error: { message: "rls denied" } });
		const result = await submitFeedback("user-1", "hi", "overview");
		expect(result).toEqual({ ok: false, error: "rls denied" });
	});

	it("collectContext captures the app version and current view", () => {
		const ctx = collectContext("gmail");
		expect(ctx.app_version).toBe("v-test");
		expect(ctx.view).toBe("gmail");
		expect(ctx.screen).toMatch(/^\d+x\d+$/);
	});
});
