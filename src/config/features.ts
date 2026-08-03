/**
 * Beta feature gates.
 *
 * Status & Location (the E2 lifecycle: clean/dirty/at-cleaner/…, per-item
 * location, and the card-border encoding that visualizes them) ship **dark**
 * for the Founding Members beta. Every surface that exposes them — the edit
 * form's status/location selects, the Status & Location filter dimensions, and
 * the Search "Borders" toggle — is gated on `showStatusLocation()`.
 *
 * Default OFF. Flip per-environment with `VITE_SHOW_STATUS_LOCATION="true"` in
 * the Vercel/`.env` config — no code change, no rebuild of call sites. The
 * planned longer-term home is a per-user Supabase `profiles` column so it can
 * be flipped per tester without a deploy; this constant is the P0-sized stand-in.
 *
 * Intentionally a function, not a module-level const: read at call time so a
 * config change takes effect for every caller, and so tests can flip it with
 * `vi.stubEnv("VITE_SHOW_STATUS_LOCATION", "true")` per case.
 */
export function showStatusLocation(): boolean {
	return import.meta.env.VITE_SHOW_STATUS_LOCATION === "true";
}

/**
 * "What's changed" screen (WhatsChanged/) — a one-time full-screen card shown
 * on reopen after a new release, styled like onboarding, max 3 bullets.
 *
 * Default ON: this exists specifically so the person testing installs during
 * the beta push can see it fire for themselves. Expected to be revisited
 * before beta launches proper — flip `VITE_SHOW_WHATS_CHANGED="false"` to kill
 * it without a code change if review decides the copy or timing isn't ready.
 */
export function showWhatsChanged(): boolean {
	return import.meta.env.VITE_SHOW_WHATS_CHANGED !== "false";
}
