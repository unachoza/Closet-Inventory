import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setConsent } from "../consent";

const { sentryInit, sentryCaptureException, posthogInit } = vi.hoisted(() => ({
	sentryInit: vi.fn(),
	sentryCaptureException: vi.fn(),
	posthogInit: vi.fn(),
}));

vi.mock("@sentry/react", () => ({
	init: sentryInit,
	captureException: sentryCaptureException,
}));

vi.mock("posthog-js", () => ({
	default: { init: posthogInit },
}));

describe("monitoring", () => {
	beforeEach(() => {
		localStorage.clear();
		sentryInit.mockClear();
		sentryCaptureException.mockClear();
		posthogInit.mockClear();
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("initMonitoring: does nothing without consent, even with both keys configured", async () => {
		vi.stubEnv("VITE_SENTRY_DSN", "https://example.test/1");
		vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
		const { initMonitoring } = await import("../monitoring");

		await initMonitoring();

		expect(sentryInit).not.toHaveBeenCalled();
		expect(posthogInit).not.toHaveBeenCalled();
	});

	it("initMonitoring: with consent, initializes only the SDKs whose env var is set", async () => {
		setConsent("granted");
		vi.stubEnv("VITE_SENTRY_DSN", "https://example.test/1");
		vi.stubEnv("VITE_POSTHOG_KEY", "");
		const { initMonitoring } = await import("../monitoring");

		await initMonitoring();

		expect(sentryInit).toHaveBeenCalledWith({ dsn: "https://example.test/1", sendDefaultPii: false });
		expect(posthogInit).not.toHaveBeenCalled();
	});

	it("initMonitoring: is a no-op the second time it's called", async () => {
		setConsent("granted");
		vi.stubEnv("VITE_SENTRY_DSN", "https://example.test/1");
		const { initMonitoring } = await import("../monitoring");

		await initMonitoring();
		await initMonitoring();

		expect(sentryInit).toHaveBeenCalledTimes(1);
	});

	it("captureException: reports to Sentry when consent is granted and a DSN is configured", async () => {
		setConsent("granted");
		vi.stubEnv("VITE_SENTRY_DSN", "https://example.test/1");
		const { captureException } = await import("../monitoring");
		const error = new Error("boom");

		await captureException(error);

		expect(sentryCaptureException).toHaveBeenCalledWith(error);
	});

	it("captureException: no-ops without consent", async () => {
		vi.stubEnv("VITE_SENTRY_DSN", "https://example.test/1");
		const { captureException } = await import("../monitoring");

		await captureException(new Error("boom"));

		expect(sentryCaptureException).not.toHaveBeenCalled();
	});
});
