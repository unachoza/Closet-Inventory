import "./LegalLinks.css";

/**
 * Links to the privacy policy and terms.
 *
 * These are plain `<a href>` to static documents in `public/`, NOT in-app
 * routes — the app has no router, and Google's OAuth consent screen has to
 * point at URLs that resolve without booting the SPA. `target="_blank"` keeps
 * a reader from losing an in-progress closet edit, and matters more inside the
 * installed PWA where there is no browser back button.
 *
 * The service worker's navigation fallback is denylisted for both paths
 * (`vite.config.ts`); without that these links serve the app shell instead.
 */
export default function LegalLinks({ className }: { readonly className?: string }) {
	return (
		<p className={`legal-links${className ? ` ${className}` : ""}`}>
			<a href="/privacy.html" target="_blank" rel="noreferrer">
				Privacy
			</a>
			<span aria-hidden="true"> · </span>
			<a href="/terms.html" target="_blank" rel="noreferrer">
				Terms
			</a>
		</p>
	);
}
