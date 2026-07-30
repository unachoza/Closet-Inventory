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
	default: { init: posthogInit, register: vi.fn(), identify: vi.fn(), reset: vi.fn(), capture: vi.fn() },
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

	it("initMonitoring: starts no analytics without consent, even with the key configured", async () => {
		vi.stubEnv("VITE_SENTRY_DSN", "https://example.test/1");
		vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
		const { initMonitoring } = await import("../monitoring");

		await initMonitoring();

		expect(posthogInit).not.toHaveBeenCalled();
		// Analytics init must not drag Sentry in as a side effect — the two are
		// deliberately separate lifecycles now.
		expect(sentryInit).not.toHaveBeenCalled();
	});

	it("initMonitoring: with consent, starts PostHog when its key is set", async () => {
		setConsent("granted");
		vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
		const { initMonitoring } = await import("../monitoring");

		await initMonitoring();

		expect(posthogInit).toHaveBeenCalled();
	});

	it("initMonitoring: is a no-op the second time it's called", async () => {
		setConsent("granted");
		vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
		const { initMonitoring } = await import("../monitoring");

		await initMonitoring();
		await initMonitoring();

		expect(posthogInit).toHaveBeenCalledTimes(1);
	});

	// Crash reporting is deliberately NOT consent-gated: consent defaults to
	// "undecided", and gating Sentry behind it meant a month-long sign-in outage
	// produced zero telemetry. Scope stays narrow — no PII, no replay, no identify.
	it("initErrorTracking: starts Sentry without consent when a DSN is configured", async () => {
		vi.stubEnv("VITE_SENTRY_DSN", "https://example.test/1");
		const { initErrorTracking } = await import("../monitoring");

		await initErrorTracking();

		expect(sentryInit).toHaveBeenCalledWith(
			expect.objectContaining({ dsn: "https://example.test/1", sendDefaultPii: false, release: expect.any(String) }),
		);
	});

	it("initErrorTracking: does nothing without a DSN", async () => {
		vi.stubEnv("VITE_SENTRY_DSN", "");
		const { initErrorTracking } = await import("../monitoring");

		await initErrorTracking();

		expect(sentryInit).not.toHaveBeenCalled();
	});

	it("initErrorTracking: is a no-op the second time it's called", async () => {
		vi.stubEnv("VITE_SENTRY_DSN", "https://example.test/1");
		const { initErrorTracking } = await import("../monitoring");

		await initErrorTracking();
		await initErrorTracking();

		expect(sentryInit).toHaveBeenCalledTimes(1);
	});

	it("captureException: reports to Sentry with a DSN configured", async () => {
		vi.stubEnv("VITE_SENTRY_DSN", "https://example.test/1");
		const { captureException } = await import("../monitoring");
		const error = new Error("boom");

		await captureException(error);

		expect(sentryCaptureException).toHaveBeenCalledWith(error);
	});

	it("captureException: reports even without consent — errors are not analytics", async () => {
		vi.stubEnv("VITE_SENTRY_DSN", "https://example.test/1");
		const { captureException } = await import("../monitoring");
		const error = new Error("boom");

		await captureException(error);

		expect(sentryCaptureException).toHaveBeenCalledWith(error);
	});

	it("captureException: initializes Sentry itself if nothing else has yet", async () => {
		// A crash during startup must not be the one report that gets dropped.
		vi.stubEnv("VITE_SENTRY_DSN", "https://example.test/1");
		const { captureException } = await import("../monitoring");

		await captureException(new Error("boom"));

		expect(sentryInit).toHaveBeenCalledTimes(1);
	});

	it("captureException: no-ops without a DSN", async () => {
		vi.stubEnv("VITE_SENTRY_DSN", "");
		const { captureException } = await import("../monitoring");

		await captureException(new Error("boom"));

		expect(sentryCaptureException).not.toHaveBeenCalled();
	});
});
