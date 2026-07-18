import { getSupabase } from "../lib/supabaseClient";
import type { Json } from "../lib/database.types";
import { appVersion } from "../lib/monitoring";

/** Client context auto-attached to every feedback row for reproduction. */
export interface FeedbackContext {
	app_version: string;
	view: string;
	url: string;
	user_agent: string;
	screen: string;
}

/** Snapshot the environment a tester is reporting from — no PII beyond the UA. */
export function collectContext(view: string): FeedbackContext {
	return {
		app_version: appVersion(),
		view,
		url: window.location.href,
		user_agent: navigator.userAgent,
		screen: `${window.innerWidth}x${window.innerHeight}`,
	};
}

/**
 * Insert a feedback row for the signed-in user. Validates a non-empty message
 * at the boundary (RLS also enforces it) and returns a typed result rather than
 * throwing, so the UI can show a friendly error without a try/catch at the call
 * site.
 */
export async function submitFeedback(
	userId: string,
	message: string,
	view: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
	const trimmed = message.trim();
	if (!trimmed) return { ok: false, error: "Please enter a message before sending." };
	if (!userId) return { ok: false, error: "You need to be signed in to send feedback." };

	try {
		const { error } = await getSupabase()
			.from("feedback")
			.insert({ user_id: userId, message: trimmed, context: collectContext(view) as unknown as Json });
		if (error) return { ok: false, error: error.message };
		return { ok: true };
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : "Could not send feedback. Please try again." };
	}
}
