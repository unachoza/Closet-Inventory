export const GMAIL_SEARCH_SUBJECTS = [
	"Thank you for your purchase",
	"Thanks for your purchase",
	"Order Confirmation",
	"Your order has shipped",
	"Receipt for your purchase",
];

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

export const GMAIL_SEARCH_DATE_RANGE_DAYS = 90; // Search emails from the last 90 days

export const GMAIL_AUTH_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/userinfo.email"];

export const GMAIL_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export const GMAIL_TOKEN_URL = "https://oauth2.googleapis.com/token";

export const GMAIL_API_BASE = "https://www.googleapis.com/gmail/v1/users/me";

export const MAX_EMAIL_RESULTS = 50;
