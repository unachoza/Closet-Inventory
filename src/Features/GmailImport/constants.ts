export const GMAIL_EXCLUDE_SENDERS = [
	"no-reply@spotify.com",
	"noreply@service.wayfair.com",
	"noreply@order.eventbrite.com",
	"no-reply@doordash.com",
	"Receipts@united.com",
	"donotreply@23andme.com",
	"no-reply.ecommerce@fedex.com",
	"contact@diginn.com",
	"Myaccount@spectrumemails.com",
	"CVS.com@cvshealth.com",
	"no-reply@purchase.riteaid.com",
	"udemy@email.udemy.com",
	"help@capsule.com",
	"googlestore-noreply@google.com",
	"orderinquiry@burtsbees.com",
	"payment@arryved.com",
	"noreply@email-special.usps.com",
];

export const GMAIL_SEARCH_SUBJECTS = [
	"Thank you for your purchase",
	"Thanks for your purchase",
	"Order Confirmation",
	"Your order has shipped",
	"Receipt for your purchase",
];

// Hidden widen-net for the Gmail subject search: AND-of-words groups (Gmail
// syntax `subject:(word1 word2)`) that catch confirmation-stage subjects the
// literal phrases above miss — e.g. "Order #597544 confirmed" or "Your
// Nordstrom Rack order #1042965288, confirmed!" share no contiguous phrase
// with "Order Confirmation", so Gmail's quoted-phrase search never fetches
// them. Not shown in the UI and not user-editable — same pattern as
// GMAIL_EXCLUDE_SENDERS: always applied on top of whatever subjects the user
// has configured.
export const GMAIL_SEARCH_SUBJECT_WORD_GROUPS = ["order confirmed"];

export const GMAIL_SEARCH_BODY_KEYWORDS = [
	"order confirmation",
	"receipt",
	"purchase",
	"shipping confirmation",
	"invoice",
	"Your Order Summary",
	"we'll notify you when your package has been shipped",
	"Your order is being processed",
	"See your order details",
	"Check order Status",
	"Order Subtotal",
];

export const GMAIL_SEARCH_DATE_RANGE_DAYS = 120; // Search emails from the last 90 days

export const GMAIL_AUTH_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/userinfo.email"];

export const GMAIL_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export const GMAIL_TOKEN_URL = "https://oauth2.googleapis.com/token";

export const GMAIL_API_BASE = "https://www.googleapis.com/gmail/v1/users/me";

export const MAX_EMAIL_RESULTS = 100;

export const GMAIL_CACHE_KEY = "gmail_emails_cache";
export const GMAIL_CACHE_BODIES_KEY = "gmail_email_bodies_cache";
export const GMAIL_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
