import { Cloud, CloudOff } from "lucide-react";
import { useSupabaseAuthContext } from "../../context/SupabaseAuthContext";
import { useCloset } from "../../context/ClosetContext";
import type { SyncStatus } from "../../hooks/useCloudCloset";
import { useGoogleUnverifiedNotice } from "../../Features/Onboarding/useGoogleUnverifiedNotice";
import GoogleUnverifiedNotice from "../../Features/Onboarding/GoogleUnverifiedNotice";
import "./CloudSyncControl.css";

// The sync axis (only meaningful when signed in). "Behind" = a write is still
// in flight / not yet acknowledged by the server; "Error" = a write failed.
const SYNC_LABEL: Record<SyncStatus, string> = {
	synced: "Synced",
	syncing: "Behind",
	offline: "Offline",
	error: "Error",
};

/**
 * E1-1.4 — cloud-sync entry point + the "which state am I in?" status chip.
 *
 * The chip is explicit on three independent axes so the user is never guessing:
 *   • auth  — Signed out  ↔  Signed in (email shown/tooltip)
 *   • store — Local (this browser only)  ↔  Cloud
 *   • sync  — Synced / Behind / Offline / Error   (only when signed in)
 *
 * Signed out, the closet lives only in localStorage; "Sign in to sync" starts
 * Supabase Google OAuth and, on return, `useCloudCloset` seeds the cloud from
 * the local closet (E1-1.5).
 */
const CloudSyncControl = () => {
	const { isAuthenticated, user, signIn, signOut, isLoading } = useSupabaseAuthContext();
	const { syncStatus } = useCloset();
	const googleNotice = useGoogleUnverifiedNotice();

	if (!isAuthenticated) {
		return (
			<div
				className="cloud-sync-control"
				data-testid="cloud-sync-control"
				aria-label="Signed out — closet stored locally in this browser"
			>
				<span className="cloud-sync-control__store cloud-sync-control__store--local">
					<CloudOff size={14} aria-hidden="true" /> Local
				</span>
				<span className="cloud-sync-control__auth">Signed out</span>
				<button
					className="cloud-sync-control__btn"
					onClick={() => googleNotice.requestGoogleSignIn(() => void signIn())}
					disabled={isLoading}
				>
					Sign in to sync
				</button>
				<GoogleUnverifiedNotice
					isOpen={googleNotice.isOpen}
					onContinue={googleNotice.confirm}
					onCancel={googleNotice.dismiss}
				/>
			</div>
		);
	}

	return (
		<div
			className="cloud-sync-control"
			data-testid="cloud-sync-control"
			aria-label={`Signed in${user?.email ? ` as ${user.email}` : ""} — cloud sync ${SYNC_LABEL[syncStatus]}`}
		>
			<span className="cloud-sync-control__store cloud-sync-control__store--cloud" title={user?.email ?? undefined}>
				<Cloud size={14} aria-hidden="true" /> Cloud
			</span>
			<span className={`cloud-sync-control__sync cloud-sync-control__sync--${syncStatus}`} data-testid="cloud-sync-state">
				{SYNC_LABEL[syncStatus]}
			</span>
			<button className="cloud-sync-control__btn" onClick={() => void signOut()} disabled={isLoading}>
				Sign out
			</button>
		</div>
	);
};

export default CloudSyncControl;
