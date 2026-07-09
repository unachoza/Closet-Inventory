/**
 * Thin wrapper around `console.*` used everywhere instead of calling it
 * directly. Two jobs: redact anything shaped like a token, OAuth code, or
 * email before it reaches the console, and gate debug-level noise behind dev
 * builds so production consoles don't accumulate non-actionable logs.
 */

// JWTs and long opaque access/refresh tokens: dot-separated base64url segments.
const TOKEN_LIKE = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;
// key/value pairs for common OAuth fields, however they're quoted or spaced.
const KEYED_SECRET = /("?(?:access_token|refresh_token|provider_token|id_token|code)"?\s*[:=]\s*)"?[^\s",}]+"?/gi;
const EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function redact(value: string): string {
	return value
		.replace(TOKEN_LIKE, "[redacted-token]")
		.replace(KEYED_SECRET, (_match, prefix: string) => `${prefix}[redacted]`)
		.replace(EMAIL, "[redacted-email]");
}

function toMessage(error: unknown): string {
	if (error instanceof Error) return `${error.name}: ${error.message}`;
	if (typeof error === "string") return error;
	try {
		return JSON.stringify(error);
	} catch {
		return String(error);
	}
}

/** Log an error-level event. `error` is redacted before it reaches the console. */
export function logError(context: string, error?: unknown): void {
	const detail = error === undefined ? "" : ` — ${redact(toMessage(error))}`;
	console.error(`[${context}]${detail}`);
}

/** Log a warn-level event. `error` is redacted before it reaches the console. */
export function logWarn(context: string, error?: unknown): void {
	const detail = error === undefined ? "" : ` — ${redact(toMessage(error))}`;
	console.warn(`[${context}]${detail}`);
}

/** Dev-only diagnostic logging — no-ops in production builds. */
export function logDebug(context: string, message?: string): void {
	if (!import.meta.env.DEV) return;
	console.log(`[${context}]${message ? ` — ${redact(message)}` : ""}`);
}
