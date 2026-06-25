import type { Page } from "@playwright/test";

/**
 * Mocks the Gmail import flow for e2e:
 *  1. Seeds a fake auth token so the app is "authenticated" (no OAuth popup).
 *  2. Blocks Google's GSI / OAuth scripts so the provider doesn't hang.
 *  3. Intercepts the three Gmail REST endpoints the app calls and returns
 *     fixtures shaped exactly like the real API.
 *
 * Bodies are encoded as base64url UTF-8 — the exact inverse of the app's
 * decodeBase64Url (decodeURIComponent(escape(atob()))) — so non-ASCII like
 * "™" and "&nbsp;" survive the round-trip and the preview renders real content.
 */

const GMAIL_API = "https://www.googleapis.com/gmail/v1/users/me";

export interface MockEmail {
	id: string;
	threadId: string;
	subject: string;
	from: string;
	date: string;
	snippet: string;
	/** Full HTML body shown in the preview panel. */
	html: string;
}

/** UTF-8 → base64url (no padding). Inverse of the app's decodeBase64Url. */
export function encodeBase64Url(input: string): string {
	return Buffer.from(input, "utf-8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Realistic, intentionally large retailer emails so layout/sizing bugs surface. */
export const DEFAULT_MOCK_EMAILS: MockEmail[] = [
	{
		id: "zara-001",
		threadId: "t-zara-001",
		subject: "Thank you for your purchase — Order 0/1112/051",
		from: "ZARA <noreply@zara.com>",
		date: "Tue, 03 Jun 2026 10:14:00 +0000",
		snippet: "Your order is confirmed. SHORT JACQUARD JUMPSUIT, KNOTTED TOP …",
		html: [
			'<div style="font:13px arial,sans-serif;margin:24px">',
			'<h1 style="text-align:center">ZARA</h1>',
			'<h2 style="font-size:20px">Thank you for your purchase</h2>',
			'<table cellspacing="0" cellpadding="6" style="width:100%;font-size:13px">',
			"<thead><tr><th>Description</th><th>Colour</th><th>Size</th><th>Units</th><th>Amount</th></tr></thead>",
			"<tbody>",
			"<tr><td>SHORT JACQUARD JUMPSUIT</td><td>Bluish</td><td>M</td><td>1</td><td>29.99&nbsp;USD</td></tr>",
			"<tr><td>KNOTTED TOP</td><td>Red</td><td>L</td><td>1</td><td>19.99&nbsp;USD</td></tr>",
			"</tbody></table>",
			'<p style="margin-top:20px">Composition: 96% Cotton, 4% Elastane™ blend.</p>',
			"</div>",
		].join(""),
	},
	{
		id: "aritzia-002",
		threadId: "t-aritzia-002",
		subject: "Your Aritzia order has shipped",
		from: "Aritzia <orders@aritzia.com>",
		date: "Mon, 02 Jun 2026 18:40:00 +0000",
		snippet: "Sculpt Knit Racer Mini Dress — Pink — Size M …",
		html: [
			'<div style="font:13px Helvetica,sans-serif;margin:24px">',
			"<h1>aritzia</h1>",
			"<h2>Your order has shipped</h2>",
			'<table style="width:100%;font-size:13px">',
			"<tr><td>Sculpt Knit Racer Mini Dress | Bodycon Knit Pink dress</td><td>Pink</td><td>M</td><td>$43.99</td></tr>",
			"</table>",
			"<p>Material: 100% Recycled Knit. Care: Hand wash warm water, lay flat.</p>",
			"</div>",
		].join(""),
	},
];

/** Apply all Gmail mocks to a page. Call before page.goto(). */
export async function mockGmail(page: Page, emails: MockEmail[] = DEFAULT_MOCK_EMAILS): Promise<void> {
	// 1) Fake the Google Identity Services client so the app authenticates through
	//    its REAL path (useGoogleLogin → onSuccess → in-memory token). The token is
	//    memory-only now, so the old "seed localStorage" trick no longer works —
	//    the app purges that key on mount. Instead we stub window.google.accounts:
	//    initTokenClient auto-fires its callback on mount, which drives onSuccess
	//    exactly like a real popup grant, with no network and no popup.
	await page.addInitScript(() => {
		const token = { access_token: "e2e-fake-token", expires_in: 3600 };
		// Minimal surface the @react-oauth/google provider + useGoogleLogin touch.
		(window as unknown as { google: unknown }).google = {
			accounts: {
				id: {
					initialize: () => {},
					prompt: () => {},
					renderButton: () => {},
					cancel: () => {},
					disableAutoSelect: () => {},
				},
				oauth2: {
					initTokenClient: (config: { callback: (t: typeof token) => void }) => {
						// Auto-grant shortly after the client is created (mount), so specs
						// land already authenticated — matching the prior behaviour.
						setTimeout(() => config.callback(token), 0);
						// Also honour an explicit login() click (Connect button).
						return { requestAccessToken: () => config.callback(token) };
					},
				},
			},
		};
	});

	// 2) Neutralize Google's auth scripts so the OAuth provider doesn't hang (the
	//    empty body still fires the script's onload → "GSI loaded" — our injected
	//    window.google survives because the empty script defines nothing).
	await page.route(/accounts\.google\.com\/.*/, (route) => route.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
	await page.route(/googleapis\.com\/oauth2\/.*/, (route) => route.fulfill({ status: 200, contentType: "application/json", body: "{}" }));

	// 3) Gmail REST API: list, per-message metadata, and full body.
	await page.route(`${GMAIL_API}/messages**`, async (route) => {
		const url = new URL(route.request().url());
		const idMatch = url.pathname.match(/\/messages\/([^/]+)$/);

		// List endpoint → just ids + threadIds.
		if (!idMatch) {
			return route.fulfill({ json: { messages: emails.map((e) => ({ id: e.id, threadId: e.threadId })) } });
		}

		const email = emails.find((e) => e.id === idMatch[1]);
		if (!email) return route.fulfill({ status: 404, json: { error: { message: "not found" } } });

		const headers = [
			{ name: "Subject", value: email.subject },
			{ name: "From", value: email.from },
			{ name: "Date", value: email.date },
		];

		// format=full → include the base64url-encoded HTML body.
		if (url.searchParams.get("format") === "full") {
			return route.fulfill({
				json: {
					id: email.id,
					threadId: email.threadId,
					snippet: email.snippet,
					payload: {
						mimeType: "text/html",
						headers,
						body: { data: encodeBase64Url(email.html), size: email.html.length },
					},
				},
			});
		}

		// format=metadata → headers + snippet only (no body).
		return route.fulfill({
			json: {
				id: email.id,
				threadId: email.threadId,
				snippet: email.snippet,
				payload: { mimeType: "multipart/alternative", headers, body: { size: 0 } },
			},
		});
	});
}
