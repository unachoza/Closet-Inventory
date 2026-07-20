/**
 * Translate raw Gmail-import failures into plain-language messages with a
 * recovery action. Raw inputs come from three places: `fetchJson` in
 * useAdvancedSearch throws `Gmail API error (<status>): <response text>`,
 * the browser's fetch throws "Failed to fetch"-style strings offline, and
 * useGmailAuth sets its own popup messages. Testers should never see a status
 * code or JSON blob — they see what happened and one button that fixes it.
 */

export type GmailErrorAction = "reconnect" | "retry";

/** Coarse failure category, reported to analytics as `import_failed.reason`. */
export type GmailErrorReason =
	| "auth_expired"
	| "no_permission"
	| "rate_limited"
	| "gmail_down"
	| "network"
	| "popup_closed"
	| "popup_blocked"
	| "unknown";

export interface FriendlyGmailError {
	readonly message: string;
	readonly action: GmailErrorAction;
	readonly reason: GmailErrorReason;
}

const POPUP_BLOCKED_MESSAGE = "Couldn't open Google sign-in. Please allow pop-ups for this site and try again.";

function statusOf(raw: string): number | null {
	const match = raw.match(/Gmail API error \((\d{3})\)/);
	return match ? Number(match[1]) : null;
}

export function describeGmailError(raw: string): FriendlyGmailError {
	const status = statusOf(raw);

	if (status === 401) {
		return {
			message: "Your Gmail connection has expired. Reconnect to keep importing.",
			action: "reconnect",
			reason: "auth_expired",
		};
	}

	// 403 is two different problems: Google's rate limiter (retry) or the user
	// declining the gmail.readonly checkbox on the consent screen (reconnect).
	if (status === 403) {
		if (/rate ?limit|quota/i.test(raw)) {
			return {
				message: "Gmail is asking us to slow down. Give it a moment, then try again.",
				action: "retry",
				reason: "rate_limited",
			};
		}
		return {
			message: "We don't have permission to read your Gmail. Reconnect and allow access when Google asks.",
			action: "reconnect",
			reason: "no_permission",
		};
	}

	if (status === 429) {
		return {
			message: "Gmail is asking us to slow down. Give it a moment, then try again.",
			action: "retry",
			reason: "rate_limited",
		};
	}

	if (status !== null && status >= 500) {
		return {
			message: "Gmail is having trouble on their end. Try again in a minute.",
			action: "retry",
			reason: "gmail_down",
		};
	}

	// Browser fetch failures: Chrome "Failed to fetch", Firefox "NetworkError
	// when attempting to fetch resource.", Safari "Load failed".
	if (/failed to fetch|networkerror|load failed|network request failed/i.test(raw)) {
		return {
			message: "Can't reach Gmail. Check your internet connection and try again.",
			action: "retry",
			reason: "network",
		};
	}

	if (raw === "Authentication popup was closed") {
		return {
			message: "The Google sign-in window was closed before finishing. Reconnect to try again.",
			action: "reconnect",
			reason: "popup_closed",
		};
	}

	// useGmailAuth's popup-blocked message is already written for humans.
	if (raw === POPUP_BLOCKED_MESSAGE) {
		return { message: raw, action: "reconnect", reason: "popup_blocked" };
	}

	return {
		message: "Something went wrong while searching Gmail. Try again in a moment.",
		action: "retry",
		reason: "unknown",
	};
}
