import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setConsent } from "../consent";

const { sentryInit, sentryCaptureException, posthogInit, posthogCapture, posthogIdentify, posthogRegister, detectStandalone, showStatusLocation, showWhatsChanged } =
	vi.hoisted(() => ({
		sentryInit: vi.fn(),
		sentryCaptureException: vi.fn(),
		posthogInit: vi.fn(),
		posthogCapture: vi.fn(),
		posthogIdentify: vi.fn(),
		posthogRegister: vi.fn(),
		detectStandalone: vi.fn(() => false),
		showStatusLocation: vi.fn(() => false),
		showWhatsChanged: vi.fn(() => true),
	}));

vi.mock("@sentry/react", () => ({
	init: sentryInit,
	captureException: sentryCaptureException,
}));

vi.mock("posthog-js", () => ({
	default: { init: posthogInit, register: posthogRegister, identify: posthogIdentify, reset: vi.fn(), capture: posthogCapture },
}));

vi.mock("../../hooks/useInstallPrompt", () => ({ detectStandalone }));
vi.mock("../../config/features", () => ({ showStatusLocation, showWhatsChanged }));

describe("monitoring", () => {
	beforeEach(() => {
		localStorage.clear();
		sentryInit.mockClear();
		sentryCaptureException.mockClear();
		posthogInit.mockClear();
		posthogCapture.mockClear();
		posthogIdentify.mockClear();
		posthogRegister.mockClear();
		detectStandalone.mockClear().mockReturnValue(false);
		showStatusLocation.mockClear().mockReturnValue(false);
		showWhatsChanged.mockClear().mockReturnValue(true);
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

	it("initMonitoring: registers is_standalone and the current feature-flag states as super-properties", async () => {
		setConsent("granted");
		vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
		detectStandalone.mockReturnValue(true);
		showStatusLocation.mockReturnValue(true);
		showWhatsChanged.mockReturnValue(false);
		const { initMonitoring } = await import("../monitoring");

		await initMonitoring();

		expect(posthogRegister).toHaveBeenCalledWith(
			expect.objectContaining({
				is_standalone: true,
				flag_status_location: true,
				flag_whats_changed: false,
			}),
		);
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

	// The onboarding funnel runs entirely before the consent banner can be shown
	// (ConsentBanner mounts past the OnboardingFlow early-return in App.tsx), so
	// without buffering every first-run event is structurally unreachable.
	describe("pre-consent event buffer", () => {
		it("sends nothing to PostHog while consent is undecided", async () => {
			vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
			const { trackEvent } = await import("../monitoring");

			await trackEvent("onboarding_step_viewed", { step: "welcome" });

			expect(posthogCapture).not.toHaveBeenCalled();
		});

		it("flushes buffered events once consent is granted", async () => {
			vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
			const { trackEvent, initMonitoring } = await import("../monitoring");
			await trackEvent("onboarding_step_viewed", { step: "welcome" });
			await trackEvent("install_prompt_result", { outcome: "accepted" });

			setConsent("granted");
			await initMonitoring();

			expect(posthogCapture).toHaveBeenCalledTimes(2);
			expect(posthogCapture).toHaveBeenNthCalledWith(1, "onboarding_step_viewed", { step: "welcome" }, expect.anything());
			expect(posthogCapture).toHaveBeenNthCalledWith(2, "install_prompt_result", { outcome: "accepted" }, expect.anything());
		});

		it("replays each event with the time it actually happened, not the flush time", async () => {
			vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
			const { trackEvent, initMonitoring } = await import("../monitoring");
			const before = new Date();
			await trackEvent("onboarding_step_viewed", { step: "welcome" });

			setConsent("granted");
			await initMonitoring();

			const options = posthogCapture.mock.calls[0][2] as { timestamp: Date };
			expect(options.timestamp).toBeInstanceOf(Date);
			expect(options.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
			expect(options.timestamp.getTime()).toBeLessThanOrEqual(Date.now());
		});

		it("attributes flushed events to a user identified before consent", async () => {
			vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
			const { trackEvent, identify, initMonitoring } = await import("../monitoring");
			await identify("user-123", { name: "Tester" });
			await trackEvent("onboarding_completed");

			setConsent("granted");
			await initMonitoring();

			// identify must land before the replayed events, or they attach to an
			// anonymous person and the funnel can't be followed per-user.
			expect(posthogIdentify).toHaveBeenCalledWith("user-123", { name: "Tester" });
			expect(posthogIdentify.mock.invocationCallOrder[0]).toBeLessThan(posthogCapture.mock.invocationCallOrder[0]);
		});

		it("discards the buffer when consent is declined — nothing is ever sent", async () => {
			vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
			const { trackEvent, discardPendingEvents, initMonitoring } = await import("../monitoring");
			await trackEvent("onboarding_step_viewed", { step: "welcome" });

			setConsent("declined");
			discardPendingEvents();
			// Even if analytics were somehow started later, the declined events are gone.
			setConsent("granted");
			await initMonitoring();

			expect(posthogCapture).not.toHaveBeenCalled();
		});

		it("drops new events outright once consent is declined", async () => {
			vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
			setConsent("declined");
			const { trackEvent, initMonitoring } = await import("../monitoring");

			await trackEvent("item_added");
			setConsent("granted");
			await initMonitoring();

			expect(posthogCapture).not.toHaveBeenCalled();
		});

		it("caps the buffer so an undecided session can't grow without bound", async () => {
			vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
			const { trackEvent, MAX_PENDING_EVENTS, initMonitoring } = await import("../monitoring");

			for (let i = 0; i < MAX_PENDING_EVENTS + 10; i++) {
				await trackEvent("screen_viewed", { index: i });
			}
			setConsent("granted");
			await initMonitoring();

			expect(posthogCapture).toHaveBeenCalledTimes(MAX_PENDING_EVENTS);
			// The cap keeps the OLDEST events — the first-run funnel is the reason
			// this buffer exists, so late noise is what gets dropped.
			expect(posthogCapture).toHaveBeenNthCalledWith(1, "screen_viewed", { index: 0 }, expect.anything());
		});

		it("does not buffer when no PostHog key is configured", async () => {
			vi.stubEnv("VITE_POSTHOG_KEY", "");
			const { trackEvent, initMonitoring } = await import("../monitoring");
			await trackEvent("onboarding_completed");

			setConsent("granted");
			vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
			await initMonitoring();

			expect(posthogCapture).not.toHaveBeenCalled();
		});

		it("sends events immediately once consent is granted — no buffering after that", async () => {
			setConsent("granted");
			vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
			const { trackEvent, initMonitoring } = await import("../monitoring");
			await initMonitoring();

			await trackEvent("item_added", { source: "manual" });

			expect(posthogCapture).toHaveBeenCalledWith("item_added", { source: "manual" });
		});
	});
});
