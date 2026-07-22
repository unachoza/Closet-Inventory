import { Icon, type LucideProps } from "lucide-react";
import { coatHanger } from "@lucide/lab";
import "./GoogleConsentCard.css";

const CoatHangerIcon = (props: LucideProps) => <Icon iconNode={coatHanger} {...props} />;

function GoogleMark({ size = 20 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
			<path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z" />
			<path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.4 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 24Z" />
			<path fill="#FBBC05" d="M5.6 14.7a7 7 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3Z" />
			<path fill="#EA4335" d="M12 4.6c1.7 0 3.2.6 4.4 1.7L19.7 3A11.5 11.5 0 0 0 1.8 7.3l3.8 3c.9-2.7 3.4-4.7 6.4-4.7Z" />
		</svg>
	);
}

function initialsFrom(name?: string): string {
	if (!name) return "";
	const parts = name.trim().split(/\s+/);
	const first = parts[0]?.[0] ?? "";
	const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
	return (first + last).toUpperCase();
}

const PERMISSIONS: Record<"sign-in" | "gmail-import", string[]> = {
	"sign-in": ["Your name and email address", "Clothing order confirmations", "Your closet securely synced to your account"],
	"gmail-import": ["Read-only access to your Gmail", "Used only to find purchase-confirmation emails to import"],
};

export interface GoogleConsentCardProps {
	readonly variant: "sign-in" | "gmail-import";
	/** Compact mode drops the avatar/permission list for inline placement below a button. */
	readonly compact?: boolean;
	readonly userPhotoUrl?: string | null;
	readonly userName?: string | null;
	readonly className?: string;
}

/**
 * Branded primer shown before Google's own "unverified app" consent screen —
 * mirrors the LinkedIn-style OAuth interstitial (app mark + Google mark, scoped
 * permissions, plain-language reassurance) so testers recognize NTW as the
 * requester before Google's still-unverified screen appears. It does not
 * change what Google itself shows.
 */
export default function GoogleConsentCard({ variant, compact, userName, className }: GoogleConsentCardProps) {
	const initials = initialsFrom(userName ?? undefined);
	console.log(initials);

	return (
		<div className={`gconsent${compact ? " gconsent--compact" : ""}${className ? ` ${className}` : ""}`}>
			<div className="gconsent__marks">
				<span className="gconsent__mark gconsent__mark--app" aria-hidden="true">
					<CoatHangerIcon size={compact ? 16 : 20} />
				</span>
				<span className="gconsent__mark-divider" aria-hidden="true" />
				<span className="gconsent__mark gconsent__mark--google" aria-hidden="true">
					<GoogleMark size={compact ? 16 : 20} />
				</span>
			</div>
			{/* TODO: Decide, I'm not sure about this */}
			{/* {!compact && (
				<div className="gconsent__avatar" aria-hidden="true">
					{userPhotoUrl ? (
						<img className="gconsent__avatar-img" src={userPhotoUrl} alt="" />
					) : initials ? (
						<span className="gconsent__avatar-initials">{initials}</span>
					) : (
						<UserIcon size={20} />
					)}
				</div>
			)} */}

			<p className="gconsent__lead">
				<strong>Nothing To Wear</strong> wants to {variant === "sign-in" ? "sign you in with Google" : "connect your Gmail"}.
			</p>

			{!compact && (
				<ul className="gconsent__perms">
					{PERMISSIONS[variant].map((perm) => (
						<li key={perm}>{perm}</li>
					))}
				</ul>
			)}

			<p className="gconsent__reassurance">
				<strong>One quick note</strong> Google will display an additional verification screen while Nothing To Wear completes Google's
				app verification.
			</p>
		</div>
	);
}
