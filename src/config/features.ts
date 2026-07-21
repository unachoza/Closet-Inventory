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
