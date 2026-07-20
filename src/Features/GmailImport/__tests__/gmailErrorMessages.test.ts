import { describe, it, expect } from "vitest";
import { describeGmailError } from "../gmailErrorMessages";

// Raw inputs mirror what actually reaches the UI today: `fetchJson` throws
// `Gmail API error (<status>): <response text>`, the browser throws
// "Failed to fetch" offline, and useGmailAuth sets its own popup messages.
describe("describeGmailError", () => {
	it("maps 401 to an expired-connection message with a reconnect action", () => {
		const result = describeGmailError('Gmail API error (401): {"error":{"code":401,"status":"UNAUTHENTICATED"}}');
		expect(result.action).toBe("reconnect");
		expect(result.reason).toBe("auth_expired");
		expect(result.message).toMatch(/expired/i);
		expect(result.message).not.toMatch(/401|API|UNAUTHENTICATED/);
	});

	it("maps 403 to a permission message with a reconnect action", () => {
		const result = describeGmailError('Gmail API error (403): {"error":{"message":"Insufficient Permission"}}');
		expect(result.action).toBe("reconnect");
		expect(result.reason).toBe("no_permission");
		expect(result.message).toMatch(/permission/i);
		expect(result.message).not.toMatch(/403/);
	});

	it("maps a 403 rate-limit body to retry, not reconnect", () => {
		const result = describeGmailError('Gmail API error (403): {"error":{"message":"Rate Limit Exceeded"}}');
		expect(result.action).toBe("retry");
		expect(result.reason).toBe("rate_limited");
	});

	it("maps 429 to a slow-down message with a retry action", () => {
		const result = describeGmailError("Gmail API error (429): rateLimitExceeded");
		expect(result.action).toBe("retry");
		expect(result.reason).toBe("rate_limited");
		expect(result.message).not.toMatch(/429/);
	});

	it("maps 5xx to a Gmail-side problem with a retry action", () => {
		const result = describeGmailError("Gmail API error (503): Service Unavailable");
		expect(result.action).toBe("retry");
		expect(result.reason).toBe("gmail_down");
		expect(result.message).not.toMatch(/503/);
	});

	it("maps browser network failures to a connection message with retry", () => {
		for (const raw of ["Failed to fetch", "NetworkError when attempting to fetch resource.", "Load failed"]) {
			const result = describeGmailError(raw);
			expect(result.action).toBe("retry");
			expect(result.reason).toBe("network");
			expect(result.message).toMatch(/connection/i);
		}
	});

	it("maps the closed-popup auth error to reconnect", () => {
		const result = describeGmailError("Authentication popup was closed");
		expect(result.action).toBe("reconnect");
		expect(result.reason).toBe("popup_closed");
	});

	it("passes the already-friendly popup-blocked message through", () => {
		const raw = "Couldn't open Google sign-in. Please allow pop-ups for this site and try again.";
		const result = describeGmailError(raw);
		expect(result.action).toBe("reconnect");
		expect(result.reason).toBe("popup_blocked");
		expect(result.message).toBe(raw);
	});

	it("falls back to a generic retry message for anything unrecognized", () => {
		const result = describeGmailError("some totally unexpected thing");
		expect(result.action).toBe("retry");
		expect(result.reason).toBe("unknown");
		expect(result.message).toMatch(/try again/i);
		expect(result.message).not.toMatch(/unexpected thing/);
	});
});
